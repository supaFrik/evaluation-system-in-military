package com.trungdoi.danhgia.modules.report.service;

import com.trungdoi.danhgia.modules.report.dto.UnitAggregateResponse;

import java.util.List;

public interface ReportService {
    List<UnitAggregateResponse> getUnitAggregate(String unitId, String date);
}
