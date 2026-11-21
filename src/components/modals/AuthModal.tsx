import React, { useState } from 'react';
import { SyncService } from '../../services/syncService';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { X, Cloud, Lock, Mail, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string | null;
  onAuthSuccess: (email: string) => void;
  onSignOut: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
  onAuthSuccess,
  onSignOut
}) => {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ text: '이메일과 비밀번호를 모두 입력해 주세요.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    if (isLoginTab) {
      const { user, error } = await SyncService.signIn(email, password);
      setLoading(false);
      if (error) {
        setMessage({ text: `로그인 실패: ${error}`, type: 'error' });
      } else {
        setMessage({ text: '성공적으로 로그인되었습니다! 클라우드 동기화가 활성화됩니다.', type: 'success' });
        setTimeout(() => {
          onAuthSuccess(user?.email || email);
          onClose();
        }, 900);
      }
    } else {
      const { user, error } = await SyncService.signUp(email, password, nickname || '청운 수련생');
      setLoading(false);
      if (error) {
        setMessage({ text: `회원가입 실패: ${error}`, type: 'error' });
      } else {
        setMessage({ text: '회원가입이 완료되었습니다! 계정으로 로그인되었습니다.', type: 'success' });
        setTimeout(() => {
          onAuthSuccess(user?.email || email);
          onClose();
        }, 900);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fantasy-modal auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">☁️</span>
            <div>
              <h3>무림 강호 계정 & 클라우드</h3>
              <p className="modal-subtitle">PC, 태블릿, 스마트폰 어디서나 저장 데이터를 이어하세요</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        {/* 모달 바디 */}
        <div className="modal-body auth-body">
          {currentUserEmail ? (
            // 이미 로그인된 상태
            <div className="auth-logged-card">
              <div className="logged-icon-box">
                <CheckCircle2 size={36} className="text-emerald" />
              </div>
              <h4>강호 계정 연동 완료</h4>
              <p className="logged-email-text">{currentUserEmail}</p>
              <div className="sync-status-badge">
                <Cloud size={14} className="text-cyan" />
                <span>클라우드 자동 동기화 활성화됨</span>
              </div>
              <button
                className="btn-logout"
                onClick={() => {
                  SyncService.signOut();
                  onSignOut();
                  onClose();
                }}
              >
                로그아웃
              </button>
            </div>
          ) : (
            // 로그인 / 회원가입 폼
            <>
              {/* 탭 전환 */}
              <div className="auth-tab-row">
                <button
                  type="button"
                  className={`auth-tab-btn ${isLoginTab ? 'active' : ''}`}
                  onClick={() => {
                    setIsLoginTab(true);
                    setMessage(null);
                  }}
                >
                  로그인
                </button>
                <button
                  type="button"
                  className={`auth-tab-btn ${!isLoginTab ? 'active' : ''}`}
                  onClick={() => {
                    setIsLoginTab(false);
                    setMessage(null);
                  }}
                >
                  새 문파원 등록 (회원가입)
                </button>
              </div>

              {!isSupabaseConfigured && (
                <div className="supabase-offline-notice">
                  <AlertCircle size={14} className="text-gold" />
                  <span>
                    현재 로컬 게스트 모드로 동작 중입니다. 계정을 생성하면 브라우저에 즉시 연동됩니다.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                {!isLoginTab && (
                  <div className="auth-input-group">
                    <label>
                      <User size={14} /> 캐릭터 닉네임
                    </label>
                    <input
                      type="text"
                      placeholder="강호에서 사용할 닉네임 (예: 청운)"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                  </div>
                )}

                <div className="auth-input-group">
                  <label>
                    <Mail size={14} /> 이메일 주소
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="example@learningmoorim.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="auth-input-group">
                  <label>
                    <Lock size={14} /> 비밀번호 (6자리 이상)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {message && (
                  <div className={`auth-msg-banner ${message.type}`}>
                    {message.text}
                  </div>
                )}

                <button type="submit" className="btn-auth-submit" disabled={loading}>
                  {loading ? '처리 중...' : isLoginTab ? '강호에 접속하기 (로그인)' : '문파 등록 완료 (가입하기)'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="modal-footer">
          <p className="modal-tip-text">
            * 로그인하지 않아도 게스트 모드로 모든 게임 플레이와 로컬 저장이 가능합니다.
          </p>
          <button className="btn-confirm" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
