package com.trungdoi.danhgia.modules.unit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trungdoi.danhgia.modules.unit.dto.UnitRemarkRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UnitControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /units without auth returns 401")
    void testGetAllUnits_Unauthorized() throws Exception {
        mockMvc.perform(get("/units"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("GET /units with auth returns unit list")
    void testGetAllUnits_Success() throws Exception {
        mockMvc.perform(get("/units"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("GET /units/tree returns tree structure")
    void testGetUnitTree_Success() throws Exception {
        mockMvc.perform(get("/units/tree"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].id").value("e335"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("POST /units/{unitId}/remarks saves remark")
    void testSaveRemark_Success() throws Exception {
        UnitRemarkRequest request = UnitRemarkRequest.builder()
                .date("2026-09-24")
                .remark("Duy trì nền nếp tác phong tốt.")
                .build();

        mockMvc.perform(post("/units/e335/remarks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.generalRemark").value("Duy trì nền nếp tác phong tốt."));
    }

    @Test
    @WithMockUser(username = "user_demo", roles = {"USER"})
    @DisplayName("POST /units/{unitId}/remarks with USER role returns 403 Forbidden")
    void testSaveRemark_ForbiddenForUser() throws Exception {
        UnitRemarkRequest request = UnitRemarkRequest.builder()
                .date("2026-09-24")
                .remark("Chiến sĩ không có quyền nhận xét đơn vị.")
                .build();

        mockMvc.perform(post("/units/e335/remarks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
