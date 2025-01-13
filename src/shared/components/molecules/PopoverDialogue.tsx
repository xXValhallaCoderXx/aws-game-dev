// src/components/Dialogue/PopoverDialogue.tsx

import React, { useEffect, useState } from "react";
import { PhaserEventBus } from "@/shared/services/phaser-event.service";

interface PopoverMessage {
  text: string;
}

const PopoverDialogue: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Listener for showing dialogue
    const showDialogueListener = (popoverMessage: PopoverMessage) => {
      console.log(
        "Received display-popover event with message:",
        popoverMessage.text
      );

      // Update state with new message
      setMessage(popoverMessage.text);
      setVisible(true);
    };

    PhaserEventBus.on("display-popover", showDialogueListener);

    // Cleanup on unmount
    return () => {
      PhaserEventBus.off("display-popover", showDialogueListener);
    };
  }, []);

  const handleClose = () => {
    console.log("Closing popover");
    setVisible(false);
    setMessage("");
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="nes-container is-dark">
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            marginBottom: 10,
            gap: 8,
          }}
        >
          <div>
            <p>{message}</p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="nes-btn" onClick={handleClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopoverDialogue;
