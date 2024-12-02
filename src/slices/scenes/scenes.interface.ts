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
  canTransition?: () => boolean; // Optional condition function
  feedbackMessage?: string; // Optional feedback message when transition is blocked
}
