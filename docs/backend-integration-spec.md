# TÀI LIỆU ĐẶC TẢ TÍCH HỢP HỆ THỐNG BACKEND & FRONTEND
## Hệ thống Quản lý và Theo dõi Thi đua Quân nhân (Sư đoàn 324 - Trung đoàn 335)

> **Phiên bản:** 1.0.0  
> **Ngày lập:** 23/09/2026  
> **Kiến trúc mục tiêu:** Next.js 16 (React 19) ↔ Spring Boot 3.3.4 (Java 21, Spring Security, JWT, MySQL)  
> **Tài liệu tham chiếu:** Quyết chế thi đua Trung đoàn 335 (`nội dung làm website.docx`), Codebase Frontend (`frontend/my-app/`), Codebase Backend (`backend/`)

---

## 1. KIẾN TRÚC TÍCH HỢP TỔNG THỂ (SYSTEM OVERVIEW)

### 1.1. Mô hình giao tiếp mạng & Cổng dịch vụ
```
┌─────────────────────────────────┐                 ┌───────────────────────────────────┐
│     CLIENT BROWSER / NEXT.JS    │                 │       SPRING BOOT 3.3.4 API       │
│     (Next.js 16 - Port 3005)    │  HTTP / JSON    │    (Java 21 / Servlet Port 8080)  │
│  - App Router, React 19 Client  │ ──────────────> │  - Context-path: /api/v1          │
│  - API Client / Interceptors    │ <────────────── │  - Spring Security + JWT Filter   │
│  - Port cấu hình: 3005          │   Bearer JWT    │  - Port cấu hình: 8080            │
└─────────────────────────────────┘                 └─────────────────┬─────────────────┘
                                                                      │ Spring Data JPA
                                                                      ▼
                                                    ┌───────────────────────────────────┐
                                                    │           MYSQL DATABASE          │
                                                    │  Database: military_emulation     │
                                                    │  Port: 3306                       │
                                                    └───────────────────────────────────┘
```

- **Frontend Client:** `http://localhost:3005` (Next.js khởi chạy theo cấu hình `scripts.dev` trong `package.json`: `next dev -p 3005`).
- **Backend API Gateway:** `http://localhost:8080/api/v1` (Khởi chạy theo `backend/src/main/resources/application.properties`: `server.port=8080`, `server.servlet.context-path=/api/v1`).
- **Cơ sở dữ liệu:** MySQL 8.0+ tại `localhost:3306`, database name: `military_emulation`.

### 1.2. Chiến lược xử lý CORS (Cross-Origin Resource Sharing)
Cấu hình CORS tập trung tại tầng Spring Security (`WebMvcConfigurer` hoặc `CorsConfigurationSource`):
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3005", "http://127.0.0.1:3005")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type", "Accept", "X-Requested-With")
                .exposedHeaders("Authorization")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 1.3. Cấu hình biến môi trường (Environment Variables)

#### Phía Frontend (`frontend/my-app/.env.local`)
```properties
# URL gốc của Backend Spring Boot API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# Thời gian timeout cho mỗi request (miligiây)
NEXT_PUBLIC_API_TIMEOUT=15000

# Khóa lưu token trong localStorage / Cookie
NEXT_PUBLIC_AUTH_TOKEN_KEY=thi_dua_jwt_token
NEXT_PUBLIC_REFRESH_TOKEN_KEY=thi_dua_refresh_token
```

#### Phía Backend (`backend/src/main/resources/application.properties`)
```properties
spring.application.name=emulation-management
server.port=8080
server.servlet.context-path=/api/v1

# Database MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/military_emulation?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&allowPublicKeyRetrieval=true&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT Configuration (Secret 256-bit Hex)
jwt.secret=9a2f8c4e7b1d3f6a8e0c2b5d7e9f1a3c5b7d9e1f3a5c7b9e1f3a5c7b9e1f3a5c
jwt.expiration=86400000
jwt.refresh-expiration=604800000
```

---

## 2. CƠ CHẾ XÁC THỰC & PHÂN QUYỀN (AUTH & SECURITY FLOW)

### 2.1. Cấu trúc Phân cấp & Vai trò trong Quân đội
Căn cứ theo hệ thống thực tế của Sư đoàn 324 - Trung đoàn 335 và định nghĩa tại `types.ts`:

