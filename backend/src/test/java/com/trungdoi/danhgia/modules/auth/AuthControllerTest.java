package com.trungdoi.danhgia.modules.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trungdoi.danhgia.modules.auth.dto.request.LoginRequest;
import com.trungdoi.danhgia.modules.auth.dto.request.RefreshTokenRequest;
import com.trungdoi.danhgia.modules.auth.dto.request.RegisterRequest;
import com.trungdoi.danhgia.modules.auth.dto.request.VerifyOtpRequest;
import com.trungdoi.danhgia.modules.auth.entity.OtpToken;
import com.trungdoi.danhgia.modules.auth.repository.OtpTokenRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OtpTokenRepository otpTokenRepository;

    @Test
    @DisplayName("AC1: Login successfully with thang_b1 account and return valid JWT with role ADMIN")
    void testLoginSuccess_ThangB1() throws Exception {
        LoginRequest request = new LoginRequest("thang_b1", "Password@123");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Đăng nhập thành công"))
                .andExpect(jsonPath("$.data.accessToken").isString())
                .andExpect(jsonPath("$.data.refreshToken").isString())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.user.username").value("thang_b1"))
                .andExpect(jsonPath("$.data.user.name").value("Nguyễn Văn Thắng"))
                .andExpect(jsonPath("$.data.user.role").value("ADMIN"))
                .andExpect(jsonPath("$.data.user.roleTitle").value("Trung đội trưởng B1"))
                .andExpect(jsonPath("$.data.user.unitScopeTier").value("PLATOON"))
                .andExpect(jsonPath("$.data.user.platoonId").value("C1-B1"))
                .andExpect(jsonPath("$.data.user.assignedUnitId").value("C1-B1"));
    }

    @Test
    @DisplayName("Login fails with invalid password")
    void testLoginFailure_WrongPassword() throws Exception {
        LoginRequest request = new LoginRequest("thang_b1", "WrongPassword");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @DisplayName("Login fails with non-existent user")
    void testLoginFailure_NonExistentUser() throws Exception {
        LoginRequest request = new LoginRequest("unknown_user", "Password@123");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Refresh token successfully generates new access token")
    void testRefreshTokenSuccess() throws Exception {
        // 1. First login
        LoginRequest loginRequest = new LoginRequest("thang_b1", "Password@123");
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String refreshToken = root.path("data").path("refreshToken").asText();
        assertNotNull(refreshToken);

        // 2. Call refresh token
        RefreshTokenRequest refreshRequest = new RefreshTokenRequest(refreshToken);
        mockMvc.perform(post("/auth/refresh-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isString())
                .andExpect(jsonPath("$.data.refreshToken").isString())
                .andExpect(jsonPath("$.data.user.username").value("thang_b1"));
    }

    @Test
    @DisplayName("Refresh token alias endpoint /auth/refresh works identically")
    void testRefreshTokenAliasEndpoint() throws Exception {
        LoginRequest loginRequest = new LoginRequest("thang_b1", "Password@123");
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String refreshToken = root.path("data").path("refreshToken").asText();

        RefreshTokenRequest refreshRequest = new RefreshTokenRequest(refreshToken);
        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isString());
    }

    @Test
    @DisplayName("Security: Refresh token cannot be used as Bearer access token")
    void testRefreshTokenCannotBeUsedAsAccessToken() throws Exception {
        LoginRequest loginRequest = new LoginRequest("thang_b1", "Password@123");
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String refreshToken = root.path("data").path("refreshToken").asText();

        mockMvc.perform(get("/auth/me")
                        .header("Authorization", "Bearer " + refreshToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Security: Access token cannot be used as Refresh token")
    void testAccessTokenCannotBeUsedAsRefreshToken() throws Exception {
        LoginRequest loginRequest = new LoginRequest("thang_b1", "Password@123");
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String accessToken = root.path("data").path("accessToken").asText();

        RefreshTokenRequest refreshRequest = new RefreshTokenRequest(accessToken);
        mockMvc.perform(post("/auth/refresh-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Refresh token fails with invalid token")
    void testRefreshToken_Invalid() throws Exception {
        RefreshTokenRequest refreshRequest = new RefreshTokenRequest("invalid_refresh_token_string");

        mockMvc.perform(post("/auth/refresh-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @DisplayName("Get current user profile /auth/me with Bearer token")
    void testGetCurrentUser_Success() throws Exception {
        // 1. Login to get access token
        LoginRequest loginRequest = new LoginRequest("thang_b1", "Password@123");
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String accessToken = root.path("data").path("accessToken").asText();

        // 2. Request /auth/me with Bearer token
        mockMvc.perform(get("/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("thang_b1"))
                .andExpect(jsonPath("$.data.name").value("Nguyễn Văn Thắng"))
                .andExpect(jsonPath("$.data.role").value("ADMIN"));
    }

    @Test
    @DisplayName("Get current user profile /auth/me without token returns 401")
    void testGetCurrentUser_Unauthorized() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @DisplayName("Validation fails when username or password is blank")
    void testLoginValidation_BlankFields() throws Exception {
        LoginRequest request = new LoginRequest("", "");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    @DisplayName("Login works case-insensitively for username")
    void testLoginSuccess_CaseInsensitive() throws Exception {
        LoginRequest request = new LoginRequest("THANG_B1", "Password@123");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.username").value("thang_b1"));
    }

    @Test
    @DisplayName("Register with Gmail creates PENDING account and generates OTP; verifyOtp activates it")
    void testRegisterWithEmail_And_VerifyOtp() throws Exception {
        String testEmail = "testuser." + System.currentTimeMillis() + "@gmail.com";
        RegisterRequest registerReq = RegisterRequest.builder()
                .name("Trần Văn Test")
                .email(testEmail)
                .password("Password@123")
                .build();

        // 1. Register with email
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("USER"))
                .andExpect(jsonPath("$.data.status").value("PENDING"));

        // 2. Fetch the generated OTP from database
        OtpToken otpToken = otpTokenRepository.findTopByIdentifierAndIsUsedFalseOrderByCreatedAtDesc(testEmail)
                .orElseThrow(() -> new AssertionError("OTP token was not generated in repository"));
        assertNotNull(otpToken.getOtpCode());

        // 3. Verify OTP
        VerifyOtpRequest verifyReq = VerifyOtpRequest.builder()
                .identifier(testEmail)
                .otpCode(otpToken.getOtpCode())
                .build();

        mockMvc.perform(post("/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isString())
                .andExpect(jsonPath("$.data.user.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.user.role").value("USER"));
    }

    @Test
    @DisplayName("Register with Phone number creates ACTIVE account directly with USER role")
    void testRegisterWithPhone_Success() throws Exception {
        String testPhone = "0987" + (System.currentTimeMillis() % 1000000);
        RegisterRequest registerReq = RegisterRequest.builder()
                .name("Lê Văn Số ĐT")
                .phone(testPhone)
                .password("Password@123")
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("USER"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.phone").value(testPhone));
    }

    @Test
    @DisplayName("Register fails if email is already registered")
    void testRegisterDuplicateEmail_Fails() throws Exception {
        RegisterRequest registerReq = RegisterRequest.builder()
                .name("Tài khoản trùng email")
                .email("thang.nguyen@mod.gov.vn") // already in DataSeeder
                .password("Password@123")
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
