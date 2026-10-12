package com.trungdoi.danhgia.modules.emulation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreDecisionDocumentDto {
    private String documentNumber;
    private String documentType;
    private String issuedBy;
    private String issuedDate;
    private String fileName;
    private String fileSize;
    private String notes;
}
