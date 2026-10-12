package com.trungdoi.danhgia.modules.emulation.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trungdoi.danhgia.common.dto.ApiResponse;
import com.trungdoi.danhgia.common.exception.BadRequestException;
import com.trungdoi.danhgia.common.exception.ResourceNotFoundException;
import com.trungdoi.danhgia.modules.emulation.entity.DailyScore;
import com.trungdoi.danhgia.modules.emulation.entity.EmulationAppeal;
import com.trungdoi.danhgia.modules.emulation.entity.ViolationRecord;
import com.trungdoi.danhgia.modules.emulation.repository.DailyScoreRepository;
import com.trungdoi.danhgia.modules.emulation.repository.EmulationAppealRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/appeals")
@RequiredArgsConstructor
public class AppealController {

    private final EmulationAppealRepository appealRepository;
    private final DailyScoreRepository dailyScoreRepository;
    private final ObjectMapper objectMapper;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateAppealRequest {
        private String soldierId;
        private String soldierName;
        private String unitId;
        private String unitName;
        private String date;
        private String criterionId;
        private String criterionName;
        private Integer deductionPoints;
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResolveAppealRequest {
        private String status;
        private String reply;
        private String resolvedBy;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<EmulationAppeal>>> getAppeals(
            @RequestParam(required = false) String unitId,
            @RequestParam(required = false) String soldierId,
            @RequestParam(required = false) String status) {
        List<EmulationAppeal> items = appealRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(a -> unitId == null || unitId.isBlank() || unitId.equalsIgnoreCase(a.getUnitId()))
                .filter(a -> soldierId == null || soldierId.isBlank() || soldierId.equalsIgnoreCase(a.getSoldierId()))
                .filter(a -> status == null || status.isBlank() || status.equalsIgnoreCase(a.getStatus()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách khiếu nại thành công", items));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<EmulationAppeal>> createAppeal(@RequestBody CreateAppealRequest request) {
        if (request.getReason() == null || request.getReason().isBlank()) {
            throw new BadRequestException("Lý do khiếu nại không được để trống");
        }

        EmulationAppeal appeal = EmulationAppeal.builder()
                .id("appeal-" + UUID.randomUUID().toString().substring(0, 8))
                .soldierId(request.getSoldierId() != null ? request.getSoldierId() : "s1")
                .soldierName(request.getSoldierName() != null ? request.getSoldierName() : "Quân nhân")
                .unitId(request.getUnitId() != null ? request.getUnitId() : "C1-B1")
                .unitName(request.getUnitName() != null ? request.getUnitName() : "Trung đội 1")
                .date(request.getDate() != null ? request.getDate() : java.time.LocalDate.now().toString())
                .criterionId(request.getCriterionId())
                .criterionName(request.getCriterionName() != null ? request.getCriterionName() : "Chung")
                .deductionPoints(request.getDeductionPoints() != null ? request.getDeductionPoints() : -5)
                .reason(request.getReason().trim())
                .status("PENDING")
                .createdAt(Instant.now().toString())
                .build();

        EmulationAppeal saved = appealRepository.save(appeal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(), "Tạo đơn khiếu nại thành công", saved));
    }

    @PutMapping("/{appealId}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCORER', 'COMMANDER')")
    @Transactional
    public ResponseEntity<ApiResponse<EmulationAppeal>> resolveAppeal(
            @PathVariable String appealId,
            @RequestBody ResolveAppealRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        EmulationAppeal appeal = appealRepository.findById(appealId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn khiếu nại với ID: " + appealId));

        String previousStatus = appeal.getStatus();
        String newStatus = request.getStatus() != null ? request.getStatus().toUpperCase() : "APPROVED";
        String resolvedBy = (request.getResolvedBy() != null && !request.getResolvedBy().isBlank())
                ? request.getResolvedBy()
                : (userDetails != null ? userDetails.getUsername() : "Cán bộ phụ trách");

        appeal.setStatus(newStatus);
        appeal.setReply(request.getReply() != null ? request.getReply().trim() : "");
        appeal.setResolvedBy(resolvedBy);
        appeal.setResolvedAt(Instant.now().toString());

        // Tự động hoàn lại số điểm bị trừ vào tiêu chí tương ứng (cả khi sổ đã khóa) nếu chuyển sang APPROVED
        if ("APPROVED".equals(newStatus) && !"APPROVED".equals(previousStatus)) {
            int pointsToRestore = Math.abs(appeal.getDeductionPoints() != null ? appeal.getDeductionPoints() : 5);
            restoreScoreOnApprovedAppeal(appeal, pointsToRestore, resolvedBy);
        }

        EmulationAppeal saved = appealRepository.save(appeal);
        return ResponseEntity.ok(ApiResponse.success("Xử lý khiếu nại thành công", saved));
    }

    private void restoreScoreOnApprovedAppeal(EmulationAppeal appeal, int pointsToRestore, String resolvedBy) {
        if (pointsToRestore <= 0) return;

        String targetCritId = resolveCriterionKey(appeal.getCriterionId(), appeal.getCriterionName());

        DailyScore score = dailyScoreRepository.findBySoldierIdAndScoreDate(appeal.getSoldierId(), appeal.getDate())
                .orElseGet(() -> DailyScore.builder()
                        .id("sc-" + appeal.getSoldierId() + "-" + appeal.getDate())
                        .soldierId(appeal.getSoldierId())
                        .soldierName(appeal.getSoldierName())
                        .platoonId(appeal.getUnitId())
                        .scoreDate(appeal.getDate())
                        .politicalScore(100)
                        .taskScore(100)
                        .hygieneScore(100)
                        .bearingScore(100)
                        .totalScore(400)
                        .evaluatedBy(resolvedBy)
                        .build());

        Map<String, Integer> criteriaScores = new HashMap<>();
        if (score.getCriteriaScoresJson() != null && !score.getCriteriaScoresJson().isBlank()) {
            try {
                criteriaScores = objectMapper.readValue(score.getCriteriaScoresJson(), new TypeReference<Map<String, Integer>>() {});
            } catch (Exception e) {
                log.warn("Could not parse criteriaScoresJson during appeal resolution", e);
            }
        }

        if ("c_political".equals(targetCritId)) {
            int updated = Math.min(100, score.getPoliticalScore() + pointsToRestore);
            score.setPoliticalScore(updated);
            criteriaScores.put("c_political", updated);
        } else if ("c_task".equals(targetCritId)) {
            int updated = Math.min(100, score.getTaskScore() + pointsToRestore);
            score.setTaskScore(updated);
            criteriaScores.put("c_task", updated);
        } else if ("c_hygiene".equals(targetCritId)) {
            int updated = Math.min(100, score.getHygieneScore() + pointsToRestore);
            score.setHygieneScore(updated);
            criteriaScores.put("c_hygiene", updated);
        } else if ("c_bearing".equals(targetCritId)) {
            int updated = Math.min(100, score.getBearingScore() + pointsToRestore);
            score.setBearingScore(updated);
            criteriaScores.put("c_bearing", updated);
        } else {
            int curr = criteriaScores.getOrDefault(targetCritId, 95);
            criteriaScores.put(targetCritId, Math.min(100, curr + pointsToRestore));
        }

        int total = score.getPoliticalScore() + score.getTaskScore() + score.getHygieneScore() + score.getBearingScore();
        score.setTotalScore(total);

        try {
            score.setCriteriaScoresJson(objectMapper.writeValueAsString(criteriaScores));
        } catch (Exception e) {
            log.warn("Failed to serialize criteriaScoresJson after appeal adjustment", e);
        }

        ViolationRecord adjustmentRecord = ViolationRecord.builder()
                .id("v-appeal-" + UUID.randomUUID().toString().substring(0, 8))
                .category("chinh_tri")
                .content("Hoàn điểm sau khiếu nại được chấp thuận (" + appeal.getCriterionName() + "): +" + pointsToRestore + "đ")
                .points(pointsToRestore)
                .criterionId(targetCritId)
                .dailyScore(score)
                .build();
        score.getViolations().add(adjustmentRecord);

        dailyScoreRepository.save(score);
        log.info("Restored +{} points for soldier {} on {} via approved appeal {}", pointsToRestore, appeal.getSoldierId(), appeal.getDate(), appeal.getId());
    }

    private String resolveCriterionKey(String criterionId, String criterionName) {
        if (criterionId != null && !criterionId.isBlank()) {
            return criterionId;
        }
        String name = criterionName != null ? criterionName.toLowerCase() : "";
        if (name.contains("nhiệm vụ") || name.contains("huấn luyện")) return "c_task";
        if (name.contains("nội vụ") || name.contains("vệ sinh")) return "c_hygiene";
        if (name.contains("lễ tiết") || name.contains("tác phong") || name.contains("kỷ luật")) return "c_bearing";
        return "c_political";
    }
}
