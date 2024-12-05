import styles from "./stats-panel.module.css";

const StatsPanel = () => (
  <div className={styles.statsContainer}>
    <p>Player Level: 15</p>
    <p>Experience: 23,452 XP</p>
    <p>Health: 120/150</p>
  </div>
);

export default StatsPanel;
