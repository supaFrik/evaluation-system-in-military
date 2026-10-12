package com.trungdoi.danhgia.modules.emulation.dto;

import com.trungdoi.danhgia.modules.emulation.entity.CommendationItem;
import com.trungdoi.danhgia.modules.emulation.enums.CommendationScope;
import com.trungdoi.danhgia.modules.emulation.enums.CommendationType;
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
public class CommendationRequest {

    private String id;

    @NotNull(message = "Loại biểu dương / nhắc nhở không được để trống")
    private CommendationType type;

    @NotNull(message = "Phạm vi không được để trống")
    private CommendationScope scope;

    @NotBlank(message = "Mã đối tượng không được để trống")
    private String targetId;

    @NotBlank(message = "Tên đối tượng không được để trống")
    private String targetName;

    private String platoonId;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;

    @NotBlank(message = "Ngày không được để trống")
    private String date;

    private String createdBy;

    private DisciplineDocumentDto disciplineDocument;
}
