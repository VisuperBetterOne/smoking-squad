
export interface Member {
  id: string;
  name: string;
}

export interface SmokeRecord {
  memberId: string;
  date: string; // YYYY-MM-DD
  count: number;
}

export interface AppState {
  members: Member[];
  records: SmokeRecord[];
  activeMemberId: string;
}

export enum TabType {
  HOME = 'home',
  GROUP = 'group',
  STATS = 'stats'
}
