import { createSlice } from '@reduxjs/toolkit';

const modalSlice = createSlice({
  name: 'modal',
  initialState: {
    activeModal: null, // null | 'addTransaction' | 'addBank' | 'editBank' | 'addCategory' ...
    modalData: null,
  },
  reducers: {
    openModal: (state, action) => {
      if (typeof action.payload === 'string') {
        state.activeModal = action.payload;
        state.modalData = null;
      } else {
        state.activeModal = action.payload.type;
        state.modalData = action.payload.data || null;
      }
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
