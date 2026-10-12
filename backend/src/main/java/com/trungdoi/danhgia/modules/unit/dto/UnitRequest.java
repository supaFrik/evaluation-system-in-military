package com.trungdoi.danhgia.modules.unit.dto;

import com.trungdoi.danhgia.common.enums.UnitTier;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnitRequest {
    private String id;

    @NotBlank(message = "Tên đơn vị không được để trống")
    private String name;

    @NotBlank(message = "Mã đơn vị không được để trống")
    private String code;

    @NotNull(message = "Cấp đơn vị không được để trống")
    private UnitTier tier;

    private String parentId;
    private String leaderTitle;
    private String leaderName;
    private Integer totalSoldiers;
}
