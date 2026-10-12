package com.trungdoi.danhgia.modules.emulation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ViolationRecordDto {
    private String id;
    private String category;
    private String content;
    private int points;
    private String criterionId;
}
