# TÀI LIỆU THIẾT KẾ HẠ TẦNG BACKEND & QUY TRÌNH DEVOPS
## Hệ thống Quản lý và Theo dõi Thi đua Quân nhân (Sư đoàn 324 - Trung đoàn 335)

> **Môi trường:** Private VPS / Máy chủ ảo mạng riêng  
> **Triết lý:** Tối ưu hóa hiệu năng, bảo mật, chuẩn YAGNI (loại bỏ lãng phí tài nguyên)  
> **Kiến trúc:** Next.js 16 ↔ Nginx Gateway ↔ Spring Boot 3.3.4 (Modular Monolith) ↔ MySQL 8.0

---

## 1. TỔNG QUAN KIẾN TRÚC HẠ TẦNG (SYSTEM TOPOLOGY)

```
                       INTERNET / MẠNG NỘI BỘ KIỂM SOÁT
                                      │
                                      ▼ [Port 80 / 443]
              ┌──────────────────────────────────────────────────┐
              │           NGINX REVERSE PROXY & GATEWAY          │
              │  - Quản lý SSL/TLS (HTTPS)                       │
              │  - Rate Limiting chống Brute-force (/auth/login) │
              │  - Gzip / HTTP/2 & Static Cache                  │
              └───────────────┬──────────────────┬───────────────┘
                              │                  │
           Proxy [Port 3005]  │                  │  Proxy [Port 8080]
           Path: /*           │                  │  Path: /api/v1/*
                              ▼                  ▼
             ┌─────────────────────┐   ┌──────────────────────────────┐
             │  CONTAINER FRONTEND │   │      CONTAINER BACKEND       │
             │   Next.js 16 (SSR)  │   │     Spring Boot 3 (Java 21)  │
             │   React 19 / Node20 │   │  - Modular Monolith          │
             │   Port nội bộ: 3005 │   │  - Optimistic/Pessimistic    │
             └─────────────────────┘   │    Locking (Chống Race Cond) │
                                       │  - Port nội bộ: 8080         │
                                       └──────────────┬───────────────┘
                                                      │ JDBC [Port 3306]
                                                      ▼
                                       ┌──────────────────────────────┐
                                       │      CONTAINER DATABASE      │
                                       │          MySQL 8.0           │
                                       │   Volume: mysql_data         │
                                       └──────────────────────────────┘
```

---

## 2. TECH CORE BACKEND (CHỐNG RACE CONDITION & RATE LIMITING KHÔNG CẦN REDIS)

### 2.1. Giải quyết Race Condition bằng Database Locking (Zero-Cost, Cực kỳ Đáng tin cậy)

Hệ thống thi đua có 2 tình huống nhạy cảm về tranh chấp dữ liệu:
1. **Hai cán bộ cùng chấm điểm hoặc sửa điểm cho một chiến sĩ cùng lúc.**
2. **Cán bộ đang sửa điểm thì cấp trên bấm nút Chốt sổ 21:00 (`lockDate`).**

#### A. Khóa Lạc quan (Optimistic Locking) cho Chấm điểm thi đua (`DailyScore`)
Sử dụng trường `@Version` của JPA/Hibernate. Khi lưu điểm, Hibernate tự động so sánh số version. Nếu có người khác đã sửa trước, hệ thống tự động ném `OptimisticLockingFailureException` thay vì ghi đè mất dữ liệu.

```java
@Entity
@Table(name = "daily_scores", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"soldier_id", "score_date"})
})
@Getter
@Setter
public class DailyScore {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Version
    @Column(name = "version")
    private Long version; // Tự động tăng khi cập nhật, chống ghi đè đồng thời

    // ... các trường điểm và vi phạm
}
```

#### B. Khóa Bi quan (Pessimistic Locking) cho Nghiệp vụ Chốt sổ 21:00 (`DailyLock`)
Khi thực hiện chốt sổ hoặc mở khóa sổ ngày, cần đảm bảo chỉ **duy nhất 1 giao dịch** được cập nhật trạng thái của ngày đó:

```java
public interface DailyLockRepository extends JpaRepository<DailyLock, String> {
    
    // Khóa dòng dữ liệu của ngày đó trong MySQL (SELECT ... FOR UPDATE)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM DailyLock l WHERE l.lockDate = :date")
    Optional<DailyLock> findByLockDateWithLock(@Param("date") LocalDate date);
}
```

---

### 2.2. Rate Limiting Chống Tấn công Dò Mật khẩu & Spam Request

#### Cấu hình tại Gateway Nginx (Hiệu năng cao nhất, chặn từ cửa ngõ)
Nginx sử dụng thuật toán Leaky Bucket để giới hạn tần suất request mà không tiêu hao CPU/RAM của Spring Boot:

