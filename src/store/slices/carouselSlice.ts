import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CarouselItem {
  id: string;
  name: string;
  photo: string;
  title: string;
  description: string;
  createdAt: string;
}

interface CarouselState {
  items: CarouselItem[];
  isModalOpen: boolean;
  editingItem: CarouselItem | null;
  loading: boolean;
}

const initialState: CarouselState = {
  items: [],
  isModalOpen: false,
  editingItem: null,
  loading: false,
};

const carouselSlice = createSlice({
  name: 'carousel',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<CarouselItem[]>) => {
      state.items = action.payload;
    },
    addItem: (state, action: PayloadAction<CarouselItem>) => {
      state.items.unshift(action.payload);
    },
    updateItem: (state, action: PayloadAction<CarouselItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    openModal: (state, action: PayloadAction<CarouselItem | null>) => {
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
} = carouselSlice.actions;

export default carouselSlice.reducer;
