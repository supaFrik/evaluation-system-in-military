package com.trungdoi.danhgia.modules.auth.controller;

import com.trungdoi.danhgia.common.exception.UnauthorizedException;

import com.trungdoi.danhgia.common.dto.ApiResponse;
import com.trungdoi.danhgia.modules.auth.dto.request.LoginRequest;
import com.trungdoi.danhgia.modules.auth.dto.request.RefreshTokenRequest;
import com.trungdoi.danhgia.modules.auth.dto.response.AuthResponse;
import com.trungdoi.danhgia.modules.auth.dto.response.UserResponseDto;
import com.trungdoi.danhgia.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }

    @PostMapping({"/refresh-token", "/refresh"})
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Làm mới token thành công", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDto>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new UnauthorizedException("Chưa đăng nhập hoặc phiên làm việc đã hết hạn");
        }
        UserResponseDto userDto = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người dùng thành công", userDto));
    }
}
