package com.trungdoi.danhgia.modules.unit.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnitRemarkRequest {

    @NotBlank(message = "Ngày nhận xét không được để trống")
    @JsonAlias({"remarkDate"})
    private String date;

    @NotBlank(message = "Nội dung nhận xét không được để trống")
    @JsonAlias({"generalRemark", "content"})
    private String remark;

    public String getRemarkDate() {
        return date;
    }

    public String getGeneralRemark() {
        return remark;
    }
}
