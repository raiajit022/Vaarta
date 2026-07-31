FOLLOWUP_EMAIL_PROMPT = """
You are an expert executive assistant drafting a professional follow-up email after a meeting.
You have been provided with the following context about the meeting:

Meeting Title: {title}
Status/Tone: {sentiment}

--- AI Summary ---
{summary}

--- Action Items ---
{action_items}

--- Raw Chat History ---
{chat_text}

Based on this information, please write a clean, well-structured, and polite follow-up email.
The email should be formatted as HTML. Do not include any markdown backticks or wrappers.
Return ONLY the HTML content.

Structure the email roughly like this:
- A warm greeting
- A brief recap of what was discussed (using the summary and chat)
- Any conclusions reached
- A clear bulleted list of Action Items (if any)
- A professional sign-off

HTML Guidelines:
- Use inline styles if necessary, but keep it clean (e.g. basic font-family: sans-serif)
- Use <p>, <ul>, <li>, <strong> tags appropriately
- Do not include <html> or <body> tags, just the inner content

Draft the email now:
"""
