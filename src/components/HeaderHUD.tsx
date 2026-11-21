import React from 'react';
import { PlayerStats, QuestSummary } from '../types/game';
import { Compass, BookOpen, Shield, Flame, Zap, Cloud, CloudCheck } from 'lucide-react';

interface HeaderHUDProps {
  stats: PlayerStats;
  quest: QuestSummary;
  playerPos: { x: number; z: number };
  monsters?: { x: number; z: number; isBoss: boolean }[];
  currentUserEmail: string | null;
  onOpenQuestModal: () => void;
  onOpenCharacterModal: () => void;
  onOpenAuthModal: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  stats,
  quest,
  playerPos,
  monsters = [],
  currentUserEmail,
  onOpenQuestModal,
  onOpenCharacterModal,
  onOpenAuthModal
}) => {
  const hpPercent = Math.min(100, Math.round((stats.hp / stats.maxHp) * 100));
  const mpPercent = Math.min(100, Math.round((stats.mp / stats.maxMp) * 100));
  const expPercent = Math.min(100, Math.round((stats.exp / stats.maxExp) * 100));

  // 미니맵 좌표 계산 (월드 반경 약 28m를 미니맵 반경 42% 범위에 투영)
  const mapScale = 28.0;
  const markerX = Math.max(8, Math.min(92, 50 + (playerPos.x / mapScale) * 42));
  const markerY = Math.max(8, Math.min(92, 50 + (playerPos.z / mapScale) * 42));

  return (
    <header className="header-hud">
      {/* 1. 좌측 상단: 플레이어 상태 프로필 & 클라우드 상태 배지 */}
      <div className="header-left-cluster">
        <div className="player-profile-card" onClick={onOpenCharacterModal} role="button" tabIndex={0} title="캐릭터 정보 보기 (단축키: C)">
          <div className="avatar-wrapper">
            <div className="avatar-frame">
              <span className="avatar-emoji">🥋</span>
            </div>
            <div className="level-badge">Lv.{stats.level}</div>
          </div>

          <div className="profile-details">
            <div className="profile-meta">
              <span className="character-name">{stats.nickname}</span>
              <span className="character-job-tag">{stats.job}</span>
            </div>

            {/* HP 바 */}
            <div className="stat-bar-group">
              <div className="bar-label-row">
                <span className="bar-name"><Flame size={12} className="text-red" /> HP</span>
                <span className="bar-val">{stats.hp} / {stats.maxHp}</span>
              </div>
              <div className="bar-track hp-track">
                <div className="bar-fill hp-fill" style={{ width: `${hpPercent}%` }} />
              </div>
            </div>

            {/* MP 바 */}
            <div className="stat-bar-group">
              <div className="bar-label-row">
                <span className="bar-name"><Zap size={12} className="text-blue" /> MP</span>
                <span className="bar-val">{stats.mp} / {stats.maxMp}</span>
              </div>
              <div className="bar-track mp-track">
                <div className="bar-fill mp-fill" style={{ width: `${mpPercent}%` }} />
              </div>
            </div>

            {/* EXP 바 */}
            <div className="stat-bar-group">
              <div className="bar-label-row">
                <span className="bar-name"><Shield size={12} className="text-gold" /> EXP</span>
                <span className="bar-val">{stats.exp} / {stats.maxExp} ({expPercent}%)</span>
              </div>
              <div className="bar-track exp-track">
                <div className="bar-fill exp-fill" style={{ width: `${expPercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* 클라우드 동기화 상태 배지 버튼 */}
        <button
          className={`cloud-sync-pill ${currentUserEmail ? 'synced' : 'guest'}`}
          onClick={onOpenAuthModal}
          title={currentUserEmail ? `연동 계정: ${currentUserEmail}` : '클라우드 계정 연동하기'}
        >
          <Cloud size={13} className={currentUserEmail ? 'text-cyan' : 'text-gold'} />
          <span>{currentUserEmail ? '클라우드 연동됨' : '게스트 (계정 연동)'}</span>
        </button>
      </div>

      {/* 2. 우측 상단: 미니맵 및 퀘스트 추적기 */}
      <div className="header-right-hud">
        {/* 미니맵 */}
        <div className="minimap-container">
          <div className="minimap-circle">
            <div className="radar-grid">
              <div className="radar-crosshair" />
              <div className="radar-circle-ring" />
            </div>

            {/* 주요 시설 고정 마커 */}
            <div className="landmark-marker pavilion-dot" style={{ top: '22%', left: '50%' }} title="수련 정자" />
            <div className="landmark-marker monolith-dot" style={{ top: '46%', left: '55%' }} title="지혜의 비석 (학습 퀘스트)" />
            <div className="landmark-marker shop-dot" style={{ top: '41%', left: '44%' }} title="강호 만물상 (상점)" />
            <div className="landmark-marker dummy-dot" style={{ top: '44%', left: '36%' }} title="목인장" />
            <div className="landmark-marker crystal-dot" style={{ top: '38%', left: '76%' }} title="영기 수정" />

            {/* 실시간 몬스터 마커들 */}
            {monsters.map((mob, idx) => {
              const mx = Math.max(6, Math.min(94, 50 + (mob.x / mapScale) * 42));
              const my = Math.max(6, Math.min(94, 50 + (mob.z / mapScale) * 42));
              return (
                <div
                  key={idx}
                  className={`landmark-marker ${mob.isBoss ? 'boss-dot' : 'monster-dot'}`}
                  style={{ left: `${mx}%`, top: `${my}%` }}
                  title={mob.isBoss ? '보스 몬스터!' : '적 몬스터'}
                />
              );
            })}

            {/* 실시간 플레이어 위치 마커 */}
            <div
              className="player-marker"
              style={{ left: `${markerX}%`, top: `${markerY}%` }}
              title={`현재 위치 (X: ${playerPos.x.toFixed(1)}, Z: ${playerPos.z.toFixed(1)})`}
            />

            {/* 방위계 */}
            <span className="compass-dir north">N</span>
            <span className="compass-dir south">S</span>
            <span className="compass-dir east">E</span>
            <span className="compass-dir west">W</span>
          </div>
          <div className="zone-tag">
            <Compass size={13} />
            <span>청풍림 · 본문 수련장</span>
          </div>
        </div>

        {/* 퀘스트 추적 카드 */}
        <div className="quest-tracker-card" onClick={onOpenQuestModal} role="button" tabIndex={0} title="퀘스트 목록 보기 (단축키: L)">
          <div className="quest-header">
            <div className="quest-badge-wrap">
              <BookOpen size={14} className="text-emerald" />
              <span className="quest-subject-tag">{quest.subject}</span>
            </div>
            <span className="quest-status-text">진행 중</span>
          </div>
          <h4 className="quest-title">{quest.title}</h4>
          <p className="quest-desc">{quest.description}</p>
          <div className="quest-reward-preview">
            <span>보상:</span>
            <span className="gold-text">+{quest.rewardGold} 엽전</span>
            <span className="exp-text">+{quest.rewardExp} EXP</span>
          </div>
        </div>
      </div>
    </header>
  );
};
