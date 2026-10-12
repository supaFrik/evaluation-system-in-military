package com.trungdoi.danhgia.modules.emulation.controller;

import com.trungdoi.danhgia.common.dto.ApiResponse;
import com.trungdoi.danhgia.modules.emulation.dto.CommendationRequest;
import com.trungdoi.danhgia.modules.emulation.dto.CommendationResponse;
import com.trungdoi.danhgia.modules.emulation.service.CommendationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/commendations")
@RequiredArgsConstructor
public class CommendationController {

    private final CommendationService commendationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommendationResponse>>> getCommendations(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String unitId,
            @RequestParam(required = false) String targetId) {
        List<CommendationResponse> items = commendationService.getCommendations(date, unitId, targetId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách biểu dương/nhắc nhở thành công", items));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SCORER', 'COMMANDER')")
    public ResponseEntity<ApiResponse<CommendationResponse>> createCommendation(
            @Valid @RequestBody CommendationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (request.getCreatedBy() == null || request.getCreatedBy().isBlank()) {
            if (userDetails != null) {
                request.setCreatedBy(userDetails.getUsername());
            }
        }
        CommendationResponse created = commendationService.createCommendation(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(), "Tạo phiếu biểu dương/nhắc nhở thành công", created));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCommendation(@PathVariable String id) {
        commendationService.deleteCommendation(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa phiếu biểu dương/nhắc nhở thành công", null));
    }
}
