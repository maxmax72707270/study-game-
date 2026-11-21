import React, { useState } from 'react';
import { SoundEffects } from '../../services/soundEffects';
import { X, Volume2, Monitor, HelpCircle, Gamepad2, Cloud, RefreshCw, LogIn } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string | null;
  onOpenAuth: () => void;
  onManualSave: () => void;
  onManualLoad: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
  onOpenAuth,
  onManualSave,
  onManualLoad
}) => {
  const [bgmVolume, setBgmVolume] = useState(70);
  const [sfxVolume, setSfxVolume] = useState(85);
  const [graphicsQuality, setGraphicsQuality] = useState('high');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fantasy-modal" onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">⚙️</span>
            <h3>환경 설정 및 데이터 동기화</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        {/* 모달 바디 */}
        <div className="modal-body settings-body">
          {/* 1. 클라우드 저장 및 계정 연동 섹션 */}
          <div className="settings-section cloud-section">
            <div className="section-title">
              <Cloud size={16} className="text-cyan" />
              <span>클라우드 저장 및 동기화</span>
            </div>
            <div className="cloud-action-row">
              <div className="cloud-user-meta">
                <span className="meta-label">연동 계정:</span>
                <span className="meta-val">{currentUserEmail || '게스트 (로컬 모드)'}</span>
              </div>
              <button className="btn-small-auth" onClick={onOpenAuth}>
                <LogIn size={13} /> {currentUserEmail ? '계정 정보' : '계정 로그인'}
              </button>
            </div>
            <div className="cloud-buttons-group">
              <button className="btn-cloud-save" onClick={onManualSave}>
                <Cloud size={15} /> 지금 클라우드에 수동 저장
              </button>
              <button className="btn-cloud-load" onClick={onManualLoad}>
                <RefreshCw size={15} /> 클라우드 데이터 불러오기
              </button>
            </div>
          </div>

          {/* 2. 조작 안내 섹션 */}
          <div className="settings-section">
            <div className="section-title">
              <Gamepad2 size={16} className="text-cyan" />
              <span>조작 키 안내</span>
            </div>
            <div className="controls-guide-grid">
              <div className="control-item">
                <span className="key-badge">WASD / 방향키</span>
                <span className="control-desc">캐릭터 8방향 자유 달리기 이동</span>
              </div>
              <div className="control-item">
                <span className="key-badge">Space</span>
                <span className="control-desc">기본 공격 (연환검) 및 도약 점프</span>
              </div>
              <div className="control-item">
                <span className="key-badge">Q / E / R</span>
                <span className="control-desc">무공 스킬 (청월참, 기류폭발, 천검강림)</span>
              </div>
              <div className="control-item">
                <span className="key-badge">Shift</span>
                <span className="control-desc">경공 고속 대시 (질풍보)</span>
              </div>
              <div className="control-item">
                <span className="key-badge">비석 근처 E</span>
                <span className="control-desc">지혜의 비석 조사 (학습 퀘스트 풀기)</span>
              </div>
              <div className="control-item">
                <span className="key-badge">C / I / L / ESC</span>
                <span className="control-desc">캐릭터, 가방, 퀘스트, 설정 메뉴 창</span>
              </div>
            </div>
          </div>

          {/* 3. 오디오 설정 */}
          <div className="settings-section">
            <div className="section-title">
              <Volume2 size={16} className="text-gold" />
              <span>음향 설정</span>
            </div>
            <div className="slider-group">
              <div className="slider-row">
                <span>배경 음악</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bgmVolume}
                  onChange={(e) => setBgmVolume(Number(e.target.value))}
                />
                <span className="slider-val">{bgmVolume}%</span>
              </div>
              <div className="slider-row">
                <span>효과음</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVolume}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSfxVolume(val);
                    SoundEffects.volume = val / 100;
                  }}
                />
                <span className="slider-val">{sfxVolume}%</span>
              </div>
            </div>
          </div>

          {/* 4. 그래픽 품질 */}
          <div className="settings-section">
            <div className="section-title">
              <Monitor size={16} className="text-emerald" />
              <span>화면 품질</span>
            </div>
            <div className="quality-radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="quality"
                  value="high"
                  checked={graphicsQuality === 'high'}
                  onChange={() => setGraphicsQuality('high')}
                />
                <span>고화질 (부드러운 그림자 및 고해상도 렌더링)</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="quality"
                  value="medium"
                  checked={graphicsQuality === 'medium'}
                  onChange={() => setGraphicsQuality('medium')}
                />
                <span>표준 (배터리 절약 및 저사양 모바일 최적화)</span>
              </label>
            </div>
          </div>

          {/* 버전 정보 */}
          <div className="settings-version-tag">
            <HelpCircle size={14} />
            <span>학습무림 — 레벨업 판타지 v0.5.0 (클라우드 동기화 지원)</span>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="modal-footer">
          <button className="btn-confirm" onClick={onClose}>설정 완료</button>
        </div>
      </div>
    </div>
  );
};
