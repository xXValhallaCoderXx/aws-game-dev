import { useState } from "react";
import styles from "./inventory-panel.module.css";
import { useSelector } from "react-redux";
import { RootState } from "@/shared/services/redux-store.service";

const InventoryPanel = () => {
  const { isSettingsOpen } = useSelector((state: RootState) => state.platform);
  const [activeTab, setActiveTab] = useState("inventory");

  const tools = [
    { name: "Sword", icon: "🗡️" },
    { name: "Pickaxe", icon: "⛏️" },
    { name: "Axe", icon: "🪓" },
    { name: "Watering Can", icon: "💧" },
    { name: "Scythe", icon: "🌾" },
  ];

  const items = [
    { name: "Coffee", quantity: 10, icon: "☕" },
    { name: "Honey", quantity: 8, icon: "🍯" },
    { name: "Gold Ore", quantity: 12, icon: "🏆" },
    { name: "Gem", quantity: 99, icon: "💎" },
    { name: "Sunflower", quantity: 1, icon: "🌻" },
  ];

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
      {activeTab === "inventory" && (
        <div>
          <div className={styles.topSection}>
            <div className={styles.toolsContainer}>
              {tools.map((tool, index) => (
                <div key={index} className={styles.toolSlot}>
                  <span>{tool.icon}</span>
                </div>
              ))}
            </div>
            <div className={styles.currencyInfo}>
              <p>Current Funds: 6,233,124g</p>
              <p>Total Earnings: 22,451,346g</p>
            </div>
          </div>
          <div className={styles.itemsContainer}>
            {items.map((item, index) => (
              <div key={index} className={styles.itemSlot}>
                <span>{item.icon}</span>
                <span>{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === "stats" && (
        <div className={styles.statsContainer}>
          <p>Player Level: 15</p>
          <p>Experience: 23,452 XP</p>
          <p>Health: 120/150</p>
        </div>
      )}
      {activeTab === "settings" && (
        <div className={styles.settingsContainer}>
          <p>Settings will go here...</p>
        </div>
      )}
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

export default InventoryPanel;