1. **Cấp đơn vị (`UnitTier`):**
   - `REGIMENT` (Trung đoàn - e335)
   - `BATTALION` (Tiểu đoàn - dBB4, dBB5...)
   - `COMPANY` (Đại đội - c1, c2, c3...)
   - `PLATOON` (Trung đội - b1, b2, b3...)
   - `SQUAD` (Tiểu đội - a1, a2, a3...)

2. **Vai trò người dùng (`UserRole`):**
   - `COMMANDER` (Chỉ huy): Trung đoàn trưởng, Tiểu đoàn trưởng, Đại đội trưởng, Trung đội trưởng. Có quyền duyệt báo cáo, chốt/mở khóa sổ thi đua, phê duyệt khen thưởng/kỷ luật.
   - `SCORER` (Cán bộ chấm điểm): Tiểu đội trưởng, Bí thư chi đoàn, Trực ban ngày. Có quyền nhập điểm thi đua hàng ngày, lập phiếu biểu dương/nhắc nhở.
   - `SOLDIER` (Chiến sĩ): Quân nhân thuộc các phân đội. Xem hồ sơ cá nhân, theo dõi kết quả thi đua và cẩm nang quy chế.

### 2.2. Luồng xác thực JWT (Token Life Cycle)

```
[Người dùng nhập User/Pass]
          │
          ▼
POST /api/v1/auth/login ─────────────► [Spring Security AuthenticationManager]
                                                      │ Xác thực mật khẩu BCrypt
                                                      ▼
[Lưu accessToken & refreshToken] ◄── [Trả về Token + User Profile + Scope Tier]
          │
          ▼
Mỗi Request: Gắn Header `Authorization: Bearer <accessToken>`
          │
          ▼
[Nếu gặp 401 Unauthorized]
          │
          ▼
POST /api/v1/auth/refresh-token (kèm refreshToken)
          ├── Thành công: Lưu token mới, retry request ban đầu
          └── Thất bại: Xóa storage, chuyển hướng về `/login`
```

### 2.3. Ma trận Phân quyền Endpoint (RBAC Matrix)

| Nhóm Tài Nguyên | Phương Thức | Endpoint URI | COMMANDER | SCORER | SOLDIER | Điều kiện phạm vi đơn vị |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **Xác thực** | POST | `/auth/login`, `/auth/refresh` | Toàn quyền | Toàn quyền | Toàn quyền | Không giới hạn |
| **Hồ sơ cá nhân** | GET | `/auth/me` | Toàn quyền | Toàn quyền | Toàn quyền | Theo ID cá nhân |
| **Cây Đơn vị** | GET | `/units`, `/units/tree` | Đọc | Đọc | Đọc | Lọc theo `unitScopeTier` |
| **Nhận xét Đơn vị**| POST/PUT | `/units/{id}/remarks` | Ghi | ❌ | ❌ | Chỉ đơn vị thuộc quyền chỉ huy |
| **Quân nhân** | GET | `/soldiers`, `/soldiers/{id}` | Đọc | Đọc | Chỉ bản thân | Thuộc đơn vị phụ trách |
| **Quản lý Quân nhân**| POST/PUT/DELETE | `/soldiers/**` | Toàn quyền | ❌ | ❌ | Chỉ đơn vị trực thuộc |
| **Tiêu chí Thi đua**| GET | `/criteria` | Đọc | Đọc | Đọc | Toàn đơn vị |
| **Quản trị Tiêu chí**| POST/PUT/DELETE | `/criteria/**` | Toàn quyền | ❌ | ❌ | Cấp Trung đoàn / Đại đội |
| **Điểm thi đua ngày**| GET | `/scores/daily` | Đọc | Đọc | Đọc | Thuộc đơn vị phụ trách |
| **Nhập điểm ngày** | POST/PUT | `/scores/daily` | Ghi | Ghi | ❌ | Khi ngày **CHƯA KHÓA** (`isLocked=false`) |
| **Chốt sổ thi đua** | POST | `/scores/lock` | Ghi | ❌ | ❌ | Chốt sổ lúc 21:00 hoặc theo lệnh chỉ huy |
| **Mở khóa sổ** | POST | `/scores/unlock` | Ghi | ❌ | ❌ | Bắt buộc nhập lý do mở khóa |
| **Biểu dương/Nhắc nhở**| GET | `/commendations` | Đọc | Đọc | Đọc | Thuộc đơn vị |
| **Tạo Khen thưởng/KL** | POST/PUT/DELETE | `/commendations/**` | Ghi | Ghi | ❌ | Theo phân cấp |
| **Báo cáo tổng hợp** | GET | `/reports/**` | Xem/Xuất | Xem | Xem của mình | Thuộc đơn vị |

