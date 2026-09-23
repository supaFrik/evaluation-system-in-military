package com.trungdoi.danhgia.modules.emulation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "daily_scores", indexes = {
    @Index(name = "idx_daily_scores_soldier_date", columnList = "soldier_id, score_date", unique = true),
    @Index(name = "idx_daily_scores_platoon_date", columnList = "platoon_id, score_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyScore {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "soldier_id", length = 50, nullable = false)
    private String soldierId;

    @Column(name = "soldier_name", length = 100)
    private String soldierName;

    @Column(name = "platoon_id", length = 50, nullable = false)
    private String platoonId;

    @Column(name = "score_date", length = 20, nullable = false)
    private String scoreDate; // YYYY-MM-DD

    @Column(name = "political_score", nullable = false)
    @Builder.Default
    private int politicalScore = 100;

    @Column(name = "task_score", nullable = false)
    @Builder.Default
    private int taskScore = 100;

    @Column(name = "hygiene_score", nullable = false)
    @Builder.Default
    private int hygieneScore = 100;

    @Column(name = "bearing_score", nullable = false)
    @Builder.Default
    private int bearingScore = 100;

    @Column(name = "total_score", nullable = false)
    @Builder.Default
    private int totalScore = 400;

    @Column(name = "criteria_scores_json", columnDefinition = "TEXT")
    private String criteriaScoresJson;

    @OneToMany(mappedBy = "dailyScore", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ViolationRecord> violations = new ArrayList<>();

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "evaluated_by", length = 100)
    private String evaluatedBy;

    @Column(name = "decision_document_json", columnDefinition = "TEXT")
    private String decisionDocumentJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void addViolation(ViolationRecord violation) {
        violations.add(violation);
        violation.setDailyScore(this);
    }

    public void removeViolation(ViolationRecord violation) {
        violations.remove(violation);
        violation.setDailyScore(null);
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
