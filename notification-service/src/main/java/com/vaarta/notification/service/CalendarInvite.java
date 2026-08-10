package com.vaarta.notification.service;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Builds RFC 5545 calendar invitations.
 *
 * <p>Hand-written rather than pulled from a library: a VEVENT is a dozen lines of
 * text, and the one thing that actually needs care — folding long lines and
 * escaping separators — is a few lines of code. A dependency here would be more
 * to read than the thing it replaces.
 *
 * <p>Attaching this to the invite email is what makes a meeting land in Google
 * Calendar or Outlook instead of being copy-pasted out of the message body.
 */
public final class CalendarInvite {

    /** RFC 5545 requires UTC timestamps in basic ISO form, e.g. 20260810T143000Z. */
    private static final DateTimeFormatter ICS_UTC =
            DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");

    /** Meetings have no explicit end time, so invites reserve a default hour. */
    private static final long DEFAULT_DURATION_MINUTES = 60;

    private CalendarInvite() {}

    /**
     * Produces the {@code .ics} body for a meeting invitation.
     *
     * @param meetingId  stable UID — reusing it lets a later CANCEL or update
     *                   replace the original event rather than duplicate it
     * @param title      event summary
     * @param joinLink   the Vaarta join URL, used as both URL and description
     * @param start      meeting start; when null the invite is anchored to now,
     *                   which is the correct reading for an instant meeting
     * @param organizer  the from-address the invite appears to come from
     * @param attendee   the recipient
     * @param method     {@code REQUEST} to add or update, {@code CANCEL} to remove
     * @param sequence   bump on every update so clients accept the newer version
     */
    public static String build(UUID meetingId,
                               String title,
                               String joinLink,
                               ZonedDateTime start,
                               String organizer,
                               String attendee,
                               String method,
                               int sequence) {

        ZonedDateTime startUtc = (start == null ? ZonedDateTime.now() : start)
                .withZoneSameInstant(ZoneOffset.UTC);
        ZonedDateTime endUtc = startUtc.plusMinutes(DEFAULT_DURATION_MINUTES);

        String description = "Join the meeting: " + joinLink;

        return String.join("\r\n",
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//Vaarta//Meetings//EN",
                "CALSCALE:GREGORIAN",
                "METHOD:" + method,
                "BEGIN:VEVENT",
                "UID:" + meetingId + "@vaarta.site",
                "SEQUENCE:" + sequence,
                "DTSTAMP:" + ICS_UTC.format(ZonedDateTime.now(ZoneOffset.UTC)),
                "DTSTART:" + ICS_UTC.format(startUtc),
                "DTEND:" + ICS_UTC.format(endUtc),
                fold("SUMMARY:" + escape(title)),
                fold("DESCRIPTION:" + escape(description)),
                fold("URL:" + joinLink),
                "ORGANIZER:mailto:" + organizer,
                "ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:" + attendee,
                "STATUS:" + ("CANCEL".equals(method) ? "CANCELLED" : "CONFIRMED"),
                "END:VEVENT",
                "END:VCALENDAR",
                "");
    }

    /** Escapes the characters RFC 5545 treats as structural. */
    private static String escape(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\")
                .replace(";", "\\;")
                .replace(",", "\\,")
                .replace("\n", "\\n");
    }

    /**
     * Folds lines to 75 octets, continuing with a leading space.
     *
     * <p>Skipping this is the usual reason a hand-rolled invite is silently
     * rejected: a long meeting title pushes SUMMARY past the limit and strict
     * parsers discard the event.
     */
    private static String fold(String line) {
        if (line.length() <= 75) return line;

        StringBuilder folded = new StringBuilder(line.substring(0, 75));
        int index = 75;
        while (index < line.length()) {
            int end = Math.min(index + 74, line.length());
            folded.append("\r\n ").append(line, index, end);
            index = end;
        }
        return folded.toString();
    }
}
