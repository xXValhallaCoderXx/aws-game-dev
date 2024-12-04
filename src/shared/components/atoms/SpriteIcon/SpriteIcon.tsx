/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from "react";
import classes from "./sprite-icon.module.css";

interface ISpriteIconProps {
  iconIndex: number;
  iconWidth?: number;
  iconHeight?: number;
  hotkeyNumber: number;
  itemCount: number;
  onClick?: (data: any) => void;
}

const SpriteIcon: FC<ISpriteIconProps> = ({
  iconIndex,
  iconHeight = 16,
  iconWidth = 16,
  hotkeyNumber,
  itemCount,
  onClick,
}) => {
  const rowCount = 4; // Number of icons per row in the sprite sheet (adjust based on your sprite sheet)

  const x = -(iconIndex % rowCount) * iconWidth;
  const y = -Math.floor(iconIndex / rowCount) * iconHeight;
  const handleOnClick = () => {
    if (onClick) {
      onClick({ iconIndex, hotkeyNumber, itemCount });
    }
  };
  return (
    <div className={classes.iconContainer} onClick={handleOnClick}>
      <div
        className={classes.icon}
        style={{
          backgroundPosition: `${x}px ${y}px`,
          width: iconWidth,
          height: iconHeight,
        }}
      >
        {hotkeyNumber !== undefined && (
          <span className={classes.hotkeyNumber}>{hotkeyNumber}</span>
        )}
        {itemCount !== undefined && (
          <span className={classes.itemCount}>{itemCount}</span>
        )}
      </div>
    </div>
  );
};

export default SpriteIcon;
