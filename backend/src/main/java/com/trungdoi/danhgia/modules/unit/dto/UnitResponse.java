package com.trungdoi.danhgia.modules.unit.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.trungdoi.danhgia.common.enums.UnitTier;
import com.trungdoi.danhgia.modules.unit.entity.MilitaryUnit;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UnitResponse {

    private String id;
    private String name;
    private String code;
    private UnitTier tier;
    private String parentId;
    private String leaderTitle;
    private String leaderName;
    private int totalSoldiers;
    private List<UnitResponse> children;

    public static UnitResponse fromEntity(MilitaryUnit unit) {
        if (unit == null) return null;
        return UnitResponse.builder()
                .id(unit.getId())
                .name(unit.getName())
                .code(unit.getCode())
                .tier(unit.getTier())
                .parentId(unit.getParentId())
                .leaderTitle(unit.getLeaderTitle())
                .leaderName(unit.getLeaderName())
                .totalSoldiers(unit.getTotalSoldiers())
                .children(null)
                .build();
    }

    public static UnitResponse fromEntityWithChildren(MilitaryUnit unit, List<UnitResponse> children) {
        if (unit == null) return null;
        return UnitResponse.builder()
                .id(unit.getId())
                .name(unit.getName())
                .code(unit.getCode())
                .tier(unit.getTier())
                .parentId(unit.getParentId())
                .leaderTitle(unit.getLeaderTitle())
                .leaderName(unit.getLeaderName())
                .totalSoldiers(unit.getTotalSoldiers())
                .children(children != null ? children : new ArrayList<>())
                .build();
    }
}
