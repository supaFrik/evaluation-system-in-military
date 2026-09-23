package com.trungdoi.danhgia.modules.unit.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "unit_remarks", indexes = {
    @Index(name = "idx_unit_remarks_unit_date", columnList = "unit_id, remark_date", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnitRemark {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "unit_id", length = 50, nullable = false)
    private String unitId;

    @Column(name = "remark_date", length = 20, nullable = false)
    private String remarkDate; // YYYY-MM-DD

    @Column(name = "general_remark", columnDefinition = "TEXT")
    private String generalRemark;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public String getRemark() {
        return generalRemark;
    }

    public void setRemark(String remark) {
        this.generalRemark = remark;
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
