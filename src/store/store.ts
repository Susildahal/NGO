import { configureStore } from '@reduxjs/toolkit';
import noticReducer from './slices/noticSlicer';

export const store = configureStore({
  reducer: {
   
    notic: noticReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
