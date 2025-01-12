/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from "react";
import classes from "./sprite-icon.module.css";

interface ISpriteIconProps {
  iconWidth?: number;
  iconHeight?: number;
  hotkeyNumber?: number;
  itemCount: number;
  data?: any;
  isEmpty?: boolean;
  scale?: number;
  onClick?: (iconInfo: any) => void;
  spriteSheet: {
    path: string;
    frameNumber: number;
    spriteSize: number;
    spritesheetWidth: number;
  };
}

const SpriteIconNew: FC<ISpriteIconProps> = ({
  iconHeight = 16,
  iconWidth = 16,
  hotkeyNumber,
  itemCount,
  scale = 2,
  onClick,
  data,
  spriteSheet,
  isEmpty = false,
}) => {
  // Calculate sprite position based on frameNumber
  const spritesPerRow = Math.floor(
    spriteSheet.spritesheetWidth / spriteSheet.spriteSize
  );

  // Calculate x and y without negative values
  const x = (spriteSheet.frameNumber % spritesPerRow) * spriteSheet.spriteSize;
  const y =
    Math.floor(spriteSheet.frameNumber / spritesPerRow) *
    spriteSheet.spriteSize;

  const scaledWidth = iconWidth * scale;
  const scaledHeight = iconHeight * scale;

  const handleOnClick = () => {
    if (onClick) {
      onClick({
        frameNumber: spriteSheet.frameNumber,
        hotkeyNumber,
        itemCount,
        data,
      });
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
          backgroundImage: isEmpty ? "" : `url(${spriteSheet.path})`,
          backgroundPosition: `${-x * scale}px ${-y * scale}px`,
          backgroundSize: `${spriteSheet.spritesheetWidth * scale}px auto`,
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
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

export default SpriteIconNew;
