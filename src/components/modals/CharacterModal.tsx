import React from 'react';
import { PlayerStats } from '../../types/game';
import { X, Shield, Swords, Zap, Activity, Award } from 'lucide-react';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  solvedCount: number;
  correctRate: number;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  stats,
  solvedCount,
  correctRate
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fantasy-modal" onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">🥋</span>
            <h3>캐릭터 정보 (강호 기록부)</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        {/* 모달 바디 */}
        <div className="modal-body character-body">
          {/* 캐릭터 요약 카드 */}
          <div className="char-summary-card">
            <div className="char-avatar-large">
              <span className="avatar-large-emoji">🗡️</span>
              <span className="char-title-tag">칭호: 무림의 샛별</span>
            </div>
            <div className="char-info-text">
              <h4 className="char-big-name">{stats.nickname}</h4>
              <p className="char-sub-text">소속: 청운문 · 직업: {stats.job}</p>
              <div className="char-level-badge">성장 단계: Lv.{stats.level} (수련생)</div>
            </div>
          </div>

          {/* 세부 스탯 그리드 */}
          <div className="stat-grid">
            <div className="stat-box">
              <div className="stat-box-label">
                <Swords size={16} className="text-red" />
                <span>공격력 (ATK)</span>
              </div>
              <span className="stat-box-val">{stats.atk}</span>
            </div>

            <div className="stat-box">
              <div className="stat-box-label">
                <Shield size={16} className="text-gold" />
                <span>방어력 (DEF)</span>
              </div>
              <span className="stat-box-val">{stats.def}</span>
            </div>

            <div className="stat-box">
              <div className="stat-box-label">
                <Zap size={16} className="text-blue" />
                <span>기력 (MP)</span>
              </div>
              <span className="stat-box-val">{stats.maxMp}</span>
            </div>

            <div className="stat-box">
              <div className="stat-box-label">
                <Activity size={16} className="text-emerald" />
                <span>민첩성 (AGI)</span>
              </div>
              <span className="stat-box-val">{stats.agi}</span>
            </div>
          </div>

          {/* 학습 수련 현황 (실제 데이터 연동) */}
          <div className="learning-achievement-box">
            <div className="achievement-title">
              <Award size={16} className="text-gold" />
              <span>학습 수련 실적</span>
            </div>
            <div className="achievement-stats">
              <div className="achieve-item">
                <span className="achieve-num">{solvedCount} 문제</span>
                <span className="achieve-label">해결한 문제</span>
              </div>
              <div className="achieve-item">
                <span className="achieve-num">{correctRate}%</span>
                <span className="achieve-label">정답률</span>
              </div>
              <div className="achieve-item">
                <span className="achieve-num">{stats.level >= 2 ? '초출강호' : '무림초입'}</span>
                <span className="achieve-label">무림 경지</span>
              </div>
            </div>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="modal-footer">
          <p className="modal-tip-text">💡 팁: 학습 퀘스트를 풀면 레벨업 경험치와 능력치 보너스를 얻을 수 있습니다.</p>
          <button className="btn-confirm" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
};
