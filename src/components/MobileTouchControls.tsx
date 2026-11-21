import React, { useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpCircle } from 'lucide-react';

interface MobileTouchControlsProps {
  onMoveVectorChange: (dirX: number, dirY: number) => void;
  onJumpPress: () => void;
}

export const MobileTouchControls: React.FC<MobileTouchControlsProps> = ({
  onMoveVectorChange,
  onJumpPress
}) => {
  const activeDirRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const startMove = (x: number, y: number) => {
    activeDirRef.current = { x, y };
    onMoveVectorChange(x, y);
  };

  const stopMove = () => {
    activeDirRef.current = { x: 0, y: 0 };
    onMoveVectorChange(0, 0);
  };

  return (
    <div className="mobile-touch-controls">
      {/* 가상 D-Pad */}
      <div className="virtual-dpad">
        <button
          className="dpad-btn dpad-up"
          onPointerDown={() => startMove(0, -1)}
          onPointerUp={stopMove}
          onPointerLeave={stopMove}
          aria-label="전진 (W)"
        >
          <ArrowUp size={22} />
        </button>
        <div className="dpad-middle-row">
          <button
            className="dpad-btn dpad-left"
            onPointerDown={() => startMove(-1, 0)}
            onPointerUp={stopMove}
            onPointerLeave={stopMove}
            aria-label="좌측 (A)"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="dpad-center" />
          <button
            className="dpad-btn dpad-right"
            onPointerDown={() => startMove(1, 0)}
            onPointerUp={stopMove}
            onPointerLeave={stopMove}
            aria-label="우측 (D)"
          >
            <ArrowRight size={22} />
          </button>
        </div>
        <button
          className="dpad-btn dpad-down"
          onPointerDown={() => startMove(0, 1)}
          onPointerUp={stopMove}
          onPointerLeave={stopMove}
          aria-label="후진 (S)"
        >
          <ArrowDown size={22} />
        </button>
      </div>

      {/* 모바일 점프 도약 버튼 */}
      <button
        className="mobile-jump-btn"
        onPointerDown={onJumpPress}
        title="도약 (Space)"
        aria-label="점프"
      >
        <ArrowUpCircle size={26} />
        <span>도약</span>
      </button>
    </div>
  );
};
