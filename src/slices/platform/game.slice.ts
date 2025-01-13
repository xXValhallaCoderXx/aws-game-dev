import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import type { PayloadAction } from "@reduxjs/toolkit";

export interface IPlatformState {
  isMerchantStoreOpen: boolean;
  isSettingsOpen: boolean;
  isSoundEnabled: boolean;
}

const initialState: IPlatformState = {
  isSettingsOpen: false,
  isSoundEnabled: true,
  isMerchantStoreOpen: false,
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
    enableSound(state) {
      state.isSoundEnabled = true;
    },
    disableSound(state) {
      state.isSoundEnabled = false;
    },
    setIsMerchantStoreOpen(state, action: PayloadAction<boolean>) {
      state.isMerchantStoreOpen = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  toggleSettings,
  toggleSound,
  enableSound,
  disableSound,
  setIsMerchantStoreOpen,
} = platformSlice.actions;

export default platformSlice.reducer;
