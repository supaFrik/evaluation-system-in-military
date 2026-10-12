package com.trungdoi.danhgia.modules.emulation.service;

import com.trungdoi.danhgia.common.exception.ResourceNotFoundException;
import com.trungdoi.danhgia.modules.emulation.dto.CriterionRequest;
import com.trungdoi.danhgia.modules.emulation.dto.CriterionResponse;
import com.trungdoi.danhgia.modules.emulation.entity.EmulationCriterion;
import com.trungdoi.danhgia.modules.emulation.repository.EmulationCriterionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CriteriaServiceImpl implements CriteriaService {

    private final EmulationCriterionRepository criterionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CriterionResponse> getCriteria(Boolean activeOnly) {
        List<EmulationCriterion> list;
        if (Boolean.TRUE.equals(activeOnly)) {
            list = criterionRepository.findByIsActiveTrue();
        } else {
            list = criterionRepository.findAll();
        }
        return list.stream()
                .map(CriterionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CriterionResponse getCriterionById(String id) {
        EmulationCriterion criterion = criterionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tiêu chí với ID: " + id));
        return CriterionResponse.fromEntity(criterion);
    }

    @Override
    @Transactional
    public CriterionResponse createCriterion(CriterionRequest request) {
        String id = (request.getId() != null && !request.getId().isBlank())
                ? request.getId()
                : "crit_" + UUID.randomUUID().toString().substring(0, 8);

        EmulationCriterion criterion = EmulationCriterion.builder()
                .id(id)
                .name(request.getName())
                .code(request.getCode())
                .maxScore(request.getMaxScore() > 0 ? request.getMaxScore() : 100)
                .description(request.getDescription())
                .deductionRules(request.getDeductionRules() != null ? new ArrayList<>(request.getDeductionRules()) : new ArrayList<>())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .category(request.getCategory())
                .build();

        EmulationCriterion saved = criterionRepository.save(criterion);
        return CriterionResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public CriterionResponse updateCriterion(String id, CriterionRequest request) {
        EmulationCriterion criterion = criterionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tiêu chí với ID: " + id));

        if (request.getName() != null) criterion.setName(request.getName());
        if (request.getCode() != null) criterion.setCode(request.getCode());
        if (request.getMaxScore() > 0) criterion.setMaxScore(request.getMaxScore());
        if (request.getDescription() != null) criterion.setDescription(request.getDescription());
        if (request.getDeductionRules() != null) {
            criterion.setDeductionRules(new ArrayList<>(request.getDeductionRules()));
        }
        if (request.getIsActive() != null) criterion.setActive(request.getIsActive());
        if (request.getCategory() != null) criterion.setCategory(request.getCategory());

        EmulationCriterion saved = criterionRepository.save(criterion);
        return CriterionResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public CriterionResponse toggleCriterion(String id) {
        EmulationCriterion criterion = criterionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tiêu chí với ID: " + id));
        criterion.setActive(!criterion.isActive());
        EmulationCriterion saved = criterionRepository.save(criterion);
        return CriterionResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void deleteCriterion(String id) {
        if (!criterionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy tiêu chí với ID: " + id);
        }
        criterionRepository.deleteById(id);
    }
}
