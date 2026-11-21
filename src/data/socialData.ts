// 소셜, 문파(길드), 주간 랭킹 데이터 정의

export interface FriendUser {
  id: string;
  nickname: string;
  level: number;
  job: string;
  guildName: string;
  status: 'online' | 'training' | 'offline';
  solvedProblems: number;
  bossDefeated: boolean;
  avatarEmoji: string;
}

export interface GuildItem {
  id: string;
  name: string;
  masterNickname: string;
  memberCount: number;
  maxMembers: number;
  notice: string;
  minLevel: number;
  badgeEmoji: string;
}

export interface LeaderboardRank {
  rank: number;
  nickname: string;
  guildName: string;
  level: number;
  solvedCount: number;
  weeklyExp: number;
  bossClearTime?: string;
  avatarEmoji: string;
}

// 초기 친구 기본 데이터
export const INITIAL_FRIENDS: FriendUser[] = [
  {
    id: 'friend_1',
    nickname: '백호무제',
    level: 4,
    job: '비호 권사',
    guildName: '청운검파',
    status: 'online',
    solvedProblems: 8,
    bossDefeated: true,
    avatarEmoji: '🐯'
  },
  {
    id: 'friend_2',
    nickname: '비류연',
    level: 3,
    job: '견습 검사',
    guildName: '화산검문',
    status: 'training',
    solvedProblems: 5,
    bossDefeated: false,
    avatarEmoji: '🦅'
  },
  {
    id: 'friend_3',
    nickname: '수리학도',
    level: 2,
    job: '청운 도사',
    guildName: '청운검파',
    status: 'offline',
    solvedProblems: 3,
    bossDefeated: false,
    avatarEmoji: '📚'
  }
];

// 가입 가능한 문파 목록
export const GUILDS_LIST: GuildItem[] = [
  {
    id: 'guild_1',
    name: '청운검파',
    masterNickname: '청운도인',
    memberCount: 28,
    maxMembers: 40,
    notice: '배움과 무예를 함께 닦는 청운문의 본파입니다. 초보 수련생 환영!',
    minLevel: 1,
    badgeEmoji: '☁️'
  },
  {
    id: 'guild_2',
    name: '소림밀전',
    masterNickname: '혜공대사',
    memberCount: 35,
    maxMembers: 50,
    notice: '수학 연산과 과학의 이치를 깨우쳐 절대무공을 완성합니다.',
    minLevel: 2,
    badgeEmoji: '🏯'
  },
  {
    id: 'guild_3',
    name: '화산검문',
    masterNickname: '매화검존',
    memberCount: 22,
    maxMembers: 30,
    notice: '매화 향기 가득한 영문 비급 독해 특화 문파입니다.',
    minLevel: 2,
    badgeEmoji: '🌸'
  }
];

// 주간 학습 랭킹 (Top 10)
export const WEEKLY_STUDY_LEADERBOARD: LeaderboardRank[] = [
  {
    rank: 1,
    nickname: '천재검객',
    guildName: '청운검파',
    level: 6,
    solvedCount: 15,
    weeklyExp: 1850,
    avatarEmoji: '👑'
  },
  {
    rank: 2,
    nickname: '수리도사',
    guildName: '소림밀전',
    level: 5,
    solvedCount: 12,
    weeklyExp: 1420,
    avatarEmoji: '🥈'
  },
  {
    rank: 3,
    nickname: '백호무제',
    guildName: '청운검파',
    level: 4,
    solvedCount: 8,
    weeklyExp: 1050,
    avatarEmoji: '🥉'
  },
  {
    rank: 4,
    nickname: '영문마스터',
    guildName: '화산검문',
    level: 4,
    solvedCount: 7,
    weeklyExp: 890,
    avatarEmoji: '📜'
  },
  {
    rank: 5,
    nickname: '비류연',
    guildName: '화산검문',
    level: 3,
    solvedCount: 5,
    weeklyExp: 650,
    avatarEmoji: '🦅'
  }
];

// 보스 토벌 기록 랭킹
export const BOSS_CLEAR_LEADERBOARD: LeaderboardRank[] = [
  {
    rank: 1,
    nickname: '천재검객',
    guildName: '청운검파',
    level: 6,
    solvedCount: 15,
    weeklyExp: 1850,
    bossClearTime: '0분 48초',
    avatarEmoji: '👑'
  },
  {
    rank: 2,
    nickname: '백호무제',
    guildName: '청운검파',
    level: 4,
    solvedCount: 8,
    weeklyExp: 1050,
    bossClearTime: '1분 15초',
    avatarEmoji: '🐯'
  },
  {
    rank: 3,
    nickname: '수리도사',
    guildName: '소림밀전',
    level: 5,
    solvedCount: 12,
    weeklyExp: 1420,
    bossClearTime: '1분 32초',
    avatarEmoji: '🏯'
  }
];
