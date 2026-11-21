import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';

interface GameCanvasProps {
  onEngineReady?: (engine: GameEngine) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onEngineReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // GameEngine 초기화
    const engine = new GameEngine(containerRef.current);
    engineRef.current = engine;

    if (onEngineReady) {
      onEngineReady(engine);
    }

    // 윈도우 리사이즈 대응
    const handleResize = () => {
      if (containerRef.current && engineRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        engineRef.current.resize(clientWidth, clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
      engineRef.current = null;
    };
  }, [onEngineReady]);

  return (
    <div
      ref={containerRef}
      className="game-canvas-container"
      tabIndex={0}
      title="화면을 마우스로 드래그하면 3D 시점이 360도 회전하고, 휠로 확대/축소할 수 있습니다."
    />
  );
};
