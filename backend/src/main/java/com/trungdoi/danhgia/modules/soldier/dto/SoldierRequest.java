package com.trungdoi.danhgia.modules.soldier.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoldierRequest {

    private String id;

    @NotBlank(message = "Họ và tên quân nhân không được để trống")
    private String name;

    private String dob;
    private String gender;

    @NotBlank(message = "Cấp bậc quân hàm không được để trống")
    private String rank;

    private String roleTitle;

    private String battalionId;
    private String battalionName;
    private String companyId;
    private String companyName;

    @NotBlank(message = "Trung đội trực thuộc không được để trống")
    private String platoonId;

    private String platoonName;
    private String squadId;
    private String squadName;

    private String joinDate;
    private String officialDate;

    @NotBlank(message = "Số thẻ quân nhân không được để trống")
    private String militaryCode;

    private String idCardNumber;
    private String phone;
    private String hometown;
    private String partyStatus;
    private String partyJoinDate;
    private String avatarUrl;
}
