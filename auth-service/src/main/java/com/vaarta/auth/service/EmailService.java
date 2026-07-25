package com.vaarta.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

/**
 * Sends transactional emails via the Resend API.
 *
 * <p>Uses Spring WebFlux's {@link WebClient} for non-blocking HTTP.
 * Resend API reference: <a href="https://resend.com/docs/api-reference/emails/send-email">docs</a>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final WebClient.Builder webClientBuilder;

    @Value("${resend.api-key}")
    private String resendApiKey;

    @Value("${resend.from-address}")
    private String fromAddress;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    /**
     * Sends an email verification link to the newly registered user.
     *
     * @param toEmail   Recipient email address.
     * @param token     One-time verification token.
     * @param fullName  Recipient name for personalization.
     */
    public void sendVerificationEmail(String toEmail, String token, String fullName) {
        String verifyUrl = frontendUrl + "/verify-email?token=" + token;
        String name = (fullName != null && !fullName.isBlank()) ? fullName : "there";

        String html = """
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
                  <h1 style="font-size: 22px; font-weight: 600; color: #1c1917; margin-bottom: 8px;">Verify your email</h1>
                  <p style="color: #57534e; font-size: 14px; line-height: 1.6;">Hi %s,<br><br>
                  Thanks for signing up for Vaarta. Click the button below to verify your email address.</p>
                  <a href="%s"
                     style="display: inline-block; margin: 24px 0; padding: 10px 20px; background: #059669;
                            color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                    Verify email address
                  </a>
                  <p style="color: #a8a29e; font-size: 12px;">This link expires in 24 hours. If you didn't create a Vaarta account, ignore this email.</p>
                </div>
                """.formatted(name, verifyUrl);

        sendEmail(toEmail, "Verify your Vaarta email", html);
    }

    /**
     * Sends a password-reset link.
     *
     * @param toEmail Recipient email address.
     * @param token   One-time reset token.
     */
    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;

        String html = """
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
                  <h1 style="font-size: 22px; font-weight: 600; color: #1c1917; margin-bottom: 8px;">Reset your password</h1>
                  <p style="color: #57534e; font-size: 14px; line-height: 1.6;">
                  We received a request to reset your Vaarta password. Click below to choose a new one.</p>
                  <a href="%s"
                     style="display: inline-block; margin: 24px 0; padding: 10px 20px; background: #059669;
                            color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                    Reset password
                  </a>
                  <p style="color: #a8a29e; font-size: 12px;">This link expires in 1 hour. If you didn't request a reset, no action is needed — your password remains unchanged.</p>
                </div>
                """.formatted(resetUrl);

        sendEmail(toEmail, "Reset your Vaarta password", html);
    }

    // ── Internal ──────────────────────────────────────────────────────────

    private void sendEmail(String to, String subject, String html) {
        Map<String, Object> body = Map.of(
                "from", fromAddress,
                "to", new String[]{to},
                "subject", subject,
                "html", html
        );

        try {
            webClientBuilder.build()
                    .post()
                    .uri("https://api.resend.com/emails")
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(body)
                    .retrieve()
                    .toBodilessEntity()
                    .block(); // acceptable in a service call — not on a reactive chain
            log.info("Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            // Log but don't bubble up — a failed email should not break the registration flow
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
