package com.trungdoi.danhgia.modules.emulation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LockDateRequest {

    @NotBlank(message = "Ngày chốt sổ không được để trống")
    private String date;

    private String officerName;
    private String note;
}
