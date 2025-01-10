// protected setupAnimations(): void {
//   const directions: DirectionCapitalized[] = ["Down", "Left", "Right", "Up"];

//   directions.forEach((direction, dirIndex) => {
//     // Walking/Idle animations
//     const walkStartFrame = dirIndex * 6;
//     this.scene.anims.create({
//       key: `${this.enemyType}-walk${direction}`,
//       frames: this.scene.anims.generateFrameNumbers(this.texture.key, {
//         start: walkStartFrame,
//         end: walkStartFrame + 3,
//       }),
//       frameRate: 8,
//       repeat: -1,
//     });

//     // Idle animations (same frames as walk but slower)
//     this.scene.anims.create({
//       key: `${this.enemyType}-idle${direction}`,
//       frames: this.scene.anims.generateFrameNumbers(this.texture.key, {
//         start: walkStartFrame,
//         end: walkStartFrame + 3,
//       }),
//       frameRate: 4,
//       repeat: -1,
//     });

//     // Normal Hit animations
//     this.scene.anims.create({
//       key: `${this.enemyType}-hit${direction}`,
//       frames: this.scene.anims.generateFrameNumbers(this.texture.key, {
//         frames: [walkStartFrame + 4],
//       }),
//       frameRate: 8,
//       repeat: 0,
//     });

//     // Critical Hit animations
//     this.scene.anims.create({
//       key: `${this.enemyType}-criticalHit${direction}`,
//       frames: this.scene.anims.generateFrameNumbers(this.texture.key, {
//         frames: [walkStartFrame + 5],
//       }),
//       frameRate: 8,
//       repeat: 0,
//     });
//   });

//   // Attack animations
// const attackFrames = {
//   Down: { start: 25, end: 28 },
//   Left: { start: 31, end: 34 },
//   Right: { start: 37, end: 40 },
//   Up: { start: 43, end: 46 },
// };

// Object.entries(attackFrames).forEach(([direction, frames]) => {
//   this.scene.anims.create({
//     key: `${this.enemyType}-attack${direction}`,
//     frames: this.scene.anims.generateFrameNumbers(this.texture.key, {
//       start: frames.start,
//       end: frames.end,
//     }),
//     frameRate: 8,
//     repeat: 0,
//   });
// });
// }

// protected getDefaultAnimations(): Record<string, string> {
//   // super.getDefaultAnimations()
//   console.log("ENEMY CHARACTER - GET DEFAULT ANIMS: ", this.enemyType);
//   return {
//     walkUp: `${this.enemyType}-walkUp`,
//     walkDown: `${this.enemyType}-walkDown`,
//     walkLeft: `${this.enemyType}-walkLeft`,
//     walkRight: `${this.enemyType}-walkRight`,
//     idleUp: `${this.enemyType}-idleUp`,
//     idleDown: `${this.enemyType}-idleDown`,
//     idleLeft: `${this.enemyType}-idleLeft`,
//     idleRight: `${this.enemyType}-idleRight`,
//     attackUp: `${this.enemyType}-attackUp`,
//     attackDown: `${this.enemyType}-attackDown`,
//     attackLeft: `${this.enemyType}-attackLeft`,
//     attackRight: `${this.enemyType}-attackRight`,
//     hitUp: `${this.enemyType}-hitUp`,
//     hitDown: `${this.enemyType}-hitDown`,
//     hitLeft: `${this.enemyType}-hitLeft`,
//     hitRight: `${this.enemyType}-hitRight`,
//     criticalHitUp: `${this.enemyType}-criticalHitUp`,
//     criticalHitDown: `${this.enemyType}-criticalHitDown`,
//     criticalHitLeft: `${this.enemyType}-criticalHitLeft`,
//     criticalHitRight: `${this.enemyType}-criticalHitRight`,
//   };
// }






// protected getDefaultAnimations(): Record<AnimationKey, string> {
//   const baseAnimations: Record<AnimationKey, string> = {
//     idleDown: `${this.characterType}-idle-down`,
//     idleUp: `${this.characterType}-idle-up`,
//     idleLeft: `${this.characterType}-idle-left`,
//     idleRight: `${this.characterType}-idle-right`,
//     walkDown: `${this.characterType}-walk-down`,
//     walkUp: `${this.characterType}-walk-up`,
//     walkLeft: `${this.characterType}-walk-left`,
//     walkRight: `${this.characterType}-walk-right`,
//     hitDown: `${this.characterType}-hit-down`,
//     hitUp: `${this.characterType}-hit-up`,
//     hitLeft: `${this.characterType}-hit-left`,
//     hitRight: `${this.characterType}-hit-right`,
//     attackOneHandDown: `${this.characterType}-attack-one-hand-down`,
//     attackOneHandUp: `${this.characterType}-attack-one-hand-up`,
//     attackOneHandLeft: `${this.characterType}-attack-one-hand-left`,
//     attackOneHandRight: `${this.characterType}-attack-one-hand-right`,
//     criticalHitDown: `${this.characterType}-critical-hit-down`,
//     criticalHitUp: `${this.characterType}-critical-hit-up`,
//     criticalHitLeft: `${this.characterType}-critical-hit-left`,
//     criticalHitRight: `${this.characterType}-critical-hit-right`,
//   };

