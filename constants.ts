
import { User } from './types';

export const INITIAL_USERS: User[] = [
  { id: 'user1', name: '阿強', avatar: 'https://picsum.photos/seed/user1/100', color: '#ef4444' },
  { id: 'user2', name: '小明', avatar: 'https://picsum.photos/seed/user2/100', color: '#3b82f6' },
  { id: 'user3', name: '大華', avatar: 'https://picsum.photos/seed/user3/100', color: '#10b981' },
  { id: 'user4', name: '阿美', avatar: 'https://picsum.photos/seed/user4/100', color: '#f59e0b' },
  { id: 'user5', name: '老陳', avatar: 'https://picsum.photos/seed/user5/100', color: '#8b5cf6' },
];

export const STORAGE_KEY = 'quit_together_history_v2';
export const PROFILES_KEY = 'quit_together_profiles_v2';
