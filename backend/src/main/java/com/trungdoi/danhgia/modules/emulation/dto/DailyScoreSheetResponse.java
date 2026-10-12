package com.trungdoi.danhgia.modules.emulation.dto;

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
public class DailyScoreSheetResponse {
    private String date;
    private DailyLockStatusDto lockStatus;
    @Builder.Default
    private List<DailyScoreResponse> scores = new ArrayList<>();
}