//   return baseAnimations;
// }












// protected getDefaultAnimations(): Record<string, string> {
//   return {
//     walkUp: "player-walk-up",
//     walkDown: "player-walk-down",
//     walkLeft: "player-walk-left",
//     walkRight: "player-walk-right",
//     idleUp: "player-idle-up",
//     idleDown: "player-idle-down",
//     idleLeft: "player-idle-left",
//     idleRight: "player-idle-right",
//     harvestUp: "player-harvest-up",
//     harvestDown: "player-harvest-down",
//     harvestLeft: "player-harvest-left",
//     harvestRight: "player-harvest-right",
//     rollUp: "player-roll-up",
//     rollDown: "player-roll-down",
//     rollLeft: "player-roll-left",
//     rollRight: "player-roll-right",
//     attackOneHandUp: "player-attack-one-hand-up",
//     attackOneHandDown: "player-attack-one-hand-down",
//     attackOneHandLeft: "player-attack-one-hand-left",
//     attackOneHandRight: "player-attack-one-hand-right",
//     damageUp: "player-damage-up",
//     damageDown: "player-damage-down",
//     damageLeft: "player-damage-left",
//     damageRight: "player-damage-right",
//   };
// }

// protected getCarryAnimations(): Record<string, string> {
//   return {
//     walkUp: "player-carry-walk-up",
//     walkDown: "player-carry-walk-down",
//     walkLeft: "player-carry-walk-left",
//     walkRight: "player-carry-walk-right",
//     idleUp: "player-carry-idle-up",
//     idleDown: "player-carry-idle-down",
//     idleLeft: "player-carry-idle-left",
//     idleRight: "player-carry-idle-right",
//   };
// }

// protected setupAnimations(): void {
//   const directions = ["up", "down", "left", "right"];

//   directions.forEach((direction, directionIndex) => {
//     // Regular animations
//     ["walk", "idle", "roll", "attack-one-hand"].forEach((action) => {
//       const baseKey = `player-${action}-${direction}`;
//       const spritesheet = `player-${action}`;

//       if (!this.scene.anims.exists(baseKey)) {
//         if (action === "roll" || action === "attack-one-hand") {
//           this.scene.anims.create({
//             key: baseKey,
//             frames: this.scene.anims.generateFrameNumbers(spritesheet, {
//               start: directionIndex * 9, // Multiply by 9 since each direction has 9 frames
//               end: directionIndex * 9 + 8, // Add 8 to get to the last frame (0-8 = 9 frames)
//             }),
//             frameRate: 15,
//             repeat: 0,
//           });
//         } else {
//           this.scene.anims.create({
//             key: baseKey,
//             frames: this.scene.anims.generateFrameNumbers(spritesheet, {
//               start: directionIndex * 6,
//               end: directionIndex * 6 + 5,
//             }),
//             frameRate: action === "walk" ? 10 : 8,
//             repeat: -1,
//           });
//         }
//       }
//     });

//     // Add damage animation setup
//     const damageKey = `player-damage-${direction}`;
//     if (!this.scene.anims.exists(damageKey)) {
//       this.scene.anims.create({
//         key: damageKey,
//         frames: this.scene.anims.generateFrameNumbers("player-damage", {
//           start: directionIndex * 8, // 8 frames per direction
//           end: directionIndex * 8 + 7,
//         }),
//         frameRate: 15,
//         repeat: 0,
//       });
//     }
//     // Carry animations
//     ["walk", "idle"].forEach((action) => {
//       const baseKey = `player-carry-${action}-${direction}`;
//       const spritesheet = `player-carry-${action}`;

//       if (!this.scene.anims.exists(baseKey)) {
//         this.scene.anims.create({
//           key: baseKey,
//           frames: this.scene.anims.generateFrameNumbers(spritesheet, {
//             start: directionIndex * 6,
//             end: directionIndex * 6 + 5,
//           }),
//           frameRate: action === "walk" ? 10 : 8,
//           repeat: -1,
//         });
//       }
//     });

//     // Harvest animation
//     ["up", "down", "left", "right"].forEach(() => {
//       const baseKey = `player-harvest-${direction}`;
//       const spritesheet = `player-harvest`;

//       if (!this.scene.anims.exists(baseKey)) {
//         this.scene.anims.create({
//           key: baseKey,
//           frames: this.scene.anims.generateFrameNumbers(spritesheet, {
//             start: directionIndex * 6,
//             end: directionIndex * 6 + 5,
//           }),
//           frameRate: 12,
//           repeat: 0,
//         });
//       }
//     });
//   });

//   ["up", "down", "left", "right"].forEach((direction, directionIndex) => {
//     const baseKey = `weapon-attack-${direction}`;
//     if (!this.scene.anims.exists(baseKey)) {
//       this.scene.anims.create({
//         key: baseKey,
//         frames: this.scene.anims.generateFrameNumbers(
//           "player-attack-one-hand-sword",
//           {
//             start: directionIndex * 9,
//             end: directionIndex * 9 + 8,
//           }
//         ),
//         frameRate: 15,
//         repeat: 0,
//       });
//     }
//   });

//   // Start with idle animation
//   this.play("player-idle-down");
// }