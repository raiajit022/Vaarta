package com.vaarta.auth.config;

import com.vaarta.auth.model.Role;
import com.vaarta.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Promotes a configured account to {@link Role#ADMIN} on startup.
 *
 * <p><strong>Why this exists.</strong> Every account is created as {@code USER},
 * and the only endpoint that can grant {@code ADMIN} is itself gated by
 * {@code hasRole("ADMIN")}. That makes the first admin impossible to create
 * through the application — it previously required a manual SQL {@code UPDATE}
 * against production, repeated for every new environment.
 *
 * <p>Set {@code VAARTA_ADMIN_EMAIL} to the address that should hold admin rights.
 * The runner is idempotent and a no-op when the variable is blank, so it is safe
 * to leave configured permanently.
 *
 * <p>Note this promotes an <em>existing</em> account rather than creating one:
 * the person still has to register and verify their email normally, so no
 * account can come into being without going through the usual flow.
 */
@Configuration
public class AdminBootstrap {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    @Bean
    CommandLineRunner promoteConfiguredAdmin(UserRepository userRepository,
                                             @Value("${vaarta.admin-email:}") String adminEmail) {
        return args -> {
            if (adminEmail == null || adminEmail.isBlank()) {
                return;
            }

            String email = adminEmail.trim().toLowerCase();

            userRepository.findByEmail(email).ifPresentOrElse(user -> {
                if (user.getRole() == Role.ADMIN) {
                    log.info("Admin bootstrap: {} already has the ADMIN role", email);
                    return;
                }
                user.setRole(Role.ADMIN);
                userRepository.save(user);
                log.info("Admin bootstrap: promoted {} to ADMIN", email);
            }, () -> log.warn(
                    "Admin bootstrap: no account found for {} — register that address first, "
                            + "then restart this service to complete the promotion", email));
        };
    }
}
