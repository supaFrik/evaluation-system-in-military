package com.trungdoi.danhgia.modules.unit.controller;

import com.trungdoi.danhgia.common.dto.ApiResponse;
import com.trungdoi.danhgia.common.enums.UnitTier;
import com.trungdoi.danhgia.modules.unit.dto.UnitRemarkRequest;
import com.trungdoi.danhgia.modules.unit.dto.UnitRemarkResponse;
import com.trungdoi.danhgia.modules.unit.dto.UnitResponse;
import com.trungdoi.danhgia.modules.unit.dto.UnitUpdateRequest;
import com.trungdoi.danhgia.modules.unit.service.UnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UnitResponse>>> getAllUnits(
            @RequestParam(required = false) UnitTier tier,
            @RequestParam(required = false) String parentId) {
        List<UnitResponse> units = unitService.getAllUnits(tier, parentId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn vị thành công", units));
    }

    @GetMapping("/tree")
    public ResponseEntity<ApiResponse<List<UnitResponse>>> getUnitTree() {
        List<UnitResponse> tree = unitService.getUnitTree();
        return ResponseEntity.ok(ApiResponse.success("Lấy cây đơn vị thành công", tree));
    }

    @GetMapping("/{unitId}")
    public ResponseEntity<ApiResponse<UnitResponse>> getUnitById(@PathVariable String unitId) {
        UnitResponse unit = unitService.getUnitById(unitId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin đơn vị thành công", unit));
    }

    @PutMapping("/{unitId}")
    public ResponseEntity<ApiResponse<UnitResponse>> updateUnit(
            @PathVariable String unitId,
            @RequestBody UnitUpdateRequest request) {
        UnitResponse unit = unitService.updateUnit(unitId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật đơn vị thành công", unit));
    }

    @PostMapping("/{unitId}/remarks")
    public ResponseEntity<ApiResponse<UnitRemarkResponse>> saveRemark(
            @PathVariable String unitId,
            @Valid @RequestBody UnitRemarkRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String createdBy = userDetails != null ? userDetails.getUsername() : "Chỉ huy";
        UnitRemarkResponse response = unitService.saveRemark(unitId, request, createdBy);
        return ResponseEntity.ok(ApiResponse.success("Lưu nhận xét đơn vị thành công", response));
    }
}
