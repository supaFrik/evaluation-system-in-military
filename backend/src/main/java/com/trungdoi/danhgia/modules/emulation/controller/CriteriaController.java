package com.trungdoi.danhgia.modules.emulation.controller;

import com.trungdoi.danhgia.common.dto.ApiResponse;
import com.trungdoi.danhgia.modules.emulation.dto.CriterionRequest;
import com.trungdoi.danhgia.modules.emulation.dto.CriterionResponse;
import com.trungdoi.danhgia.modules.emulation.service.CriteriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/criteria")
@RequiredArgsConstructor
public class CriteriaController {

    private final CriteriaService criteriaService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CriterionResponse>>> getCriteria(
            @RequestParam(required = false) Boolean activeOnly) {
        List<CriterionResponse> list = criteriaService.getCriteria(activeOnly);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tiêu chí thành công", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CriterionResponse>> getCriterionById(@PathVariable String id) {
        CriterionResponse criterion = criteriaService.getCriterionById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin tiêu chí thành công", criterion));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CriterionResponse>> createCriterion(@Valid @RequestBody CriterionRequest request) {
        CriterionResponse created = criteriaService.createCriterion(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(), "Thêm mới tiêu chí thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CriterionResponse>> updateCriterion(
            @PathVariable String id,
            @Valid @RequestBody CriterionRequest request) {
        CriterionResponse updated = criteriaService.updateCriterion(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tiêu chí thành công", updated));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CriterionResponse>> toggleCriterion(@PathVariable String id) {
        CriterionResponse updated = criteriaService.toggleCriterion(id);
        return ResponseEntity.ok(ApiResponse.success("Thay đổi trạng thái tiêu chí thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCriterion(@PathVariable String id) {
        criteriaService.deleteCriterion(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa tiêu chí thành công", null));
    }
}
