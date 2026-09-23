# Project: Full End-to-End Integration (Spring Boot 3.3.4 & Next.js 16)

## Architecture
The system integrates a Java 21 Spring Boot 3.3.4 Modular Monolith backend (`http://localhost:8080/api/v1`) with a Next.js 16 (React 19) frontend (`http://localhost:3005`).

```
Frontend (Next.js 16 / React 19)
├── app/
│   ├── layout.tsx                                # Root layout with Toaster
│   ├── page.tsx                                  # Main Dashboard connecting 27 UI components
│   └── login/client.tsx                          # Real Login with Bearer Token & Refresh Token
├── components/                                   # 27 UI components consuming useEmulationStore
├── lib/
│   ├── api/
│   │   ├── client.ts                             # Native Fetch Client (zero deps, Bearer, 401 refresh & retry)
│   │   ├── auth.service.ts                       # Login, refresh-token, me
│   │   ├── unit.service.ts                       # Units list, hierarchy tree, remarks
│   │   ├── soldier.service.ts                    # Soldier CRUD & paginated query
│   │   ├── criteria.service.ts                   # Emulation criteria CRUD & toggle
│   │   ├── score.service.ts                      # Daily scores GET/POST, lock/unlock (21:00 rule)
│   │   ├── commendation.service.ts               # Commendations & discipline CRUD
│   │   └── report.service.ts                     # Unit aggregate emulation matrix report
│   ├── store.ts                                  # useEmulationStore (Strict Real API, 21 signatures preserved)
│   └── notify.ts                                 # Toast notification utility
└── .env.local                                    # NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

                                  ▲
                         HTTP / REST API (JSON)
                      ApiResponse<T> Envelope
                                  ▼

Backend (Spring Boot 3.3.4 / Java 21 - Modular Monolith)
├── common/
│   ├── dto/ApiResponse.java                      # Standard envelope {success, code, message, data, errors, timestamp}
│   ├── enums/                                    # UnitTier, UserRole
│   └── exception/GlobalExceptionHandler.java     # AppException (including 423 Locked), validation errors
├── infrastructure/
│   ├── config/CorsConfig.java                    # CORS for port 3005 with credentials
│   ├── security/SecurityConfig.java              # Stateless JWT security, /api/v1 context-path
│   └── seeder/DataSeeder.java                    # Initial seed data for units, soldiers, criteria, users, scores
└── modules/
    ├── auth/                                     # AuthController, AuthService, UserAccount, JwtTokenProvider
    ├── unit/                                     # UnitController, UnitService, MilitaryUnit, UnitRemark
    ├── soldier/                                  # SoldierController, SoldierService, Soldier, SoldierRepository
    ├── emulation/                                # CriterionController, DailyScoreController, LockController,
    │                                             # CommendationController, EmulationService, DailyLock, CommendationItem
    └── report/                                   # ReportController, ReportService, UnitAggregateResponse
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Standard API Envelope & Error Handling | `ApiResponse<T>` & `GlobalExceptionHandler` with HTTP 423 support | M1 | `docs/backend-integration-spec.md §3` |
| 2 | Unit REST APIs & Remarks | `GET /units`, `GET /units/tree`, `POST /units/{unitId}/remarks` + `UnitRemark` entity | M1 | `ORIGINAL_REQUEST.md §R1` |
| 3 | Soldier CRUD & Filter APIs | `GET /soldiers` (unitId, tier, page, size), `GET /soldiers/{id}`, `POST`, `PUT`, `DELETE` | M1 | `ORIGINAL_REQUEST.md §R1` |
| 4 | Emulation Criteria APIs | `GET /criteria`, `POST`, `PUT`, `PATCH /criteria/{id}/toggle`, `DELETE` | M1 | `ORIGINAL_REQUEST.md §R1` |
| 5 | Daily Scores & 21:00 Lock Rule | `GET /scores/daily`, `POST /scores/daily` (returns 423 if locked, past, or after 21:00) | M1 | `ORIGINAL_REQUEST.md §R1` |
| 6 | Score Lock & Unlock APIs | `POST /scores/lock`, `POST /scores/unlock` with audit history JSON in `DailyLock` | M1 | `ORIGINAL_REQUEST.md §R1` |
| 7 | Commendation & Discipline APIs | `GET /commendations`, `POST /commendations`, `DELETE /commendations/{id}` | M1 | `ORIGINAL_REQUEST.md §R1` |
| 8 | Unit Aggregate Report API | `GET /reports/unit-aggregate` with child units ranking & remarks | M1 | `ORIGINAL_REQUEST.md §R1` |
| 9 | Data Seeder Sample Records | Seed initial daily scores, locks, and commendations for seamless frontend integration | M1 | `ORIGINAL_REQUEST.md §Acceptance` |
| 10 | Backend Integration Test Suite | Comprehensive tests for new controllers, 100% pass with `mvnw test` on Java 21 | M1 | `ORIGINAL_REQUEST.md §R4` |
| 11 | Frontend Native Fetch API Client | `lib/api/client.ts` with zero deps, base URL, Bearer auth, 401 refresh token & retry | M2 | `ORIGINAL_REQUEST.md §R2` |
| 12 | Frontend API Service Modules | 7 service modules in `lib/api/` (`auth`, `unit`, `soldier`, `criteria`, `score`, `commendation`, `report`) | M2 | `ORIGINAL_REQUEST.md §R2` |
| 13 | Environment Configuration | `frontend/my-app/.env.local` configuring `NEXT_PUBLIC_API_BASE_URL` | M2 | `ORIGINAL_REQUEST.md §R2` |
| 14 | Real Authentication UI Flow | Update `app/login/client.tsx` & `login-signup.tsx` with real login, token storage & error toast | M2 | `ORIGINAL_REQUEST.md §R3` |
| 15 | Strict Real API Store Adapter | Refactor `lib/store.ts` to call async API services, eliminate localStorage mock fallback | M3 | `ORIGINAL_REQUEST.md §R3` |
| 16 | Preserve 21 Store Signatures | Maintain exact signatures for 21 actions so 27 UI components remain 100% intact | M3 | `ORIGINAL_REQUEST.md §R3` |
| 17 | Frontend Build Verification | `pnpm run build` and `npx tsc --noEmit` pass with zero type or lint errors | M3 | `ORIGINAL_REQUEST.md §R4` |
| 18 | Dual-End Automated Verification | Run backend tests and frontend production build | M4 | `ORIGINAL_REQUEST.md §Acceptance` |
| 19 | Adversarial Quality Verification | Reviewers & Challengers verify edge cases, lock rules, and token refresh | M4 | System Standard |
| 20 | Forensic Integrity Audit | Auditor verification for authentic implementation, zero cheating, zero mock fallbacks | M4 | Hard Constraint |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Backend Domain REST Controllers & Services | Implement `modules/unit`, `modules/soldier`, `modules/emulation`, `modules/report` controllers, services, DTOs, `UnitRemark` entity, sample seeder, and tests | None | IN_PROGRESS |
| M2 | Frontend Native Fetch API Client & Real Auth | Implement `lib/api/client.ts`, 7 services in `lib/api/`, `.env.local`, and real login in `app/login/client.tsx` | M1 interface contracts | PLANNED |
| M3 | Frontend Store Adapter & Strict Real API | Refactor `lib/store.ts` to async Real API calls, preserve 21 signatures, error toasts | M2 | PLANNED |
| M4 | End-to-End Verification & Forensic Integrity Audit | Full test pass (`mvnw test` + `pnpm run build`), Adversarial challenge, and Forensic Audit | M1, M2, M3 | PLANNED |

## Interface Contracts
### API Envelope & HTTP Codes
- **Base URL:** `http://localhost:8080/api/v1`
- **Envelope:**
  ```json
  {
    "success": true,
    "code": 200,
    "message": "Success message",
    "data": { ... },
    "errors": null,
    "timestamp": 1727107200000
  }
  ```
