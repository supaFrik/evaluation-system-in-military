package com.trungdoi.danhgia.modules.emulation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyScoreResponse {
    private String id;
    private String soldierId;
    private String soldierName;
    private String platoonId;
    private String date;

    private int politicalScore;
    private int taskScore;
    private int hygieneScore;
    private int bearingScore;
    private int totalScore;

    @Builder.Default
    private Map<String, Integer> criteriaScores = new HashMap<>();

    @Builder.Default
    private List<ViolationRecordDto> violations = new ArrayList<>();

    private String notes;
    private String evaluatedBy;
    private ScoreDecisionDocumentDto decisionDocument;
}
