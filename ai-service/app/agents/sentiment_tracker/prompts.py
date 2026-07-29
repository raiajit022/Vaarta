SENTIMENT_PROMPT = """
You are an expert conversational analyst observing a meeting.
Your task is to analyze the following meeting chat/transcript and determine the overall sentiment or tone of the discussion.

Classify the meeting into exactly ONE of these labels:
- POSITIVE (e.g. collaborative, friendly, successful, encouraging)
- NEUTRAL (e.g. informational, standard status update, objective)
- TENSE (e.g. argumentative, frustrated, stressed, conflicting)

You must also provide a short reason (1-2 sentences) explaining why you chose this label based on the conversation.

Meeting Chat/Transcript:
{chat_text}
"""
