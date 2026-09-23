# E2E Test Infra: Military Emulation Management System Backend

## Test Philosophy
- Automated test verification using Spring Boot 3.3.4 Test Suite & MockMvc.
- Regression testing covering 100% of existing authentication flows, JWT token validations, context boot, and data seeding.
- Build & test command: `$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"; .\mvnw.cmd clean test` in `backend/`.

## Feature Inventory & Test Coverage
| # | Feature | Test Class | Current Cases | Target Status |
|---|---------|------------|:-------------:|:-------------:|
| 1 | Login Success (Thang B1) | `AuthControllerTest` | 1 | PASS |
| 2 | Login Failure (Bad Password) | `AuthControllerTest` | 1 | PASS |
| 3 | Login Failure (Non-existent user) | `AuthControllerTest` | 1 | PASS |
| 4 | Refresh Token Success | `AuthControllerTest` | 1 | PASS |
| 5 | Refresh Token Alias Endpoint | `AuthControllerTest` | 1 | PASS |
| 6 | Refresh Token Substitution Block | `AuthControllerTest` | 1 | PASS |
| 7 | Access Token Substitution Block | `AuthControllerTest` | 1 | PASS |
| 8 | Invalid Refresh Token | `AuthControllerTest` | 1 | PASS |
| 9 | Current User /me Success | `AuthControllerTest` | 1 | PASS |
| 10 | Current User /me Unauthorized | `AuthControllerTest` | 1 | PASS |
| 11 | Blank Field Validation | `AuthControllerTest` | 1 | PASS |
| 12 | Case Insensitive Login | `AuthControllerTest` | 1 | PASS |
| 13 | All Demo Accounts Login | `AuthControllerTest` | 1 | PASS |
| 14 | JWT Access Token Lifecycle | `JwtTokenProviderTest` | 1 | PASS |
| 15 | JWT Refresh Token Lifecycle | `JwtTokenProviderTest` | 1 | PASS |
| 16 | JWT Invalid Token Detection | `JwtTokenProviderTest` | 1 | PASS |
| 17 | JWT Expired Token Handling | `JwtTokenProviderTest` | 1 | PASS |
| 18 | Full Spring Context Boot | `DemoApplicationTests` | 1 | PASS |

## Test Architecture
- Test Runner: Maven Surefire Plugin via `mvnw.cmd`
- Database: H2 in-memory DB (`MODE=MySQL`, `create-drop`), populated by `DataSeeder`
- Context Path: `/api/v1`
- Java Version: Java 21 LTS (`C:\Program Files\Java\jdk-21`)
- Success Criteria: 100% tests pass (18/18 or more), 0 failures, 0 errors, 0 skips, clean compile.
