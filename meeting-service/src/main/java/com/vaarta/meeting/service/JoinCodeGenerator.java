package com.vaarta.meeting.service;

import org.springframework.stereotype.Component;
import java.security.SecureRandom;

@Component
public class JoinCodeGenerator {
    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding confusing chars like I,1,O,0
    private static final int CODE_LENGTH = 9;
    private final SecureRandom random = new SecureRandom();

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
