// src/components/Dialogue/Dialogue.tsx

import React, { useEffect, useState } from "react";
import { PhaserEventBus } from "../../services/phaser.service";
import "./Dialogue.css"; // Optional: For styling

interface Dialogue {
  speaker: string;
  text: string;
}

interface DialogueBranch {
  key: string;
  dialogues: Dialogue[];
  choices?: {
    text: string;
    nextBranch: string;
  }[];
}

const Dialogue: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState<Dialogue | null>(null);
  const [choices, setChoices] = useState<
    { text: string; nextBranch: string }[] | null
  >(null);

  useEffect(() => {
    // Listener for showing dialogue
    const showDialogueListener = (branch: DialogueBranch) => {
      setVisible(true);
      setCurrentDialogue(branch.dialogues[0]);
      setChoices(branch.choices || null);
    };

    PhaserEventBus.on("show-dialogue", showDialogueListener);

    // Cleanup on unmount
    return () => {
      PhaserEventBus.off("show-dialogue", showDialogueListener);
    };
  }, []);

  const handleNext = () => {
    // Emit an event to Phaser to advance the dialogue
    PhaserEventBus.emit("advance-dialogue");
  };

  const handleChoice = (nextBranch: string) => {
    // Emit an event to Phaser to handle the dialogue choice
    PhaserEventBus.emit("choose-dialogue", nextBranch);
    // Hide the dialogue UI
    setVisible(false);
    setCurrentDialogue(null);
    setChoices(null);
  };

  // Listen for dialogue updates
  useEffect(() => {
    if (!visible) return;

    const updateDialogueListener = (branch: DialogueBranch) => {
      setCurrentDialogue(branch.dialogues[0]);
      setChoices(branch.choices || null);
    };

    PhaserEventBus.on("show-dialogue", updateDialogueListener);

    return () => {
      PhaserEventBus.off("show-dialogue", updateDialogueListener);
    };
  }, [visible]);

  if (!visible || !currentDialogue) return null;

  return (
    <div className="dialogue-container">
      <div className="dialogue-box">
        <p>
          <strong>{currentDialogue.speaker}:</strong> {currentDialogue.text}
        </p>
        {choices ? (
          <div className="choices">
            {choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoice(choice.nextBranch)}
              >
                {choice.text}
              </button>
            ))}
          </div>
        ) : (
          <button onClick={handleNext}>Next</button>
        )}
      </div>
    </div>
  );
};

export default Dialogue;