- **Auth:** `Authorization: Bearer <accessToken>`
- **Refresh:** `POST /api/v1/auth/refresh-token` with `{ "refreshToken": "..." }`
- **423 Locked:**
  ```json
  {
    "success": false,
    "code": 423,
    "message": "Ngày đánh giá đã bị khóa sổ",
    "data": null,
    "errors": null,
    "timestamp": ...
  }
  ```

### Frontend ↔ Backend Service Mapping
| Frontend Service | Backend Controller Endpoint | Methods |
|---|---|---|
| `authService` | `/api/v1/auth/login`, `/refresh-token`, `/me` | POST, GET |
| `unitService` | `/api/v1/units`, `/api/v1/units/tree`, `/api/v1/units/{unitId}/remarks` | GET, POST |
| `soldierService` | `/api/v1/soldiers`, `/api/v1/soldiers/{id}` | GET, POST, PUT, DELETE |
| `criteriaService` | `/api/v1/criteria`, `/api/v1/criteria/{id}`, `/api/v1/criteria/{id}/toggle` | GET, POST, PUT, PATCH, DELETE |
| `scoreService` | `/api/v1/scores/daily`, `/api/v1/scores/lock`, `/api/v1/scores/unlock` | GET, POST |
| `commendationService` | `/api/v1/commendations`, `/api/v1/commendations/{id}` | GET, POST, DELETE |
| `reportService` | `/api/v1/reports/unit-aggregate` | GET |

## Code Layout
- Backend Source: `backend/src/main/java/com/trungdoi/danhgia/`
- Backend Tests: `backend/src/test/java/com/trungdoi/danhgia/`
- Frontend Source: `frontend/my-app/`
- Frontend API Client & Services: `frontend/my-app/lib/api/`
- Frontend Store: `frontend/my-app/lib/store.ts`
- Frontend Login: `frontend/my-app/app/login/client.tsx`
