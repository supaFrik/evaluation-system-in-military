package com.trungdoi.danhgia.modules.soldier.dto;

import com.trungdoi.danhgia.modules.soldier.entity.Soldier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoldierResponse {

    private String id;
    private String name;
    private String dob;
    private String gender;
    private String rank;
    private String roleTitle;

    private String battalionId;
    private String battalionName;
    private String companyId;
    private String companyName;
    private String platoonId;
    private String platoonName;
    private String squadId;
    private String squadName;

    private String joinDate;
    private String officialDate;
    private String militaryCode;
    private String idCardNumber;
    private String phone;
    private String hometown;
    private String partyStatus;
    private String partyJoinDate;
    private String avatarUrl;

    public static SoldierResponse fromEntity(Soldier s) {
        if (s == null) return null;
        return SoldierResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .dob(s.getDob())
                .gender(s.getGender())
                .rank(s.getRank())
                .roleTitle(s.getRoleTitle())
                .battalionId(s.getBattalionId())
                .battalionName(s.getBattalionName())
                .companyId(s.getCompanyId())
                .companyName(s.getCompanyName())
                .platoonId(s.getPlatoonId())
                .platoonName(s.getPlatoonName())
                .squadId(s.getSquadId())
                .squadName(s.getSquadName())
                .joinDate(s.getJoinDate())
                .officialDate(s.getOfficialDate())
                .militaryCode(s.getMilitaryCode())
                .idCardNumber(s.getIdCardNumber())
                .phone(s.getPhone())
                .hometown(s.getHometown())
                .partyStatus(s.getPartyStatus())
                .partyJoinDate(s.getPartyJoinDate())
                .avatarUrl(s.getAvatarUrl() != null ? s.getAvatarUrl() : "/default-avatar.png")
                .build();
    }
}
