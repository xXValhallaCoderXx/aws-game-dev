import { RootState } from "@/shared/services/redux-store.service";
import React, { useState } from "react";
import { toggleSound, toggleSettings } from "@/slices/platform/game.slice";
import styles from "./avatar-dropdown.module.css";
import { useSelector, useDispatch } from "react-redux";

const ProfileAvatar = () => {
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isSoundEnabled = useSelector(
    (state: RootState) => state.platform.isSoundEnabled
  );

  const isSettingsOpen = useSelector(
    (state: RootState) => state.platform.isSettingsOpen
  );


  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleToggleSound = () => {
    dispatch(toggleSound(!isSoundEnabled));
  };

  const handleToggleSettings = () => {
    dispatch(toggleSettings(!isSettingsOpen));
  };

  return (
    <div className={styles.profileContainer}>
      <button className={styles.avatarButton} onClick={toggleDropdown}>
        <div className={styles.avatarIcon}>👤</div>
        <div className={styles.healthBarContainer}>
          <div className={styles.healthBar} style={{ width: "80%" }}>
            Health: 80%
          </div>
          <div className={styles.staminaBar} style={{ width: "60%" }}>
            Stamina: 60%
          </div>
        </div>
      </button>
      {isDropdownOpen && (
        <div className={styles.dropdownMenu}>
          <button className={styles.dropdownItem} onClick={handleToggleSound}>
            Sound {isSoundEnabled ? "On" : "Off"}
          </button>
          <button
            className={styles.dropdownItem}
            onClick={handleToggleSettings}
          >
            Settings
          </button>
          <button className={styles.dropdownItem}>Log Out</button>
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
