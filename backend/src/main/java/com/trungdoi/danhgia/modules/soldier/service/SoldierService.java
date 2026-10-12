package com.trungdoi.danhgia.modules.soldier.service;

import com.trungdoi.danhgia.common.enums.UnitTier;
import com.trungdoi.danhgia.modules.soldier.dto.PageResponse;
import com.trungdoi.danhgia.modules.soldier.dto.SoldierRequest;
import com.trungdoi.danhgia.modules.soldier.dto.SoldierResponse;

import java.util.List;

public interface SoldierService {
    PageResponse<SoldierResponse> getSoldiers(String unitId, UnitTier tier, String search, Integer page, Integer size);
    List<SoldierResponse> getAllSoldiers(String unitId);
    SoldierResponse getSoldierById(String id);
    SoldierResponse createSoldier(SoldierRequest request);
    SoldierResponse updateSoldier(String id, SoldierRequest request);
    void deleteSoldier(String id);
}
