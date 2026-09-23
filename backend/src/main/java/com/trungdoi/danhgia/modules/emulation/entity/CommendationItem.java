package com.trungdoi.danhgia.modules.emulation.entity;

import com.trungdoi.danhgia.modules.emulation.enums.CommendationScope;
import com.trungdoi.danhgia.modules.emulation.enums.CommendationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "commendation_items", indexes = {
    @Index(name = "idx_commendation_items_date", columnList = "item_date"),
    @Index(name = "idx_commendation_items_platoon", columnList = "platoon_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommendationItem {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 20, nullable = false)
    private CommendationType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "scope", length = 20, nullable = false)
    private CommendationScope scope;

    @Column(name = "target_id", length = 50, nullable = false)
    private String targetId;

    @Column(name = "target_name", length = 100, nullable = false)
    private String targetName;

    @Column(name = "platoon_id", length = 50)
    private String platoonId;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "item_date", length = 20, nullable = false)
    private String itemDate; // YYYY-MM-DD

    @Column(name = "created_by", length = 100, nullable = false)
    private String createdBy;

    @Column(name = "discipline_document_json", columnDefinition = "TEXT")
    private String disciplineDocumentJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
