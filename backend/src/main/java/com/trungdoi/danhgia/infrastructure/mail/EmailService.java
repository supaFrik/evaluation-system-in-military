package com.trungdoi.danhgia.infrastructure.mail;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otpCode);
}
