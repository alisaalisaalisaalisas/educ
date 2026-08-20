import React, { useMemo } from 'react';
import { ShopItem, SHOP_ITEMS, SHOP_ZONES } from '../data/merchants';

interface ShopModalProps {
  zone: string;
  credits: number;
  onBuy: (item: ShopItem) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ zone, credits, onBuy, onClose }) => {
  const items = useMemo(() => {
    const allowed = SHOP_ZONES[zone] ?? [];
    return SHOP_ITEMS.filter(i => allowed.includes(i.id));
  }, [zone]);

  return (
    <div className="quest-overlay">
      <div className="quest-modal shop-modal">
        <div className="quest-modal__header">
          <div className="quest-modal__title-group">
            <span className="quest-modal__category">🛒 DevOps Shop</span>
            <span className="quest-modal__title">Магазин снаряжения</span>
          </div>
          <button className="quest-modal__close" onClick={onClose} title="Закрыть">✕</button>
        </div>
        <div className="shop-modal__credits">
          💰 Баланс: <strong>{credits}</strong> Compute Credits
        </div>
        <div className="shop-modal__list">
          {items.map(item => {
            const canBuy = credits >= item.price;
            return (
              <div key={item.id} className="shop-modal__item">
                <div className="shop-modal__item-icon">{item.icon}</div>
                <div className="shop-modal__item-info">
                  <div className="shop-modal__item-name">{item.name}</div>
                  <div className="shop-modal__item-desc">{item.desc}</div>
                </div>
                <button
                  className={`shop-modal__buy ${canBuy ? '' : 'shop-modal__buy--disabled'}`}
                  disabled={!canBuy}
                  onClick={() => onBuy(item)}
                >
                  {item.price} ⚡
                </button>
              </div>
            );
          })}
        </div>
        <div className="quest-modal__footer">
          <button className="quest-modal__submit" onClick={onClose}>Закрыть магазин ▸</button>
        </div>
      </div>
    </div>
  );
};