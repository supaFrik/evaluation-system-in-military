package com.trungdoi.danhgia.modules.soldier.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.Collections;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageResponse<T> {

    private List<T> content;
    private long totalElements;
    private int totalPages;
    private int page;
    private int size;

    public static <T> PageResponse<T> of(List<T> content, long totalElements, int totalPages, int page, int size) {
        return PageResponse.<T>builder()
                .content(content != null ? content : Collections.emptyList())
                .totalElements(totalElements)
                .totalPages(totalPages)
                .page(page)
                .size(size)
                .build();
    }

    public static <T> PageResponse<T> fromPage(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .page(page.getNumber())
                .size(page.getSize())
                .build();
    }
}
