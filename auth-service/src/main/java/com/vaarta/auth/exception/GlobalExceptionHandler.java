package com.vaarta.auth.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Centralised error handler — produces a consistent JSON error shape for all endpoints:
 *
 * <pre>
 * {
 *   "timestamp": "...",
 *   "status": 400,
 *   "error": "Bad Request",
 *   "message": "Human-readable description",
 *   "fields": { "email": "Must be a valid email" }   // only on validation failures
 * }
 * </pre>
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Bean Validation failures (e.g. blank email, short password). */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex
    ) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        return error(HttpStatus.BAD_REQUEST, "Validation failed", null, fieldErrors);
    }

    /** Invalid credentials, wrong password, etc. */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        return error(HttpStatus.UNAUTHORIZED, ex.getMessage(), null, null);
    }

    /** Business-rule violations (duplicate email, invalid token, etc.). */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return error(HttpStatus.BAD_REQUEST, ex.getMessage(), null, null);
    }

    /** State violations (email not verified). */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        return error(HttpStatus.FORBIDDEN, ex.getMessage(), null, null);
    }

    /** Catch-all — log fully, return generic 500 to not leak internals. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", null, null);
    }

    // ── Helper ────────────────────────────────────────────────────────────

    private ResponseEntity<Map<String, Object>> error(
            HttpStatus status,
            String message,
            String detail,
            Map<String, String> fields
    ) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        if (detail != null) body.put("detail", detail);
        if (fields != null && !fields.isEmpty()) body.put("fields", fields);

        return ResponseEntity.status(status).body(body);
    }
}
