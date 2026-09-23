package com.trungdoi.danhgia.common.exception;

public class ResourceNotFoundException extends AppException {
    public ResourceNotFoundException(String message) {
        super(404, message);
    }
}
