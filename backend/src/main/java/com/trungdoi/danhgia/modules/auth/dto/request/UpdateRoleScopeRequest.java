package com.trungdoi.danhgia.modules.auth.dto.request;

import com.trungdoi.danhgia.common.enums.UnitTier;
import com.trungdoi.danhgia.common.enums.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateRoleScopeRequest {

    @NotNull(message = "Vai trò (role) không được để trống")
    private UserRole role;

    private String roleTitle;

    private UnitTier unitScopeTier;

    private String assignedUnitId;

    private List<String> assignedUnitIds;

    private String platoonId;

    private String status;
}
