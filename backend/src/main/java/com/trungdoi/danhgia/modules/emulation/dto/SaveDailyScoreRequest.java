package com.trungdoi.danhgia.modules.emulation.dto;

import jakarta.validation.constraints.NotBlank;
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
public class SaveDailyScoreRequest {

    private String id;

    @NotBlank(message = "ID quân nhân không được để trống")
    private String soldierId;

    private String soldierName;
    private String platoonId;

    @NotBlank(message = "Ngày chấm điểm không được để trống")
    private String date;

    @Builder.Default
    private int politicalScore = 100;

    @Builder.Default
    private int taskScore = 100;

    @Builder.Default
    private int hygieneScore = 100;

    @Builder.Default
    private int bearingScore = 100;

    private Integer totalScore;

    @Builder.Default
    private Map<String, Integer> criteriaScores = new HashMap<>();

    @Builder.Default
    private List<ViolationRecordDto> violations = new ArrayList<>();

    private String notes;
    private String evaluatedBy;
    private ScoreDecisionDocumentDto decisionDocument;
}
