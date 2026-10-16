export type ItemType =
  | 'trai_6_mui'
  | 'chuoi_18cm'
  | 'dep_trai_khoai_to'
  | 'anh_top_khoai_to'
  | 'anh_da_den'
  | 'be_bot'
  | 'chuoi_9cm'
  | 'nyc';

export interface GameItemConfig {
  id: ItemType;
  name: string;
  shortLabel: string;
  points: number;
  isPositive: boolean;
  color: string;
  badgeBg: string;
  description: string;
  icon: string;
  voiceLine: string;
}

export type GameState = 'title' | 'playing' | 'paused' | 'victory';

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  isPositive: boolean;
}
