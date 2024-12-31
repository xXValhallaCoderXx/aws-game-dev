// src/components/Dialogue/Dialogue.tsx

import React, { useEffect, useState } from "react";
import { PhaserEventBus } from "@/shared/services/phaser-event.service";

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
      console.log("Received show-dialogue event with branch:", branch.key);
      console.log("Dialogue data:", branch.dialogues);

      // Update state with new dialogues
      setDialogues(branch.dialogues);
      setCurrentIndex(0);
      setChoices(branch.choices || null);
      setCurrentDialogue(branch.dialogues[0]);
      setVisible(true);

      console.log("State after updating:", {
        visible: true,
        currentDialogue: branch.dialogues[0],
        currentIndex: 0,
        choices: branch.choices || null,
      });
    };
    PhaserEventBus.on("show-dialogue", showDialogueListener);

    // Cleanup on unmount
    return () => {
      PhaserEventBus.off("show-dialogue", showDialogueListener);
    };
  }, []);

  const handleNext = () => {
    if (currentIndex + 1 < dialogues.length) {
      const nextIndex = currentIndex + 1;
      console.log(`HANDLE NEXT - NEXT DIALOGUE: ${nextIndex}`);
      setCurrentIndex(nextIndex);
      setCurrentDialogue(dialogues[nextIndex]);
    } else {
      // End of dialogues
      console.log("HANDLE NEXT - END OF CUTSCENE");
      setVisible(false);
      setDialogues([]);
      setCurrentDialogue(null);
      setChoices(null);

      // Emit cutscene-end event to Phaser
      PhaserEventBus.emit("cutscene-end");
    }
  };

  const handleChoice = (nextBranch: string) => {
    console.log(`User chose branch: ${nextBranch}`);

    setVisible(false);
    setDialogues([]);
    setCurrentDialogue(null);
    setChoices(null);
    PhaserEventBus.emit("choose-dialogue", nextBranch);
  };


  if (!visible || !currentDialogue) {
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
          <div
            style={{ display: "flex", flexDirection: "column", fontSize: 12 }}
          >
            <img
              src="/sprites/characters/guide/portrait-happy.png"
              alt="Guide"
              width={100}
              height={100}
            />
            <div
              style={{
                marginTop: 4,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              {currentDialogue.speaker}
            </div>
          </div>
          <div>
            <p>{currentDialogue.text}</p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {choices && currentIndex === dialogues.length - 1 ? (
            <div>
              {choices.map((choice, index) => (
                <button
                  className="nes-btn"
                  key={index}
                  onClick={() => handleChoice(choice.nextBranch)}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          ) : (
            <button className="nes-btn" onClick={handleNext}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dialogue;
