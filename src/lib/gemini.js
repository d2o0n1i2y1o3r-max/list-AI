// Gemini AI client wrapper
// To use the real Gemini API:
// 1. Go to https://aistudio.google.com/app/apikey
// 2. Create an API key
// 3. Add VITE_GEMINI_API_KEY=your_key to your .env file
//
// Without a real key, the app runs in "mock mode" with simulated AI responses.

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
export const isGeminiConfigured = Boolean(GEMINI_API_KEY && !GEMINI_API_KEY.includes('REPLACE'));

let genAI = null;
let model = null;

if (isGeminiConfigured) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `You are a warm, helpful daily planner assistant embedded in a task management app.

Your personality:
- Speak plainly and directly. Short sentences preferred.
- Warm but not cheesy. Never use excessive exclamation points.
- Honest about limitations. If you can't do something, say so simply.
- Respectful of the user's time. Get to the point.
- Never take actions (like setting alarms) without explicit user permission.

When a user creates a task, your first response should always ask:
"Want me to add this to your schedule and set an alarm for the start time?"

If they say yes → confirm you've set it and remind them of the time.
If they say no → acknowledge clearly: "Got it — I won't set an alarm unless you say so. Just let me know if you change your mind."

You can help users:
- Organize and prioritize tasks
- Suggest time blocks for their day
- Answer questions about their schedule
- Give friendly reminders in chat

Keep responses concise. Never be robotic or overly formal.`,
  });
}

// System prompt for mock mode
const MOCK_RESPONSES = {
  alarm_ask: "Want me to add this to your schedule and set an alarm for the start time?",
  alarm_yes: "Done — I've set an alarm for {time}. I'll remind you right in the app when it's time.",
  alarm_no: "Got it — I won't set an alarm unless you say so. Just let me know if you change your mind.",
  greeting: "Hey! I'm here to help you plan your day. What's on your list?",
  default: [
    "Got it. Anything else you'd like to add to your day?",
    "Makes sense. Want me to help you organize the rest of your tasks?",
    "Sure thing. Let me know if you need to adjust anything.",
    "I'll keep that in mind. What else is on your plate today?",
    "Noted. Want me to suggest a time block for this one?",
  ],
};

let mockResponseIndex = 0;

function getMockResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  if (msg.includes('yes') || msg.includes('yeah') || msg.includes('sure') || msg.includes('ok')) {
    return MOCK_RESPONSES.alarm_yes.replace('{time}', 'the scheduled time');
  }
  if (msg.includes('no') || msg.includes('nope') || msg.includes("don't") || msg.includes('not')) {
    return MOCK_RESPONSES.alarm_no;
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return MOCK_RESPONSES.greeting;
  }
  const responses = MOCK_RESPONSES.default;
  const response = responses[mockResponseIndex % responses.length];
  mockResponseIndex++;
  return response;
}

export async function sendMessage(conversationHistory, userMessage, imageData = null) {
  if (!isGeminiConfigured || !model) {
    // Simulate a small delay for realism
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 600));
    return getMockResponse(userMessage);
  }

  try {
    const chat = model.startChat({
      history: conversationHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
    });

    const parts = [{ text: userMessage }];

    if (imageData) {
      parts.push({
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.data,
        },
      });
    }

    const result = await chat.sendMessage(parts);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return "Sorry, I had trouble connecting right now. Try again in a moment.";
  }
}

export { MOCK_RESPONSES };
