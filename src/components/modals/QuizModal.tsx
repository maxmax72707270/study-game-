import React, { useState } from 'react';
import { QuizQuestion } from '../../data/learningQuests';
import { X, CheckCircle, AlertCircle, HelpCircle, Award, Coins, BookOpen, ArrowRight } from 'lucide-react';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: QuizQuestion | null;
  isCompleted: boolean;
  onSolveQuestion: (
    questionId: string,
    isCorrect: boolean,
    rewardExp: number,
    rewardGold: number
  ) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  question,
  isCompleted,
  onSolveQuestion
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  if (!isOpen || !question) return null;

  const isCorrect = selectedIndex === question.correctIndex;

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    setIsSubmitted(true);
    onSolveQuestion(question.id, isCorrect, question.rewardExp, question.rewardGold);
  };

  const handleNext = () => {
    setSelectedIndex(null);
    setIsSubmitted(false);
    setShowHint(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fantasy-modal quiz-modal" onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">📖</span>
            <div>
              <h3>학습 수련 문제 풀이</h3>
              <div className="quiz-meta-sub">
                <span className={`quest-subject-badge ${question.subject}`}>{question.subject}</span>
                <span className="quiz-grade-text">{question.gradeLevel}</span>
                {isCompleted && <span className="quiz-completed-badge">✓ 이미 완료된 수련</span>}
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        {/* 모달 바디 */}
        <div className="modal-body quiz-body">
          {/* 퀘스트 타이틀 & 문제 본문 */}
          <div className="quiz-question-box">
            <h4 className="quiz-quest-title">{question.questTitle}</h4>
            <p className="quiz-problem-text">{question.problem}</p>
          </div>

          {/* 힌트 토글 */}
          {question.hint && (
            <div className="quiz-hint-wrap">
              <button
                type="button"
                className="quiz-hint-toggle"
                onClick={() => setShowHint((prev) => !prev)}
              >
                <HelpCircle size={14} />
                <span>{showHint ? '수련 힌트 숨기기' : '도움이 필요하신가요? 힌트 보기'}</span>
              </button>
              {showHint && (
                <div className="quiz-hint-content">
                  💡 <strong>힌트:</strong> {question.hint}
                </div>
              )}
            </div>
          )}

          {/* 객관식 보기 목록 */}
          <div className="quiz-options-list">
            {question.options.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              let optionClass = 'quiz-option-card';

              if (isSubmitted) {
                if (idx === question.correctIndex) {
                  optionClass += ' correct-answer';
                } else if (isSelected && !isCorrect) {
                  optionClass += ' wrong-answer';
                }
              } else if (isSelected) {
                optionClass += ' selected';
              }

              return (
                <button
                  key={idx}
                  className={optionClass}
                  onClick={() => !isSubmitted && setSelectedIndex(idx)}
                  disabled={isSubmitted}
                >
                  <span className="option-num-badge">{idx + 1}</span>
                  <span className="option-text">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* 결과 및 해설 피드백 창 */}
          {isSubmitted && (
            <div className={`quiz-feedback-box ${isCorrect ? 'success' : 'fail'}`}>
              <div className="feedback-header">
                {isCorrect ? (
                  <>
                    <CheckCircle size={22} className="text-emerald" />
                    <h4>정답입니다! 뛰어난 깨달음을 얻었습니다!</h4>
                  </>
                ) : (
                  <>
                    <AlertCircle size={22} className="text-red" />
                    <h4>아쉽습니다! 정답을 다시 확인해 보세요.</h4>
                  </>
                )}
              </div>

              {/* 보상 정보 안내 */}
              {isCorrect && (
                <div className="feedback-rewards">
                  {!isCompleted ? (
                    <>
                      <span className="reward-pill exp">
                        <Award size={14} /> EXP +{question.rewardExp}
                      </span>
                      <span className="reward-pill gold">
                        <Coins size={14} /> 엽전 +{question.rewardGold}냥
                      </span>
                    </>
                  ) : (
                    <span className="reward-pill replay">
                      (복습 완료: 중복 보상 없이 완료 상태 유지)
                    </span>
                  )}
                </div>
              )}

              {/* 쉬운 해설 */}
              <div className="feedback-explanation">
                <strong>[친절한 문제 해설]</strong>
                <p>{question.explanation}</p>
              </div>
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="modal-footer">
          {!isSubmitted ? (
            <button
              className="btn-submit-answer"
              disabled={selectedIndex === null}
              onClick={handleSubmit}
            >
              답안 제출하기
            </button>
          ) : (
            <button className="btn-confirm" onClick={handleNext}>
              <ArrowRight size={16} /> 다음으로 진행
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
