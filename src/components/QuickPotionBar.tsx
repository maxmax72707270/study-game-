import React from 'react';

interface QuickPotionBarProps {
  hpPotionCount: number;
  mpPotionCount: number;
  onUseHpPotion: () => void;
  onUseMpPotion: () => void;
}

export const QuickPotionBar: React.FC<QuickPotionBarProps> = ({
  hpPotionCount,
  mpPotionCount,
  onUseHpPotion,
  onUseMpPotion
}) => {
  return (
    <div className="quick-potion-bar">
      {/* 1번 슬롯: 소생단 (HP) */}
      <button
        className={`potion-slot-btn hp ${hpPotionCount <= 0 ? 'empty' : ''}`}
        onClick={onUseHpPotion}
        disabled={hpPotionCount <= 0}
        title="소생단 (HP 120 회복) - 단축키: 1"
      >
        <span className="potion-hotkey">1</span>
        <span className="potion-emoji">🧪</span>
        <span className="potion-qty">{hpPotionCount}</span>
      </button>

      {/* 2번 슬롯: 청심환 (MP) */}
      <button
        className={`potion-slot-btn mp ${mpPotionCount <= 0 ? 'empty' : ''}`}
        onClick={onUseMpPotion}
        disabled={mpPotionCount <= 0}
        title="청심환 (MP 80 회복) - 단축키: 2"
      >
        <span className="potion-hotkey">2</span>
        <span className="potion-emoji">🍶</span>
        <span className="potion-qty">{mpPotionCount}</span>
      </button>
    </div>
  );
};
