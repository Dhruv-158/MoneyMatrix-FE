import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cashService } from '@/services/endpoints';

// Backend returns: { success, message, data: { _id, userId, balance, ... } }
export const fetchCashWallet = createAsyncThunk('cash/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data: res } = await cashService.get();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch cash wallet');
  }
});

export const updateCashWallet = createAsyncThunk('cash/update', async (balance, { rejectWithValue }) => {
  try {
    const { data: res } = await cashService.update(balance);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update cash wallet');
  }
});

const cashSlice = createSlice({
  name: 'cash',
  initialState: {
    wallet: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCashWallet.pending, (state) => { state.loading = true; })
      .addCase(fetchCashWallet.fulfilled, (state, action) => { state.loading = false; state.wallet = action.payload; })
      .addCase(fetchCashWallet.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateCashWallet.fulfilled, (state, action) => { state.wallet = action.payload; });
  },
});

export default cashSlice.reducer;
