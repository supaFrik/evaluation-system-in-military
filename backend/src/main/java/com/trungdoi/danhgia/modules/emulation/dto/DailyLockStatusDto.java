package com.trungdoi.danhgia.modules.emulation.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyLockStatusDto {
    private String date;

    @JsonProperty("isLocked")
    private boolean isLocked;

    private String lockedAt;
    private String lockedBy;
    private String lockNote;
    @Builder.Default
    private List<UnlockHistoryDto> unlockHistory = new ArrayList<>();

    @JsonProperty("isLocked")
    public boolean isLocked() {
        return isLocked;
    }

    @JsonProperty("isLocked")
    public void setLocked(boolean isLocked) {
        this.isLocked = isLocked;
    }
}
