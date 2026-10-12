package com.trungdoi.danhgia.modules.report.dto;

import com.trungdoi.danhgia.common.enums.UnitTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnitAggregateResponse {
    private String unitId;
    private String unitName;
    private String unitCode;
    private UnitTier tier;
    private int totalSoldiers;
    private double avgPolitical;
    private double avgTask;
    private double avgHygiene;
    private double avgBearing;
    private double avgTotal;
    @Builder.Default
    private Map<String, Double> avgCriteriaScores = new HashMap<>();
    private int rank;
    private String generalRemark;
}