---

## 3. ĐẶC TẢ API CONTRACT & DTO MAPPING

### 3.1. Chuẩn hóa Envelope Response

Mọi API response từ Spring Boot đều được bọc trong cấu trúc chuẩn:
```json
// Thành công (HTTP 200, 201)
{
  "success": true,
  "code": 200,
  "message": "Thao tác thành công",
  "data": { ... },
  "timestamp": "2026-09-23T16:30:00Z"
}

// Thất bại (HTTP 400, 401, 403, 404, 500)
{
  "success": false,
  "code": 400,
  "message": "Dữ liệu yêu cầu không hợp lệ",
  "errors": [
    {
      "field": "militaryCode",
      "message": "Số hiệu quân nhân không được để trống"
    }
  ],
  "timestamp": "2026-09-23T16:30:00Z"
}
```

---

### 3.2. Chi tiết Endpoints theo Nhóm Nghiệp vụ

#### NHÓM 1: AUTHENTICATION (`/api/v1/auth`)

##### 1. Đăng nhập hệ thống
- **Method:** `POST`
- **URL:** `/api/v1/auth/login`
- **Quyền:** Public
- **Request Body:**
```json
{
  "username": "thang_b1",
  "password": "Password@123"
}
```
- **Response Data (HTTP 200):**
```json
{
  "success": true,
  "code": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "d8f3a9b1-e2c7-4a5f-8b9d-1234567890ab",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "id": "u-004",
      "username": "thang_b1",
      "name": "Nguyễn Văn Thắng",
      "rank": "Đại úy",
      "role": "COMMANDER",
      "roleTitle": "Trung đội trưởng B1",
      "soldierId": null,
      "platoonId": "b1",
      "unitScopeTier": "PLATOON",
      "assignedUnitId": "b1",
      "avatarUrl": "/default-avatar.png"
    }
  },
  "timestamp": "2026-09-23T16:30:00Z"
}
```

##### 2. Lấy thông tin tài khoản hiện hành
- **Method:** `GET`
- **URL:** `/api/v1/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response Data (HTTP 200):** Trả về đối tượng `user` như trên.

---

#### NHÓM 2: QUẢN LÝ ĐƠN VỊ QUÂN ĐỘI (`/api/v1/units`)

##### 1. Danh sách đơn vị / Cây đơn vị phân cấp
- **Method:** `GET`
- **URL:** `/api/v1/units` hoặc `/api/v1/units/tree`
- **Response Data (HTTP 200):**
```json
{
  "success": true,
  "code": 200,
  "message": "Thành công",
  "data": [
    {
      "id": "e335",
      "name": "Trung đoàn BB 335",
      "code": "e335",
      "tier": "REGIMENT",
      "parentId": null,
      "leaderTitle": "Trung đoàn trưởng",
      "leaderName": "Thượng tá Nguyễn Hữu Hải",
      "totalSoldiers": 270
    },
    {
      "id": "dbb4",
      "name": "Tiểu đoàn Bộ binh 4",
      "code": "dBB4",
      "tier": "BATTALION",
      "parentId": "e335",
      "leaderTitle": "Tiểu đoàn trưởng",
      "leaderName": "Thiếu tá Trần Văn Minh",
      "totalSoldiers": 90
    }
  ],
  "timestamp": "2026-09-23T16:30:00Z"
}
```

##### 2. Lưu nhận xét thi đua đơn vị theo ngày
- **Method:** `POST`
- **URL:** `/api/v1/units/{unitId}/remarks`
- **Request Body:**
```json
{
  "date": "2026-09-23",
  "remark": "Đơn vị duy trì nghiêm quân số, nội vụ sắp đặt gọn gàng, hoàn thành tốt bài huấn luyện kỹ thuật chiến đấu bộ binh."
}
```

---

#### NHÓM 3: HỒ SƠ QUÂN NHÂN (`/api/v1/soldiers`)

##### 1. Danh sách quân nhân (hỗ trợ lọc theo đơn vị)
- **Method:** `GET`
- **URL:** `/api/v1/soldiers?unitId=b1&tier=PLATOON&page=0&size=20`
- **Response Data (HTTP 200):**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "content": [
      {
        "id": "s-001",
        "name": "Nguyễn Văn An",
        "dob": "17/04/2005",
        "gender": "Nam",
        "rank": "Binh nhất",
        "roleTitle": "Chiến sĩ",
        "battalionId": "dbb4",
        "battalionName": "Tiểu đoàn BB4",
        "companyId": "c1",
        "companyName": "Đại đội 1",
        "platoonId": "b1",
        "platoonName": "Trung đội 1",
        "squadId": "a1",
        "squadName": "Tiểu đội 1",
        "joinDate": "02/2024",
        "militaryCode": "QN-335-001",
        "idCardNumber": "038205001234",
        "phone": "0912345678",
        "hometown": "Đô Lương, Nghệ An",
        "partyStatus": "Đoàn viên",
        "avatarUrl": "/default-avatar.png"
      }
    ],
    "totalElements": 30,
    "totalPages": 2,
    "page": 0,
    "size": 20
  }
}
```

