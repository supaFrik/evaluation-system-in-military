package com.trungdoi.danhgia.modules.auth.entity;

import com.trungdoi.danhgia.common.enums.UnitTier;
import com.trungdoi.danhgia.common.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_accounts", indexes = {
    @Index(name = "idx_user_accounts_username", columnList = "username", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAccount {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "username", length = 100, nullable = false, unique = true)
    private String username;

    @Column(name = "password", length = 255, nullable = false)
    private String password;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "military_rank", length = 50)
    private String rank;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 20, nullable = false)
    private UserRole role;

    @Column(name = "role_title", length = 100)
    private String roleTitle;

    @Column(name = "soldier_id", length = 50)
    private String soldierId;

    @Column(name = "platoon_id", length = 50)
    private String platoonId;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "avatar_url", length = 255)
    @Builder.Default
    private String avatarUrl = "/default-avatar.png";

    @Enumerated(EnumType.STRING)
    @Column(name = "unit_scope_tier", length = 20)
    private UnitTier unitScopeTier;

    @Column(name = "assigned_unit_id", length = 50)
    private String assignedUnitId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
