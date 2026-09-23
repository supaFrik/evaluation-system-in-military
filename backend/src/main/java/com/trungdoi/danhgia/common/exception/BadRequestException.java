package com.trungdoi.danhgia.common.exception;

public class BadRequestException extends AppException {
    public BadRequestException(String message) {
        super(400, message);
    }
}
