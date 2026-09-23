package com.trungdoi.danhgia.modules.emulation.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "daily_locks", indexes = {
    @Index(name = "idx_daily_locks_date", columnList = "lock_date", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyLock {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "lock_date", length = 20, nullable = false, unique = true)
    private String lockDate; // YYYY-MM-DD

    @Column(name = "is_locked", nullable = false)
    @Builder.Default
    private boolean isLocked = false;

    @Column(name = "locked_at", length = 50)
    private String lockedAt;

    @Column(name = "locked_by", length = 100)
    private String lockedBy;

    @Column(name = "lock_note", columnDefinition = "TEXT")
    private String lockNote;

    @Column(name = "unlock_history_json", columnDefinition = "TEXT")
    private String unlockHistoryJson;
}
