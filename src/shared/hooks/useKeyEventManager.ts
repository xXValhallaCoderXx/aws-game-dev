import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { toggleSettings } from "@/slices/platform/game.slice";

const useKeyEventManager = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "i") {
        dispatch(toggleSettings());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch]);
};

export default useKeyEventManager;
