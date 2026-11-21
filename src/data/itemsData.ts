// 학습무림 장비, 아이템, 칭호 종합 데이터베이스

export interface GameItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'potion';
  grade: '일반' | '희귀' | '영웅' | '전설';
  icon: string;
  description: string;
  buyPrice: number;
  sellPrice: number;
  // 장비 스탯 보너스
  atkBonus?: number;
  defBonus?: number;
  hpBonus?: number;
  mpBonus?: number;
  agiBonus?: number;
  // 소비 영약 회복량
  healHp?: number;
  healMp?: number;
}

export interface TitleItem {
  id: string;
  name: string;
  description: string;
  statBonusText: string;
  atkBonus: number;
  defBonus: number;
  unlocked: boolean;
}

// 상점 및 드랍에서 사용되는 마스터 아이템 목록
export const MASTER_ITEMS: Record<string, GameItem> = {
  // 무기류
  sword_starter: {
    id: 'sword_starter',
    name: '청운 수련검',
    type: 'weapon',
    grade: '일반',
    icon: '🗡️',
    description: '청운문 입문자에게 지급되는 기본 연마검.',
    buyPrice: 80,
    sellPrice: 35,
    atkBonus: 15,
    agiBonus: 2
  },
  sword_rare: {
    id: 'sword_rare',
    name: '벽력 청강검',
    type: 'weapon',
    grade: '희귀',
    icon: '⚔️',
    description: '벽력의 푸른 벼락 기운이 깃든 예리한 명검.',
    buyPrice: 350,
    sellPrice: 160,
    atkBonus: 32,
    agiBonus: 6
  },
  sword_epic: {
    id: 'sword_epic',
    name: '천룡 비검',
    type: 'weapon',
    grade: '영웅',
    icon: '✨',
    description: '용의 비늘을 녹여 벼린 신비한 무림 비검.',
    buyPrice: 850,
    sellPrice: 420,
    atkBonus: 60,
    agiBonus: 14,
    mpBonus: 30
  },
  sword_legend: {
    id: 'sword_legend',
    name: '뇌신 천겁도',
    type: 'weapon',
    grade: '전설',
    icon: '⚡',
    description: '하늘의 번개를 다스리는 무림 지존의 전설적 보도.',
    buyPrice: 2200,
    sellPrice: 1100,
    atkBonus: 105,
    agiBonus: 25,
    mpBonus: 60
  },

  // 방어구 (도포/갑주)
  armor_starter: {
    id: 'armor_starter',
    name: '청운문 수련 도복',
    type: 'armor',
    grade: '일반',
    icon: '🥋',
    description: '가볍고 질긴 무명 천으로 지은 도복.',
    buyPrice: 70,
    sellPrice: 30,
    defBonus: 12,
    hpBonus: 30
  },
  armor_rare: {
    id: 'armor_rare',
    name: '현무 비단 도포',
    type: 'armor',
    grade: '희귀',
    icon: '🛡️',
    description: '현무의 단단한 비늘 실로 짠 방호 도포.',
    buyPrice: 320,
    sellPrice: 140,
    defBonus: 26,
    hpBonus: 80
  },
  armor_epic: {
    id: 'armor_epic',
    name: '백호 영갑',
    type: 'armor',
    grade: '영웅',
    icon: '🥋',
    description: '백호의 정기가 깃든 장엄한 무협 전투 갑주.',
    buyPrice: 820,
    sellPrice: 390,
    defBonus: 50,
    hpBonus: 180,
    agiBonus: 8
  },

  // 장신구
  acc_ring: {
    id: 'acc_ring',
    name: '청옥 노리개',
    type: 'accessory',
    grade: '희귀',
    icon: '📿',
    description: '맑은 영기를 모아 기력 소모를 돕는 노리개.',
    buyPrice: 240,
    sellPrice: 110,
    mpBonus: 40,
    agiBonus: 6
  },
  acc_amulet: {
    id: 'acc_amulet',
    name: '태극 영기 부적',
    type: 'accessory',
    grade: '영웅',
    icon: '🔮',
    description: '음양의 조화를 이루어 전반적인 공방 능력을 증폭시킨다.',
    buyPrice: 750,
    sellPrice: 360,
    atkBonus: 18,
    defBonus: 18,
    hpBonus: 60,
    mpBonus: 60
  },

  // 소비 영약
  potion_hp: {
    id: 'potion_hp',
    name: '소생단 (체력 회복)',
    type: 'potion',
    grade: '일반',
    icon: '🧪',
    description: '복용 즉시 체력(HP)을 120 회복합니다.',
    buyPrice: 30,
    sellPrice: 12,
    healHp: 120
  },
  potion_mp: {
    id: 'potion_mp',
    name: '청심환 (기력 회복)',
    type: 'potion',
    grade: '일반',
    icon: '🍶',
    description: '복용 즉시 내공 기력(MP)을 80 회복합니다.',
    buyPrice: 35,
    sellPrice: 15,
    healMp: 80
  },
  potion_elixir: {
    id: 'potion_elixir',
    name: '천년 대환단',
    type: 'potion',
    grade: '영웅',
    icon: '💊',
    description: '복용 즉시 체력과 기력을 100% 완전 회복합니다.',
    buyPrice: 150,
    sellPrice: 70,
    healHp: 9999,
    healMp: 9999
  }
};

// 칭호 목록
export const TITLES_LIST: TitleItem[] = [
  {
    id: 'title_novice',
    name: '무림초입 (기초 수련생)',
    description: '강호에 첫 발을 내딛은 어린 수련생',
    statBonusText: '능력치 보너스 없음',
    atkBonus: 0,
    defBonus: 0,
    unlocked: true
  },
  {
    id: 'title_scholar',
    name: '학식의 달인',
    description: '학습 퀘스트 문제를 3개 이상 정답으로 통과한 자',
    statBonusText: '공격력 +6, 방어력 +4',
    atkBonus: 6,
    defBonus: 4,
    unlocked: false
  },
  {
    id: 'title_hunter',
    name: '도깨비 사냥꾼',
    description: '수련 도깨비를 물리치고 숲의 평화를 지킨 자',
    statBonusText: '공격력 +10',
    atkBonus: 10,
    defBonus: 0,
    unlocked: false
  },
  {
    id: 'title_golem_slayer',
    name: '흑요석 파괴자',
    description: '천년 흑요석 골렘 필드 보스를 토벌한 강자',
    statBonusText: '공격력 +16, 방어력 +12',
    atkBonus: 16,
    defBonus: 12,
    unlocked: false
  }
];
