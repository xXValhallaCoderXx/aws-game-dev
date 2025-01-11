# Combat System Changes

The combat system has been enhanced with the following improvements:

1. Base damage calculation now properly incorporates:
   - Attacker's strength as base damage
   - Weapon damage (if equipped) using min/max range
   - Defender's defense stat (reduces damage by percentage)
   - Random variation (-10% to +10% of final damage)

2. New DamageData interface includes weapon stats for context

3. Separated combat calculations into utility functions:
   - `calculateDamage`: Handles all damage calculations
   - `createDamageData`: Creates properly formatted damage data

4. Both player and enemy attacks now use the same calculation system

## Key Features

- Weapons add randomized damage within their min/max range
- Defense stat provides percentage-based damage reduction
- Small random variation in damage for unpredictability
- Consistent calculation between player and enemy attacks

## Usage

The system automatically handles:
- Player attacks with/without weapons
- Enemy attacks (typically without weapons)
- Defense calculations
- Minimum damage of 1 to ensure hits always do something