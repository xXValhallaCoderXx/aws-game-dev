import React, { useState } from "react";
import styles from "./avatar-dropdown.module.css";

const ProfileAvatar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Handler for the toggle button
  // const handleToggleMute = () => {
  //     if (phaserRef.current) {
  //       phaserRef.current.game.sound.mute = !phaserRef.current.game.sound.mute;
  //       setIsMuted(() => !phaserRef.current.game.sound.mute);
  //     }
  //   };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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
          <button className={styles.dropdownItem}>Toggle Sound</button>
          <button className={styles.dropdownItem}>Settings</button>
          <button className={styles.dropdownItem}>Log Out</button>
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
