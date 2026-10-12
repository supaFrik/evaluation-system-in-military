package com.trungdoi.danhgia.modules.emulation.controller;

import com.trungdoi.danhgia.common.dto.ApiResponse;
import com.trungdoi.danhgia.modules.emulation.dto.*;
import com.trungdoi.danhgia.modules.emulation.service.DailyScoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/scores")
@RequiredArgsConstructor
public class DailyScoreController {

    private final DailyScoreService dailyScoreService;

    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<DailyScoreSheetResponse>> getDailyScores(
            @RequestParam String date,
            @RequestParam(required = false) String unitId) {
        DailyScoreSheetResponse response = dailyScoreService.getDailyScores(date, unitId);
        return ResponseEntity.ok(ApiResponse.success("Lấy bảng điểm ngày thành công", response));
    }

    @PostMapping("/daily")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCORER', 'COMMANDER')")
    public ResponseEntity<ApiResponse<DailyScoreResponse>> saveDailyScore(
            @Valid @RequestBody SaveDailyScoreRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (request.getEvaluatedBy() == null || request.getEvaluatedBy().isBlank()) {
            if (userDetails != null) {
                request.setEvaluatedBy(userDetails.getUsername());
            }
        }
        DailyScoreResponse response = dailyScoreService.saveDailyScore(request);
        return ResponseEntity.ok(ApiResponse.success("Lưu điểm thi đua thành công", response));
    }

    @PostMapping("/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DailyLockStatusDto>> lockDate(
            @Valid @RequestBody LockDateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (request.getOfficerName() == null || request.getOfficerName().isBlank()) {
            if (userDetails != null) {
                request.setOfficerName(userDetails.getUsername());
            }
        }
        DailyLockStatusDto response = dailyScoreService.lockDate(request);
        return ResponseEntity.ok(ApiResponse.success("Chốt sổ thi đua ngày thành công", response));
    }

    @PostMapping("/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DailyLockStatusDto>> unlockDate(
            @Valid @RequestBody UnlockDateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (request.getOfficerName() == null || request.getOfficerName().isBlank()) {
            if (userDetails != null) {
                request.setOfficerName(userDetails.getUsername());
            }
        }
        DailyLockStatusDto response = dailyScoreService.unlockDate(request);
        return ResponseEntity.ok(ApiResponse.success("Mở khóa sổ thi đua thành công", response));
    }

    @GetMapping("/lock-status")
    public ResponseEntity<ApiResponse<DailyLockStatusDto>> getLockStatus(@RequestParam String date) {
        DailyLockStatusDto response = dailyScoreService.getDailyLockStatus(date);
        return ResponseEntity.ok(ApiResponse.success("Lấy trạng thái khóa sổ thành công", response));
    }
}