```nginx
# Định nghĩa vùng nhớ giới hạn: 10MB lưu được 160.000 IP
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;  # Tối đa 5 lần login/phút
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/s;    # API chung: 30 req/giây

server {
    listen 443 ssl http2;
    server_name thidua.e335.vn;

    # Bảo vệ endpoint đăng nhập chống Brute-force
    location /api/v1/auth/login {
        limit_req zone=login_limit burst=3 nodelay;
        proxy_pass http://backend:8080/api/v1/auth/login;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }

    # API chung
    location /api/v1/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://backend:8080/api/v1/;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

---

## 3. DOCKER & CONTAINERIZATION (CHUẨN HÓA TRÊN PRIVATE VPS)

### 3.1. Dockerfile Backend (`backend/Dockerfile`) - Multi-Stage Build Tối ưu Kích thước
```dockerfile
# Giai đoạn 1: Build mã nguồn với Maven và JDK 21
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline -B
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Giai đoạn 2: Runtime JRE 21 siêu nhẹ (~180MB)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Tạo user thường không quyền root để tăng cường bảo mật
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
COPY --from=builder /app/target/*.jar app.jar

ENV TZ=Asia/Ho_Chi_Minh
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
```

### 3.2. Dockerfile Frontend (`frontend/my-app/Dockerfile`) - Standalone Output
```dockerfile
# Giai đoạn 1: Cài đặt dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Giai đoạn 2: Build Next.js
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# Giai đoạn 3: Runner tối giản (< 150MB)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3005
ENV PORT=3005
CMD ["node", "server.js"]
```

### 3.3. File Điều phối `docker-compose.yml`
```yaml
version: '3.8'

services:
  database:
    image: mysql:8.0
    container_name: thidua-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-root_password_secret}
      MYSQL_DATABASE: military_emulation
      MYSQL_USER: ${DB_USER:-thidua_user}
      MYSQL_PASSWORD: ${DB_PASSWORD:-thidua_pass_secret}
      TZ: Asia/Ho_Chi_Minh
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - internal_net
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: thidua-backend
    restart: always
    depends_on:
      database:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://database:3306/military_emulation?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&allowPublicKeyRetrieval=true&characterEncoding=UTF-8
      SPRING_DATASOURCE_USERNAME: ${DB_USER:-thidua_user}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD:-thidua_pass_secret}
      JWT_SECRET: ${JWT_SECRET:-9a2f8c4e7b1d3f6a8e0c2b5d7e9f1a3c5b7d9e1f3a5c7b9e1f3a5c7b9e1f3a5c}
      TZ: Asia/Ho_Chi_Minh
    networks:
      - internal_net
      - proxy_net

  frontend:
    build:
      context: ./frontend/my-app
      dockerfile: Dockerfile
    container_name: thidua-frontend
    restart: always
    environment:
      NEXT_PUBLIC_API_BASE_URL: https://thidua.e335.vn/api/v1
    networks:
      - proxy_net

  nginx:
    image: nginx:alpine
    container_name: thidua-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - backend
      - frontend
    networks:
      - proxy_net

networks:
  internal_net:
    internal: true # Tuyệt đối không expose port MySQL ra ngoài Internet
  proxy_net:

volumes:
  mysql_data:
```

---

## 4. QUY TRÌNH DEVOPS & CI/CD (GITHUB ACTIONS QUA SSH)

Pipeline tự động hóa kiểm thử mã nguồn và triển khai lên Private VPS khi có commit trên nhánh `main`:

Tạo file `.github/workflows/deploy.yml`:
```yaml
name: CI/CD Pipeline - Military Emulation System

on:
  push:
    branches: [ "main" ]

## 4. QUY TRÌNH DEVOPS & CI/CD (JACOCO, SONARCLOUD, HANOI TIMEZONE & SSH DEPLOY)

Pipeline tự động hóa hoàn chỉnh gồm 3 giai đoạn: **Kiểm thử & Đo độ bao phủ JaCoCo** ➔ **Phân tích Chất lượng & Bảo mật SonarCloud** ➔ **Deploy lên Private VPS qua SSH**.

Tệp cấu hình `.github/workflows/deploy.yml`:
```yaml
name: CI/CD Pipeline - Military Emulation System

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

env:
  TZ: "Asia/Ho_Chi_Minh" # Múi giờ Hà Nội (GMT+7) xuyên suốt runner

jobs:
  test-and-analyze:
    name: Backend Test, JaCoCo Coverage & SonarQube Analysis
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code with Full History
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # SonarQube cần toàn bộ commit history để phân tích blame

      - name: Configure System Timezone (Hanoi - GMT+7)
        run: |
          sudo timedatectl set-timezone Asia/Ho_Chi_Minh
          date

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven

      - name: Cache SonarCloud Packages
        uses: actions/cache@v4
        with:
          path: ~/.sonar/cache
          key: ${{ runner.os }}-sonar
          restore-keys: ${{ runner.os }}-sonar

      - name: Run Backend Tests with JaCoCo Coverage
        run: |
          cd backend
          mvn clean test jacoco:report

      - name: Upload JaCoCo Coverage Report Artifact
        uses: actions/upload-artifact@v4
        with:
          name: jacoco-report
          path: backend/target/site/jacoco/
          retention-days: 7

      - name: SonarCloud Scan & Code Quality Analysis
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        run: |
          cd backend
          mvn sonar:sonar \
            -Dsonar.organization=${{ secrets.SONAR_ORGANIZATION }} \
            -Dsonar.projectKey=${{ secrets.SONAR_PROJECT_KEY }} \
            -Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml

      - name: Check SonarQube Quality Gate
        uses: sonarsource/sonarqube-quality-gate-action@master
        timeout-minutes: 5
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        with:
          scanMetadataReportFile: backend/target/sonar/report-task.txt

  frontend-build:
    name: Frontend Lint & Production Build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Configure System Timezone (Hanoi - GMT+7)
        run: |
          sudo timedatectl set-timezone Asia/Ho_Chi_Minh
          date

      - name: Set up Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        run: corepack enable && corepack prepare pnpm@latest --activate

      - name: Install Dependencies
        run: |
          cd frontend/my-app
          pnpm install --frozen-lockfile

      - name: Run Next.js Build
        env:
          TZ: "Asia/Ho_Chi_Minh"
          NEXT_PUBLIC_API_BASE_URL: "https://thidua.e335.vn/api/v1"
        run: |
          cd frontend/my-app
          pnpm run build

  deploy:
    name: Deploy to Private VPS via SSH
    needs: [test-and-analyze, frontend-build]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Execute Remote Deployment
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT || 22 }}
          script: |
            export TZ="Asia/Ho_Chi_Minh"
            cd /opt/military-emulation-system
            git pull origin main
            docker compose build --pull
            docker compose up -d --remove-orphans
            docker system prune -f
```

---

## 5. ĐỒNG BỘ TOÀN DIỆN MÚI GIỜ HÀ NỘI (ASIA/HO_CHI_MINH - GMT+7)

Để đảm bảo các quy chế điểm danh, lịch sử kỷ luật và đặc biệt là **logic tự động chốt sổ sau 21:00** (`DailyLockStatus`) chạy hoàn toàn chuẩn xác và đồng nhất ở mọi môi trường:

| Tầng Hệ Thống | Vị Trí Cấu Hình | Chi Tiết Kỹ Thuật |
| :--- | :--- | :--- |
| **Spring Boot JVM** | `DemoApplication.java` | `@PostConstruct public void init() { TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh")); }` |
| **Maven & Surefire** | `backend/pom.xml` | `<argLine>@{argLine} -Dfile.encoding=UTF-8 -Duser.timezone=Asia/Ho_Chi_Minh</argLine>` |
| **Jackson JSON** | `application.properties` | `spring.jackson.time-zone=Asia/Ho_Chi_Minh` và `spring.jackson.date-format=yyyy-MM-dd HH:mm:ss` |
| **MySQL Database** | JDBC Connection String | `jdbc:mysql://...&serverTimezone=Asia/Ho_Chi_Minh&characterEncoding=UTF-8` |
| **MySQL Container** | `docker-compose.yml` | `environment: TZ: Asia/Ho_Chi_Minh` và `command: --default-time-zone=+07:00` |
| **Dockerfiles** | Backend & Frontend | `ENV TZ=Asia/Ho_Chi_Minh` |
| **CI/CD Runner** | GitHub Actions | `sudo timedatectl set-timezone Asia/Ho_Chi_Minh` và `env: TZ: "Asia/Ho_Chi_Minh"` |

---

## 6. BẢO MẬT & SAO LƯU DỮ LIỆU ĐẶC THÙ QUÂN ĐỘI

1. **Cô lập Mạng Cơ sở Dữ liệu (`internal: true`)**: MySQL chỉ được đặt trong mạng Docker nội bộ, không mở port `3306` ra ngoài IP máy chủ.
2. **Kịch bản Tự động Sao lưu Database (Backup Cronjob trên VPS)**:
   ```bash
   # Thêm vào crontab: chạy lúc 02:00 sáng mỗi ngày
   0 2 * * * docker exec thidua-mysql mysqldump -u root -p"$DB_ROOT_PASSWORD" military_emulation | gzip > /opt/backups/emulation_$(date +\%F).sql.gz
   # Tự động xóa file backup cũ hơn 30 ngày
   0 3 * * * find /opt/backups/ -type f -name "*.sql.gz" -mtime +30 -delete
   ```
3. **Audit Log ghi thẳng vào Database**: Mọi hành vi chấm điểm, sửa điểm, mở khóa sổ đều được ghi lại vào bảng `audit_logs` kèm `timestamp`, `ip_address`, `username` và `old_value`/`new_value` phục vụ công tác thanh tra đơn vị.

---
*Tài liệu được cập nhật chuẩn hóa theo yêu cầu JaCoCo, SonarCloud Quality Gate và Múi giờ Hà Nội (GMT+7).*