##### 2. Thêm mới / Cập nhật hồ sơ quân nhân
- **Method:** `POST` (Tạo mới) / `PUT` (Cập nhật tại `/api/v1/soldiers/{id}`)
- **Request Body:** Tương ứng với model `Soldier` ở trên (bỏ `id` khi tạo mới).

---

#### NHÓM 4: TIÊU CHÍ THI ĐUA ĐỘNG (`/api/v1/criteria`)

##### 1. Lấy danh sách tiêu chí áp dụng
- **Method:** `GET`
- **URL:** `/api/v1/criteria?activeOnly=true`
- **Response Data (HTTP 200):**
```json
{
  "success": true,
  "code": 200,
  "data": [
    {
      "id": "crit_ct",
      "name": "1. Chất lượng chính trị",
      "code": "CT",
      "maxScore": 100,
      "description": "Nhận thức tư tưởng, học tập chính trị, chấp hành kỷ luật, đoàn kết nội bộ.",
      "deductionRules": [
        "Vắng học chính trị không lý do (-20đ)",
        "Không ghi chép bài đầy đủ (-5đ)",
        "Vi phạm phát ngôn, thiếu lễ phép (-10đ)"
      ],
      "isActive": true,
      "category": "CHINH_TRI"
    },
    {
      "id": "crit_nv",
      "name": "2. Thực hiện nhiệm vụ",
      "code": "NV",
      "maxScore": 100,
      "description": "Huấn luyện quân sự, thao trường, tăng gia sản xuất, trực gác tuần tra.",
      "deductionRules": [
        "Đi muộn giờ huấn luyện (-5đ)",
        "Không hoàn thành chỉ tiêu tăng gia (-10đ)",
        "Ngủ gật trong ca trực gác (-50đ)"
      ],
      "isActive": true,
      "category": "QUAN_SU"
    },
    {
      "id": "crit_nvvs",
      "name": "3. Nội vụ, vệ sinh",
      "code": "NVVS",
      "maxScore": 100,
      "description": "Gấp chăn màn vuông thành sắc cạnh, sắp đặt giày dép, ba lô đúng quy định.",
      "deductionRules": [
        "Chăn màn gấp không vuông góc (-10đ)",
        "Giày dép để lộn xộn (-5đ)",
        "Vệ sinh doanh trại chưa sạch (-10đ)"
      ],
      "isActive": true,
      "category": "HAU_CAN"
    },
    {
      "id": "crit_ltp",
      "name": "4. Lễ tiết tác phong",
      "code": "LTP",
      "maxScore": 100,
      "description": "Đầu tóc, quân dung tươi tỉnh, xưng hô chào hỏi đúng điều lệnh quân đội.",
      "deductionRules": [
        "Tóc dài quá quy định (-10đ)",
        "Mặc sai trang phục quy định (-10đ)",
        "Không chào cấp trên khi gặp (-10đ)"
      ],
      "isActive": true,
      "category": "KY_LUAT"
    }
  ]
}
```

---

