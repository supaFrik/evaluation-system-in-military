package com.trungdoi.danhgia.modules.emulation.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trungdoi.danhgia.common.exception.ResourceNotFoundException;
import com.trungdoi.danhgia.modules.emulation.dto.CommendationRequest;
import com.trungdoi.danhgia.modules.emulation.dto.CommendationResponse;
import com.trungdoi.danhgia.modules.emulation.dto.DisciplineDocumentDto;
import com.trungdoi.danhgia.modules.emulation.entity.CommendationItem;
import com.trungdoi.danhgia.modules.emulation.repository.CommendationItemRepository;
import com.trungdoi.danhgia.modules.soldier.entity.Soldier;
import com.trungdoi.danhgia.modules.soldier.repository.SoldierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommendationServiceImpl implements CommendationService {

    private final CommendationItemRepository commendationItemRepository;
    private final SoldierRepository soldierRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CommendationResponse> getCommendations(String date, String unitId, String targetId) {
        List<CommendationItem> items;

        if (targetId != null && !targetId.isBlank()) {
            items = commendationItemRepository.findByTargetId(targetId);
            if (date != null && !date.isBlank()) {
                items = items.stream().filter(i -> date.equals(i.getItemDate())).collect(Collectors.toList());
            }
        } else if (date != null && !date.isBlank()) {
            items = commendationItemRepository.findByItemDate(date);
        } else {
            items = commendationItemRepository.findAll();
        }

        if (unitId != null && !unitId.isBlank()) {
            List<Soldier> unitSoldiers = soldierRepository.findAllByAnyUnitId(unitId);
            Set<String> soldierIds = unitSoldiers.stream().map(Soldier::getId).collect(Collectors.toSet());
            items = items.stream()
                    .filter(i -> unitId.equalsIgnoreCase(i.getPlatoonId())
                            || soldierIds.contains(i.getTargetId())
                            || unitId.equalsIgnoreCase(i.getTargetId()))
                    .collect(Collectors.toList());
        }

        return items.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CommendationResponse createCommendation(CommendationRequest request) {
        String id = (request.getId() != null && !request.getId().isBlank())
                ? request.getId()
                : "c-" + UUID.randomUUID().toString().substring(0, 8);

        String docJson = null;
        if (request.getDisciplineDocument() != null) {
            try {
                docJson = objectMapper.writeValueAsString(request.getDisciplineDocument());
            } catch (Exception e) {
                log.warn("Failed to serialize discipline document", e);
            }
        }

        CommendationItem item = CommendationItem.builder()
                .id(id)
                .type(request.getType())
                .scope(request.getScope())
                .targetId(request.getTargetId())
                .targetName(request.getTargetName())
                .platoonId(request.getPlatoonId())
                .content(request.getContent())
                .itemDate(request.getDate())
                .createdBy(request.getCreatedBy() != null ? request.getCreatedBy() : "Chỉ huy")
                .disciplineDocumentJson(docJson)
                .build();

        CommendationItem saved = commendationItemRepository.save(item);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteCommendation(String id) {
        if (!commendationItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy phiếu biểu dương/nhắc nhở với ID: " + id);
        }
        commendationItemRepository.deleteById(id);
    }

    private CommendationResponse toResponse(CommendationItem item) {
        DisciplineDocumentDto doc = null;
        if (item.getDisciplineDocumentJson() != null && !item.getDisciplineDocumentJson().isBlank()) {
            try {
                doc = objectMapper.readValue(item.getDisciplineDocumentJson(), DisciplineDocumentDto.class);
            } catch (Exception e) {
                log.warn("Failed to parse discipline document for item id: {}", item.getId());
            }
        }

        return CommendationResponse.builder()
                .id(item.getId())
                .type(item.getType())
                .scope(item.getScope())
                .targetId(item.getTargetId())
                .targetName(item.getTargetName())
                .platoonId(item.getPlatoonId())
                .content(item.getContent())
                .date(item.getItemDate())
                .createdBy(item.getCreatedBy())
                .disciplineDocument(doc)
                .build();
    }
}
