
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

export interface AIInsight {
  summary: string;
  suggestion: string;
  motivationalQuote: string;
}

export type AppView = { type: 'home' } | { type: 'profile'; userId: string };
