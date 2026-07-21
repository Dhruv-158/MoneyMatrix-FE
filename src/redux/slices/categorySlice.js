import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryService } from '@/services/endpoints';

// Backend returns: { success, message, data: [array of categories] }
// Category fields: _id, name, isBuiltin, iconUrl, imageUrl
export const fetchCategories = createAsyncThunk('categories/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data: res } = await categoryService.getAll();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
  }
});

export const createCategory = createAsyncThunk('categories/create', async (catData, { rejectWithValue }) => {
  try {
    const { data: res } = await categoryService.create(catData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create category');
  }
});

export const updateCategory = createAsyncThunk('categories/update', async ({ id, ...catData }, { rejectWithValue }) => {
  try {
    const { data: res } = await categoryService.update(id, catData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update category');
  }
});

export const deleteCategory = createAsyncThunk('categories/delete', async (id, { rejectWithValue }) => {
  try {
    await categoryService.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete category');
  }
});

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.loading = true; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchCategories.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createCategory.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.list.findIndex(c => c._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.list = state.list.filter(c => c._id !== action.payload);
      });
  },
});

export default categorySlice.reducer;
