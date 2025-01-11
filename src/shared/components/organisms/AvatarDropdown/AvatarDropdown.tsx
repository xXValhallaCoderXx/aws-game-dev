import { RootState } from "@/shared/services/redux-store.service";

import { toggleSound, toggleSettings } from "@/slices/platform/game.slice";
import styles from "./avatar-dropdown.module.css";
import { useSelector, useDispatch } from "react-redux";
import { Menu } from "@ark-ui/react/menu";
import { SpriteIconNew } from "../../atoms/SpriteIconNew";

const ProfileAvatar = () => {
  const dispatch = useDispatch();

  const health = useSelector((state: RootState) => state.player.health);

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

  return (
    <Menu.Root>
      <Menu.Trigger style={{ padding: 0 }}>
        <div className={styles.avatarDropdownContainer}>
          <div>
            <SpriteIconNew
              iconHeight={48}
              iconWidth={48}
              data={null}
              spriteSheet={{
                frameNumber: 2,
                path: "/sprites/characters/player/player-portrait.png",
                spritesheetWidth: 192,
                spriteSize: 48,
              }}
              hotkeyNumber={0}
              itemCount={0}
            />
          </div>
          <div>
            <div className={styles.healthBarContainer}>
              <div style={{ color: "black" }} className={styles.healthBar}>
                Health: {health}
              </div>
              <div className={styles.staminaBar}>Stamina: 60%</div>
            </div>
          </div>
        </div>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content className={styles.dropdownMenu}>
          <Menu.ItemGroup>
            <Menu.Item value="react">
              <button
                className={styles.dropdownItem}
                onClick={handleToggleSound}
              >
                Sound {isSoundEnabled ? "On" : "Off"}
              </button>
            </Menu.Item>
            <Menu.Item value="solid">
              {" "}
              <button
                className={styles.dropdownItem}
                onClick={handleToggleSettings}
              >
                Settings
              </button>
            </Menu.Item>
            <Menu.Separator />

            <Menu.Item value="vue">Logout</Menu.Item>
          </Menu.ItemGroup>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
};

export default ProfileAvatar;
