package com.trungdoi.danhgia.modules.unit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnitUpdateRequest {
    private String name;
    private String code;
    private String leaderTitle;
    private String leaderName;
    private Integer totalSoldiers;
}
