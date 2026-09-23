package com.trungdoi.danhgia.common.exception;

public class ForbiddenException extends AppException {
    public ForbiddenException(String message) {
        super(403, message);
    }
}
