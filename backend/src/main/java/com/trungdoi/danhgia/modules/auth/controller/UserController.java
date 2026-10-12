package com.trungdoi.danhgia.modules.auth.controller;

import com.trungdoi.danhgia.common.dto.ApiResponse;
import com.trungdoi.danhgia.common.enums.UserRole;
import com.trungdoi.danhgia.modules.auth.dto.request.AssignSoldierRequest;
import com.trungdoi.danhgia.modules.auth.dto.request.AssignUnitsRequest;
import com.trungdoi.danhgia.modules.auth.dto.request.UpdateRoleScopeRequest;
import com.trungdoi.danhgia.modules.auth.dto.response.UserResponseDto;
import com.trungdoi.danhgia.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> getAllUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        List<UserResponseDto> users = authService.getAllUsers(role, status, search);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách người dùng thành công", users));
    }

    @PutMapping("/{userId}/assign-soldier")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDto>> assignSoldier(
            @PathVariable String userId,
            @Valid @RequestBody AssignSoldierRequest request) {
        UserResponseDto response = authService.assignSoldier(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Liên kết hồ sơ quân nhân thành công", response));
    }

    @PutMapping("/{userId}/role-scope")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDto>> updateRoleScope(
            @PathVariable String userId,
            @Valid @RequestBody UpdateRoleScopeRequest request) {
        UserResponseDto response = authService.updateRoleScope(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật quyền và đơn vị phụ trách thành công", response));
    }

    @PutMapping("/{userId}/assigned-units")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDto>> assignUnitsToUser(
            @PathVariable String userId,
            @RequestBody AssignUnitsRequest request) {
        UserResponseDto response = authService.assignUnitsToUser(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật danh sách đơn vị phụ trách thành công", response));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable String userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String currentUsername = userDetails != null ? userDetails.getUsername() : "";
        authService.deleteUser(userId, currentUsername);
        return ResponseEntity.ok(ApiResponse.success("Xóa tài khoản thành công", null));
    }
}
