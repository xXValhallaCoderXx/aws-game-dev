import { RootState } from "../services/redux-store.service";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSettings } from "@/slices/platform/game.slice";

const useKeyEventManager = () => {
  const isSettingsOpen = useSelector(
    (state: RootState) => state.platform.isSettingsOpen
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "i") {
        dispatch(toggleSettings(!isSettingsOpen));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, isSettingsOpen]);
};

export default useKeyEventManager;
