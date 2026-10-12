package com.trungdoi.danhgia.modules.emulation.dto;

import com.trungdoi.danhgia.modules.emulation.enums.CriterionCategory;
import jakarta.validation.constraints.NotBlank;
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
public class CriterionRequest {

    private String id;

    @NotBlank(message = "Tên tiêu chí không được để trống")
    private String name;

    @NotBlank(message = "Mã tiêu chí không được để trống")
    private String code;

    @Builder.Default
    private int maxScore = 100;

    private String description;

    @Builder.Default
    private List<String> deductionRules = new ArrayList<>();

    @Builder.Default
    private Boolean isActive = true;

    private CriterionCategory category;
}
