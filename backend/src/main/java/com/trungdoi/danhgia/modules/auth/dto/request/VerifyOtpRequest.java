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
public class VerifyOtpRequest {

    @NotBlank(message = "Email hoặc thông tin định danh không được để trống")
    private String identifier;

    @NotBlank(message = "Mã xác thực OTP không được để trống")
    private String otpCode;
}
