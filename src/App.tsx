/* eslint-disable @typescript-eslint/no-explicit-any */

import { PhaserGame } from "@components/organisms/PhaserGame";
import { useRef } from "react";
import Dialogue from "@components/molecules/Dialogue";
import useKeyEventManager from "./shared/hooks/useKeyEventManager";
import { InventoryToolbar } from "./shared/components/organisms/InventoryToolbar";
import { InventoryPanel } from "./shared/components/organisms/InventoryPanel";
import { AvatarDropdown } from "./shared/components/organisms/AvatarDropdown";

const App = () => {
  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<any>();

  useKeyEventManager();

  const currentScene = (scene: any) => {
    console.log("Current Scene: ", scene.scene.key);
  };

  return (
    <div id="app">
      <div id="phaser-overlay" style={{ position: "relative" }}>
        <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />

        {/* Top right container */}
        <div
          id="top-right-container"
          style={{
            position: "absolute",
            right: 10,
            top: 0,
            zIndex: 10,
          }}
        >
          <AvatarDropdown />
        </div>

        {/* New center container */}
        <div
          id="center-container"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <InventoryPanel />
        </div>

        {/* Center bottom container */}
        <div
          id="center-bottom-container"
          style={{
            position: "absolute",
            left: "50%",
            bottom: "20px",
            transform: "translateX(-50%)",

            width: "650px",
            zIndex: 10,
          }}
        >
          <Dialogue />
          <InventoryToolbar />
        </div>
      </div>
    </div>
  );
};

export default App;
