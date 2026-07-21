import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { transactionService } from '@/services/endpoints';

// Backend returns: { success, message, data: { items, page, limit, total } }
// Transaction items have: bankId (populated: { bankName, accountType }), categoryId (populated: { name })
export const fetchTransactions = createAsyncThunk('transactions/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data: res } = await transactionService.getAll(params);
    return res.data; // { items, page, limit, total }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch transactions');
  }
});

export const createTransaction = createAsyncThunk('transactions/create', async (txData, { rejectWithValue }) => {
  try {
    const { data: res } = await transactionService.create(txData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create transaction');
  }
});

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    loading: false,
    error: null,
    lastUpdated: null,
  },
  reducers: {
    setPage: (state, action) => { state.page = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page || 1;
        state.limit = action.payload.limit || 10;
      })
      .addCase(fetchTransactions.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.total += 1;
        state.lastUpdated = Date.now();
      });
  },
});

export const { setPage } = transactionSlice.actions;
export default transactionSlice.reducer;
