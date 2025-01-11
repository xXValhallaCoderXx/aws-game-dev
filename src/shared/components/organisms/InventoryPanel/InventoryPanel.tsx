import styles from "./inventory-panel.module.css";
import { RootState } from "@/shared/services/redux-store.service";
import { SpriteIconNew } from "../../atoms/SpriteIconNew";
import { useSelector } from "react-redux";
import { PhaserEventBus } from "@/shared/services/phaser-event.service";
import { PLAYER_EVENTS } from "@/slices/events/phaser-events.types";
import { ITEM_REGISTRY } from "@/slices/items/item-registry";

const InventoryPanel = () => {
  const { items } = useSelector((state: RootState) => state.inventory);

  const handleOnClickItem = (event: React.MouseEvent<HTMLButtonElement>) => {
    const index = Number(event.currentTarget.id);
    const item = items[index];

    PhaserEventBus.emit(PLAYER_EVENTS.SELECT_ITEM, item?.id);
  };

  // Create an array of 18 slots (2 rows x 9 columns)

  const slots = Array(18)
    .fill(null)
    .map((_, index) => {
      if (items[index]) {
        const mappedItem = ITEM_REGISTRY[items[index].id];

        return {
          quantity: items[index].quantity,
          id: items[index].id,
          spriteSheet: {
            frameNumber: mappedItem.sprite.spriteFrame,
            path: mappedItem.sprite.filepath,
            spritesheetWidth: mappedItem.sprite.spritesheetWidth,
            spriteSize: mappedItem.sprite.spriteSize,
          },
        };
      }
      return items[index];
    });

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
              <SpriteIconNew
                data={item || null}
                spriteSheet={item?.spriteSheet ?? {}}
                hotkeyNumber={index + 1}
                itemCount={item?.quantity || 0}
                isEmpty={!item} // Add this prop to SpriteIcon if you want to style empty slots differently
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default InventoryPanel;
