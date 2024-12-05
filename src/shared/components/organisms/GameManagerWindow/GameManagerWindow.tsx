import { useState } from "react";
import styles from "./inventory-panel.module.css";
import { useSelector } from "react-redux";
import { RootState } from "@/shared/services/redux-store.service";
import { InventoryPanel } from "../InventoryPanel";
import { SettingsPanel } from "../SettingsPanel";
import { StatsPanel } from "../StatsPanel";

const GameManagerWindow = () => {
  const { isSettingsOpen } = useSelector((state: RootState) => state.platform);
  const [activeTab, setActiveTab] = useState("inventory");

  const petInfo = {
    petName: "Whiskers",
    petType: "Cat",
    horse: true,
  };

  if (!isSettingsOpen) {
    return null;
  }

  return (
    <div className={styles.inventoryPanel}>
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "inventory" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("inventory")}
        >
          Inventory
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "stats" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("stats")}
        >
          Stats
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "settings" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>
      {activeTab === "inventory" && <InventoryPanel />}
      {activeTab === "stats" && <StatsPanel />}
      {activeTab === "settings" && <SettingsPanel />}
      <div className={styles.playerInfo}>
        <div className={styles.avatar}>👒</div>
        <p>Farm Name: Whisper Garden</p>
        <p>
          Pet: {petInfo.petType} - {petInfo.petName}
        </p>
        {petInfo.horse && <p>Horse: Available</p>}
      </div>
    </div>
  );
};

export default GameManagerWindow;
