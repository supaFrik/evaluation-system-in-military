package com.trungdoi.danhgia.modules.unit.service;

import com.trungdoi.danhgia.common.enums.UnitTier;
import com.trungdoi.danhgia.modules.unit.dto.UnitRemarkRequest;
import com.trungdoi.danhgia.modules.unit.dto.UnitRemarkResponse;
import com.trungdoi.danhgia.modules.unit.dto.UnitResponse;
import com.trungdoi.danhgia.modules.unit.dto.UnitUpdateRequest;

import java.util.List;

public interface UnitService {
    List<UnitResponse> getAllUnits(UnitTier tier, String parentId);
    List<UnitResponse> getUnitTree();
    UnitResponse getUnitById(String id);
    UnitResponse updateUnit(String id, UnitUpdateRequest request);
    UnitRemarkResponse saveRemark(String unitId, UnitRemarkRequest request, String createdBy);
    String getRemark(String unitId, String date);
}
