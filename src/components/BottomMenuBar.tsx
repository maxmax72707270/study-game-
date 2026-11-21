import React from 'react';
import { User, Briefcase, BookOpen, Settings, Store, Users } from 'lucide-react';

interface BottomMenuBarProps {
  onOpenCharacter: () => void;
  onOpenInventory: () => void;
  onOpenQuest: () => void;
  onOpenShop: () => void;
  onOpenSocial: () => void;
  onOpenSettings: () => void;
}

export const BottomMenuBar: React.FC<BottomMenuBarProps> = ({
  onOpenCharacter,
  onOpenInventory,
  onOpenQuest,
  onOpenShop,
  onOpenSocial,
  onOpenSettings
}) => {
  return (
    <nav className="bottom-menu-bar">
      <button
        className="menu-tab-btn"
        onClick={onOpenCharacter}
        title="캐릭터 능력치 (단축키: C)"
      >
        <User size={18} />
        <span className="menu-btn-text">캐릭터</span>
        <span className="menu-hotkey">C</span>
      </button>

      <button
        className="menu-tab-btn"
        onClick={onOpenInventory}
        title="가방 및 장비 (단축키: I)"
      >
        <Briefcase size={18} />
        <span className="menu-btn-text">가방</span>
        <span className="menu-hotkey">I</span>
      </button>

      <button
        className="menu-tab-btn"
        onClick={onOpenQuest}
        title="학습 퀘스트 (단축키: L)"
      >
        <BookOpen size={18} />
        <span className="menu-btn-text">학습 퀘스트</span>
        <span className="menu-hotkey">L</span>
      </button>

      <button
        className="menu-tab-btn"
        onClick={onOpenShop}
        title="강호 만물상 (단축키: B)"
      >
        <Store size={18} />
        <span className="menu-btn-text">만물상</span>
        <span className="menu-hotkey">B</span>
      </button>

      <button
        className="menu-tab-btn"
        onClick={onOpenSocial}
        title="문파 및 친구 랭킹 (단축키: G)"
      >
        <Users size={18} />
        <span className="menu-btn-text">강호 소셜</span>
        <span className="menu-hotkey">G</span>
      </button>

      <button
        className="menu-tab-btn"
        onClick={onOpenSettings}
        title="게임 설정 및 조작 가이드 (단축키: ESC)"
      >
        <Settings size={18} />
        <span className="menu-btn-text">설정</span>
        <span className="menu-hotkey">ESC</span>
      </button>
    </nav>
  );
};
