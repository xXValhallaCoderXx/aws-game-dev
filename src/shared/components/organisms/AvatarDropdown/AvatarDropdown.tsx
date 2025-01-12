/* eslint-disable @typescript-eslint/ban-ts-comment */
import { RootState } from "@/shared/services/redux-store.service";
import { useState, useEffect, useRef } from "react";
import { toggleSound, toggleSettings } from "@/slices/platform/game.slice";
import styles from "./avatar-dropdown.module.css";
import { useSelector, useDispatch } from "react-redux";
import { SpriteIconNew } from "../../atoms/SpriteIconNew";

const ProfileAvatar = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const health = useSelector((state: RootState) => state.player.health);
  const avatarRef = useRef(null); // Create a ref for the dropdown container

  const handleOutsideClick = (event: MouseEvent) => {
    // @ts-ignore
    if (avatarRef.current && !avatarRef.current.contains(event.target)) {
      setIsOpen(false); // Close menu if click is outside
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick); // Add event listener

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick); // Cleanup on unmount
    };
  }, []);

  const isSoundEnabled = useSelector(
    (state: RootState) => state.platform.isSoundEnabled
  );

  const isSettingsOpen = useSelector(
    (state: RootState) => state.platform.isSettingsOpen
  );

  const handleToggleSound = () => {
    dispatch(toggleSound(!isSoundEnabled));
  };

  const handleToggleSettings = () => {
    dispatch(toggleSettings(!isSettingsOpen));
  };
  const maxHealth = 120;
  const healthPercentage = (health / maxHealth) * 100;

  return (
    <div ref={avatarRef}>
      <div>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={styles.avatarDropdownContainer}
        >
          <SpriteIconNew
            iconHeight={48}
            iconWidth={48}
            data={null}
            scale={1}
            spriteSheet={{
              frameNumber: 2,
              path: "/sprites/characters/player/player-portrait.png",
              spritesheetWidth: 192,
              spriteSize: 48,
            }}
            itemCount={0}
          />

          <div className={styles.healthBarContainer}>
            <div
              style={{
                color: "black",
                background: `linear-gradient(to right, #ff5555 ${healthPercentage}%, #d4a374 ${healthPercentage}%)`,
              }}
              className={styles.healthBar}
            >
              Health: {health}/{maxHealth}
            </div>
            <div
              style={{ display: "flex", justifyContent: "start", fontSize: 14 }}
            >
              Gold: 0
            </div>
          </div>
        </div>
        {isOpen && (
          <div
            className={styles.dropdownMenu}
            style={{ width: 250, marginTop: 10 }}
          >
            <button className={styles.dropdownItem} onClick={handleToggleSound}>
              Sound {isSoundEnabled ? "On" : "Off"}
            </button>
            <button
              className={styles.dropdownItem}
              onClick={handleToggleSettings}
            >
              Settings
            </button>

            <button
              className={styles.dropdownItem}
              onClick={handleToggleSettings}
            >
              Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAvatar;
