// src/components/Dialogue/Dialogue.tsx

import React, { useEffect, useState } from "react";
import { PhaserEventBus } from "../../services/phaser.service";


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
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<
    { text: string; nextBranch: string }[] | null
  >(null);

  useEffect(() => {
    // Listener for showing dialogue
    const showDialogueListener = (branch: DialogueBranch) => {
      setDialogues(branch.dialogues);
      setCurrentIndex(0);
      setChoices(branch.choices || null);
      setCurrentDialogue(branch.dialogues[0]);
      setVisible(true);
    };

    PhaserEventBus.on("show-dialogue", showDialogueListener);

    // Cleanup on unmount
    return () => {
      PhaserEventBus.off("show-dialogue", showDialogueListener);
    };
  }, []);

  const handleNext = () => {
    if (currentIndex + 1 < dialogues.length) {
      setCurrentIndex(currentIndex + 1);
      setCurrentDialogue(dialogues[currentIndex + 1]);

      // If at the last dialogue with choices
      if (currentIndex + 1 === dialogues.length - 1 && choices) {
        // Choices are handled below
      } else {
        // Continue listening for next input
        PhaserEventBus.emit("advance-dialogue");
      }
    } else {
      console.log("DIALOGUE END");
      // End of dialogues
      setVisible(false);
      setDialogues([]);
      setCurrentDialogue(null);
      setChoices(null);
      // Emit cutscene-end if needed
      PhaserEventBus.emit("cutscene-end");
    }
  };

  const handleChoice = (nextBranch: string) => {
    console.log("HANDLE CHOICE: ", nextBranch);
    // Emit an event to Phaser with the chosen branch
    PhaserEventBus.emit("cutscene-end");
    // Hide the dialogue UI
    setVisible(false);
    setDialogues([]);
    setCurrentDialogue(null);
    setChoices(null);
  };

  if (!visible || !currentDialogue) return null;

  return (
    <div className="dialogue-container">
      <div className="dialogue-box">
        <p>
          <strong>{currentDialogue.speaker}:</strong> {currentDialogue.text}
        </p>
        {choices && currentIndex === dialogues.length - 1 ? (
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
