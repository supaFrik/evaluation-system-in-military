package com.trungdoi.danhgia.modules.unit.dto;

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
public class UnitImportSummaryResponse {
    private int totalProcessed;
    private int totalCreated;
    private int totalUpdated;
    @Builder.Default
    private List<String> errors = new ArrayList<>();
    private String message;

    public static UnitImportSummaryResponse empty() {
        return UnitImportSummaryResponse.builder()
                .totalProcessed(0)
                .totalCreated(0)
                .totalUpdated(0)
                .errors(new ArrayList<>())
                .message("Không có dữ liệu hợp lệ")
                .build();
    }
}
