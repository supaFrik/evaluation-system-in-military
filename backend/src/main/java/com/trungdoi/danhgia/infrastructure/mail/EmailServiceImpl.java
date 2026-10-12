package com.trungdoi.danhgia.infrastructure.mail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        log.info("=================================================================");
        log.info("[OTP VERIFICATION] Gửi mã xác thực OTP tới: {}", toEmail);
        log.info("[OTP CODE]: >>> {} <<< (Thời hạn: 10 phút)", otpCode);
        log.info("=================================================================");

        if (mailSender == null || fromEmail == null || fromEmail.isBlank()) {
            log.warn("JavaMailSender hoặc spring.mail.username chưa được cấu hình. Sử dụng mã OTP in tại log để kiểm thử/phát triển.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Mã xác thực đăng ký tài khoản - Hệ thống Thi đua Quân nhân");
            message.setText("Xin chào,\n\n"
                    + "Mã xác thực OTP của bạn là: " + otpCode + "\n\n"
                    + "Mã có hiệu lực trong 10 phút. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.\n\n"
                    + "Trân trọng,\nHệ thống Quản lý và Theo dõi Thi đua Quân nhân");

            mailSender.send(message);
            log.info("Email OTP đã được gửi thành công tới: {}", toEmail);
        } catch (Exception ex) {
            log.error("Không thể gửi email OTP qua SMTP: {}. Mã OTP vẫn có hiệu lực: {}", ex.getMessage(), otpCode);
        }
    }
}
