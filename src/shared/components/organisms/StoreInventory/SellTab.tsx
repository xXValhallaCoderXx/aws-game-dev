/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/organisms/MerchantBuyTab/MerchantBuyTab.tsx
import React, { useState } from "react";
import styles from "./store-inventory.module.css";
import { SpriteIconNew } from "../../atoms/SpriteIconNew";
import { ITEM_REGISTRY } from "@/slices/items/item-registry";
import { useSelector } from "react-redux";
import { RootState } from "@/shared/services/redux-store.service";
import { PhaserEventBus } from "@/shared/services/phaser-event.service";
import { MERCHANT_EVENTS } from "@/slices/events/phaser-events.types";

interface SelectedItem {
  id: string;
  quantity: number;
  price: number;
}

const MerchantBuyTab: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const playerGold = useSelector((state: RootState) => state.inventory.gold);
  const playerItems = useSelector((state: RootState) => state.inventory.items);

  const handlePurchase = (items: any[]) => {
    // Handle purchase logic here
    console.log("Selling Items:", items);
    // You can emit events or dispatch Redux actions here
    PhaserEventBus.emit(MERCHANT_EVENTS.SELL_ITEMS, {
      items,
      id: "merchant-blacksmith",
    });
  };

  const handleItemClick = (item: any) => {
    const existingItem = selectedItems.find((i) => i.id === item.id);

    if (existingItem) {
      // Remove item if clicking again
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      // Add item to selection
      setSelectedItems([
        ...selectedItems,
        { id: item.id, quantity: 1, price: item.price },
      ]);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const totalCost = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const canAfford = playerGold >= totalCost;

  return (
    <div className={styles.merchantBuyContainer}>
      <div className={styles.itemsColumn}>
        <div className={styles.itemsGrid}>
          {playerItems.map((item, index) => {
            const mappedItem = ITEM_REGISTRY[item.id];
            const isSelected = selectedItems.some((i) => i.id === item.id);

            return (
              <button
                key={index}
                className={`${styles.itemButton} ${
                  isSelected ? styles.selected : ""
                }`}
                onClick={() => handleItemClick(item)}
              >
                <SpriteIconNew
                  data={{
                    id: item.id,
                    quantity: item.quantity,
                  }}
                  spriteSheet={{
                    frameNumber: mappedItem.sprite.spriteFrame,
                    path: mappedItem.sprite.filepath,
                    spritesheetWidth: mappedItem.sprite.spritesheetWidth,
                    spriteSize: mappedItem.sprite.spriteSize,
                  }}
                  itemCount={item.quantity}
                  isEmpty={false}
                />
                {/* @ts-ignore */}
                <div className={styles.itemPrice}>{item?.price} gold</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.cartColumn}>
        <h3 className={styles.cartTitle}>Selected Items</h3>
        <div className={styles.selectedItems}>
          {selectedItems.map((item) => {
            const mappedItem = ITEM_REGISTRY[item.id];
            return (
              <div key={item.id} className={styles.selectedItem}>
                <SpriteIconNew
                  data={{
                    id: item.id,
                    quantity: item.quantity,
                  }}
                  spriteSheet={{
                    frameNumber: mappedItem.sprite.spriteFrame,
                    path: mappedItem.sprite.filepath,
                    spritesheetWidth: mappedItem.sprite.spritesheetWidth,
                    spriteSize: mappedItem.sprite.spriteSize,
                  }}
                  itemCount={item.quantity}
                  isEmpty={false}
                />
                <div className={styles.itemDetails}>
                  <span>{mappedItem.name}</span>
                  <div className={styles.quantityControls}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="nes-btn is-small"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="nes-btn is-small"
                    >
                      +
                    </button>
                  </div>
                  <span>{item.price * item.quantity} gold</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.cartSummary}>
          <div className={styles.totalCost}>Total: {totalCost} gold</div>
          <div className={styles.playerGold}>Your gold: {playerGold}</div>
          <button
            className={`nes-btn ${canAfford ? "is-primary" : "is-disabled"}`}
            onClick={() => handlePurchase(selectedItems)}
            disabled={!canAfford || selectedItems.length === 0}
          >
            Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default MerchantBuyTab;
