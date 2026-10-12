package com.trungdoi.danhgia.modules.report.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trungdoi.danhgia.modules.emulation.entity.DailyScore;
import com.trungdoi.danhgia.modules.emulation.entity.EmulationCriterion;
import com.trungdoi.danhgia.modules.emulation.repository.DailyScoreRepository;
import com.trungdoi.danhgia.modules.emulation.repository.EmulationCriterionRepository;
import com.trungdoi.danhgia.modules.report.dto.UnitAggregateResponse;
import com.trungdoi.danhgia.modules.soldier.entity.Soldier;
import com.trungdoi.danhgia.modules.soldier.repository.SoldierRepository;
import com.trungdoi.danhgia.modules.unit.entity.MilitaryUnit;
import com.trungdoi.danhgia.modules.unit.entity.UnitRemark;
import com.trungdoi.danhgia.modules.unit.repository.MilitaryUnitRepository;
import com.trungdoi.danhgia.modules.unit.repository.UnitRemarkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final MilitaryUnitRepository militaryUnitRepository;
    private final SoldierRepository soldierRepository;
    private final DailyScoreRepository dailyScoreRepository;
    private final UnitRemarkRepository unitRemarkRepository;
    private final EmulationCriterionRepository criterionRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<UnitAggregateResponse> getUnitAggregate(String unitId, String date) {
        String parentId = (unitId != null && !unitId.isBlank()) ? unitId : "e335";

        List<MilitaryUnit> targetUnits = militaryUnitRepository.findByParentId(parentId);
        if (targetUnits.isEmpty()) {
            // If no children, aggregate for the unit itself
            militaryUnitRepository.findById(parentId).ifPresent(targetUnits::add);
        }

        if (targetUnits.isEmpty()) {
            return Collections.emptyList();
        }

        List<EmulationCriterion> activeCriteria = criterionRepository.findByIsActiveTrue();
        List<DailyScore> allScoresForDate = dailyScoreRepository.findByScoreDate(date);
        Map<String, DailyScore> scoreBySoldierId = allScoresForDate.stream()
                .collect(Collectors.toMap(DailyScore::getSoldierId, s -> s, (s1, s2) -> s1));

        List<UnitAggregateResponse> result = new ArrayList<>();

        for (MilitaryUnit unit : targetUnits) {
            List<Soldier> unitSoldiers = soldierRepository.findAllByAnyUnitId(unit.getId());
            int totalSoldiers = unitSoldiers.size();

            List<DailyScore> scores = unitSoldiers.stream()
                    .map(s -> scoreBySoldierId.get(s.getId()))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            String remark = unitRemarkRepository.findByUnitIdAndRemarkDate(unit.getId(), date)
                    .map(UnitRemark::getGeneralRemark)
                    .orElse("");

            if (scores.isEmpty()) {
                result.add(UnitAggregateResponse.builder()
                        .unitId(unit.getId())
                        .unitName(unit.getName())
                        .unitCode(unit.getCode())
                        .tier(unit.getTier())
                        .totalSoldiers(totalSoldiers)
                        .avgPolitical(0)
                        .avgTask(0)
                        .avgHygiene(0)
                        .avgBearing(0)
                        .avgTotal(0)
                        .avgCriteriaScores(new HashMap<>())
                        .rank(0)
                        .generalRemark(remark.isBlank() ? "Chưa có dữ liệu chấm điểm" : remark)
                        .build());
                continue;
            }

            int count = scores.size();
            double avgPolitical = round(scores.stream().mapToInt(DailyScore::getPoliticalScore).average().orElse(0.0));
            double avgTask = round(scores.stream().mapToInt(DailyScore::getTaskScore).average().orElse(0.0));
            double avgHygiene = round(scores.stream().mapToInt(DailyScore::getHygieneScore).average().orElse(0.0));
            double avgBearing = round(scores.stream().mapToInt(DailyScore::getBearingScore).average().orElse(0.0));
            double avgTotal = round(scores.stream().mapToInt(DailyScore::getTotalScore).average().orElse(0.0));

            // Dynamic criteria calculation
            Map<String, Double> avgCriteriaScores = new HashMap<>();
            for (EmulationCriterion crit : activeCriteria) {
                double critSum = 0;
                for (DailyScore sc : scores) {
                    Map<String, Integer> critMap = parseCriteriaScores(sc.getCriteriaScoresJson());
                    if (critMap.containsKey(crit.getId())) {
                        critSum += critMap.get(crit.getId());
                    } else if ("c_political".equals(crit.getId()) || "crit_ct".equals(crit.getId())) {
                        critSum += sc.getPoliticalScore();
                    } else if ("c_task".equals(crit.getId()) || "crit_nv".equals(crit.getId())) {
                        critSum += sc.getTaskScore();
                    } else if ("c_hygiene".equals(crit.getId()) || "crit_nvvs".equals(crit.getId())) {
                        critSum += sc.getHygieneScore();
                    } else if ("c_bearing".equals(crit.getId()) || "crit_ltp".equals(crit.getId())) {
                        critSum += sc.getBearingScore();
                    } else {
                        critSum += crit.getMaxScore();
                    }
                }
                avgCriteriaScores.put(crit.getId(), round(critSum / count));
            }

            result.add(UnitAggregateResponse.builder()
                    .unitId(unit.getId())
                    .unitName(unit.getName())
                    .unitCode(unit.getCode())
                    .tier(unit.getTier())
                    .totalSoldiers(totalSoldiers)
                    .avgPolitical(avgPolitical)
                    .avgTask(avgTask)
                    .avgHygiene(avgHygiene)
                    .avgBearing(avgBearing)
                    .avgTotal(avgTotal)
                    .avgCriteriaScores(avgCriteriaScores)
                    .rank(0)
                    .generalRemark(remark)
                    .build());
        }

        // Rank by avgTotal descending
        result.sort(Comparator.comparingDouble(UnitAggregateResponse::getAvgTotal).reversed());
        for (int i = 0; i < result.size(); i++) {
            result.get(i).setRank(i + 1);
        }

        return result;
    }

    private double round(double val) {
        return BigDecimal.valueOf(val).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private Map<String, Integer> parseCriteriaScores(String json) {
        if (json == null || json.isBlank()) return Collections.emptyMap();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Integer>>() {});
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }
}
