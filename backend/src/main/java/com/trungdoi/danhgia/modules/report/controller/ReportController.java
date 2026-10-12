package com.trungdoi.danhgia.modules.report.controller;

import com.trungdoi.danhgia.common.dto.ApiResponse;
import com.trungdoi.danhgia.modules.report.dto.UnitAggregateResponse;
import com.trungdoi.danhgia.modules.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/unit-aggregate")
    public ResponseEntity<ApiResponse<List<UnitAggregateResponse>>> getUnitAggregate(
            @RequestParam(required = false, defaultValue = "e335") String unitId,
            @RequestParam(required = false) String date) {
        String queryDate = (date != null && !date.isBlank()) ? date
                : LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).toString();
        List<UnitAggregateResponse> report = reportService.getUnitAggregate(unitId, queryDate);
        return ResponseEntity.ok(ApiResponse.success("Lấy báo cáo tổng hợp thi đua thành công", report));
    }
}
