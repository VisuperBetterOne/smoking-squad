
export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface DailyRecord {
  [userId: string]: number;
}

export interface SmokeHistory {
  [date: string]: DailyRecord;
}

// AIInsight defines the structure of the AI analysis returned by Gemini
export interface AIInsight {
  summary: string;
  suggestion: string;
  motivationalQuote: string;
}

export type AppView = { type: 'home' } | { type: 'profile'; userId: string };
