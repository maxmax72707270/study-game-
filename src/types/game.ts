// 게임 기본 데이터 및 상태 인터페이스 정의

export type PlayerJob = '견습 검사' | '청운 도사' | '비호 권사';

export interface PlayerStats {
  nickname: string;
  job: PlayerJob;
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  agi: number;
  gold: number; // 엽전
  silver: number; // 은화
}

export interface SkillItem {
  id: string;
  name: string;
  hotkey: string;
  costMp: number;
  cooldown: number; // 초 단위
  currentCooldown: number;
  icon: string;
  description: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'potion' | 'scroll';
  grade: '일반' | '희귀' | '영웅' | '전설';
  statDesc: string;
  count: number;
  icon: string;
  equipped?: boolean;
}

export interface QuestSummary {
  id: string;
  title: string;
  subject: '수학' | '영어' | '과학';
  gradeLevel: string;
  description: string;
  rewardExp: number;
  rewardGold: number;
  completed: boolean;
}