#### NHÓM 5: CHẤM ĐIỂM THI ĐUA & KHÓA SỔ 21:00 (`/api/v1/scores`)

##### 1. Lấy bảng chấm điểm ngày theo đơn vị
- **Method:** `GET`
- **URL:** `/api/v1/scores/daily?date=2026-09-23&unitId=b1`
- **Response Data (HTTP 200):**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "date": "2026-09-23",
    "lockStatus": {
      "date": "2026-09-23",
      "isLocked": false,
      "lockedAt": null,
      "lockedBy": null,
      "lockNote": null
    },
    "scores": [
      {
        "id": "score-001",
        "soldierId": "s-001",
        "soldierName": "Nguyễn Văn An",
        "platoonId": "b1",
        "date": "2026-09-23",
        "politicalScore": 95,
        "taskScore": 90,
        "hygieneScore": 92,
        "bearingScore": 98,
        "totalScore": 375,
        "criteriaScores": {
          "crit_ct": 95,
          "crit_nv": 90,
          "crit_nvvs": 92,
          "crit_ltp": 98
        },
        "violations": [
          {
            "id": "v-1",
            "category": "chinh_tri",
            "content": "Chưa ghi chép đầy đủ nội dung bài học chính trị",
            "points": -5,
            "criterionId": "crit_ct"
          }
        ],
        "notes": "Tích cực phát biểu xây dựng bài, chăn màn nội vụ vuông đẹp",
        "evaluatedBy": "Trung sĩ Hoàng Văn Bình"
      }
    ]
  }
}
```

##### 2. Lưu / Cập nhật điểm thi đua của quân nhân
- **Method:** `POST`
- **URL:** `/api/v1/scores/daily`
- **Ràng buộc:** Nếu ngày đã khóa (`isLocked === true`), Backend trả về mã lỗi `HTTP 423 Locked` kèm thông báo: *"Ngày đánh giá đã bị khóa sổ sau 21:00. Liên hệ Chỉ huy để mở khóa trước khi sửa."*
- **Request Body:**
```json
{
  "soldierId": "s-001",
  "date": "2026-09-23",
  "criteriaScores": {
    "crit_ct": 95,
    "crit_nv": 90,
    "crit_nvvs": 92,
    "crit_ltp": 98
  },
  "politicalScore": 95,
  "taskScore": 90,
  "hygieneScore": 92,
  "bearingScore": 98,
  "violations": [
    {
      "id": "v-1",
      "category": "chinh_tri",
      "content": "Chưa ghi chép đầy đủ nội dung bài học chính trị",
      "points": -5,
      "criterionId": "crit_ct"
    }
  ],
  "notes": "Có tinh thần cầu thị sửa chữa khuyết điểm",
  "evaluatedBy": "Trung sĩ Hoàng Văn Bình"
}
```

##### 3. Khóa sổ thi đua ngày (21:00)
- **Method:** `POST`
- **URL:** `/api/v1/scores/lock`
- **Quyền:** `COMMANDER`
- **Request Body:**
```json
{
  "date": "2026-09-23",
  "officerName": "Đại úy Nguyễn Văn Thắng",
  "note": "Đã kiểm tra toàn bộ điểm danh tối 21:00 và phê duyệt bảng điểm ngày."
}
```

##### 4. Mở khóa sổ thi đua
- **Method:** `POST`
- **URL:** `/api/v1/scores/unlock`
- **Quyền:** `COMMANDER`
- **Request Body:**
```json
{
  "date": "2026-09-23",
  "officerName": "Đại úy Nguyễn Văn Thắng",
  "reason": "Điều chỉnh bổ sung điểm thưởng trực ban tuần tra ban đêm phát hiện vụ việc."
}
```

---

#### NHÓM 6: BIỂU DƯƠNG / NHẮC NHỞ & KỶ LUẬT (`/api/v1/commendations`)

##### 1. Lấy danh sách biểu dương / nhắc nhở
- **Method:** `GET`
- **URL:** `/api/v1/commendations?date=2026-09-23&unitId=b1`
- **Response Data (HTTP 200):**
```json
{
  "success": true,
  "code": 200,
  "data": [
    {
      "id": "c-001",
      "type": "COMMENDATION",
      "scope": "INDIVIDUAL",
      "targetId": "s-001",
      "targetName": "Binh nhất Nguyễn Văn An",
      "platoonId": "b1",
      "content": "Gấp chăn màn đẹp nhất Trung đội, đạt chuẩn mẫu mực điểm danh sáng.",
      "date": "2026-09-23",
      "createdBy": "Đại úy Nguyễn Văn Thắng",
      "disciplineDocument": null
    }
  ]
}
```

##### 2. Tạo phiếu Biểu dương / Nhắc nhở
- **Method:** `POST`
- **URL:** `/api/v1/commendations`
- **Request Body:**
```json
{
  "type": "REMINDER",
  "scope": "INDIVIDUAL",
  "targetId": "s-002",
  "targetName": "Binh nhì Trần Văn Bình",
  "platoonId": "b1",
  "content": "Đi muộn giờ tập trung điểm danh 10 phút, tác phong chưa nghiêm túc.",
  "date": "2026-09-23",
  "createdBy": "Trung úy Lê Văn Nam",
  "disciplineDocument": {
    "documentNumber": "KL-01/QĐ-B1",
    "documentType": "Khiển trách trước toàn trung đội",
    "issuedBy": "Đại úy Nguyễn Văn Thắng",
    "issuedDate": "2026-09-23",
    "effectiveDate": "2026-09-23",
    "reason": "Vi phạm chế độ trong ngày lần thứ nhất",
    "duration": "1 tuần thử thách"
  }
}
```

---

#### NHÓM 7: BÁO CÁO & XẾP HẠNG THI ĐUA (`/api/v1/reports`)

##### 1. Bảng tổng hợp thi đua phân cấp (Adaptive Matrix)
- **Method:** `GET`
- **URL:** `/api/v1/reports/unit-aggregate?unitId=e335&date=2026-09-23`
- **Response Data (HTTP 200):** Trả về mảng `UnitAggregate[]` bao gồm điểm trung bình 4 tiêu chuẩn, điểm tổng, thứ hạng và lời nhận xét chung.

---

## 4. KẾ HOẠCH CHUYỂN ĐỔI MOCK DATA SANG REAL API

### 4.1. Bản đồ Mock Data hiện tại trong `frontend/my-app/`

| Tệp tin | Vị trí Mock Data | Mô tả chuyển đổi sang Real API |
| :--- | :--- | :--- |
| `lib/mock-data.ts` | Toàn bộ file | Giữ lại làm `fallback` khi offline hoặc chế độ kiểm thử unit test. |
| `lib/store.ts` | Dòng 59 - 115 (Load LocalStorage) | Thay thế bằng các lệnh gọi Service HTTP bất đồng bộ (`async/await`). |
| `lib/store.ts` | `login()`, `logout()` | Gọi `authService.login()`, lưu token vào cookie/secure storage thay vì chỉ lưu object user trần. |
| `lib/store.ts` | `saveDailyScore()` | Gọi `scoreService.saveDailyScore()`, nhận phản hồi từ backend để update state. |
| `lib/store.ts` | `lockDate()`, `unlockDate()` | Gọi `scoreService.lockDate()`, `scoreService.unlockDate()`. |
| `lib/store.ts` | `addSoldier()`, `updateSoldier()` | Gọi `soldierService.create()`, `soldierService.update()`. |
| `app/login/client.tsx`| Dòng 10 - 25 (`handleSuccess`) | Gọi API đăng nhập thật với username/password từ form, nhận JWT token. |

### 4.2. Thiết kế tầng API Client tập trung (`src/lib/api/` hoặc `lib/api/`)

#### 1. Core HTTP Client (`frontend/my-app/lib/api/client.ts`)
```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Tự động đính kèm Bearer token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('thi_dua_jwt_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý Envelope & Catch mã lỗi 401
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Trả về thẳng data payload nếu backend dùng chuẩn ApiResponse
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('thi_dua_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        // Gọi API cấp lại token
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        localStorage.setItem('thi_dua_jwt_token', newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        // Refresh thất bại: Xóa storage và quay về login
        localStorage.removeItem('thi_dua_jwt_token');
        localStorage.removeItem('thi_dua_refresh_token');
        localStorage.removeItem('thi_dua_user');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);
```

#### 2. Cấu trúc các Service Files (`frontend/my-app/lib/api/`)
- `auth.service.ts`: `login()`, `logout()`, `refreshToken()`, `getMe()`.
- `soldier.service.ts`: `getSoldiers(params)`, `getSoldierById(id)`, `createSoldier(data)`, `updateSoldier(id, data)`, `deleteSoldier(id)`.
- `score.service.ts`: `getDailyScores(date, unitId)`, `saveDailyScore(data)`, `lockDate(payload)`, `unlockDate(payload)`, `getDailyLockStatus(date)`.
- `unit.service.ts`: `getAllUnits()`, `getUnitTree()`, `updateUnitRemark(unitId, payload)`.
- `criteria.service.ts`: `getCriteria()`, `createCriterion()`, `updateCriterion()`, `toggleCriterion()`.
- `commendation.service.ts`: `getCommendations(date, unitId)`, `createCommendation(data)`, `deleteCommendation(id)`.
- `report.service.ts`: `getUnitAggregates(unitId, date)`, `getPlatoonAnalysis(platoonId, period)`.

### 4.3. Chiến lược Tương thích (Adapter Pattern cho `useEmulationStore`)
Để đảm bảo **không làm xáo trộn hoặc vỡ 27 components UI hiện tại**, `useEmulationStore` trong `frontend/my-app/lib/store.ts` sẽ được giữ nguyên chữ ký hàm (Method Signature) và trạng thái State, nhưng bên trong thân hàm sẽ chuyển từ thao tác LocalStorage sang gọi các Service API tương ứng:
```typescript
// Ví dụ cách chuyển đổi saveDailyScore bên trong useEmulationStore:
const saveDailyScore = async (score: DailyScore) => {
  try {
    const updatedScore = await scoreService.saveDailyScore(score);
    setDailyScores((prev) => {
      const idx = prev.findIndex((s) => s.soldierId === score.soldierId && s.date === score.date);
      return idx >= 0 ? prev.map((s, i) => (i === idx ? updatedScore : s)) : [updatedScore, ...prev];
    });
    notify.success('Đã lưu điểm', `Cập nhật thành công cho ${score.soldierName}`);
  } catch (error: any) {
    notify.error('Lỗi lưu điểm', error.response?.data?.message || 'Không thể lưu điểm thi đua');
  }
};
```

---

## 5. CHECKLIST TÍCH HỢP & KIỂM THỬ (INTEGRATION & TESTING CHECKLIST)

### 5.1. Phân kỳ Triển khai (4 Giai đoạn)

#### Giai đoạn 1: Thiết lập Cơ sở Dữ liệu & Khung Spring Boot (Database & Auth Foundation)
- [ ] Thiết kế Database Schema MySQL `military_emulation`: Tạo các bảng `military_units`, `user_accounts`, `soldiers`, `emulation_criteria`, `daily_scores`, `violation_records`, `daily_locks`, `commendation_items`.
- [ ] Xây dựng các JPA Entities tương ứng trong `backend/src/main/java/com/trungdoi/danhgia/entity/`.
- [ ] Cấu hình Spring Security 6 & JWT Filter trong `backend/.../security/`.
- [ ] Xây dựng `AuthController` và `AuthService` với mã hóa mật khẩu `BCryptPasswordEncoder`.
- [ ] Thiết lập bảng `DataSeeder` để nạp dữ liệu mẫu ban đầu (tài khoản demo, các đơn vị e335, dBB4, c1, b1, a1).
- [ ] **Acceptance Criteria (AC1):** Postman gọi `POST /api/v1/auth/login` với tài khoản `thang_b1` trả về mã 200 và chuỗi JWT token hợp lệ.

#### Giai đoạn 2: Quản lý Quân số & Cây Đơn vị (Unit & Soldier Module)
- [ ] Viết JPA Repositories và Services cho `MilitaryUnit` và `Soldier`.
- [ ] Cài đặt các API: `GET /units/tree`, `GET /soldiers`, `POST /soldiers`, `PUT /soldiers/{id}`.
- [ ] Tích hợp API vào component `CascadingUnitSelector.tsx` và `SoldierList.tsx`.
- [ ] Kiểm thử đồng bộ avatar và thông tin thẻ quân nhân, ngày nhập ngũ, quê quán.
- [ ] **Acceptance Criteria (AC2):** Thay đổi đơn vị trên thanh chọn cấp bậc (Sư đoàn -> Trung đoàn -> Tiểu đoàn -> Trung đội) dữ liệu danh sách quân nhân phản hồi chính xác trong dưới 300ms.

#### Giai đoạn 3: Chấm điểm Thi đua, Tiêu chí Động & Khóa sổ 21:00 (Scoring Core)
- [ ] Viết API CRUD Tiêu chí thi đua (`/criteria`) và API lưu điểm ngày (`/scores/daily`).
- [ ] Cài đặt nghiệp vụ Khóa sổ tự động lúc 21:00 (Sử dụng Spring `@Scheduled(cron = "0 0 21 * * ?")`).
- [ ] Xây dựng API Chốt sổ thủ công (`/scores/lock`) và Mở khóa sổ có lưu lịch sử (`/scores/unlock`).
- [ ] Tích hợp vào `DailyScoringSheet.tsx` và `CriteriaHandbook.tsx`.
- [ ] **Acceptance Criteria (AC3):** Khi ngày đã bị khóa, thao tác sửa điểm từ frontend bị chặn lại và hiển thị thông báo lỗi rõ ràng từ Backend.

#### Giai đoạn 4: Biểu dương, Kỷ luật & Báo cáo Thống kê (Reports & Polish)
- [ ] Viết API cho Biểu dương / Nhắc nhở (`/commendations`) có hỗ trợ đính kèm văn bản kỷ luật `DisciplineDocument`.
- [ ] Xây dựng thuật toán tính toán ma trận xếp hạng thi đua (`/reports/unit-aggregate`) trên Database/Service để tối ưu hiệu năng.
- [ ] Tích hợp dữ liệu vào `EmulationDashboard.tsx` và `PlatoonAnalysis.tsx`.
- [ ] Hoàn thiện xử lý lỗi mạng, hiển thị Skeleton Loading và Toast Notification.
- [ ] **Acceptance Criteria (AC4):** Bảng tổng hợp thi đua hiển thị đúng thứ hạng, điểm trung bình và biểu đồ phân tích 3 Trung đội theo đúng số liệu thực tế được lưu trong Database.

---

## 6. SƠ ĐỒ THỰC THỂ CƠ SỞ DỮ LIỆU (DATABASE ERD LOGICAL SPEC)

```
┌────────────────────────┐         1:N         ┌────────────────────────┐
│     military_units     │ ──────────────────> │     user_accounts      │
│  - id (PK, VARCHAR)    │                     │  - id (PK, VARCHAR)    │
│  - name, code, tier    │                     │  - username, password  │
│  - parent_id (FK)      │                     │  - role, rank          │
│  - leader_name         │                     │  - unit_id (FK)        │
└───────────┬────────────┘                     └────────────────────────┘
            │ 1:N
            ▼
┌────────────────────────┐         1:N         ┌────────────────────────┐
│        soldiers        │ ──────────────────> │      daily_scores      │
│  - id (PK, VARCHAR)    │                     │  - id (PK, VARCHAR)    │
│  - name, rank          │                     │  - soldier_id (FK)     │
│  - military_code (UQ)  │                     │  - score_date (DATE)   │
│  - platoon_id (FK)     │                     │  - political_score     │
│  - squad_id (FK)       │                     │  - task_score          │
└───────────┬────────────┘                     │  - hygiene_score       │
            │ 1:N                              │  - bearing_score       │
            ▼                                  │  - total_score         │
┌────────────────────────┐                     └───────────┬────────────┘
│  commendation_items    │                                 │ 1:N
│  - id (PK, VARCHAR)    │                                 ▼
│  - type, scope         │                     ┌────────────────────────┐
│  - target_id (FK)      │                     │   violation_records    │
│  - content, date       │                     │  - id (PK, VARCHAR)    │
│  - discipline_doc_json │                     │  - daily_score_id (FK) │
└────────────────────────┘                     │  - category, points    │
                                               │  - criterion_id (FK)   │
                                               └────────────────────────┘
```

---
*Tài liệu này được biên soạn độc quyền cho Dự án Hệ thống Quản lý và Theo dõi Thi đua Quân nhân. Mọi thành viên đội ngũ phát triển Frontend và Backend phải tuân thủ nghiêm ngặt các quy định về API Contract và Phân quyền đã nêu trên.*
