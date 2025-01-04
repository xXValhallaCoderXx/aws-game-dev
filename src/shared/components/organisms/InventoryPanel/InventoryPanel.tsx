import styles from "./inventory-panel.module.css";
import { RootState } from "@/shared/services/redux-store.service";
import { SpriteIcon } from "../../atoms/SpriteIcon";
import { useSelector } from "react-redux";
import { PhaserEventBus } from "@/shared/services/phaser-event.service";
import { INVENTORY_SPRITE_MAPPING } from "@/slices/inventory/inventory-sprite-map";

const InventoryPanel = () => {
  const { items } = useSelector((state: RootState) => state.inventory);

  const handleOnClickItem = (event: React.MouseEvent<HTMLButtonElement>) => {
    const index = Number(event.currentTarget.id);
    const item = items[index];

    PhaserEventBus.emit("inventory:seedSelected", item?.id);
  };

  // Create an array of 18 slots (2 rows x 9 columns)
  const slots = Array.from({ length: 18 }, (_, index) => items[index] || null);

  return (
    <div>
      <div className={styles.topSection}>
        <div className={styles.itemsContainer}>
          {slots.map((item, index) => (
            <button
              key={index}
              id={String(index)}
              className={styles.toolbarButton}
              onClick={handleOnClickItem}
            >
              <SpriteIcon
                data={item}
                spriteSheet={item?.category ?? "seeds"}
                iconIndex={
                  item
                    ? INVENTORY_SPRITE_MAPPING[
                        item.id as keyof typeof INVENTORY_SPRITE_MAPPING
                      ]
                    : -1 // Default sprite index for empty slot
                }
                hotkeyNumber={index + 1}
                itemCount={item?.quantity || 0}
                isEmpty={!item} // Optional: Style empty slots differently
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default InventoryPanel;
