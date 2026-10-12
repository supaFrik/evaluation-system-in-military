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
public class UnlockDateRequest {

    @NotBlank(message = "Ngày mở khóa không được để trống")
    private String date;

    private String officerName;

    @NotBlank(message = "Lý do mở khóa không được để trống")
    private String reason;
}
