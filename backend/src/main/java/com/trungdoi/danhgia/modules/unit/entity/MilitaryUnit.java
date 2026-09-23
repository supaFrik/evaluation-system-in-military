package com.trungdoi.danhgia.modules.unit.entity;

import com.trungdoi.danhgia.common.enums.UnitTier;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "military_units")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MilitaryUnit {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "name", length = 150, nullable = false)
    private String name;

    @Column(name = "code", length = 50, nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "tier", length = 20, nullable = false)
    private UnitTier tier;

    @Column(name = "parent_id", length = 50)
    private String parentId;

    @Column(name = "leader_title", length = 100)
    private String leaderTitle;

    @Column(name = "leader_name", length = 100)
    private String leaderName;

    @Column(name = "total_soldiers", nullable = false)
    @Builder.Default
    private int totalSoldiers = 0;
}
