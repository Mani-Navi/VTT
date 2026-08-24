package com.VTT.V10.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@titipool.ir}")
    private String fromEmail;

    @Async
    public void sendOtpCode(String toEmail, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Titipool VTT");
            helper.setTo(toEmail);
            helper.setSubject("کد تایید حساب کاربری — Titipool");

            String htmlContent = """
                <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #090a0f; color: #f4f4f5; padding: 30px; border-radius: 16px; max-width: 500px; margin: auto; text-align: center; border: 1px solid #27272a;">
                    <div style="margin-bottom: 20px;">
                        <h2 style="color: #fbbf24; margin: 0; font-size: 22px;">پلتفرم میز مجازی Titipool</h2>
                        <p style="color: #a1a1aa; font-size: 13px; margin-top: 5px;">تایید آدرس ایمیل کاربری</p>
                    </div>
                    <div style="background-color: #18181b; padding: 20px; border-radius: 12px; border: 1px solid #3f3f46; margin: 20px 0;">
                        <p style="color: #e4e4e7; font-size: 14px; margin-bottom: 10px;">کد تایید شما:</p>
                        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #fbbf24; font-family: monospace;">
                            %s
                        </div>
                    </div>
                    <p style="color: #71717a; font-size: 12px; line-height: 1.6;">این کد به مدت ۲ دقیقه معتبر است. اگر شما این درخواست را نداده‌اید، این پیام را نادیده بگیرید.</p>
                </div>
            """.formatted(code);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("✅ Verification email sent successfully to {}", toEmail);

        } catch (MessagingException e) {
            log.error("❌ Failed to send verification email to {}: ", toEmail, e);
        } catch (Exception e) {
            log.error("❌ General error in sending email: ", e);
        }
    }
}