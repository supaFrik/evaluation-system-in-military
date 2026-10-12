package com.trungdoi.danhgia.modules.emulation.dto;

import com.trungdoi.danhgia.modules.emulation.enums.CommendationScope;
import com.trungdoi.danhgia.modules.emulation.enums.CommendationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommendationResponse {

    private String id;
    private CommendationType type;
    private CommendationScope scope;
    private String targetId;
    private String targetName;
    private String platoonId;
    private String content;
    private String date;
    private String createdBy;
    private DisciplineDocumentDto disciplineDocument;
}
