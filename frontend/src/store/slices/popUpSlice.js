import { createSlice } from "@reduxjs/toolkit";

const popupSlice = createSlice({
  name: "popup",
  initialState: {
    settingPopup: false,
    addBookPopup: false,
    readBookPopup: false,
    recordBookPopup: false,
    returnBookPopup: false,
    addNewAdminPopup: false,
  },
  reducers: {
    toggleSettingPopup(state) {
      state.settingPopup = !state.settingPopup;
    },
    toggleAddBookPopup(state) {
      state.addBookPopup = !state.addBookPopup;
    },
    togglereadBookPopup(state) {
      state.readBookPopup = !state.readBookPopup;
    },
    togglerecordBookPopup(state) {
      state.recordBookPopup = !state.recordBookPopup;
    },
    togglereturnBookPopup(state) {
      state.returnBookPopup = !state.returnBookPopup;
    },
    toggleaddNewAdminPopup(state) {
      state.addNewAdminPopup = !state.addNewAdminPopup;
    },
    closeAllPopup(state) {
      state.addBookPopup = false;
      state.readBookPopup = false;
      state.recordBookPopup = false;
      state.returnBookPopup = false;
      state.addNewAdminPopup = false;
      state.settingPopup = false;
    },
  },
});

export const {
  toggleaddNewAdminPopup,
  togglereturnBookPopup,
  togglerecordBookPopup,
  togglereadBookPopup,
  toggleAddBookPopup,
  toggleSettingPopup,
} = popupSlice.actions;

export default popupSlice.reducer;
