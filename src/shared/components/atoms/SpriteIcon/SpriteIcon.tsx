/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from "react";
import classes from "./sprite-icon.module.css";
import { IFarmingInventoryCategories } from "@/slices/inventory/inventory.interface";

const SPRITE_SHEET_MAP = {
  crops: {
    rowCount: 1,
    spriteSheet: "url(/sprites/crops/crops-harvested.png)",
  },
  seeds: {
    rowCount: 3,
    spriteSheet: "url(/sprites/crops/seed-packets.png)",
  },
};
interface ISpriteIconProps {
  iconIndex: number;
  iconWidth?: number;
  iconHeight?: number;
  hotkeyNumber: number;
  itemCount: number;
  data?: any;
  isEmpty?: boolean;
  onClick?: (iconInfo: any) => void;
  spriteSheet: IFarmingInventoryCategories;
}

const SpriteIcon: FC<ISpriteIconProps> = ({
  iconIndex,
  iconHeight = 16,
  iconWidth = 16,
  hotkeyNumber,
  itemCount,
  onClick,
  data,
  spriteSheet = "seeds",
  isEmpty = false,
}) => {
  const rowCount = SPRITE_SHEET_MAP[spriteSheet].rowCount; // Number of icons per row in the sprite sheet (adjust based on your sprite sheet)
  const scale = 2;
  const x = -(iconIndex % rowCount) * iconWidth;
  const y = -Math.floor(iconIndex / rowCount) * iconHeight;

  const scaledWidth = iconWidth * scale;
  const scaledHeight = iconHeight * scale;
  const handleOnClick = () => {
    if (onClick) {
      onClick({ iconIndex, hotkeyNumber, itemCount, data });
    }
  };
  return (
    <div
      className={`${classes.iconContainer} ${isEmpty ? classes.emptySlot : ""}`}
      onClick={handleOnClick}
      style={{
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
      }}
    >
      <div
        className={classes.icon}
        style={{
          width: "100%",
          height: "100%",
          backgroundImage: SPRITE_SHEET_MAP[spriteSheet].spriteSheet,
          backgroundPosition: isEmpty ? "0 0" : `${x * scale}px ${y * scale}px`,
          backgroundSize: `${rowCount * iconWidth * scale}px auto`,
          // Add some visual indication for empty slots
          opacity: isEmpty ? "0.3" : "1",
        }}
      >
        {hotkeyNumber !== undefined && (
          <span className={classes.hotkeyNumber}>{hotkeyNumber}</span>
        )}
        {!isEmpty && itemCount > 0 && (
          <span className={classes.itemCount}>{itemCount}</span>
        )}
      </div>
    </div>
  );
};

export default SpriteIcon;
