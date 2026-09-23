package com.trungdoi.danhgia.modules.unit.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.trungdoi.danhgia.modules.unit.entity.UnitRemark;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UnitRemarkResponse {

    private String id;
    private String unitId;
    private String date;
    private String remark;
    private String generalRemark;
    private String updatedAt;
    private String updatedBy;
    private String createdBy;

    public static UnitRemarkResponse fromEntity(UnitRemark entity) {
        if (entity == null) return null;
        String formattedUpdated = entity.getUpdatedAt() != null
                ? entity.getUpdatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                : null;
        return UnitRemarkResponse.builder()
                .id(entity.getId())
                .unitId(entity.getUnitId())
                .date(entity.getRemarkDate())
                .remark(entity.getGeneralRemark())
                .generalRemark(entity.getGeneralRemark())
                .updatedAt(formattedUpdated)
                .updatedBy(entity.getCreatedBy())
                .createdBy(entity.getCreatedBy())
                .build();
    }
}
