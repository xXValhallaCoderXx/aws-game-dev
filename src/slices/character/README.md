# Spirit Quest System Implementation

This document describes how to set up and use the new Spirit Quest system in your game.

## Overview

The Spirit Quest system adds mysterious spirit NPCs that randomly appear in the game world. These spirits will request items from the player and offer rewards in return.

## Components

1. **SpiritCharacter**: Handles individual spirit behavior, dialogue, and quest completion
2. **SpiritManager**: Manages spirit spawning and quest configurations

## Setup Instructions

1. Add the spirit sprite sheet to your game assets
```typescript
// In your scene's preload method
this.load.spritesheet('spirit', 'path/to/spirit/spritesheet.png', {
    frameWidth: 32,
    frameHeight: 32
});
```

2. Initialize the SpiritManager in your main game scene
```typescript
import { SpiritManager } from './slices/character/spirit-manager.service';

export class GameScene extends Scene {
    private spiritManager: SpiritManager;

    create() {
        // ... other scene initialization code ...

        // Initialize spirit manager
        this.spiritManager = new SpiritManager(this);
        
        // Start random spirit spawning (5-10 minute intervals)
        this.spiritManager = this.spiritManager.startRandomSpawning();
    }

    cleanup() {
        // ... other cleanup code ...
        this.spiritManager.destroy();
    }
}
```

## Customizing Spirit Quests

You can customize the available spirit quests by modifying the questConfigs array in the SpiritManager:

```typescript
this.questConfigs = [
    {
        questItem: GAME_ITEM_KEYS.WOOD,
        questAmount: 5,
        rewards: {
            gold: 100
        }
    },
    {
        questItem: GAME_ITEM_KEYS.STONE,
        questAmount: 3,
        rewards: {
            items: [
                { item: GAME_ITEM_KEYS.POTION_HEALTH, amount: 2 }
            ]
        }
    }
];
```

## Spirit Behavior

- Spirits will randomly spawn in the game world
- When approached, they initiate dialogue requesting specific items
- Players can accept or decline the quest
- If accepted, the spirit waits for the items
- Upon completion, the spirit gives rewards and fades away
- If declined, the spirit fades away immediately

## Events

The system uses the following PhaserEventBus events:
- `show-dialogue`: Displays spirit dialogue
- `choose-dialogue`: Handles player dialogue choices
- `inventory-remove`: Removes items from player inventory
- `inventory-add`: Adds reward items to player inventory
- `add-gold`: Adds gold rewards to player