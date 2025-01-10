/* eslint-disable @typescript-eslint/no-explicit-any */
import classes from "./inventory-toolbar.module.css";
import { SpriteIconNew } from "../../atoms/SpriteIconNew";
import { PhaserEventBus } from "@/shared/services/phaser-event.service";
import { RootState } from "@/shared/services/redux-store.service";
import { useSelector } from "react-redux";

import { ITEM_REGISTRY } from "@/slices/items/item-registry";

const InventoryToolbar = () => {
  const { items } = useSelector((state: RootState) => state.inventory);
  const TOTAL_SLOTS = 9;

  const toolbarItems = Array(TOTAL_SLOTS)
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
          onClick={handleOnClickToolbar}
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
  );
};

export default InventoryToolbar;
