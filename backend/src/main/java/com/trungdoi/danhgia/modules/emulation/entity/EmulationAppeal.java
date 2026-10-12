package com.trungdoi.danhgia.modules.emulation.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "emulation_appeals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmulationAppeal {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "soldier_id", length = 50, nullable = false)
    private String soldierId;

    @Column(name = "soldier_name", length = 100, nullable = false)
    private String soldierName;

    @Column(name = "unit_id", length = 50, nullable = false)
    private String unitId;

    @Column(name = "unit_name", length = 150, nullable = false)
    private String unitName;

    @JsonProperty("date")
    @Column(name = "appeal_date", length = 20, nullable = false)
    private String date;

    @Column(name = "criterion_id", length = 50)
    private String criterionId;

    @Column(name = "criterion_name", length = 200)
    private String criterionName;

    @Column(name = "deduction_points")
    private Integer deductionPoints;

    @Column(name = "reason", columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "created_at", length = 50, nullable = false)
    private String createdAt;

    @Column(name = "resolved_at", length = 50)
    private String resolvedAt;

    @Column(name = "resolved_by", length = 100)
    private String resolvedBy;

    @Column(name = "reply", columnDefinition = "TEXT")
    private String reply;
}
