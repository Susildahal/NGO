// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { api } from '@/lib/axios';

// export interface CarouselItem {
//   id: string;
//   name: string;
//   photo: string;
//   title: string;
//   description: string;
//   createdAt: string;
// }

// interface CarouselState {
//   items: CarouselItem[];
//   isModalOpen: boolean;
//   editingItem: CarouselItem | null;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: CarouselState = {
//   items: [],
//   isModalOpen: false,
//   editingItem: null,
//   loading: false,
//   error: null,
// };

// // Async thunks for API calls
// export const fetchCarousels = createAsyncThunk(
//   'carousel/fetchCarousels',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await api.get<CarouselItem[]>('/carousels');
//       return response.data;
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch carousels');
//     }
//   }
// );

// export const createCarousel = createAsyncThunk(
//   'carousel/createCarousel',
//   async (carouselData: Omit<CarouselItem, 'id' | 'createdAt'>, { rejectWithValue }) => {
//     try {
//       const response = await api.post<CarouselItem>('/carousels', carouselData);
//       return response.data;
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to create carousel');
//     }
//   }
// );

// export const updateCarousel = createAsyncThunk(
//   'carousel/updateCarousel',
//   async (carouselData: CarouselItem, { rejectWithValue }) => {
//     try {
//       const response = await api.put<CarouselItem>(`/carousels/${carouselData.id}`, carouselData);
//       return response.data;
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to update carousel');
//     }
//   }
// );

// export const deleteCarousel = createAsyncThunk(
//   'carousel/deleteCarousel',
//   async (id: string, { rejectWithValue }) => {
//     try {
//       await api.delete(`/carousels/${id}`);
//       return id;
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to delete carousel');
//     }
//   }
// );

// const carouselSlice = createSlice({
//   name: 'carousel',
//   initialState,
//   reducers: {
//     setItems: (state, action: PayloadAction<CarouselItem[]>) => {
//       state.items = action.payload;
//     },
//     addItem: (state, action: PayloadAction<CarouselItem>) => {
//       state.items.unshift(action.payload);
//     },
//     updateItem: (state, action: PayloadAction<CarouselItem>) => {
//       const index = state.items.findIndex(item => item.id === action.payload.id);
//       if (index !== -1) {
//         state.items[index] = action.payload;
//       }
//     },
//     deleteItem: (state, action: PayloadAction<string>) => {
//       state.items = state.items.filter(item => item.id !== action.payload);
//     },
//     openModal: (state, action: PayloadAction<CarouselItem | null>) => {
//       state.isModalOpen = true;
//       state.editingItem = action.payload;
//     },
//     closeModal: (state) => {
//       state.isModalOpen = false;
//       state.editingItem = null;
//     },
//     setLoading: (state, action: PayloadAction<boolean>) => {
//       state.loading = action.payload;
//     },
//   },
//   extraReducers: (builder) => {
//     // Fetch carousels
//     builder.addCase(fetchCarousels.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(fetchCarousels.fulfilled, (state, action) => {
//       state.loading = false;
//       state.items = action.payload;
//     });
//     builder.addCase(fetchCarousels.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload as string;
//     });

//     // Create carousel
//     builder.addCase(createCarousel.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(createCarousel.fulfilled, (state, action) => {
//       state.loading = false;
//       state.items.unshift(action.payload);
//       state.isModalOpen = false;
//       state.editingItem = null;
//     });
//     builder.addCase(createCarousel.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload as string;
//     });

//     // Update carousel
//     builder.addCase(updateCarousel.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(updateCarousel.fulfilled, (state, action) => {
//       state.loading = false;
//       const index = state.items.findIndex(item => item.id === action.payload.id);
//       if (index !== -1) {
//         state.items[index] = action.payload;
//       }
//       state.isModalOpen = false;
//       state.editingItem = null;
//     });
//     builder.addCase(updateCarousel.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload as string;
//     });

//     // Delete carousel
//     builder.addCase(deleteCarousel.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(deleteCarousel.fulfilled, (state, action) => {
//       state.loading = false;
//       state.items = state.items.filter(item => item.id !== action.payload);
//     });
//     builder.addCase(deleteCarousel.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload as string;
//     });
//   },
// });

// export const {
//   setItems,
//   addItem,
//   updateItem,
//   deleteItem,
//   openModal,
//   closeModal,
//   setLoading,
// } = carouselSlice.actions;

// export default carouselSlice.reducer;
