import { createSlice } from "@reduxjs/toolkit";
// import type { PayloadAction } from "@reduxjs/toolkit";

export interface IPlatformState {
  isSettingsOpen: boolean;
}

const initialState: IPlatformState = {
  isSettingsOpen: false,
};

export const platformSlice = createSlice({
  name: "platform",
  initialState,
  reducers: {
    toggleSettings: (state) => {
      state.isSettingsOpen = !state.isSettingsOpen;
    },
  },
});

// Action creators are generated for each case reducer function
export const { toggleSettings } = platformSlice.actions;

export default platformSlice.reducer;
