-- ==============================================================================
-- 학습무림 — 레벨업 판타지 (Learning Moorim: Level-Up Fantasy)
-- Supabase Cloud Database Schema & RLS Security Policies
-- ==============================================================================

-- 1. 게임 저장 데이터 테이블 (game_saves)
CREATE TABLE IF NOT EXISTS public.game_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    nickname TEXT NOT NULL DEFAULT '무림초출',
    level INTEGER NOT NULL DEFAULT 1,
    exp INTEGER NOT NULL DEFAULT 0,
    max_exp INTEGER NOT NULL DEFAULT 300,
    hp INTEGER NOT NULL DEFAULT 250,
    max_hp INTEGER NOT NULL DEFAULT 250,
    mp INTEGER NOT NULL DEFAULT 100,
    max_mp INTEGER NOT NULL DEFAULT 100,
    atk INTEGER NOT NULL DEFAULT 42,
    def INTEGER NOT NULL DEFAULT 22,
    agi INTEGER NOT NULL DEFAULT 18,
    gold INTEGER NOT NULL DEFAULT 250,
    silver INTEGER NOT NULL DEFAULT 10,
    completed_quests JSONB NOT NULL DEFAULT '[]'::jsonb,
    learning_stats JSONB NOT NULL DEFAULT '{"totalAttempts": 0, "correctCount": 0}'::jsonb,
    inventory JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Row Level Security (RLS) 활성화
ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;

-- 3. 보안 정책: 사용자는 오직 본인의 저장 데이터만 읽고 쓸 수 있음
CREATE POLICY "Users can view their own game save" 
    ON public.game_saves 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game save" 
    ON public.game_saves 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game save" 
    ON public.game_saves 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- 4. 업데이트 타임스탬프 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_game_save_updated
    BEFORE UPDATE ON public.game_saves
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
