package com.trungdoi.danhgia.modules.soldier.controller;

import com.trungdoi.danhgia.common.dto.ApiResponse;
import com.trungdoi.danhgia.common.enums.UnitTier;
import com.trungdoi.danhgia.modules.soldier.dto.PageResponse;
import com.trungdoi.danhgia.modules.soldier.dto.SoldierRequest;
import com.trungdoi.danhgia.modules.soldier.dto.SoldierResponse;
import com.trungdoi.danhgia.modules.soldier.service.SoldierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/soldiers")
@RequiredArgsConstructor
public class SoldierController {

    private final SoldierService soldierService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<SoldierResponse>>> getSoldiers(
            @RequestParam(required = false) String unitId,
            @RequestParam(required = false) UnitTier tier,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "50") Integer size) {
        PageResponse<SoldierResponse> result = soldierService.getSoldiers(unitId, tier, search, page, size);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách quân nhân thành công", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SoldierResponse>> getSoldierById(@PathVariable String id) {
        SoldierResponse soldier = soldierService.getSoldierById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin quân nhân thành công", soldier));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SoldierResponse>> createSoldier(@Valid @RequestBody SoldierRequest request) {
        SoldierResponse created = soldierService.createSoldier(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(), "Thêm mới quân nhân thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SoldierResponse>> updateSoldier(
            @PathVariable String id,
            @Valid @RequestBody SoldierRequest request) {
        SoldierResponse updated = soldierService.updateSoldier(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin quân nhân thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSoldier(@PathVariable String id) {
        soldierService.deleteSoldier(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa hồ sơ quân nhân thành công", null));
    }
}
