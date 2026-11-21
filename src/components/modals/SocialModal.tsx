import React, { useState } from 'react';
import {
  FriendUser,
  GuildItem,
  LeaderboardRank,
  INITIAL_FRIENDS,
  GUILDS_LIST,
  WEEKLY_STUDY_LEADERBOARD,
  BOSS_CLEAR_LEADERBOARD
} from '../../data/socialData';
import {
  X,
  Users,
  Shield,
  Trophy,
  UserPlus,
  Heart,
  Trash2,
  Check,
  Award,
  Crown,
  Search
} from 'lucide-react';

interface SocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  myNickname: string;
  myLevel: number;
  mySolvedCount: number;
  myGuildName: string | null;
  onJoinGuild: (guildName: string) => void;
  onSendCheer: (friendName: string) => void;
}

export const SocialModal: React.FC<SocialModalProps> = ({
  isOpen,
  onClose,
  myNickname,
  myLevel,
  mySolvedCount,
  myGuildName,
  onJoinGuild,
  onSendCheer
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'guild' | 'ranking'>('friends');
  const [rankingSubTab, setRankingSubTab] = useState<'study' | 'boss'>('study');

  // 친구 목록 상태
  const [friends, setFriends] = useState<FriendUser[]>(INITIAL_FRIENDS);
  const [searchNickname, setSearchNickname] = useState('');
  const [addNotice, setAddNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // 친구 추가 처리
  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchNickname.trim()) return;

    if (friends.some((f) => f.nickname === searchNickname.trim())) {
      setAddNotice('이미 친구 목록에 등록되어 있습니다.');
      return;
    }

    if (searchNickname.trim() === myNickname) {
      setAddNotice('본인은 친구로 등록할 수 없습니다.');
      return;
    }

    const newFriend: FriendUser = {
      id: `friend_${Date.now()}`,
      nickname: searchNickname.trim(),
      level: Math.floor(Math.random() * 3) + 1,
      job: '수련생',
      guildName: '무소속',
      status: 'online',
      solvedProblems: 2,
      bossDefeated: false,
      avatarEmoji: '🥋'
    };

    setFriends((prev) => [newFriend, ...prev]);
    setAddNotice(`[${searchNickname.trim()}] 님을 친구로 추가했습니다!`);
    setSearchNickname('');
    setTimeout(() => setAddNotice(null), 2500);
  };

  // 친구 삭제
  const handleDeleteFriend = (id: string, name: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== id));
    setAddNotice(`[${name}] 님을 친구 목록에서 삭제했습니다.`);
    setTimeout(() => setAddNotice(null), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fantasy-modal social-modal" onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">👥</span>
            <div>
              <h3>강호 소셜 및 주간 랭킹</h3>
              <p className="modal-subtitle">친구와 함께 수련하고 문파원들과 학식을 겨루세요</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        {/* 상단 메인 탭 */}
        <div className="social-tabs-row">
          <button
            className={`social-tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            <Users size={15} /> 친구 목록 ({friends.length})
          </button>
          <button
            className={`social-tab-btn ${activeTab === 'guild' ? 'active' : ''}`}
            onClick={() => setActiveTab('guild')}
          >
            <Shield size={15} /> 문파 (길드)
          </button>
          <button
            className={`social-tab-btn ${activeTab === 'ranking' ? 'active' : ''}`}
            onClick={() => setActiveTab('ranking')}
          >
            <Trophy size={15} /> 주간 강호 랭킹
          </button>
        </div>

        {/* 모달 바디 */}
        <div className="modal-body social-body">
          {activeTab === 'friends' && (
            // 1. 친구 탭
            <div className="friends-section">
              {/* 친구 추가 검색 폼 */}
              <form onSubmit={handleAddFriend} className="friend-search-form">
                <div className="friend-search-input-wrap">
                  <Search size={15} className="text-muted" />
                  <input
                    type="text"
                    placeholder="친구의 무림 닉네임을 입력하세요..."
                    value={searchNickname}
                    onChange={(e) => setSearchNickname(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-add-friend">
                  <UserPlus size={14} /> 친구 추가
                </button>
              </form>

              {addNotice && <div className="social-notice-pill">{addNotice}</div>}

              {/* 친구 리스트 */}
              <div className="friends-list">
                {friends.length === 0 ? (
                  <div className="empty-friends-box">
                    <span>아직 등록된 친구가 없습니다. 닉네임으로 친구를 추가해 보세요!</span>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div key={friend.id} className="friend-card-item">
                      <div className="friend-card-left">
                        <div className="friend-avatar-wrap">
                          <span className="friend-avatar-emoji">{friend.avatarEmoji}</span>
                          <span className={`friend-status-dot ${friend.status}`} />
                        </div>
                        <div className="friend-info">
                          <div className="friend-name-row">
                            <h5 className="friend-nickname">{friend.nickname}</h5>
                            <span className="friend-level-tag">Lv.{friend.level}</span>
                          </div>
                          <span className="friend-meta-text">
                            {friend.guildName} · 해결한 과업 {friend.solvedProblems}문제
                          </span>
                        </div>
                      </div>

                      <div className="friend-card-right">
                        <button
                          className="btn-cheer"
                          onClick={() => onSendCheer(friend.nickname)}
                          title="응원의 영기 보내기"
                        >
                          <Heart size={13} className="text-red" />
                          <span>응원</span>
                        </button>
                        <button
                          className="btn-delete-friend"
                          onClick={() => handleDeleteFriend(friend.id, friend.nickname)}
                          title="친구 삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'guild' && (
            // 2. 문파(길드) 탭
            <div className="guild-section">
              {myGuildName ? (
                // 소속 문파가 있는 경우
                <div className="my-guild-card">
                  <div className="my-guild-header">
                    <span className="guild-badge-big">☁️</span>
                    <div>
                      <h4 className="my-guild-title">{myGuildName}</h4>
                      <span className="my-guild-meta">소속 문파원 29명 · 문주: 청운도인</span>
                    </div>
                    <span className="guild-status-tag">가입 완료</span>
                  </div>
                  <div className="guild-notice-box">
                    <strong>📜 문파 공지사항:</strong>
                    <p>이번 주 주간 학습 퀘스트 30회 달성 시 문파 전원에게 보너스 엽전 200냥을 지급합니다!</p>
                  </div>
                </div>
              ) : (
                // 소속 문파가 없는 경우: 가입 추천
                <div className="guild-join-recommend">
                  <div className="no-guild-banner">
                    <span>현재 소속된 문파가 없습니다. 문파에 가입하여 문파원들과 함께 성장하세요!</span>
                  </div>
                </div>
              )}

              <h5 className="guilds-list-title">강호 주요 문파 목록</h5>
              <div className="guilds-list-grid">
                {GUILDS_LIST.map((guild) => {
                  const isMyGuild = myGuildName === guild.name;

                  return (
                    <div key={guild.id} className={`guild-card-item ${isMyGuild ? 'my-guild' : ''}`}>
                      <div className="guild-card-top">
                        <span className="guild-icon">{guild.badgeEmoji}</span>
                        <div>
                          <h5 className="guild-name">{guild.name}</h5>
                          <span className="guild-master">문주: {guild.masterNickname}</span>
                        </div>
                        <span className="guild-count-tag">
                          {guild.memberCount}/{guild.maxMembers}명
                        </span>
                      </div>

                      <p className="guild-notice-text">{guild.notice}</p>

                      <div className="guild-card-bottom">
                        <span className="guild-req-text">입문 조건: Lv.{guild.minLevel} 이상</span>
                        {isMyGuild ? (
                          <span className="guild-joined-badge">
                            <Check size={14} /> 소속됨
                          </span>
                        ) : (
                          <button
                            className="btn-join-guild"
                            onClick={() => onJoinGuild(guild.name)}
                          >
                            문파 가입 신청
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'ranking' && (
            // 3. 주간 랭킹 탭
            <div className="ranking-section">
              <div className="ranking-subtabs-row">
                <button
                  className={`rank-subtab ${rankingSubTab === 'study' ? 'active' : ''}`}
                  onClick={() => setRankingSubTab('study')}
                >
                  <Award size={14} /> 주간 학습왕 랭킹
                </button>
                <button
                  className={`rank-subtab ${rankingSubTab === 'boss' ? 'active' : ''}`}
                  onClick={() => setRankingSubTab('boss')}
                >
                  <Crown size={14} /> 골렘 보스 토벌 랭킹
                </button>
              </div>

              {/* 랭킹 리스트 */}
              <div className="leaderboard-list">
                {(rankingSubTab === 'study' ? WEEKLY_STUDY_LEADERBOARD : BOSS_CLEAR_LEADERBOARD).map(
                  (entry) => {
                    const isTop1 = entry.rank === 1;
                    const isTop2 = entry.rank === 2;
                    const isTop3 = entry.rank === 3;

                    return (
                      <div
                        key={entry.rank}
                        className={`rank-row-item ${isTop1 ? 'gold-rank' : isTop2 ? 'silver-rank' : isTop3 ? 'bronze-rank' : ''}`}
                      >
                        <div className="rank-badge-col">
                          {isTop1 ? (
                            <span className="rank-medal gold">1위</span>
                          ) : isTop2 ? (
                            <span className="rank-medal silver">2위</span>
                          ) : isTop3 ? (
                            <span className="rank-medal bronze">3위</span>
                          ) : (
                            <span className="rank-num">{entry.rank}위</span>
                          )}
                        </div>

                        <div className="rank-user-col">
                          <span className="rank-avatar">{entry.avatarEmoji}</span>
                          <div>
                            <span className="rank-name">{entry.nickname}</span>
                            <span className="rank-guild">{entry.guildName} · Lv.{entry.level}</span>
                          </div>
                        </div>

                        <div className="rank-score-col">
                          {rankingSubTab === 'study' ? (
                            <>
                              <span className="rank-score-main text-gold">{entry.solvedCount}문제 해결</span>
                              <span className="rank-score-sub text-cyan">+{entry.weeklyExp} EXP</span>
                            </>
                          ) : (
                            <>
                              <span className="rank-score-main text-red">{entry.bossClearTime}</span>
                              <span className="rank-score-sub text-muted">토벌 성공</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* 나의 실시간 랭킹 고정 바 */}
              <div className="my-rank-fixed-bar">
                <span className="my-rank-tag">나의 순위</span>
                <div className="my-rank-info">
                  <strong>{myNickname}</strong> (Lv.{myLevel})
                </div>
                <div className="my-rank-score text-gold">
                  {mySolvedCount}문제 해결 (상위 15%)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="modal-footer">
          <p className="modal-tip-text">
            * 닉네임 기반으로 운영되며, 개인정보는 절대 수집하지 않습니다.
          </p>
          <button className="btn-confirm" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
