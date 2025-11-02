import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NoticItem {
  id: string;
  title: string;
  description: string;
  fileType: 'image' | 'pdf';
  file: string;
  category: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface NoticState {
  items: NoticItem[];
  isModalOpen: boolean;
  editingItem: NoticItem | null;
  loading: boolean;
}

const initialState: NoticState = {
  items: [],
  isModalOpen: false,
  editingItem: null,
  loading: false,
};

const noticSlicer = createSlice({
  name: 'Notic',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<NoticItem[]>) => {
      state.items = action.payload;
    },
    addItem: (state, action: PayloadAction<NoticItem>) => {
      state.items.unshift(action.payload);
    },
    updateItem: (state, action: PayloadAction<NoticItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    openModal: (state, action: PayloadAction<NoticItem | null>) => {
      state.isModalOpen = true;
      state.editingItem = action.payload;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingItem = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setItems,
  addItem,
  updateItem,
  deleteItem,
  openModal,
  closeModal,
  setLoading,
} = noticSlicer.actions;

export default noticSlicer.reducer;
