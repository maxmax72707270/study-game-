import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HeaderHUD } from './components/HeaderHUD';
import { ActionSkillsBar, SkillSlot } from './components/ActionSkillsBar';
import { QuickPotionBar } from './components/QuickPotionBar';
import { BottomMenuBar } from './components/BottomMenuBar';
import { MobileTouchControls } from './components/MobileTouchControls';
import { CharacterModal } from './components/modals/CharacterModal';
import { InventoryModal } from './components/modals/InventoryModal';
import { QuestModal } from './components/modals/QuestModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { QuizModal } from './components/modals/QuizModal';
import { AuthModal } from './components/modals/AuthModal';
import { ShopModal } from './components/modals/ShopModal';
import { SocialModal } from './components/modals/SocialModal';
import { PlayerStats, QuestSummary, InventoryItem } from './types/game';
import { GameEngine } from './game/GameEngine';
import { WorldEnvironment } from './game/WorldEnvironment';
import { LEARNING_QUESTS_DATA, QuizQuestion } from './data/learningQuests';
import { GameItem, MASTER_ITEMS, TITLES_LIST, TitleItem } from './data/itemsData';
import { SyncService, GameSaveData } from './services/syncService';
import { SoundEffects } from './services/soundEffects';
import { Info, Sparkles, BookOpen, Store } from 'lucide-react';

const STORAGE_KEY = 'learning_moorim_save_v1';

interface ScreenDamageText {
  id: number;
  text: string;
  isCrit: boolean;
  screenX: number;
  screenY: number;
  opacity: number;
}

