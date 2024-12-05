/* eslint-disable @typescript-eslint/no-explicit-any */
import classes from "./inventory-toolbar.module.css";
import { SpriteIcon } from "../../atoms/SpriteIcon";
import { PhaserEventBus } from "@services/phaser.service";
import { RootState } from "@/shared/services/redux-store.service";
import { INVENTORY_SPRITE_MAPPING } from "@/slices/inventory/inventory-sprite-map";
import { useSelector } from "react-redux";

const InventoryToolbar = () => {
  const { items } = useSelector((state: RootState) => state.inventory);
  const TOTAL_SLOTS = 9;
  console.log("ITEMS: ", items);


  const handleOnClickToolbar = (_data: any) =>
    PhaserEventBus.emit("inventory:seedSelected", _data?.data?.id);

  const slots = Array(TOTAL_SLOTS)
    .fill(null)
    .map((_, index) => {
      const item = items[index];
      console.log("ITEM: ", item);
      return (
        <button key={index} className={classes.toolbarButton}>
          <SpriteIcon
            data={item || null}
            spriteSheet={item?.category ?? "seeds"}
            onClick={item ? handleOnClickToolbar : undefined}
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
      );
    });

  return <div className={classes.toolbar}>{slots}</div>;
};

export default InventoryToolbar;
