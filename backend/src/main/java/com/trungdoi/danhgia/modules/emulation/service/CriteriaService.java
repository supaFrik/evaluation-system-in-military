package com.trungdoi.danhgia.modules.emulation.service;

import com.trungdoi.danhgia.modules.emulation.dto.CriterionRequest;
import com.trungdoi.danhgia.modules.emulation.dto.CriterionResponse;

import java.util.List;

public interface CriteriaService {
    List<CriterionResponse> getCriteria(Boolean activeOnly);
    CriterionResponse getCriterionById(String id);
    CriterionResponse createCriterion(CriterionRequest request);
    CriterionResponse updateCriterion(String id, CriterionRequest request);
    CriterionResponse toggleCriterion(String id);
    void deleteCriterion(String id);
}
