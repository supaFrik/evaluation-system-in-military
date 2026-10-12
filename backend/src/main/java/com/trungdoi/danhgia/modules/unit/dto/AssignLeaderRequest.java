package com.trungdoi.danhgia.modules.unit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignLeaderRequest {
    private String soldierId;
    private String leaderName;
    private String leaderTitle;
}
