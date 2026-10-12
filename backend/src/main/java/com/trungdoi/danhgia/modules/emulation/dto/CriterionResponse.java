package com.trungdoi.danhgia.modules.emulation.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.trungdoi.danhgia.modules.emulation.entity.EmulationCriterion;
import com.trungdoi.danhgia.modules.emulation.enums.CriterionCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CriterionResponse {

    private String id;
    private String name;
    private String code;
    private int maxScore;
    private String description;
    @Builder.Default
    private List<String> deductionRules = new ArrayList<>();

    @JsonProperty("isActive")
    private boolean isActive;

    private CriterionCategory category;

    @JsonProperty("isActive")
    public boolean isActive() {
        return isActive;
    }

    @JsonProperty("isActive")
    public void setActive(boolean isActive) {
        this.isActive = isActive;
    }

    public static CriterionResponse fromEntity(EmulationCriterion entity) {
        if (entity == null) return null;
        return CriterionResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .maxScore(entity.getMaxScore())
                .description(entity.getDescription())
                .deductionRules(entity.getDeductionRules() != null ? new ArrayList<>(entity.getDeductionRules()) : new ArrayList<>())
                .isActive(entity.isActive())
                .category(entity.getCategory())
                .build();
    }
}
