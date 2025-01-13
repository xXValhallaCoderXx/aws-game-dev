import { useState } from "react";
import styles from "./inventory-panel.module.css";
import { useSelector } from "react-redux";
import { RootState } from "@/shared/services/redux-store.service";
import SellTab from "./SellTab";
import BuyTab from "./BuyTab";

const TABS = [
  { key: "buy", label: "Buy", component: BuyTab },
  { key: "sell", label: "Sell", component: SellTab },
];

const StoreInventoryWindow = () => {
  const { isMerchantStoreOpen } = useSelector(
    (state: RootState) => state.platform
  );
  const [activeTab, setActiveTab] = useState("buy");

  if (!isMerchantStoreOpen) return null;

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
    </div>
  );
};

export default StoreInventoryWindow;
