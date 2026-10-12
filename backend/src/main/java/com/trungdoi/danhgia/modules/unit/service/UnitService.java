package com.trungdoi.danhgia.modules.unit.service;

import com.trungdoi.danhgia.common.enums.UnitTier;
import com.trungdoi.danhgia.modules.unit.dto.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UnitService {
    List<UnitResponse> getAllUnits(UnitTier tier, String parentId);
    List<UnitResponse> getUnitTree();
    UnitResponse getUnitById(String id);
    UnitResponse createUnit(UnitRequest request);
    UnitResponse updateUnit(String id, UnitUpdateRequest request);
    void deleteUnit(String id);
    UnitResponse assignLeader(String unitId, AssignLeaderRequest request);
    UnitImportSummaryResponse importUnitsFromExcel(MultipartFile file);
    byte[] generateExcelTemplate();
    byte[] exportUnitsToExcel();
    void recalculateSoldierHeadcounts();
    UnitRemarkResponse saveRemark(String unitId, UnitRemarkRequest request, String createdBy);
    String getRemark(String unitId, String date);
}
