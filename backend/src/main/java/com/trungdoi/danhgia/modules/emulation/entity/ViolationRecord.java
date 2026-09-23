package com.trungdoi.danhgia.modules.emulation.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "violation_records", indexes = {
    @Index(name = "idx_violation_records_daily_score_id", columnList = "daily_score_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ViolationRecord {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_score_id")
    @JsonIgnore
    private DailyScore dailyScore;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "content", length = 500, nullable = false)
    private String content;

    @Column(name = "points", nullable = false)
    private int points;

    @Column(name = "criterion_id", length = 50)
    private String criterionId;
}
