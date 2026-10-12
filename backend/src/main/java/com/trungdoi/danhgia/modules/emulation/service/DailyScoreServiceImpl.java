package com.trungdoi.danhgia.modules.emulation.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trungdoi.danhgia.common.exception.AppException;
import com.trungdoi.danhgia.common.exception.ResourceNotFoundException;
import com.trungdoi.danhgia.modules.emulation.dto.*;
import com.trungdoi.danhgia.modules.emulation.entity.DailyLock;
import com.trungdoi.danhgia.modules.emulation.entity.DailyScore;
import com.trungdoi.danhgia.modules.emulation.entity.ViolationRecord;
import com.trungdoi.danhgia.modules.emulation.repository.DailyLockRepository;
import com.trungdoi.danhgia.modules.emulation.repository.DailyScoreRepository;
import com.trungdoi.danhgia.modules.soldier.entity.Soldier;
import com.trungdoi.danhgia.modules.soldier.repository.SoldierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyScoreServiceImpl implements DailyScoreService {

    private static final ZoneId HANOI_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final DailyScoreRepository dailyScoreRepository;
    private final DailyLockRepository dailyLockRepository;
    private final SoldierRepository soldierRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public DailyScoreSheetResponse getDailyScores(String date, String unitId) {
        DailyLockStatusDto lockStatus = getDailyLockStatus(date);

        List<DailyScore> scores;
        if (unitId != null && !unitId.isBlank()) {
            List<Soldier> unitSoldiers = soldierRepository.findAllByAnyUnitId(unitId);
            Set<String> soldierIds = unitSoldiers.stream().map(Soldier::getId).collect(Collectors.toSet());
            scores = dailyScoreRepository.findByScoreDate(date).stream()
                    .filter(s -> soldierIds.isEmpty() || soldierIds.contains(s.getSoldierId()))
                    .collect(Collectors.toList());
        } else {
            scores = dailyScoreRepository.findByScoreDate(date);
        }

        List<DailyScoreResponse> scoreResponses = scores.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return DailyScoreSheetResponse.builder()
                .date(date)
                .lockStatus(lockStatus)
                .scores(scoreResponses)
                .build();
    }

    @Override
    @Transactional
    public DailyScoreResponse saveDailyScore(SaveDailyScoreRequest request) {
        DailyLockStatusDto lockStatus = getDailyLockStatus(request.getDate());
        if (lockStatus.isLocked()) {
            throw new AppException(423, "Ngày đánh giá đã bị khóa sổ sau 21:00. Liên hệ Chỉ huy để mở khóa trước khi sửa.");
        }

        // Look up soldier to auto-fill name/platoon if not provided
        Soldier soldier = soldierRepository.findById(request.getSoldierId())
                .orElse(null);

        String soldierName = request.getSoldierName() != null ? request.getSoldierName()
                : (soldier != null ? soldier.getName() : "Quân nhân");
        String platoonId = request.getPlatoonId() != null ? request.getPlatoonId()
                : (soldier != null ? soldier.getPlatoonId() : "b1");

        DailyScore score = dailyScoreRepository.findBySoldierIdAndScoreDate(request.getSoldierId(), request.getDate())
                .orElseGet(() -> DailyScore.builder()
                        .id((request.getId() != null && !request.getId().isBlank()) ? request.getId() : "sc-" + UUID.randomUUID().toString().substring(0, 8))
                        .soldierId(request.getSoldierId())
                        .scoreDate(request.getDate())
                        .build());

        score.setSoldierName(soldierName);
        score.setPlatoonId(platoonId);
        score.setPoliticalScore(request.getPoliticalScore());
        score.setTaskScore(request.getTaskScore());
        score.setHygieneScore(request.getHygieneScore());
        score.setBearingScore(request.getBearingScore());

        // Total score calculation
        if (request.getTotalScore() != null) {
            score.setTotalScore(request.getTotalScore());
        } else if (request.getCriteriaScores() != null && !request.getCriteriaScores().isEmpty()) {
            int sum = request.getCriteriaScores().values().stream().mapToInt(Integer::intValue).sum();
            score.setTotalScore(sum);
        } else {
            score.setTotalScore(request.getPoliticalScore() + request.getTaskScore() + request.getHygieneScore() + request.getBearingScore());
        }

        // Serialize criteriaScores
        try {
            if (request.getCriteriaScores() != null) {
                score.setCriteriaScoresJson(objectMapper.writeValueAsString(request.getCriteriaScores()));
            }
        } catch (Exception e) {
            log.warn("Failed to serialize criteriaScores", e);
        }

        // Serialize decisionDocument
        try {
            if (request.getDecisionDocument() != null) {
                score.setDecisionDocumentJson(objectMapper.writeValueAsString(request.getDecisionDocument()));
            }
        } catch (Exception e) {
            log.warn("Failed to serialize decisionDocument", e);
        }

        if (request.getNotes() != null) score.setNotes(request.getNotes());
        if (request.getEvaluatedBy() != null) score.setEvaluatedBy(request.getEvaluatedBy());

        // Update violations
        score.getViolations().clear();
        if (request.getViolations() != null) {
            for (ViolationRecordDto vDto : request.getViolations()) {
                ViolationRecord record = ViolationRecord.builder()
                        .id((vDto.getId() != null && !vDto.getId().isBlank()) ? vDto.getId() : "v-" + UUID.randomUUID().toString().substring(0, 8))
                        .category(vDto.getCategory())
                        .content(vDto.getContent() != null ? vDto.getContent() : "")
                        .points(vDto.getPoints())
                        .criterionId(vDto.getCriterionId())
                        .dailyScore(score)
                        .build();
                score.getViolations().add(record);
            }
        }

        DailyScore saved = dailyScoreRepository.save(score);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public DailyLockStatusDto lockDate(LockDateRequest request) {
        String date = request.getDate();
        DailyLock lock = dailyLockRepository.findByLockDate(date)
                .orElseGet(() -> DailyLock.builder()
                        .id("lock-" + UUID.randomUUID().toString().substring(0, 8))
                        .lockDate(date)
                        .build());

        lock.setLocked(true);
        lock.setLockedAt(LocalDateTime.now(HANOI_ZONE).toString());
        lock.setLockedBy(request.getOfficerName() != null ? request.getOfficerName() : "Chỉ huy đơn vị");
        lock.setLockNote(request.getNote() != null ? request.getNote() : "Chỉ huy đơn vị đã kiểm tra, phê duyệt và chốt sổ thi đua.");

        DailyLock saved = dailyLockRepository.save(lock);
        return toLockDto(saved);
    }

    @Override
    @Transactional
    public DailyLockStatusDto unlockDate(UnlockDateRequest request) {
        String date = request.getDate();
        DailyLock lock = dailyLockRepository.findByLockDate(date)
                .orElseGet(() -> DailyLock.builder()
                        .id("lock-" + UUID.randomUUID().toString().substring(0, 8))
                        .lockDate(date)
                        .build());

        List<UnlockHistoryDto> history = parseUnlockHistory(lock.getUnlockHistoryJson());
        history.add(UnlockHistoryDto.builder()
                .unlockedAt(LocalDateTime.now(HANOI_ZONE).toString())
                .unlockedBy(request.getOfficerName() != null ? request.getOfficerName() : "Chỉ huy đơn vị")
                .reason(request.getReason())
                .build());

        try {
            lock.setUnlockHistoryJson(objectMapper.writeValueAsString(history));
        } catch (Exception e) {
            log.warn("Failed to serialize unlock history", e);
        }

        lock.setLocked(false);
        lock.setLockedAt(null);
        lock.setLockedBy(null);
        lock.setLockNote(null);

        DailyLock saved = dailyLockRepository.save(lock);
        DailyLockStatusDto dto = toLockDto(saved);
        dto.setUnlockHistory(history);
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public DailyLockStatusDto getDailyLockStatus(String date) {
        Optional<DailyLock> lockOpt = dailyLockRepository.findByLockDate(date);
        if (lockOpt.isPresent()) {
            return toLockDto(lockOpt.get());
        }

        // Automatic lock determination based on Hanoi timezone
        LocalDate today = LocalDate.now(HANOI_ZONE);
        try {
            LocalDate targetDate = LocalDate.parse(date);
            if (targetDate.isBefore(today)) {
                return DailyLockStatusDto.builder()
                        .date(date)
                        .isLocked(true)
                        .lockedBy("Hệ thống tự động")
                        .lockedAt(date + "T21:00:00")
                        .lockNote("Tự động chốt sổ sau 21:00 (giờ điểm danh tối)")
                        .build();
            }

            if (targetDate.isEqual(today)) {
                LocalTime now = LocalTime.now(HANOI_ZONE);
                if (now.getHour() >= 21) {
                    return DailyLockStatusDto.builder()
                            .date(date)
                            .isLocked(true)
                            .lockedBy("Hệ thống tự động")
                            .lockedAt(LocalDateTime.now(HANOI_ZONE).toString())
                            .lockNote("Tự động chốt sổ sau 21:00 (giờ điểm danh tối)")
                            .build();
                }
            }
        } catch (Exception e) {
            log.warn("Error parsing date: {}", date, e);
        }

        return DailyLockStatusDto.builder()
                .date(date)
                .isLocked(false)
                .build();
    }

    @Override
    @Scheduled(cron = "0 0 21 * * ?", zone = "Asia/Ho_Chi_Minh")
    @Transactional
    public void autoLockToday() {
        String todayStr = LocalDate.now(HANOI_ZONE).toString();
        log.info("Executing 21:00 auto-lock for date: {}", todayStr);

        DailyLock lock = dailyLockRepository.findByLockDate(todayStr)
                .orElseGet(() -> DailyLock.builder()
                        .id("lock-" + UUID.randomUUID().toString().substring(0, 8))
                        .lockDate(todayStr)
                        .build());

        if (!lock.isLocked()) {
            lock.setLocked(true);
            lock.setLockedAt(LocalDateTime.now(HANOI_ZONE).toString());
            lock.setLockedBy("Hệ thống tự động");
            lock.setLockNote("Tự động chốt sổ sau 21:00 (giờ điểm danh tối)");
            dailyLockRepository.save(lock);
            log.info("Date {} successfully locked automatically.", todayStr);
        }
    }

    private DailyScoreResponse toResponse(DailyScore score) {
        Map<String, Integer> criteriaScores = new HashMap<>();
        if (score.getCriteriaScoresJson() != null && !score.getCriteriaScoresJson().isBlank()) {
            try {
                criteriaScores = objectMapper.readValue(score.getCriteriaScoresJson(), new TypeReference<Map<String, Integer>>() {});
            } catch (Exception e) {
                log.warn("Failed to parse criteriaScoresJson for score id: {}", score.getId());
            }
        }

        ScoreDecisionDocumentDto decisionDoc = null;
        if (score.getDecisionDocumentJson() != null && !score.getDecisionDocumentJson().isBlank()) {
            try {
                decisionDoc = objectMapper.readValue(score.getDecisionDocumentJson(), ScoreDecisionDocumentDto.class);
            } catch (Exception e) {
                log.warn("Failed to parse decisionDocumentJson for score id: {}", score.getId());
            }
        }

        List<ViolationRecordDto> violations = score.getViolations() != null ? score.getViolations().stream()
                .map(v -> ViolationRecordDto.builder()
                        .id(v.getId())
                        .category(v.getCategory())
                        .content(v.getContent())
                        .points(v.getPoints())
                        .criterionId(v.getCriterionId())
                        .build())
                .collect(Collectors.toList()) : new ArrayList<>();

        return DailyScoreResponse.builder()
                .id(score.getId())
                .soldierId(score.getSoldierId())
                .soldierName(score.getSoldierName())
                .platoonId(score.getPlatoonId())
                .date(score.getScoreDate())
                .politicalScore(score.getPoliticalScore())
                .taskScore(score.getTaskScore())
                .hygieneScore(score.getHygieneScore())
                .bearingScore(score.getBearingScore())
                .totalScore(score.getTotalScore())
                .criteriaScores(criteriaScores)
                .violations(violations)
                .notes(score.getNotes())
                .evaluatedBy(score.getEvaluatedBy())
                .decisionDocument(decisionDoc)
                .build();
    }

    private DailyLockStatusDto toLockDto(DailyLock lock) {
        return DailyLockStatusDto.builder()
                .date(lock.getLockDate())
                .isLocked(lock.isLocked())
                .lockedAt(lock.getLockedAt())
                .lockedBy(lock.getLockedBy())
                .lockNote(lock.getLockNote())
                .unlockHistory(parseUnlockHistory(lock.getUnlockHistoryJson()))
                .build();
    }

    private List<UnlockHistoryDto> parseUnlockHistory(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<UnlockHistoryDto>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse unlock history json", e);
            return new ArrayList<>();
        }
    }
}
