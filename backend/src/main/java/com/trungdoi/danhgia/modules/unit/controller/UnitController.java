package com.trungdoi.danhgia.modules.unit.controller;

import com.trungdoi.danhgia.common.dto.ApiResponse;
import com.trungdoi.danhgia.common.enums.UnitTier;
import com.trungdoi.danhgia.modules.unit.dto.*;
import com.trungdoi.danhgia.modules.unit.service.UnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UnitResponse>> createUnit(@Valid @RequestBody UnitRequest request) {
        UnitResponse created = unitService.createUnit(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(), "Thêm mới đơn vị thành công", created));
    }

    @PutMapping("/{unitId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UnitResponse>> updateUnit(
            @PathVariable String unitId,
            @RequestBody UnitUpdateRequest request) {
        UnitResponse unit = unitService.updateUnit(unitId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật đơn vị thành công", unit));
    }

    @DeleteMapping("/{unitId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUnit(@PathVariable String unitId) {
        unitService.deleteUnit(unitId);
        return ResponseEntity.ok(ApiResponse.success("Xóa đơn vị thành công", null));
    }

    @PutMapping("/{unitId}/assign-leader")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UnitResponse>> assignLeader(
            @PathVariable String unitId,
            @RequestBody AssignLeaderRequest request) {
        UnitResponse unit = unitService.assignLeader(unitId, request);
        return ResponseEntity.ok(ApiResponse.success("Bổ nhiệm cán bộ thành công", unit));
    }

    @PostMapping(value = {"/import", "/import-excel"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UnitImportSummaryResponse>> importUnits(
            @RequestParam("file") MultipartFile file) {
        UnitImportSummaryResponse result = unitService.importUnitsFromExcel(file);
        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }

    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] excelBytes = unitService.generateExcelTemplate();
        String filename = URLEncoder.encode("Bieu_mau_Cay_Don_Vi.xlsx", StandardCharsets.UTF_8).replace("+", "%20");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportUnits() {
        byte[] excelBytes = unitService.exportUnitsToExcel();
        String filename = URLEncoder.encode("Danh_sach_Cay_Don_Vi.xlsx", StandardCharsets.UTF_8).replace("+", "%20");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

    @PostMapping("/recalculate-headcounts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> recalculateHeadcounts() {
        unitService.recalculateSoldierHeadcounts();
        return ResponseEntity.ok(ApiResponse.success("Đồng bộ quân số toàn đơn vị thành công", null));
    }

    @PostMapping("/{unitId}/remarks")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UnitRemarkResponse>> saveRemark(
            @PathVariable String unitId,
            @Valid @RequestBody UnitRemarkRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String createdBy = userDetails != null ? userDetails.getUsername() : "Chỉ huy";
        UnitRemarkResponse response = unitService.saveRemark(unitId, request, createdBy);
        return ResponseEntity.ok(ApiResponse.success("Lưu nhận xét đơn vị thành công", response));
    }

    @GetMapping("/{unitId}/remarks")
    public ResponseEntity<ApiResponse<String>> getRemark(
            @PathVariable String unitId,
            @RequestParam String date) {
        String remark = unitService.getRemark(unitId, date);
        return ResponseEntity.ok(ApiResponse.success("Lấy nhận xét đơn vị thành công", remark));
    }
}
