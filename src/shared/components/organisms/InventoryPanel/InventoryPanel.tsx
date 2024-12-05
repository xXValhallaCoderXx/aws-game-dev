import styles from "./inventory-panel.module.css";

const InventoryPanel = () => {
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

  return (
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
  );
};
export default InventoryPanel;
