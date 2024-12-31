import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import type { PayloadAction } from "@reduxjs/toolkit";

export interface IPlatformState {
  isSettingsOpen: boolean;
  isSoundEnabled: boolean;
}

const initialState: IPlatformState = {
  isSettingsOpen: false,
  isSoundEnabled: true,
};

export const platformSlice = createSlice({
  name: "platform",
  initialState,
  reducers: {
    toggleSettings: (state, action: PayloadAction<boolean>) => {
      state.isSettingsOpen = action.payload;
    },
    toggleSound(state, action: PayloadAction<boolean>) {
      state.isSoundEnabled = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { toggleSettings, toggleSound } = platformSlice.actions;

export default platformSlice.reducer;
