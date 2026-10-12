package com.trungdoi.danhgia.modules.soldier.service;

import com.trungdoi.danhgia.common.enums.UnitTier;
import com.trungdoi.danhgia.common.exception.BadRequestException;
import com.trungdoi.danhgia.common.exception.ResourceNotFoundException;
import com.trungdoi.danhgia.modules.soldier.dto.PageResponse;
import com.trungdoi.danhgia.modules.soldier.dto.SoldierRequest;
import com.trungdoi.danhgia.modules.soldier.dto.SoldierResponse;
import com.trungdoi.danhgia.modules.soldier.entity.Soldier;
import com.trungdoi.danhgia.modules.soldier.repository.SoldierRepository;
import com.trungdoi.danhgia.modules.unit.entity.MilitaryUnit;
import com.trungdoi.danhgia.modules.unit.repository.MilitaryUnitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SoldierServiceImpl implements SoldierService {

    private final SoldierRepository soldierRepository;
    private final MilitaryUnitRepository militaryUnitRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SoldierResponse> getSoldiers(String unitId, UnitTier tier, String search, Integer page, Integer size) {
        int pageNum = (page != null && page >= 0) ? page : 0;
        int pageSize = (size != null && size > 0) ? size : 50;
        Pageable pageable = PageRequest.of(pageNum, pageSize, Sort.by("militaryCode").ascending());

        // Nếu không truyền unitId hoặc unitId/tier là REGIMENT, tìm kiếm chung toàn Trung đoàn
        if (tier == UnitTier.REGIMENT || "e335".equalsIgnoreCase(unitId)) {
            if (search != null && !search.isBlank()) {
                Page<Soldier> result = soldierRepository.searchSoldiers(null, search.trim(), pageable);
                return PageResponse.fromPage(result.map(SoldierResponse::fromEntity));
            } else {
                Page<Soldier> result = soldierRepository.findAll(pageable);
                return PageResponse.fromPage(result.map(SoldierResponse::fromEntity));
            }
        }

        if (unitId != null && !unitId.isBlank()) {
            Optional<MilitaryUnit> unitOpt = militaryUnitRepository.findById(unitId);
            if (unitOpt.isPresent() && unitOpt.get().getTier() == UnitTier.REGIMENT) {
                if (search != null && !search.isBlank()) {
                    Page<Soldier> result = soldierRepository.searchSoldiers(null, search.trim(), pageable);
                    return PageResponse.fromPage(result.map(SoldierResponse::fromEntity));
                } else {
                    Page<Soldier> result = soldierRepository.findAll(pageable);
                    return PageResponse.fromPage(result.map(SoldierResponse::fromEntity));
                }
            }
            Page<Soldier> result = soldierRepository.searchSoldiers(unitId, (search != null && !search.isBlank()) ? search.trim() : null, pageable);
            return PageResponse.fromPage(result.map(SoldierResponse::fromEntity));
        }

        if (search != null && !search.isBlank()) {
            Page<Soldier> result = soldierRepository.searchSoldiers(null, search.trim(), pageable);
            return PageResponse.fromPage(result.map(SoldierResponse::fromEntity));
        }

        Page<Soldier> result = soldierRepository.findAll(pageable);
        return PageResponse.fromPage(result.map(SoldierResponse::fromEntity));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SoldierResponse> getAllSoldiers(String unitId) {
        if (unitId == null || unitId.isBlank()) {
            return soldierRepository.findAll(Sort.by("militaryCode").ascending()).stream()
                    .map(SoldierResponse::fromEntity)
                    .collect(Collectors.toList());
        }

        Optional<MilitaryUnit> unitOpt = militaryUnitRepository.findById(unitId);
        if (unitOpt.isPresent() && unitOpt.get().getTier() == UnitTier.REGIMENT) {
            return soldierRepository.findAll(Sort.by("militaryCode").ascending()).stream()
                    .map(SoldierResponse::fromEntity)
                    .collect(Collectors.toList());
        }

        return soldierRepository.findAllByAnyUnitId(unitId).stream()
                .map(SoldierResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SoldierResponse getSoldierById(String id) {
        Soldier soldier = soldierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quân nhân với ID: " + id));
        return SoldierResponse.fromEntity(soldier);
    }

    @Override
    @Transactional
    public SoldierResponse createSoldier(SoldierRequest request) {
        if (request.getMilitaryCode() != null && soldierRepository.findByMilitaryCode(request.getMilitaryCode()).isPresent()) {
            throw new BadRequestException("Số hiệu quân nhân '" + request.getMilitaryCode() + "' đã tồn tại trong hệ thống");
        }

        String soldierId = (request.getId() != null && !request.getId().isBlank())
                ? request.getId()
                : "s-" + UUID.randomUUID().toString().substring(0, 8);

        Soldier soldier = Soldier.builder()
                .id(soldierId)
                .name(request.getName())
                .dob(request.getDob())
                .gender(request.getGender() != null ? request.getGender() : "Nam")
                .rank(request.getRank())
                .roleTitle(request.getRoleTitle())
                .battalionId(request.getBattalionId())
                .battalionName(request.getBattalionName())
                .companyId(request.getCompanyId())
                .companyName(request.getCompanyName())
                .platoonId(request.getPlatoonId())
                .platoonName(request.getPlatoonName())
                .squadId(request.getSquadId())
                .squadName(request.getSquadName())
                .joinDate(request.getJoinDate())
                .officialDate(request.getOfficialDate())
                .militaryCode(request.getMilitaryCode())
                .idCardNumber(request.getIdCardNumber())
                .phone(request.getPhone())
                .hometown(request.getHometown())
                .partyStatus(request.getPartyStatus() != null ? request.getPartyStatus() : "Đoàn viên")
                .partyJoinDate(request.getPartyJoinDate())
                .avatarUrl(request.getAvatarUrl() != null ? request.getAvatarUrl() : "/default-avatar.png")
                .build();

        Soldier saved = soldierRepository.save(soldier);
        return SoldierResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public SoldierResponse updateSoldier(String id, SoldierRequest request) {
        Soldier soldier = soldierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quân nhân với ID: " + id));

        if (request.getMilitaryCode() != null && !request.getMilitaryCode().equals(soldier.getMilitaryCode())) {
            soldierRepository.findByMilitaryCode(request.getMilitaryCode()).ifPresent(s -> {
                throw new BadRequestException("Số hiệu quân nhân '" + request.getMilitaryCode() + "' đã tồn tại");
            });
            soldier.setMilitaryCode(request.getMilitaryCode());
        }

        if (request.getName() != null) soldier.setName(request.getName());
        if (request.getDob() != null) soldier.setDob(request.getDob());
        if (request.getGender() != null) soldier.setGender(request.getGender());
        if (request.getRank() != null) soldier.setRank(request.getRank());
        if (request.getRoleTitle() != null) soldier.setRoleTitle(request.getRoleTitle());
        if (request.getBattalionId() != null) soldier.setBattalionId(request.getBattalionId());
        if (request.getBattalionName() != null) soldier.setBattalionName(request.getBattalionName());
        if (request.getCompanyId() != null) soldier.setCompanyId(request.getCompanyId());
        if (request.getCompanyName() != null) soldier.setCompanyName(request.getCompanyName());
        if (request.getPlatoonId() != null) soldier.setPlatoonId(request.getPlatoonId());
        if (request.getPlatoonName() != null) soldier.setPlatoonName(request.getPlatoonName());
        if (request.getSquadId() != null) soldier.setSquadId(request.getSquadId());
        if (request.getSquadName() != null) soldier.setSquadName(request.getSquadName());
        if (request.getJoinDate() != null) soldier.setJoinDate(request.getJoinDate());
        if (request.getOfficialDate() != null) soldier.setOfficialDate(request.getOfficialDate());
        if (request.getIdCardNumber() != null) soldier.setIdCardNumber(request.getIdCardNumber());
        if (request.getPhone() != null) soldier.setPhone(request.getPhone());
        if (request.getHometown() != null) soldier.setHometown(request.getHometown());
        if (request.getPartyStatus() != null) soldier.setPartyStatus(request.getPartyStatus());
        if (request.getPartyJoinDate() != null) soldier.setPartyJoinDate(request.getPartyJoinDate());
        if (request.getAvatarUrl() != null) soldier.setAvatarUrl(request.getAvatarUrl());

        Soldier saved = soldierRepository.save(soldier);
        return SoldierResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void deleteSoldier(String id) {
        if (!soldierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy quân nhân với ID: " + id);
        }
        soldierRepository.deleteById(id);
    }
}
