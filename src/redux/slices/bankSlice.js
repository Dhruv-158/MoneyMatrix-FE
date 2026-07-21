import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bankService } from '@/services/endpoints';

// Backend returns: { success, message, data: [array of banks] }
// Bank fields: _id, bankName, accountType, currentBalance, accountNumberLast4, color, icon, iconUrl, imageUrl
export const fetchBanks = createAsyncThunk('banks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data: res } = await bankService.getAll();
    return res.data; // array of banks
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch banks');
  }
});

export const createBank = createAsyncThunk('banks/create', async (bankData, { rejectWithValue }) => {
  try {
    const { data: res } = await bankService.create(bankData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create bank');
  }
});

export const updateBank = createAsyncThunk('banks/update', async ({ id, ...bankData }, { rejectWithValue }) => {
  try {
    const { data: res } = await bankService.update(id, bankData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update bank');
  }
});

export const deleteBank = createAsyncThunk('banks/delete', async (id, { rejectWithValue }) => {
  try {
    await bankService.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete bank');
  }
});

const bankSlice = createSlice({
  name: 'banks',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearBankError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBanks.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchBanks.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createBank.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(updateBank.fulfilled, (state, action) => {
        const idx = state.list.findIndex(b => b._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteBank.fulfilled, (state, action) => {
        state.list = state.list.filter(b => b._id !== action.payload);
      });
  },
});

export const { clearBankError } = bankSlice.actions;
export default bankSlice.reducer;
