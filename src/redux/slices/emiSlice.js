import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { emiService } from '@/services/endpoints';

// EMI fields: _id, title, amount, frequency, startDate, nextDueDate, paymentMethod, bankId, isActive, note, iconUrl, imageUrl
export const fetchEmis = createAsyncThunk('emis/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data: res } = await emiService.getAll();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch EMIs');
  }
});

export const createEmi = createAsyncThunk('emis/create', async (emiData, { rejectWithValue }) => {
  try {
    const { data: res } = await emiService.create(emiData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create EMI');
  }
});

export const updateEmi = createAsyncThunk('emis/update', async ({ id, ...emiData }, { rejectWithValue }) => {
  try {
    const { data: res } = await emiService.update(id, emiData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update EMI');
  }
});

export const deleteEmi = createAsyncThunk('emis/delete', async (id, { rejectWithValue }) => {
  try {
    await emiService.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete EMI');
  }
});

export const toggleEmiStatus = createAsyncThunk('emis/toggle', async ({ id, isActive }, { rejectWithValue }) => {
  try {
    const { data: res } = await emiService.toggleStatus(id, isActive);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to toggle EMI');
  }
});

const emiSlice = createSlice({
  name: 'emis',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmis.pending, (state) => { state.loading = true; })
      .addCase(fetchEmis.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchEmis.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createEmi.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(updateEmi.fulfilled, (state, action) => {
        const idx = state.list.findIndex(e => e._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteEmi.fulfilled, (state, action) => {
        state.list = state.list.filter(e => e._id !== action.payload);
      })
      .addCase(toggleEmiStatus.fulfilled, (state, action) => {
        const idx = state.list.findIndex(e => e._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      });
  },
});

export default emiSlice.reducer;
