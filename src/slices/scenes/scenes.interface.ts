export interface IEntranceConfig {
  zoneX: number;
  zoneY: number;
  zoneWidth: number;
  zoneHeight: number;
  targetScene: string;
  targetStartingPosition: { x: number; y: number };
  comingFrom: string;
  // Optional: Add more properties as needed
  debug?: boolean; // Toggle to show debug borders
}
