package com.trungdoi.danhgia.modules.soldier.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "soldiers", indexes = {
    @Index(name = "idx_soldiers_military_code", columnList = "military_code", unique = true),
    @Index(name = "idx_soldiers_platoon_id", columnList = "platoon_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Soldier {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "dob", length = 20)
    private String dob;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "military_rank", length = 50)
    private String rank;

    @Column(name = "role_title", length = 100)
    private String roleTitle;

    @Column(name = "battalion_id", length = 50)
    private String battalionId;

    @Column(name = "battalion_name", length = 100)
    private String battalionName;

    @Column(name = "company_id", length = 50)
    private String companyId;

    @Column(name = "company_name", length = 100)
    private String companyName;

    @Column(name = "platoon_id", length = 50, nullable = false)
    private String platoonId;

    @Column(name = "platoon_name", length = 100)
    private String platoonName;

    @Column(name = "squad_id", length = 50)
    private String squadId;

    @Column(name = "squad_name", length = 100)
    private String squadName;

    @Column(name = "join_date", length = 20)
    private String joinDate;

    @Column(name = "official_date", length = 20)
    private String officialDate;

    @Column(name = "military_code", length = 50, unique = true)
    private String militaryCode;

    @Column(name = "id_card_number", length = 50)
    private String idCardNumber;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "hometown", length = 255)
    private String hometown;

    @Column(name = "party_status", length = 50)
    private String partyStatus;

    @Column(name = "party_join_date", length = 20)
    private String partyJoinDate;

    @Column(name = "avatar_url", length = 255)
    @Builder.Default
    private String avatarUrl = "/default-avatar.png";
}
