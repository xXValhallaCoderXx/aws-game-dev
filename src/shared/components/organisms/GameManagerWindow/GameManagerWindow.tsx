import { useState } from "react";
import styles from "./inventory-panel.module.css";
import { useSelector } from "react-redux";
import { RootState } from "@/shared/services/redux-store.service";
import { InventoryPanel } from "../InventoryPanel";
import { SettingsPanel } from "../SettingsPanel";
import { StatsPanel } from "../StatsPanel";

const TABS = [
  { key: "inventory", label: "Inventory", component: InventoryPanel },
  { key: "stats", label: "Stats", component: StatsPanel },
  { key: "settings", label: "Settings", component: SettingsPanel },
];

const GameManagerWindow = () => {
  const { isSettingsOpen } = useSelector((state: RootState) => state.platform);
  const [activeTab, setActiveTab] = useState("inventory");

  if (!isSettingsOpen) return null;

  const ActiveTabComponent = TABS.find(
    (tab) => tab.key === activeTab
  )?.component;

  return (
    <div className={styles.inventoryPanel}>
      <div className={styles.tabsContainer}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tabButton} ${
              activeTab === tab.key ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {ActiveTabComponent && <ActiveTabComponent />}
      <div className={styles.playerInfo}>
        <div className={styles.avatar}>👒</div>
        <p>Farm Name: Whisper Garden</p>
        <p>Current Funds: 6,233,124g</p>
        <p>Total Earnings: 22,451,346g</p>
      </div>
    </div>
  );
};

export default GameManagerWindow;
