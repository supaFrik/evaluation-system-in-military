package com.trungdoi.danhgia.modules.soldier;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trungdoi.danhgia.modules.soldier.dto.SoldierRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SoldierControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /soldiers without auth returns 401")
    void testGetSoldiers_Unauthorized() throws Exception {
        mockMvc.perform(get("/soldiers"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("GET /soldiers returns paged soldier list")
    void testGetSoldiers_Success() throws Exception {
        mockMvc.perform(get("/soldiers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").isNumber());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("GET /soldiers with tier=REGIMENT and unitId=C1-B1 returns filtered soldiers")
    void testGetSoldiers_WithTierAndUnitFilter() throws Exception {
        mockMvc.perform(get("/soldiers?tier=REGIMENT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());

        mockMvc.perform(get("/soldiers?unitId=C1-B1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("POST /soldiers creates a new soldier, PUT updates, and DELETE removes")
    void testSoldierLifecycle() throws Exception {
        String code = "TEST-QN-" + System.currentTimeMillis();
        SoldierRequest request = SoldierRequest.builder()
                .name("Nguyễn Văn Kiểm Thử")
                .rank("Binh nhì")
                .roleTitle("Chiến sĩ")
                .platoonId("b1")
                .militaryCode(code)
                .build();

        // 1. Create
        var createResult = mockMvc.perform(post("/soldiers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Nguyễn Văn Kiểm Thử"))
                .andReturn();

        String soldierId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 2. Get by ID
        mockMvc.perform(get("/soldiers/" + soldierId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.militaryCode").value(code));

        // 3. Update
        request.setName("Nguyễn Văn Kiểm Thử (Đã Sửa)");
        mockMvc.perform(put("/soldiers/" + soldierId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Nguyễn Văn Kiểm Thử (Đã Sửa)"));

        // 4. Delete
        mockMvc.perform(delete("/soldiers/" + soldierId))
                .andExpect(status().isOk());

        // 5. Verify deleted
        mockMvc.perform(get("/soldiers/" + soldierId))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "user_demo", roles = {"USER"})
    @DisplayName("POST /soldiers with USER role returns 403 Forbidden")
    void testCreateSoldier_ForbiddenForUser() throws Exception {
        SoldierRequest request = SoldierRequest.builder()
                .name("Quân nhân không được phép")
                .rank("Binh nhất")
                .platoonId("b1")
                .militaryCode("QN-FORBIDDEN-01")
                .build();

        mockMvc.perform(post("/soldiers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
