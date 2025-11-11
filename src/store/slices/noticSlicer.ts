import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';
import axiosInstance from '@/lib/axios';
export interface NoticItem {
  id: string;
  _id?: string;  // MongoDB uses _id
  title: string;
  description: string;
  fileType: 'image' | 'pdf';
  photo?: string;  // For image files
  file?: string;   // For PDF files
  category: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface PaginationInfo {
  totalCount: number;
  page: number;
  limit: number;
  nextpage: number | null;
}

interface NoticState {
  items: NoticItem[];
  isModalOpen: boolean;
  editingItem: NoticItem | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
}

const initialState: NoticState = {
  items: [],
  isModalOpen: false,
  editingItem: null,
  loading: false,
  error: null,
  pagination: null,
};

// Async thunks for API calls
export const fetchNotices = createAsyncThunk(
  'notic/fetchNotices',
  async (params: { q?: string; status?: string; sortBy?: string; order?: string; limit?: number; page?: number } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.q) queryParams.append('q', params.q);
      if (params.status) queryParams.append('status', params.status);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.order) queryParams.append('order', params.order);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.page) queryParams.append('page', params.page.toString());

      const response = await axiosInstance.get(`/notices?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notices');
    }
  }
);

export const createNotice = createAsyncThunk(
  'notic/createNotice',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<NoticItem>('/notices', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create notice');
    }
  }
);

export const updateNotice = createAsyncThunk(
  'notic/updateNotice',
  async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<NoticItem>(`/notices/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update notice');
    }
  }
);

export const deleteNotice = createAsyncThunk(
  'notic/deleteNotice',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('Deleting notice with ID:', id);
      await axiosInstance.delete(`/notices/${id}`);
      console.log('Notice deleted successfully');
      return id;
    } catch (error: any) {
      console.error('Delete error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notice');
    }
  }
);

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
  extraReducers: (builder) => {
    // Fetch notices
    builder.addCase(fetchNotices.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchNotices.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload.data || action.payload;
      state.pagination = action.payload.pagination || null;
    });
    builder.addCase(fetchNotices.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create notice
    builder.addCase(createNotice.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createNotice.fulfilled, (state, action) => {
      state.loading = false;
      state.items.unshift(action.payload);
      state.isModalOpen = false;
      state.editingItem = null;
    });
    builder.addCase(createNotice.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update notice
    builder.addCase(updateNotice.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateNotice.fulfilled, (state, action) => {
      state.loading = false;
      // Handle both id and _id for MongoDB
      const updatedId = action.payload.id || (action.payload as any)._id;
      const index = state.items.findIndex(item => {
        const itemId = item.id || (item as any)._id;
        return itemId === updatedId;
      });
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      state.isModalOpen = false;
      state.editingItem = null;
    });
    builder.addCase(updateNotice.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete notice
    builder.addCase(deleteNotice.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteNotice.fulfilled, (state, action) => {
      state.loading = false;
      // Handle both id and _id for MongoDB
      state.items = state.items.filter(item => {
        const itemId = item.id || (item as any)._id;
        return itemId !== action.payload;
      });
    });
    builder.addCase(deleteNotice.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
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
