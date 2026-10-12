package com.trungdoi.danhgia.modules.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignSoldierRequest {
    @NotBlank(message = "Mã quân nhân (soldierId) không được để trống")
    private String soldierId;
}
