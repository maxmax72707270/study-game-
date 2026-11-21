import React, { useState } from 'react';
import { GameItem, MASTER_ITEMS } from '../../data/itemsData';
import { InventoryItem } from '../../types/game';
import { X, Store, Coins, Sparkles, Check, ShoppingCart, ArrowDownLeft } from 'lucide-react';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  gold: number;
  silver: number;
  playerInventory: InventoryItem[];
  onBuyItem: (item: GameItem) => boolean;
  onSellItem: (itemId: string, sellPrice: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  gold,
  silver,
  playerInventory,
  onBuyItem,
  onSellItem
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [filterType, setFilterType] = useState<'all' | 'weapon' | 'armor' | 'potion'>('all');

  if (!isOpen) return null;

  const shopItems = Object.values(MASTER_ITEMS).filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fantasy-modal shop-modal" onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">🏮</span>
            <div>
              <h3>강호 만물상 (무림 상점)</h3>
              <p className="modal-subtitle">귀한 보검과 방호구, 비상 영약을 거래하세요</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        {/* 재화 상태 바 */}
        <div className="shop-currency-bar">
          <div className="shop-tabs">
            <button
              className={`shop-tab-btn ${activeTab === 'buy' ? 'active' : ''}`}
              onClick={() => setActiveTab('buy')}
            >
              <ShoppingCart size={14} /> 물품 구매
            </button>
            <button
              className={`shop-tab-btn ${activeTab === 'sell' ? 'active' : ''}`}
              onClick={() => setActiveTab('sell')}
            >
              <ArrowDownLeft size={14} /> 소지품 판매
            </button>
          </div>

          <div className="shop-wallet">
            <div className="wallet-pill">
              <Coins size={14} className="text-gold" />
              <span>{gold} 엽전</span>
            </div>
            <div className="wallet-pill">
              <Sparkles size={14} className="text-cyan" />
              <span>{silver} 은화</span>
            </div>
          </div>
        </div>

        {/* 모달 바디 */}
        <div className="modal-body shop-body">
          {activeTab === 'buy' ? (
            <>
              {/* 카테고리 필터 */}
              <div className="shop-filter-row">
                <button
                  className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterType('all')}
                >
                  전체
                </button>
                <button
                  className={`filter-btn ${filterType === 'weapon' ? 'active' : ''}`}
                  onClick={() => setFilterType('weapon')}
                >
                  무기
                </button>
                <button
                  className={`filter-btn ${filterType === 'armor' ? 'active' : ''}`}
                  onClick={() => setFilterType('armor')}
                >
                  방어구
                </button>
                <button
                  className={`filter-btn ${filterType === 'potion' ? 'active' : ''}`}
                  onClick={() => setFilterType('potion')}
                >
                  회복 영약
                </button>
              </div>

              {/* 상점 상품 그리드 */}
              <div className="shop-items-grid">
                {shopItems.map((item) => {
                  const canAfford = gold >= item.buyPrice;

                  return (
                    <div key={item.id} className={`shop-item-card ${item.grade}`}>
                      <div className="item-card-header">
                        <span className="shop-item-icon">{item.icon}</span>
                        <div className="shop-item-meta">
                          <h4 className="shop-item-title">{item.name}</h4>
                          <span className={`grade-tag ${item.grade}`}>{item.grade}</span>
                        </div>
                      </div>

                      <p className="shop-item-desc">{item.description}</p>

                      {/* 스탯 표시 */}
                      <div className="shop-stat-tags">
                        {item.atkBonus && <span className="stat-tag text-red">공격력 +{item.atkBonus}</span>}
                        {item.defBonus && <span className="stat-tag text-gold">방어력 +{item.defBonus}</span>}
                        {item.hpBonus && <span className="stat-tag text-emerald">HP +{item.hpBonus}</span>}
                        {item.mpBonus && <span className="stat-tag text-blue">MP +{item.mpBonus}</span>}
                        {item.healHp && <span className="stat-tag text-emerald">HP {item.healHp} 회복</span>}
                        {item.healMp && <span className="stat-tag text-blue">MP {item.healMp} 회복</span>}
                      </div>

                      {/* 구매 버튼 */}
                      <div className="shop-card-bottom">
                        <span className="price-tag">
                          <Coins size={14} className="text-gold" /> {item.buyPrice}냥
                        </span>
                        <button
                          className="btn-buy"
                          disabled={!canAfford}
                          onClick={() => onBuyItem(item)}
                        >
                          {canAfford ? '구매하기' : '엽전 부족'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            // 판매 탭
            <div className="shop-sell-container">
              {playerInventory.length === 0 ? (
                <div className="empty-sell-notice">
                  <span>판매 가능한 소지품이 없습니다.</span>
                </div>
              ) : (
                <div className="sell-items-list">
                  {playerInventory.map((item) => {
                    const master = MASTER_ITEMS[item.id];
                    const sellPrice = master ? master.sellPrice : 15;

                    return (
                      <div key={item.id} className="sell-item-row">
                        <div className="sell-item-left">
                          <span className="sell-icon">{item.icon}</span>
                          <div>
                            <h5 className="sell-name">{item.name} {item.count > 1 ? `x${item.count}` : ''}</h5>
                            <span className="sell-desc">{item.statDesc}</span>
                          </div>
                        </div>

                        <div className="sell-item-right">
                          <span className="sell-price-text">
                            <Coins size={13} className="text-gold" /> +{sellPrice}냥
                          </span>
                          <button
                            className="btn-sell"
                            disabled={item.equipped}
                            onClick={() => onSellItem(item.id, sellPrice)}
                            title={item.equipped ? '장착 중인 장비는 판매할 수 없습니다' : '판매하기'}
                          >
                            {item.equipped ? '장착 중' : '판매'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="modal-footer">
          <p className="modal-tip-text">
            * 학습 퀘스트와 몬스터 토벌로 엽전을 모아 상급 보검과 방호구를 장만하세요.
          </p>
          <button className="btn-confirm" onClick={onClose}>
            상점 나가기
          </button>
        </div>
      </div>
    </div>
  );
};
