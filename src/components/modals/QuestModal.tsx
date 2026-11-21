import React, { useState } from 'react';
import { QuizQuestion, LEARNING_QUESTS_DATA } from '../../data/learningQuests';
import { X, BookOpen, Calculator, Globe, Atom, CheckCircle2, Award, Play } from 'lucide-react';

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedQuestIds: string[];
  onStartQuiz: (question: QuizQuestion) => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({
  isOpen,
  onClose,
  completedQuestIds,
  onStartQuiz
}) => {
  const [activeTab, setActiveTab] = useState<'all' | '수학' | '영어' | '과학'>('all');

  const filteredQuests = LEARNING_QUESTS_DATA.filter((q) => {
    if (activeTab === 'all') return true;
    return q.subject === activeTab;
  });

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fantasy-modal" onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">📜</span>
            <div>
              <h3>학습 퀘스트 의뢰판 (무림 수련과)</h3>
              <p className="modal-subtitle">문제를 풀어 경험치를 쌓고 캐릭터를 성장시키세요</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        {/* 과목 탭 */}
        <div className="quest-subject-tabs">
          <button
            className={`subject-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <BookOpen size={14} /> 전체 ({LEARNING_QUESTS_DATA.length})
          </button>
          <button
            className={`subject-tab ${activeTab === '수학' ? 'active' : ''}`}
            onClick={() => setActiveTab('수학')}
          >
            <Calculator size={14} /> 수학
          </button>
          <button
            className={`subject-tab ${activeTab === '영어' ? 'active' : ''}`}
            onClick={() => setActiveTab('영어')}
          >
            <Globe size={14} /> 영어
          </button>
          <button
            className={`subject-tab ${activeTab === '과학' ? 'active' : ''}`}
            onClick={() => setActiveTab('과학')}
          >
            <Atom size={14} /> 과학
          </button>
        </div>

        {/* 모달 바디 */}
        <div className="modal-body quest-body">
          <div className="quest-list-container">
            {filteredQuests.map((quest) => {
              const isDone = completedQuestIds.includes(quest.id);

              return (
                <div key={quest.id} className={`quest-card-item ${isDone ? 'completed-card' : ''}`}>
                  <div className="quest-card-top">
                    <span className={`quest-subject-badge ${quest.subject}`}>
                      {quest.subject}
                    </span>
                    <span className="quest-grade-tag">{quest.gradeLevel}</span>
                    {isDone ? (
                      <span className="quest-completed-tag">✓ 수련 완료</span>
                    ) : (
                      <span className="quest-available-tag">도전 가능</span>
                    )}
                  </div>

                  <h4 className="quest-card-title">{quest.questTitle}</h4>
                  <p className="quest-card-desc">{quest.problem.slice(0, 55)}...</p>

                  <div className="quest-card-footer">
                    <div className="reward-tags">
                      <span className="reward-tag exp">
                        <Award size={13} /> EXP +{quest.rewardExp}
                      </span>
                      <span className="reward-tag gold">
                        엽전 +{quest.rewardGold}
                      </span>
                    </div>

                    <button
                      className={`btn-quest-action ${isDone ? 'btn-replay' : 'btn-start'}`}
                      onClick={() => onStartQuiz(quest)}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 size={14} /> 복습 풀기
                        </>
                      ) : (
                        <>
                          <Play size={14} /> 수련 시작
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="modal-footer">
          <p className="modal-tip-text">
            💡 팁: 수련장 안의 [지혜의 비석] 앞에서도 키보드 [E]를 눌러 곧바로 퀘스트를 풀 수 있습니다.
          </p>
          <button className="btn-confirm" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
};
