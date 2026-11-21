import React, { useState } from 'react';
import { InventoryItem } from '../../types/game';
import { TitleItem, TITLES_LIST } from '../../data/itemsData';
import { X, Coins, Sparkles, Shield, Swords, Award, Check } from 'lucide-react';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  gold: number;
  silver: number;
  items: InventoryItem[];
  equippedTitles: string;
  titles: TitleItem[];
  onEquipItem: (item: InventoryItem) => void;
  onUnequipItem: (item: InventoryItem) => void;
  onUsePotion: (item: InventoryItem) => void;
  onSelectTitle: (title: TitleItem) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  gold,
  silver,
  items,
  equippedTitles,
  titles,
  onEquipItem,
  onUnequipItem,
  onUsePotion,
  onSelectTitle
}) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'bag' | 'titles'>('bag');

  if (!isOpen) return null;

  // 장착된 장비 추출
  const equippedWeapon = items.find((i) => i.equipped && i.type === 'weapon');
  const equippedArmor = items.find((i) => i.equipped && i.type === 'armor');
  const equippedAcc = items.find((i) => i.equipped && i.type === 'accessory');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fantasy-modal inventory-modal-expanded" onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">🎒</span>
            <div>
              <h3>소지품 행낭 및 장비함</h3>
              <p className="modal-subtitle">장비를 착용하여 캐릭터를 강화하고 칭호를 변경하세요</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        {/* 상단 탭 및 재화 바 */}
        <div className="inv-top-bar">
          <div className="inv-tabs">
            <button
              className={`inv-tab-btn ${activeTab === 'bag' ? 'active' : ''}`}
              onClick={() => setActiveTab('bag')}
            >
              장비 및 행낭
            </button>
            <button
              className={`inv-tab-btn ${activeTab === 'titles' ? 'active' : ''}`}
              onClick={() => setActiveTab('titles')}
            >
              강호 칭호 ({titles.filter((t) => t.unlocked).length}/{titles.length})
            </button>
          </div>

          <div className="currency-bar">
            <div className="currency-item">
              <Coins size={14} className="text-gold" />
              <span>{gold}냥</span>
            </div>
            <div className="currency-item">
              <Sparkles size={14} className="text-cyan" />
              <span>{silver}냥</span>
            </div>
          </div>
        </div>

        {/* 모달 바디 */}
        <div className="modal-body inventory-body">
          {activeTab === 'bag' ? (
            <>
              {/* 착용 중인 장비 슬롯 3개 */}
              <div className="equipped-slots-container">
                <div className="slot-card">
                  <span className="slot-type-label">무기</span>
                  <div
                    className={`item-slot filled ${equippedWeapon ? equippedWeapon.grade : 'empty'}`}
                    onClick={() => equippedWeapon && setSelectedItem(equippedWeapon)}
                  >
                    <span className="item-icon">{equippedWeapon ? equippedWeapon.icon : '🗡️'}</span>
                  </div>
                  <span className="slot-item-name">{equippedWeapon ? equippedWeapon.name : '미착용'}</span>
                </div>

                <div className="slot-card">
                  <span className="slot-type-label">방어구</span>
                  <div
                    className={`item-slot filled ${equippedArmor ? equippedArmor.grade : 'empty'}`}
                    onClick={() => equippedArmor && setSelectedItem(equippedArmor)}
                  >
                    <span className="item-icon">{equippedArmor ? equippedArmor.icon : '🥋'}</span>
                  </div>
                  <span className="slot-item-name">{equippedArmor ? equippedArmor.name : '미착용'}</span>
                </div>

                <div className="slot-card">
                  <span className="slot-type-label">장신구</span>
                  <div
                    className={`item-slot filled ${equippedAcc ? equippedAcc.grade : 'empty'}`}
                    onClick={() => equippedAcc && setSelectedItem(equippedAcc)}
                  >
                    <span className="item-icon">{equippedAcc ? equippedAcc.icon : '📿'}</span>
                  </div>
                  <span className="slot-item-name">{equippedAcc ? equippedAcc.name : '미착용'}</span>
                </div>
              </div>

              {/* 소지품 슬롯 그리드 (총 24칸) */}
              <div className="inventory-grid-wrap">
                <div className="grid-label">보유 소지품 (클릭하여 장착 또는 복용)</div>
                <div className="inventory-slots-grid">
                  {items.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`item-slot filled ${item.grade} ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedItem(item)}
                        role="button"
                        tabIndex={0}
                      >
                        <span className="item-icon">{item.icon}</span>
                        {item.count > 1 && <span className="item-count">{item.count}</span>}
                        {item.equipped && <span className="item-equipped-badge">E</span>}
                      </div>
                    );
                  })}

                  {Array.from({ length: Math.max(0, 24 - items.length) }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="item-slot empty" />
                  ))}
                </div>
              </div>

              {/* 선택한 아이템 세부 정보 및 조작 버튼 */}
              <div className="item-detail-preview">
                {selectedItem ? (
                  <div className="selected-item-info">
                    <div className="item-header-row">
                      <span className="info-icon">{selectedItem.icon}</span>
                      <div>
                        <h5 className="info-name">{selectedItem.name}</h5>
                        <span className={`grade-tag ${selectedItem.grade}`}>{selectedItem.grade} 등급</span>
                        {selectedItem.equipped && <span className="equipped-tag">착용 중</span>}
                      </div>
                    </div>
                    <p className="info-desc">{selectedItem.statDesc}</p>

                    <div className="item-actions-row">
                      {selectedItem.type === 'potion' ? (
                        <button
                          className="btn-item-action use"
                          onClick={() => {
                            onUsePotion(selectedItem);
                            setSelectedItem(null);
                          }}
                        >
                          🧪 영약 즉시 복용하기
                        </button>
                      ) : selectedItem.equipped ? (
                        <button
                          className="btn-item-action unequip"
                          onClick={() => {
                            onUnequipItem(selectedItem);
                            setSelectedItem(null);
                          }}
                        >
                          장착 해제
                        </button>
                      ) : (
                        <button
                          className="btn-item-action equip"
                          onClick={() => {
                            onEquipItem(selectedItem);
                            setSelectedItem(null);
                          }}
                        >
                          장착하기
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="no-item-selected">
                    <span>소지품을 클릭하면 상세 설명과 함께 [장착] 또는 [복용]할 수 있습니다.</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            // 칭호 탭
            <div className="titles-container">
              <div className="titles-list">
                {titles.map((title) => {
                  const isCurrent = equippedTitles === title.name;

                  return (
                    <div
                      key={title.id}
                      className={`title-card-item ${title.unlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`}
                    >
                      <div className="title-left">
                        <Award size={20} className={isCurrent ? 'text-gold' : 'text-muted'} />
                        <div>
                          <h5 className="title-name">{title.name}</h5>
                          <p className="title-desc">{title.description}</p>
                          <span className="title-bonus text-cyan">{title.statBonusText}</span>
                        </div>
                      </div>

                      <div className="title-right">
                        {isCurrent ? (
                          <span className="title-badge-active">
                            <Check size={14} /> 착용 중
                          </span>
                        ) : title.unlocked ? (
                          <button className="btn-title-select" onClick={() => onSelectTitle(title)}>
                            착용
                          </button>
                        ) : (
                          <span className="title-badge-locked">미해금</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="modal-footer">
          <p className="modal-tip-text">
            💡 전투 중에는 키보드 숫자 [1]을 눌러 소생단(HP), [2]를 눌러 청심환(MP)을 즉시 복용할 수 있습니다.
          </p>
          <button className="btn-confirm" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
