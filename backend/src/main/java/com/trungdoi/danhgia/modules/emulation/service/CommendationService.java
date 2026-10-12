package com.trungdoi.danhgia.modules.emulation.service;

import com.trungdoi.danhgia.modules.emulation.dto.CommendationRequest;
import com.trungdoi.danhgia.modules.emulation.dto.CommendationResponse;

import java.util.List;

public interface CommendationService {
    List<CommendationResponse> getCommendations(String date, String unitId, String targetId);
    CommendationResponse createCommendation(CommendationRequest request);
    void deleteCommendation(String id);
}
