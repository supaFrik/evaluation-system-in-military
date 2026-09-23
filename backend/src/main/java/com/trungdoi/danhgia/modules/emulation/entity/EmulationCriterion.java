package com.trungdoi.danhgia.modules.emulation.entity;

import com.trungdoi.danhgia.modules.emulation.enums.CriterionCategory;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "emulation_criteria", indexes = {
    @Index(name = "idx_emulation_criteria_code", columnList = "code")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmulationCriterion {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "name", length = 200, nullable = false)
    private String name;

    @Column(name = "code", length = 50, nullable = false)
    private String code;

    @Column(name = "max_score", nullable = false)
    @Builder.Default
    private int maxScore = 100;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "criterion_deduction_rules", joinColumns = @JoinColumn(name = "criterion_id"))
    @Column(name = "deduction_rule", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> deductionRules = new ArrayList<>();

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 50)
    private CriterionCategory category;
}
