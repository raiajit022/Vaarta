package com.vaarta.meeting.service;

import org.springframework.stereotype.Component;
import java.security.SecureRandom;

/**
 * Utility class for generating secure, human-readable meeting join codes.
 *
 * <p>Produces an alphanumeric code formatted as XXX-XXX-XXX,
 * intentionally omitting characters that can be easily confused (like '1', 'I', '0', 'O').
 */
@Component
public class JoinCodeGenerator {
    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding confusing chars like I,1,O,0
    private static final int CODE_LENGTH = 9;
    private final SecureRandom random = new SecureRandom();

    /**
     * Generates a 10-digit personal meeting ID, formatted XXX-XXX-XXXX.
     *
     * <p>Digits rather than the alphanumeric room code: a personal ID gets read
     * aloud and typed from memory, and digits survive that better than a mixed
     * alphabet. Never starts with 0 so the whole thing stays unambiguous when
     * spoken.
     */
    public String generatePersonalId() {
        StringBuilder sb = new StringBuilder(12);
        sb.append((char) ('1' + random.nextInt(9)));
        for (int i = 1; i < 10; i++) {
            if (i == 3 || i == 6) {
                sb.append('-');
            }
            sb.append((char) ('0' + random.nextInt(10)));
        }
        return sb.toString();
    }

    public String generate() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH + 2);
        for (int i = 0; i < CODE_LENGTH; i++) {
            if (i > 0 && i % 3 == 0) {
                sb.append("-");
            }
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
