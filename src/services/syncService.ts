import { supabase, isSupabaseConfigured } from './supabaseClient';
import { PlayerStats } from '../types/game';

export interface GameSaveData {
  stats: PlayerStats;
  completedQuestIds: string[];
  learningStats: { totalAttempts: number; correctCount: number };
  lastSavedAt: string;
}

const LOCAL_STORAGE_KEY = 'learning_moorim_save_v1';

export class SyncService {
  /**
   * 로컬 스토리지에 즉시 임시 저장
   */
  public static saveLocal(data: GameSaveData) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  /**
   * 로컬 스토리지 데이터 불러오기
   */
  public static loadLocal(): GameSaveData | null {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('LocalStorage load failed', e);
      return null;
    }
  }

  /**
   * 클라우드(Supabase) 및 로컬 동시 저장
   */
  public static async saveGame(data: GameSaveData): Promise<{ success: boolean; isCloud: boolean }> {
    data.lastSavedAt = new Date().toISOString();

    // 1. 항상 로컬 저장소 우선 보존
    this.saveLocal(data);

    // 2. Supabase가 설정되어 있고 로그인된 사용자가 있는 경우 클라우드 동기화
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;

        if (user) {
          const payload = {
            user_id: user.id,
            nickname: data.stats.nickname,
            level: data.stats.level,
            exp: data.stats.exp,
            max_exp: data.stats.maxExp,
            hp: data.stats.hp,
            max_hp: data.stats.maxHp,
            mp: data.stats.mp,
            max_mp: data.stats.maxMp,
            atk: data.stats.atk,
            def: data.stats.def,
            agi: data.stats.agi,
            gold: data.stats.gold,
            silver: data.stats.silver,
            completed_quests: data.completedQuestIds,
            learning_stats: data.learningStats,
            updated_at: data.lastSavedAt
          };

          const { error } = await supabase.from('game_saves').upsert(payload, { onConflict: 'user_id' });
          if (!error) {
            return { success: true, isCloud: true };
          }
          console.warn('Cloud upsert error:', error.message);
        }
      } catch (err) {
        console.warn('Cloud sync error:', err);
      }
    }

    return { success: true, isCloud: false };
  }

  /**
   * 클라우드에서 최신 데이터 불러오기
   */
  public static async loadGame(): Promise<{ data: GameSaveData | null; isCloud: boolean }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;

        if (user) {
          const { data: row, error } = await supabase
            .from('game_saves')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (!error && row) {
            const cloudSave: GameSaveData = {
              stats: {
                nickname: row.nickname || '청운 (수련생)',
                job: '견습 검사',
                level: row.level || 1,
                exp: row.exp || 0,
                maxExp: row.max_exp || 300,
                hp: row.hp || 250,
                maxHp: row.max_hp || 250,
                mp: row.mp || 100,
                maxMp: row.max_mp || 100,
                atk: row.atk || 42,
                def: row.def || 22,
                agi: row.agi || 18,
                gold: row.gold || 250,
                silver: row.silver || 10
              },
              completedQuestIds: row.completed_quests || [],
              learningStats: row.learning_stats || { totalAttempts: 0, correctCount: 0 },
              lastSavedAt: row.updated_at || new Date().toISOString()
            };

            // 로컬에도 덮어써서 동기화
            this.saveLocal(cloudSave);
            return { data: cloudSave, isCloud: true };
          }
        }
      } catch (err) {
        console.warn('Cloud load error:', err);
      }
    }

    // 로컬 데이터 반환
    const local = this.loadLocal();
    return { data: local, isCloud: false };
  }

  /**
   * 이메일 회원가입
   */
  public static async signUp(email: string, pass: string, nickname: string) {
    if (!isSupabaseConfigured || !supabase) {
      // 로컬 모드용 모의 성공 지원
      return { user: { email, id: 'local_user' }, error: null };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { nickname } }
    });
    return { user: data.user, error: error?.message || null };
  }

  /**
   * 이메일 로그인
   */
  public static async signIn(email: string, pass: string) {
    if (!isSupabaseConfigured || !supabase) {
      return { user: { email, id: 'local_user' }, error: null };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });
    return { user: data.user, error: error?.message || null };
  }

  /**
   * 로그아웃
   */
  public static async signOut() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  }

  /**
   * 현재 로그인 사용자 확인
   */
  public static async getCurrentUser() {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data?.session?.user || null;
  }
}
