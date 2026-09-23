package com.trungdoi.danhgia.modules.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {
    private String id;
    private String username;
    private String name;
    private String rank;
    private String role;
    private String roleTitle;
    private String soldierId;
    private String platoonId;
    private String unitScopeTier;
    private String assignedUnitId;
    private String phone;
    private String avatarUrl;
}
