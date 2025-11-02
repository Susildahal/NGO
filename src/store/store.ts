import { configureStore } from '@reduxjs/toolkit';
import carouselReducer from './slices/carouselSlice';
import noticReducer from './slices/noticSlicer';

export const store = configureStore({
  reducer: {
    carousel: carouselReducer,
    notic: noticReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