export const App: React.FC = () => {
  const gameEngineRef = useRef<GameEngine | null>(null);

  // 계정 상태
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 좌표 및 NPC 거리
  const [playerPos, setPlayerPos] = useState<{ x: number; z: number }>({ x: 0, z: 0 });
  const [monsters, setMonsters] = useState<{ x: number; z: number; isBoss: boolean }[]>([]);
  const [isNearMonolith, setIsNearMonolith] = useState(false);
  const [isNearMerchant, setIsNearMerchant] = useState(false);

  // 대미지 텍스트 & 화면 피격 플래시
  const [floatingTexts, setFloatingTexts] = useState<ScreenDamageText[]>([]);
  const [isScreenFlashing, setIsScreenFlashing] = useState(false);

  // 캐릭터 기본 스탯
  const [stats, setStats] = useState<PlayerStats>(() => {
    const local = SyncService.loadLocal();
    if (local && local.stats) return local.stats;
    return {
      nickname: '청운 (수련생)',
      job: '견습 검사',
      level: 1,
      exp: 0,
      maxExp: 300,
      hp: 280,
      maxHp: 280,
      mp: 100,
      maxMp: 100,
      atk: 42,
      def: 22,
      agi: 18,
      gold: 250,
      silver: 10
    };
  });

  // 소속 문파 (길드)
  const [myGuildName, setMyGuildName] = useState<string | null>('청운검파');

  // 인벤토리 소지품 목록
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    return [
      {
        id: 'sword_starter',
        name: '청운 수련검',
        type: 'weapon',
        grade: '일반',
        statDesc: '공격력 +15, 민첩 +2',
        count: 1,
        icon: '🗡️',
        equipped: true
      },
      {
        id: 'armor_starter',
        name: '청운문 수련 도복',
        type: 'armor',
        grade: '일반',
        statDesc: '방어력 +12, HP +30',
        count: 1,
        icon: '🥋',
        equipped: true
      },
      {
        id: 'potion_hp',
        name: '소생단 (체력 회복)',
        type: 'potion',
        grade: '일반',
        statDesc: '복용 즉시 HP를 120 회복합니다.',
        count: 4,
        icon: '🧪'
      },
      {
        id: 'potion_mp',
        name: '청심환 (기력 회복)',
        type: 'potion',
        grade: '일반',
        statDesc: '복용 즉시 MP를 80 회복합니다.',
        count: 3,
        icon: '🍶'
      }
    ];
  });

  // 칭호 목록 & 착용 중인 칭호
  const [titles, setTitles] = useState<TitleItem[]>(TITLES_LIST);
  const [equippedTitle, setEquippedTitle] = useState<string>('무림초입 (기초 수련생)');

  // 완료한 퀘스트 목록
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>(() => {
    const local = SyncService.loadLocal();
    return local?.completedQuestIds || [];
  });

  // 학습 통계
  const [learningStats, setLearningStats] = useState<{ totalAttempts: number; correctCount: number }>(() => {
    const local = SyncService.loadLocal();
    return local?.learningStats || { totalAttempts: 0, correctCount: 0 };
  });

  // 모달 상태
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [isInvModalOpen, setIsInvModalOpen] = useState(false);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [activeQuizQuestion, setActiveQuizQuestion] = useState<QuizQuestion | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2200);
  }, []);

  // 물약 수량 계산
  const hpPotionCount = inventory.find((i) => i.id === 'potion_hp')?.count || 0;
  const mpPotionCount = inventory.find((i) => i.id === 'potion_mp')?.count || 0;

  // 자동 저장
  useEffect(() => {
    const savePayload: GameSaveData = {
      stats,
      completedQuestIds,
      learningStats,
      lastSavedAt: new Date().toISOString()
    };
    SyncService.saveGame(savePayload);
  }, [stats, completedQuestIds, learningStats, inventory]);

  // Three.js 엔진 콜백
  const handleEngineReady = useCallback((engine: GameEngine) => {
    gameEngineRef.current = engine;

    engine.onPlayerPositionChange = (x, z) => {
      setPlayerPos({ x, z });

      const monoPos = WorldEnvironment.MONOLITH_POS;
      const mDist = Math.sqrt((x - monoPos.x) ** 2 + (z - monoPos.z) ** 2);
      setIsNearMonolith(mDist <= 3.2);

      const shopPos = WorldEnvironment.MERCHANT_POS;
      const sDist = Math.sqrt((x - shopPos.x) ** 2 + (z - shopPos.z) ** 2);
      setIsNearMerchant(sDist <= 3.4);
    };

    engine.onMonstersChange = (list) => {
      setMonsters(list);
    };

    engine.onFloatingTextsChange = (texts) => {
      setFloatingTexts(texts);
    };

    engine.onPlayerDamaged = (dmg) => {
      setIsScreenFlashing(true);
      setTimeout(() => setIsScreenFlashing(false), 240);

      setStats((prev) => {
        const actualDmg = Math.max(5, Math.round(dmg - prev.def * 0.35));
        const newHp = Math.max(0, prev.hp - actualDmg);

        if (newHp <= 0) {
          showToast('⚠️ 치명상을 입었습니다! 수련 도장 중심에서 운기조식 후 부활합니다.');
          setTimeout(() => {
            if (gameEngineRef.current) {
              gameEngineRef.current.controller.position.set(0, 0, 0);
            }
            setStats((s) => ({ ...s, hp: s.maxHp, mp: s.maxMp }));
            showToast('기운을 회복하고 부활했습니다!');
          }, 2400);
        }

        return { ...prev, hp: newHp };
      });
    };

    engine.onMonsterKilled = (name, expReward, goldReward) => {
      SoundEffects.playCoinSound();
      showToast(`⚔️ [${name}] 처치 완료! (+${expReward} EXP, +${goldReward} 엽전)`);

      if (name.includes('골렘')) {
        setTitles((prev) =>
          prev.map((t) => (t.id === 'title_golem_slayer' ? { ...t, unlocked: true } : t))
        );
        showToast('🏆 칭호 획득: [흑요석 파괴자] (가방에서 착용 가능!)');
      } else {
        setTitles((prev) =>
          prev.map((t) => (t.id === 'title_hunter' ? { ...t, unlocked: true } : t))
        );
      }

      if (Math.random() < 0.45) {
        setInventory((prev) => {
          const isHp = Math.random() < 0.6;
          const targetId = isHp ? 'potion_hp' : 'potion_mp';
          const targetName = isHp ? '소생단' : '청심환';
          showToast(`🎁 몬스터가 [${targetName}]을 떨어뜨려 획득했습니다!`);

          const existing = prev.find((i) => i.id === targetId);
          if (existing) {
            return prev.map((i) => (i.id === targetId ? { ...i, count: i.count + 1 } : i));
          } else {
            const master = MASTER_ITEMS[targetId];
            return [
              ...prev,
              {
                id: targetId,
                name: master.name,
                type: 'potion',
                grade: '일반',
                statDesc: master.description,
                count: 1,
                icon: master.icon
              }
            ];
          }
        });
      }

      setStats((prev) => {
        let newExp = prev.exp + expReward;
        let newLevel = prev.level;
        let newMaxExp = prev.maxExp;
        let newMaxHp = prev.maxHp;
        let newMaxMp = prev.maxMp;
        let newAtk = prev.atk;
        let newDef = prev.def;
        let newAgi = prev.agi;
        let didLevelUp = false;

        while (newExp >= newMaxExp) {
          didLevelUp = true;
          newLevel += 1;
          newExp -= newMaxExp;
          newMaxExp = Math.round(newMaxExp * 1.4);
          newMaxHp += 40;
          newMaxMp += 20;
          newAtk += 8;
          newDef += 5;
          newAgi += 3;
        }

        if (didLevelUp) {
          setTimeout(() => {
            showToast(`⚡ 무림 레벨업 달성! Lv.${newLevel} (체력/기력 완전 회복) ⚡`);
          }, 600);
        }

        return {
          ...prev,
          level: newLevel,
          exp: newExp,
          maxExp: newMaxExp,
          hp: didLevelUp ? newMaxHp : prev.hp,
          maxHp: newMaxHp,
          mp: didLevelUp ? newMaxMp : prev.mp,
          maxMp: newMaxMp,
          atk: newAtk,
          def: newDef,
          agi: newAgi,
          gold: prev.gold + goldReward
        };
      });
    };
  }, [showToast]);

  // 비석 퀴즈 열기
  const handleOpenMonolithQuiz = useCallback(() => {
    const uncompleted = LEARNING_QUESTS_DATA.find((q) => !completedQuestIds.includes(q.id));
    const targetQuestion = uncompleted || LEARNING_QUESTS_DATA[0];
    setActiveQuizQuestion(targetQuestion);
  }, [completedQuestIds]);

  // 퀴즈 결과 처리
  const handleSolveQuestion = (
    questionId: string,
    isCorrect: boolean,
    rewardExp: number,
    rewardGold: number
  ) => {
    setLearningStats((prev) => ({
      totalAttempts: prev.totalAttempts + 1,
      correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount
    }));

    if (!isCorrect) {
      SoundEffects.playQuizWrong();
      showToast('아쉽습니다! 정답과 해설을 다시 확인해 보세요.');
      return;
    }

    SoundEffects.playQuizCorrect();
    const alreadyCompleted = completedQuestIds.includes(questionId);

    if (!alreadyCompleted) {
      const nextCompleted = [...completedQuestIds, questionId];
      setCompletedQuestIds(nextCompleted);

      if (nextCompleted.length >= 3) {
        setTitles((prev) =>
          prev.map((t) => (t.id === 'title_scholar' ? { ...t, unlocked: true } : t))
        );
        showToast('🏆 칭호 획득: [학식의 달인] (가방에서 착용 가능!)');
      }

      setStats((prev) => {
        let newExp = prev.exp + rewardExp;
        let newLevel = prev.level;
        let newMaxExp = prev.maxExp;
        let newMaxHp = prev.maxHp;
        let newMaxMp = prev.maxMp;
        let newAtk = prev.atk;
        let newDef = prev.def;
        let newAgi = prev.agi;
        let didLevelUp = false;

        while (newExp >= newMaxExp) {
          didLevelUp = true;
          newLevel += 1;
          newExp -= newMaxExp;
          newMaxExp = Math.round(newMaxExp * 1.4);
          newMaxHp += 40;
          newMaxMp += 20;
          newAtk += 8;
          newDef += 5;
          newAgi += 3;
        }

        if (didLevelUp) {
          SoundEffects.playLevelUp();
          showToast(`⚡ 무림 레벨업 달성! Lv.${newLevel} (체력/기력 완전 회복) ⚡`);
        } else {
          SoundEffects.playCoinSound();
          showToast(`학습 수련 성공! (+${rewardExp} EXP, +${rewardGold} 엽전)`);
        }

        return {
          ...prev,
          level: newLevel,
          exp: newExp,
          maxExp: newMaxExp,
          hp: didLevelUp ? newMaxHp : prev.hp,
          maxHp: newMaxHp,
          mp: didLevelUp ? newMaxMp : prev.mp,
          maxMp: newMaxMp,
          atk: newAtk,
          def: newDef,
          agi: newAgi,
          gold: prev.gold + rewardGold
        };
      });
    } else {
      showToast('복습 완료! 깨달음을 다시 되새겼습니다.');
    }
  };

  // 장비 장착 처리
  const handleEquipItem = (item: InventoryItem) => {
    const master = MASTER_ITEMS[item.id];
    if (!master) return;

    setInventory((prev) =>
      prev.map((i) => {
        if (i.type === item.type) {
          return { ...i, equipped: i.id === item.id };
        }
        return i;
      })
    );

    setStats((prev) => ({
      ...prev,
      atk: prev.atk + (master.atkBonus || 0),
      def: prev.def + (master.defBonus || 0),
      maxHp: prev.maxHp + (master.hpBonus || 0),
      maxMp: prev.maxMp + (master.mpBonus || 0),
      agi: prev.agi + (master.agiBonus || 0)
    }));

    showToast(`장착 완료: [${item.name}] (${item.statDesc})`);
  };

  // 장비 해제 처리
  const handleUnequipItem = (item: InventoryItem) => {
    const master = MASTER_ITEMS[item.id];
    if (!master) return;

    setInventory((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, equipped: false } : i))
    );

    setStats((prev) => ({
      ...prev,
      atk: Math.max(10, prev.atk - (master.atkBonus || 0)),
      def: Math.max(5, prev.def - (master.defBonus || 0)),
      maxHp: Math.max(100, prev.maxHp - (master.hpBonus || 0)),
      hp: Math.min(prev.hp, prev.maxHp - (master.hpBonus || 0)),
      maxMp: Math.max(50, prev.maxMp - (master.mpBonus || 0)),
      agi: Math.max(5, prev.agi - (master.agiBonus || 0))
    }));

    showToast(`장착 해제: [${item.name}]`);
  };

  // 영약 복용
  const handleUsePotion = (item: InventoryItem) => {
    const master = MASTER_ITEMS[item.id];
    if (!master || item.count <= 0) return;

    SoundEffects.playPotionDrink();
    setStats((prev) => {
      const healHp = master.healHp || 0;
      const healMp = master.healMp || 0;
      const newHp = Math.min(prev.maxHp, prev.hp + healHp);
      const newMp = Math.min(prev.maxMp, prev.mp + healMp);

      showToast(`영약 복용: [${item.name}] (HP +${healHp}, MP +${healMp})`);
      return { ...prev, hp: newHp, mp: newMp };
    });

    setInventory((prev) => {
      if (item.count <= 1) {
        return prev.filter((i) => i.id !== item.id);
      }
      return prev.map((i) => (i.id === item.id ? { ...i, count: i.count - 1 } : i));
    });
  };

  // 퀵슬롯 소생단(HP) 사용
  const handleUseHpPotion = () => {
    const potion = inventory.find((i) => i.id === 'potion_hp');
    if (potion && potion.count > 0) {
      handleUsePotion(potion);
    } else {
      showToast('소생단이 부족합니다! 만물상에서 구매하세요.');
    }
  };

  // 퀵슬롯 청심환(MP) 사용
  const handleUseMpPotion = () => {
    const potion = inventory.find((i) => i.id === 'potion_mp');
    if (potion && potion.count > 0) {
      handleUsePotion(potion);
    } else {
      showToast('청심환이 부족합니다! 만물상에서 구매하세요.');
    }
  };

  // 상점 물품 구매
  const handleBuyItem = (item: GameItem): boolean => {
    if (stats.gold < item.buyPrice) {
      showToast('엽전이 부족하여 구매할 수 없습니다.');
      return false;
    }

    setStats((prev) => ({ ...prev, gold: prev.gold - item.buyPrice }));

    setInventory((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, count: i.count + 1 } : i));
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          type: item.type,
          grade: item.grade,
          statDesc: item.description,
          count: 1,
          icon: item.icon,
          equipped: false
        }
      ];
    });

    showToast(`구매 완료: [${item.name}] (-${item.buyPrice}냥)`);
    return true;
  };

  // 상점 물품 판매
  const handleSellItem = (itemId: string, sellPrice: number) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    setStats((prev) => ({ ...prev, gold: prev.gold + sellPrice }));

    setInventory((prev) => {
      if (item.count <= 1) {
        return prev.filter((i) => i.id !== itemId);
      }
      return prev.map((i) => (i.id === itemId ? { ...i, count: i.count - 1 } : i));
    });

    showToast(`판매 완료: [${item.name}] (+${sellPrice}냥)`);
  };

  // 칭호 선택 장착
  const handleSelectTitle = (title: TitleItem) => {
    setEquippedTitle(title.name);
    showToast(`칭호 착용: [${title.name}] (${title.statBonusText})`);
  };

  // 소셜: 문파 가입
  const handleJoinGuild = (guildName: string) => {
    setMyGuildName(guildName);
    showToast(`축하합니다! [${guildName}]에 정식 입문하였습니다.`);
  };

  // 소셜: 친구 응원
  const handleSendCheer = (friendName: string) => {
    showToast(`❤️ [${friendName}] 수련생에게 응원의 영기를 전송했습니다!`);
  };

  // 무공 스킬 시전 핸들러
  const handleSkillUse = (skillId: SkillSlot['id'], skillName: string, mpCost: number): boolean => {
    if (!gameEngineRef.current) return false;

    if (mpCost > 0 && stats.mp < mpCost) {
      showToast(`기력(MP)이 부족합니다! (필요 MP: ${mpCost})`);
      return false;
    }

    if (mpCost > 0) {
      setStats((prev) => ({ ...prev, mp: Math.max(0, prev.mp - mpCost) }));
    }

    switch (skillId) {
      case 'attack':
        gameEngineRef.current.executeAttack(stats.atk);
        break;
      case 'skill1':
        showToast('무공 시전: [청월참]');
        gameEngineRef.current.executeSkill1(stats.atk);
        break;
      case 'skill2':
        showToast('무공 시전: [기류 폭발]');
        gameEngineRef.current.executeSkill2(stats.atk);
        break;
      case 'skill3':
        showToast('절기 발동: [천검 강림]');
        gameEngineRef.current.executeSkill3(stats.atk);
        break;
      case 'dash':
        showToast('경공: [질풍보]');
        gameEngineRef.current.controller.dash();
        break;
      default:
        break;
    }

    return true;
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toLowerCase();
      if (key === '1') {
        handleUseHpPotion();
      } else if (key === '2') {
        handleUseMpPotion();
      } else if (key === 'f') {
        if (isNearMerchant) {
          setIsShopModalOpen((prev) => !prev);
        }
      } else if (key === 'b') {
        setIsShopModalOpen((prev) => !prev);
      } else if (key === 'g') {
        setIsSocialModalOpen((prev) => !prev);
      } else if (key === 'e') {
        if (isNearMonolith && !activeQuizQuestion) {
          handleOpenMonolithQuiz();
        } else {
          handleSkillUse('skill2', '기류 폭발', 25);
        }
      } else if (key === ' ') {
        if (gameEngineRef.current) {
          gameEngineRef.current.executeAttack(stats.atk);
        }
      } else if (key === 'c') {
        setIsCharModalOpen((prev) => !prev);
      } else if (key === 'i') {
        setIsInvModalOpen((prev) => !prev);
      } else if (key === 'l') {
        setIsQuestModalOpen((prev) => !prev);
      } else if (key === 'escape') {
        setIsCharModalOpen(false);
        setIsInvModalOpen(false);
        setIsQuestModalOpen(false);
        setIsShopModalOpen(false);
        setIsSocialModalOpen(false);
        setIsAuthModalOpen(false);
        setActiveQuizQuestion(null);
        setIsSettingsModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isNearMonolith,
    isNearMerchant,
    activeQuizQuestion,
    handleOpenMonolithQuiz,
    stats.atk,
    stats.mp,
    inventory
  ]);

  // 대표 퀘스트 계산
  const uncompletedQuest = LEARNING_QUESTS_DATA.find((q) => !completedQuestIds.includes(q.id));
  const currentQuestSummary: QuestSummary = uncompletedQuest
    ? {
        id: uncompletedQuest.id,
        title: uncompletedQuest.questTitle,
        subject: uncompletedQuest.subject,
        gradeLevel: uncompletedQuest.gradeLevel,
        description: uncompletedQuest.problem.slice(0, 48) + '...',
        rewardExp: uncompletedQuest.rewardExp,
        rewardGold: uncompletedQuest.rewardGold,
        completed: false
      }
    : {
        id: 'all_done',
        title: '모든 수련 과업 달성',
        subject: '수학',
        gradeLevel: '수련 완료',
        description: '의뢰판의 모든 과목 문제를 해결했습니다! 훌륭합니다.',
        rewardExp: 0,
        rewardGold: 0,
        completed: true
      };

  const correctRate =
    learningStats.totalAttempts > 0
      ? Math.round((learningStats.correctCount / learningStats.totalAttempts) * 100)
      : 100;

  return (
    <div className="game-viewport-app">
      {/* 1. 3D WebGL Three.js 게임 캔버스 */}
      <GameCanvas onEngineReady={handleEngineReady} />

      {/* 2. 피격 붉은 화면 플래시 */}
      {isScreenFlashing && <div className="screen-damage-flash" />}

      {/* 3. 2D 플로팅 대미지 텍스트 레이어 */}
      <div className="floating-damage-overlay">
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            className={`floating-dmg-item ${ft.isCrit ? 'crit' : ''}`}
            style={{
              left: `${ft.screenX}px`,
              top: `${ft.screenY}px`,
              opacity: ft.opacity
            }}
          >
            {ft.text}
          </div>
        ))}
      </div>

      {/* 4. 상단 헤더 HUD */}
      <HeaderHUD
        stats={stats}
        quest={currentQuestSummary}
        playerPos={playerPos}
        monsters={monsters}
        currentUserEmail={currentUserEmail}
        onOpenQuestModal={() => setIsQuestModalOpen(true)}
        onOpenCharacterModal={() => setIsCharModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* 5. 상단 조작 힌트 배너 */}
      <div className="view-control-hint">
        <Info size={14} />
        <span>[1/2] 영약 | [F/B] 만물상 | [G] 문파·소셜 | 비석 [E]: 퀘스트 | Space: 공격</span>
      </div>

      {/* 6. 지혜의 비석 근처 상호작용 프롬프트 */}
      {isNearMonolith && !activeQuizQuestion && (
        <div
          className="interaction-prompt"
          onClick={handleOpenMonolithQuiz}
          role="button"
          tabIndex={0}
        >
          <span className="prompt-key">E</span>
          <BookOpen size={16} />
          <span>지혜의 비석 조사하기 (학습 퀘스트 수련)</span>
        </div>
      )}

      {/* 7. 강호 만물상인 근처 상호작용 프롬프트 */}
      {isNearMerchant && !isShopModalOpen && (
        <div
          className="interaction-prompt merchant-prompt"
          onClick={() => setIsShopModalOpen(true)}
          role="button"
          tabIndex={0}
        >
          <span className="prompt-key">F</span>
          <Store size={16} />
          <span>강호 만물상 거래하기 (장비 및 영약 상점)</span>
        </div>
      )}

      {/* 8. 액션 토스트 알림 */}
      {toastMessage && (
        <div className="action-toast">
          <Sparkles size={16} className="text-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 9. 모바일 전용 가상 조이스틱 D-Pad 및 도약 버튼 */}
      <MobileTouchControls
        onMoveVectorChange={(x, y) => {
          if (gameEngineRef.current) {
            gameEngineRef.current.controller.setVirtualMove(x, y);
          }
        }}
        onJumpPress={() => {
          if (gameEngineRef.current) {
            gameEngineRef.current.controller.jump();
          }
        }}
      />

      {/* 10. 전투 중 회복 영약 퀵슬롯 바 */}
      <QuickPotionBar
        hpPotionCount={hpPotionCount}
        mpPotionCount={mpPotionCount}
        onUseHpPotion={handleUseHpPotion}
        onUseMpPotion={handleUseMpPotion}
      />

      {/* 11. 하단 무공 및 스킬 슬롯 바 */}
      <ActionSkillsBar onSkillUse={handleSkillUse} />

      {/* 12. 하단 시스템 메뉴 탭 바 (소셜 G 포함) */}
      <BottomMenuBar
        onOpenCharacter={() => setIsCharModalOpen(true)}
        onOpenInventory={() => setIsInvModalOpen(true)}
        onOpenQuest={() => setIsQuestModalOpen(true)}
        onOpenShop={() => setIsShopModalOpen(true)}
        onOpenSocial={() => setIsSocialModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* 13. 학습 퀴즈 풀이 모달 */}
      <QuizModal
        isOpen={activeQuizQuestion !== null}
        onClose={() => setActiveQuizQuestion(null)}
        question={activeQuizQuestion}
        isCompleted={
          activeQuizQuestion ? completedQuestIds.includes(activeQuizQuestion.id) : false
        }
        onSolveQuestion={handleSolveQuestion}
      />

      {/* 14. 캐릭터 정보 모달 */}
      <CharacterModal
        isOpen={isCharModalOpen}
        onClose={() => setIsCharModalOpen(false)}
        stats={stats}
        solvedCount={completedQuestIds.length}
        correctRate={correctRate}
      />

      {/* 15. 가방 및 칭호 모달 */}
      <InventoryModal
        isOpen={isInvModalOpen}
        onClose={() => setIsInvModalOpen(false)}
        gold={stats.gold}
        silver={stats.silver}
        items={inventory}
        equippedTitles={equippedTitle}
        titles={titles}
        onEquipItem={handleEquipItem}
        onUnequipItem={handleUnequipItem}
        onUsePotion={handleUsePotion}
        onSelectTitle={handleSelectTitle}
      />

      {/* 16. 강호 만물상 상점 모달 */}
      <ShopModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        gold={stats.gold}
        silver={stats.silver}
        playerInventory={inventory}
        onBuyItem={handleBuyItem}
        onSellItem={handleSellItem}
      />

      {/* 17. 퀘스트 의뢰판 모달 */}
      <QuestModal
        isOpen={isQuestModalOpen}
        onClose={() => setIsQuestModalOpen(false)}
        completedQuestIds={completedQuestIds}
        onStartQuiz={(quest) => {
          setIsQuestModalOpen(false);
          setActiveQuizQuestion(quest);
        }}
      />

      {/* 18. 강호 소셜 및 랭킹 모달 */}
      <SocialModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        myNickname={stats.nickname}
        myLevel={stats.level}
        mySolvedCount={completedQuestIds.length}
        myGuildName={myGuildName}
        onJoinGuild={handleJoinGuild}
        onSendCheer={handleSendCheer}
      />

      {/* 19. 계정 및 클라우드 동기화 모달 */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUserEmail={currentUserEmail}
        onAuthSuccess={(email) => {
          setCurrentUserEmail(email);
          showToast(`☁️ [${email}] 계정과 클라우드 동기화되었습니다.`);
        }}
        onSignOut={() => {
          setCurrentUserEmail(null);
          showToast('계정에서 로그아웃되었습니다.');
        }}
      />

      {/* 20. 환경 설정 모달 */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentUserEmail={currentUserEmail}
        onOpenAuth={() => {
          setIsSettingsModalOpen(false);
          setIsAuthModalOpen(true);
        }}
        onManualSave={() => {
          SyncService.saveGame({
            stats,
            completedQuestIds,
            learningStats,
            lastSavedAt: new Date().toISOString()
          });
          showToast('☁️ 클라우드 및 로컬에 게임 진행 상태를 수동 저장했습니다!');
        }}
        onManualLoad={async () => {
          const { data } = await SyncService.loadGame();
          if (data) {
            setStats(data.stats);
            setCompletedQuestIds(data.completedQuestIds);
            setLearningStats(data.learningStats);
            showToast('데이터를 성공적으로 불러왔습니다.');
          }
        }}
      />
    </div>
  );
};

export default App;
