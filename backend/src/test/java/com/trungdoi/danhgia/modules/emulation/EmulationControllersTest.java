package com.trungdoi.danhgia.modules.emulation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trungdoi.danhgia.modules.emulation.dto.*;
import com.trungdoi.danhgia.modules.emulation.enums.CommendationScope;
import com.trungdoi.danhgia.modules.emulation.enums.CommendationType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class EmulationControllersTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // ── 1. Criteria Tests ──
    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("Criteria CRUD & Toggle")
    void testCriteriaFlow() throws Exception {
        CriterionRequest request = CriterionRequest.builder()
                .name("Tiêu chí thử nghiệm")
                .code("TEST_CRIT")
                .maxScore(100)
                .description("Mô tả tiêu chí")
                .build();

        // Create
        var createRes = mockMvc.perform(post("/criteria")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Tiêu chí thử nghiệm"))
                .andReturn();

        String critId = objectMapper.readTree(createRes.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // Toggle
        mockMvc.perform(patch("/criteria/" + critId + "/toggle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isActive").value(false));

        // Delete
        mockMvc.perform(delete("/criteria/" + critId))
                .andExpect(status().isOk());
    }

    // ── 2. Daily Score & Lock / Unlock Tests ──
    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("Lock, Unlock and Daily Scoring Flow")
    void testScoreAndLockFlow() throws Exception {
        String testDate = java.time.LocalDate.now().toString();

        // 1. Save score when unlocked
        SaveDailyScoreRequest scoreReq = SaveDailyScoreRequest.builder()
                .soldierId("s-001")
                .soldierName("Nguyễn Văn An")
                .platoonId("b1")
                .date(testDate)
                .politicalScore(95)
                .taskScore(90)
                .hygieneScore(92)
                .bearingScore(98)
                .criteriaScores(Map.of("crit_ct", 95, "crit_nv", 90))
                .build();

        mockMvc.perform(post("/scores/daily")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scoreReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.soldierId").value("s-001"));

        // 2. Lock the date
        LockDateRequest lockReq = LockDateRequest.builder()
                .date(testDate)
                .officerName("Đại úy Nguyễn Văn Thắng")
                .note("Đã điểm danh tối 21:00")
                .build();

        mockMvc.perform(post("/scores/lock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lockReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isLocked").value(true));

        // 3. Try to save score on locked date -> Expect 423 Locked
        mockMvc.perform(post("/scores/daily")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scoreReq)))
                .andExpect(status().is(423))
                .andExpect(jsonPath("$.code").value(423));

        // 4. Unlock the date
        UnlockDateRequest unlockReq = UnlockDateRequest.builder()
                .date(testDate)
                .officerName("Đại úy Nguyễn Văn Thắng")
                .reason("Bổ sung điểm trực gác")
                .build();

        mockMvc.perform(post("/scores/unlock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unlockReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isLocked").value(false));

        // 5. Save score again after unlock -> Expect 200 OK
        mockMvc.perform(post("/scores/daily")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scoreReq)))
                .andExpect(status().isOk());
    }

    // ── 3. Commendation Tests ──
    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("Create, Read and Delete Commendation")
    void testCommendationFlow() throws Exception {
        CommendationRequest req = CommendationRequest.builder()
                .type(CommendationType.COMMENDATION)
                .scope(CommendationScope.INDIVIDUAL)
                .targetId("s-001")
                .targetName("Binh nhất Nguyễn Văn An")
                .platoonId("b1")
                .content("Gấp chăn màn đẹp nhất Trung đội")
                .date("2026-09-24")
                .build();

        // Create
        var createRes = mockMvc.perform(post("/commendations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.content").value("Gấp chăn màn đẹp nhất Trung đội"))
                .andReturn();

        String id = objectMapper.readTree(createRes.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // Read
        mockMvc.perform(get("/commendations?date=2026-09-24"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());

        // Delete
        mockMvc.perform(delete("/commendations/" + id))
                .andExpect(status().isOk());
    }

    // ── 4. RBAC: USER cannot score or lock ──
    @Test
    @WithMockUser(username = "user_demo", roles = {"USER"})
    @DisplayName("USER role cannot lock date - 403 Forbidden")
    void testUserCannotLock() throws Exception {
        LockDateRequest lockReq = LockDateRequest.builder()
                .date("2026-09-24")
                .officerName("Chiến sĩ demo")
                .build();

        mockMvc.perform(post("/scores/lock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lockReq)))
                .andExpect(status().isForbidden());
    }
}
