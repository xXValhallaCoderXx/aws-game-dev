import { CharacterStats, DamageData } from "../character/character.interface";
import { ItemStats } from "../items/items.interface";

/**
 * Calculates the final damage value based on attacker and defender stats
 */
export function calculateDamage(
  attackerStats: CharacterStats,
  defenderStats: CharacterStats,
  weaponStats?: ItemStats
): number {
  // Base damage from strength
  let baseDamage = attackerStats.strength;

  // Add weapon damage if equipped
  if (weaponStats?.damage) {
    const { minDamage, maxDamage } = weaponStats.damage;
    const weaponDamage =
      Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
    baseDamage += weaponDamage;
  }

  // Apply defense reduction (defense reduces damage by a percentage)
  const defenseMultiplier = 1 - defenderStats.defense / 100;

  // Add some randomness (-10% to +10%)
  const variationMultiplier = 0.9 + Math.random() * 0.2;

  // Calculate final damage
  const finalDamage = Math.max(
    1,
    Math.floor(baseDamage * defenseMultiplier * variationMultiplier)
  );

  return finalDamage;
}

/**
 * Creates damage data including all necessary stats for combat
 */
export function createDamageData(
  attackerStats: CharacterStats,
  defenderStats: CharacterStats,
  weaponStats: ItemStats | undefined,
  sourcePosition: { x: number; y: number }
): DamageData {
  const damage = calculateDamage(attackerStats, defenderStats, weaponStats);

  return {
    damage,
    strength: attackerStats.strength,
    sourcePosition,
    weaponStats,
  };
}
