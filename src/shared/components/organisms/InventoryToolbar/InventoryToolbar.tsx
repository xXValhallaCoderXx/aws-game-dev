/* eslint-disable @typescript-eslint/no-explicit-any */
import classes from "./inventory-toolbar.module.css";
import { SpriteIcon } from "../../atoms/SpriteIcon";
import { PhaserEventBus } from "@/shared/services/phaser-event.service";
import { RootState } from "@/shared/services/redux-store.service";
import { INVENTORY_SPRITE_MAPPING } from "@/slices/inventory/inventory-sprite-map";
import { useSelector } from "react-redux";

const InventoryToolbar = () => {
  const { items } = useSelector((state: RootState) => state.inventory);
  const TOTAL_SLOTS = 9;

  const toolbarItems = Array(TOTAL_SLOTS)
    .fill(null)
    .map((_, index) => items[index]);

  const handleOnClickToolbar = (event: React.MouseEvent<HTMLButtonElement>) => {
    const index = Number(event.currentTarget.id);
    const item = toolbarItems[index];

    PhaserEventBus.emit("inventory:seedSelected", item?.id);
  };

  return (
    <div className={classes.toolbar}>
      {toolbarItems?.map((item, index) => (
        <button
          key={index}
          id={String(index)}
          className={classes.toolbarButton}
          onClick={item ? handleOnClickToolbar : undefined}
        >
          <SpriteIcon
            data={item || null}
            spriteSheet={item?.category ?? "seeds"}
            iconIndex={
              item
                ? INVENTORY_SPRITE_MAPPING[
                    item.id as keyof typeof INVENTORY_SPRITE_MAPPING
                  ]
                : -1 // or some default sprite index for empty slot
            }
            hotkeyNumber={index + 1}
            itemCount={item?.quantity || 0}
            isEmpty={!item} // Add this prop to SpriteIcon if you want to style empty slots differently
          />
        </button>
      ))}
    </div>
  );
};

export default InventoryToolbar;
