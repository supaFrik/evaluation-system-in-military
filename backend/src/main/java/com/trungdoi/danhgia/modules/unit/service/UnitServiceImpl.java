package com.trungdoi.danhgia.modules.unit.service;

import com.trungdoi.danhgia.common.enums.UnitTier;
import com.trungdoi.danhgia.common.exception.ResourceNotFoundException;
import com.trungdoi.danhgia.modules.unit.dto.UnitRemarkRequest;
import com.trungdoi.danhgia.modules.unit.dto.UnitRemarkResponse;
import com.trungdoi.danhgia.modules.unit.dto.UnitResponse;
import com.trungdoi.danhgia.modules.unit.dto.UnitUpdateRequest;
import com.trungdoi.danhgia.modules.unit.entity.MilitaryUnit;
import com.trungdoi.danhgia.modules.unit.entity.UnitRemark;
import com.trungdoi.danhgia.modules.unit.repository.MilitaryUnitRepository;
import com.trungdoi.danhgia.modules.unit.repository.UnitRemarkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UnitServiceImpl implements UnitService {

    private final MilitaryUnitRepository militaryUnitRepository;
    private final UnitRemarkRepository unitRemarkRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UnitResponse> getAllUnits(UnitTier tier, String parentId) {
        List<MilitaryUnit> units;
        if (tier != null && parentId != null) {
            units = militaryUnitRepository.findByParentId(parentId).stream()
                    .filter(u -> u.getTier() == tier)
                    .collect(Collectors.toList());
        } else if (tier != null) {
            units = militaryUnitRepository.findByTier(tier);
        } else if (parentId != null) {
            units = militaryUnitRepository.findByParentId(parentId);
        } else {
            units = militaryUnitRepository.findAll();
        }

        return units.stream()
                .map(UnitResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UnitResponse> getUnitTree() {
        List<MilitaryUnit> allUnits = militaryUnitRepository.findAll();
        Map<String, List<MilitaryUnit>> childrenMap = new HashMap<>();

        for (MilitaryUnit unit : allUnits) {
            if (unit.getParentId() != null) {
                childrenMap.computeIfAbsent(unit.getParentId(), k -> new ArrayList<>()).add(unit);
            }
        }

        List<MilitaryUnit> rootUnits = allUnits.stream()
                .filter(u -> u.getParentId() == null || u.getTier() == UnitTier.REGIMENT)
                .collect(Collectors.toList());

        return rootUnits.stream()
                .map(root -> buildNode(root, childrenMap))
                .collect(Collectors.toList());
    }

    private UnitResponse buildNode(MilitaryUnit unit, Map<String, List<MilitaryUnit>> childrenMap) {
        List<MilitaryUnit> childEntities = childrenMap.getOrDefault(unit.getId(), Collections.emptyList());
        List<UnitResponse> childResponses = childEntities.stream()
                .map(child -> buildNode(child, childrenMap))
                .collect(Collectors.toList());
        return UnitResponse.fromEntityWithChildren(unit, childResponses);
    }

    @Override
    @Transactional(readOnly = true)
    public UnitResponse getUnitById(String id) {
        MilitaryUnit unit = militaryUnitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn vị với ID: " + id));
        return UnitResponse.fromEntity(unit);
    }

    @Override
    @Transactional
    public UnitResponse updateUnit(String id, UnitUpdateRequest request) {
        MilitaryUnit unit = militaryUnitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn vị với ID: " + id));

        if (request.getName() != null) unit.setName(request.getName());
        if (request.getCode() != null) unit.setCode(request.getCode());
        if (request.getLeaderTitle() != null) unit.setLeaderTitle(request.getLeaderTitle());
        if (request.getLeaderName() != null) unit.setLeaderName(request.getLeaderName());
        if (request.getTotalSoldiers() != null) unit.setTotalSoldiers(request.getTotalSoldiers());

        MilitaryUnit saved = militaryUnitRepository.save(unit);
        return UnitResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public UnitRemarkResponse saveRemark(String unitId, UnitRemarkRequest request, String createdBy) {
        if (!militaryUnitRepository.existsById(unitId)) {
            throw new ResourceNotFoundException("Không tìm thấy đơn vị với ID: " + unitId);
        }

        String date = request.getRemarkDate();
        String remarkContent = request.getGeneralRemark();

        UnitRemark remark = unitRemarkRepository.findByUnitIdAndRemarkDate(unitId, date)
                .orElseGet(() -> UnitRemark.builder()
                        .id("rem-" + UUID.randomUUID().toString().substring(0, 8))
                        .unitId(unitId)
                        .remarkDate(date)
                        .build());

        remark.setGeneralRemark(remarkContent);
        if (createdBy != null && !createdBy.isBlank()) {
            remark.setCreatedBy(createdBy);
        }
        remark.setUpdatedAt(LocalDateTime.now());

        UnitRemark saved = unitRemarkRepository.save(remark);
        return UnitRemarkResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public String getRemark(String unitId, String date) {
        return unitRemarkRepository.findByUnitIdAndRemarkDate(unitId, date)
                .map(UnitRemark::getGeneralRemark)
                .orElse(null);
    }
}
