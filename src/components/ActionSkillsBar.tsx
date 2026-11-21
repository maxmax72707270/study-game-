import React, { useState, useEffect } from 'react';
import { Sword, Wind, Zap, Sparkles, ShieldAlert } from 'lucide-react';

export interface SkillSlot {
  id: 'attack' | 'skill1' | 'skill2' | 'skill3' | 'dash';
  name: string;
  key: string;
  mpCost: number;
  cooldownTime: number; // 초
  icon: React.ReactNode;
  desc: string;
}

interface ActionSkillsBarProps {
  onSkillUse: (skillId: SkillSlot['id'], skillName: string, mpCost: number) => boolean | void;
}

export const ActionSkillsBar: React.FC<ActionSkillsBarProps> = ({ onSkillUse }) => {
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);

  const skills: SkillSlot[] = [
    {
      id: 'attack',
      name: '기본 검술',
      key: 'Space',
      mpCost: 0,
      cooldownTime: 0.45,
      icon: <Sword size={22} />,
      desc: '청운문 기초 연환검식 (근접 부채꼴 타격)'
    },
    {
      id: 'skill1',
      name: '청월참',
      key: 'Q',
      mpCost: 15,
      cooldownTime: 3.0,
      icon: <Wind size={22} />,
      desc: '푸른 초승달 검기를 발사하여 원거리 관통 베기'
    },
    {
      id: 'skill2',
      name: '기류 폭발',
      key: 'E',
      mpCost: 25,
      cooldownTime: 5.5,
      icon: <Zap size={22} />,
      desc: '체내의 기를 360도로 방출하여 주변 적 넉백'
    },
    {
      id: 'skill3',
      name: '천검 강림',
      key: 'R',
      mpCost: 50,
      cooldownTime: 11.0,
      icon: <Sparkles size={22} />,
      desc: '하늘에서 쏟아지는 수십 자루의 황금 영검 비 (궁극기)'
    },
    {
      id: 'dash',
      name: '질풍보',
      key: 'Shift',
      mpCost: 10,
      cooldownTime: 1.8,
      icon: <ShieldAlert size={22} />,
      desc: '바람을 타고 눈 깜짝할 사이에 고속 대시 회피'
    }
  ];

  const handleTriggerSkill = (skill: SkillSlot) => {
    if (cooldowns[skill.id] && cooldowns[skill.id] > 0) return;

    // 상위 핸들러 호출 (MP 부족 등으로 시전 실패 시 false 반환)
    const canCast = onSkillUse(skill.id, skill.name, skill.mpCost);
    if (canCast === false) return;

    setActiveSkillId(skill.id);
    setTimeout(() => setActiveSkillId(null), 250);

    // 쿨다운 시작
    setCooldowns((prev) => ({ ...prev, [skill.id]: skill.cooldownTime }));
    const interval = 100;
    const step = interval / 1000;

    const timer = setInterval(() => {
      setCooldowns((prev) => {
        const remaining = (prev[skill.id] || 0) - step;
        if (remaining <= 0) {
          clearInterval(timer);
          const next = { ...prev };
          delete next[skill.id];
          return next;
        }
        return { ...prev, [skill.id]: Number(remaining.toFixed(1)) };
      });
    }, interval);
  };

  // 키보드 단축키(Q, E, R, Shift, Space) 연동
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const code = e.code;
      if (code === 'KeyQ') {
        const s = skills.find((x) => x.id === 'skill1');
        if (s) handleTriggerSkill(s);
      } else if (code === 'KeyE') {
        // 비석 근처 상호작용과 구분하여 전투 스킬 E
        // E키는 게임 기본 키로 매핑
      } else if (code === 'KeyR') {
        const s = skills.find((x) => x.id === 'skill3');
        if (s) handleTriggerSkill(s);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cooldowns]);

  return (
    <div className="action-skills-bar">
      <div className="skills-cluster">
        {skills.map((skill) => {
          const currentCd = cooldowns[skill.id] || 0;
          const isCooling = currentCd > 0;
          const isUlt = skill.id === 'skill3';

          return (
            <button
              key={skill.id}
              className={`skill-slot-btn ${isUlt ? 'ult-slot' : ''} ${activeSkillId === skill.id ? 'skill-active' : ''} ${isCooling ? 'cooling-down' : ''}`}
              onClick={() => handleTriggerSkill(skill)}
              disabled={isCooling}
              title={`${skill.name} (${skill.key}) - 소모 MP: ${skill.mpCost}\n${skill.desc}`}
            >
              <div className="skill-icon-wrap">{skill.icon}</div>
              <span className="skill-hotkey-badge">{skill.key}</span>
              <span className="skill-name-label">{skill.name}</span>

              {skill.mpCost > 0 && (
                <span className="skill-mp-cost">{skill.mpCost}</span>
              )}

              {isCooling && (
                <div className="cooldown-overlay">
                  <span className="cooldown-num">{currentCd.toFixed(1)}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
