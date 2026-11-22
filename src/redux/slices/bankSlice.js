import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bankService } from '@/services/endpoints';

const STALE_MS = 30_000;

// Bank fields: _id, bankName, accountType, currentBalance, accountNumberLast4, color, icon, iconUrl, imageUrl
export const fetchBanks = createAsyncThunk(
  'banks/fetchAll',
  async (_arg, { rejectWithValue }) => {
    try {
      const { data: res } = await bankService.getAll();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch banks');
    }
  },
  {
    condition: (arg, { getState }) => {
      if (arg?.force) return true;
      const { banks } = getState();
      if (banks.loading) return false;
      if (
        banks.list?.length > 0 &&
        banks.lastFetchedAt &&
        Date.now() - banks.lastFetchedAt < STALE_MS
      ) {
        return false;
      }
      return true;
    },
  }
);

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
    lastFetchedAt: null,
  },
  reducers: {
    clearBankError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBanks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchBanks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBank.fulfilled, (state, action) => {
        state.list.push(action.payload);
        state.lastFetchedAt = null;
      })
      .addCase(updateBank.fulfilled, (state, action) => {
        const idx = state.list.findIndex((b) => b._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        state.lastFetchedAt = null;
      })
      .addCase(deleteBank.fulfilled, (state, action) => {
        state.list = state.list.filter((b) => b._id !== action.payload);
        state.lastFetchedAt = null;
      });
  },
});

export const { clearBankError } = bankSlice.actions;
export default bankSlice.reducer;
