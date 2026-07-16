export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export const initialMessages: Message[] = [];

export const dummyReplies: string[] = [
  "That's a great question! Let me think about it for a moment. The answer depends on several factors, but in general, I'd suggest approaching it step by step.",
  "Interesting! Based on my analysis, there are a few key points to consider here. First, understanding the context is crucial.",
  "I appreciate you asking! Here's what I know — the best approach is usually the simplest one. Keep it straightforward.",
  "That reminds me of something important. Let me break it down for you in a way that's easy to understand.",
  "Great observation! I'd add that paying attention to the details often makes all the difference in getting the right result.",
  "You're on the right track! Let me elaborate on that a bit more to give you a complete picture.",
  "I understand what you're getting at. Here's my take — sometimes the most effective solution is also the most elegant one.",
  "That's a thoughtful question. From my perspective, the key is to balance efficiency with accuracy. Let me explain further.",
];

export const userPhrases: string[] = [
  "What's the weather like today?",
  "Can you explain quantum computing?",
  "Tell me a fun fact about space.",
  "How do I learn programming?",
  "What's the meaning of life?",
  "Give me a recipe for pasta.",
  "What are the benefits of exercise?",
  "How does AI work?",
  "Recommend a good book to read.",
  "What's the fastest animal on Earth?",
];

export function getRandomReply(): string {
  return dummyReplies[Math.floor(Math.random() * dummyReplies.length)];
}

export function getRandomUserPhrase(): string {
  return userPhrases[Math.floor(Math.random() * userPhrases.length)];
}
