import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '@/services/endpoints';
import { createTransaction, deleteTransaction } from './transactionSlice';

const STALE_MS = 30_000;

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetch',
  async (params, { rejectWithValue }) => {
    try {
      const { force, ...query } = params || {};
      const { data: res } = await dashboardService.get(query);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard');
    }
  },
  {
    condition: (params, { getState }) => {
      if (params?.force) return true;
      const { dashboard } = getState();
      if (dashboard.loading) return false;
      if (dashboard.lastFetchedAt && Date.now() - dashboard.lastFetchedAt < STALE_MS) {
        return false;
      }
      return true;
    },
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    totalBalance: 0,
    cashBalance: 0,
    totalBankBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    savings: 0,
    recentTransactions: [],
    analytics: [],
    categoryExpenses: [],
    loading: false,
    error: null,
    lastFetchedAt: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.lastFetchedAt = Date.now();
        const d = action.payload;
        state.totalBalance = d.totalBalance || 0;
        state.cashBalance = d.cashBalance || 0;
        state.totalBankBalance = d.totalBankBalance || 0;
        state.monthlyIncome = d.monthlyIncome || 0;
        state.monthlyExpense = d.monthlyExpense || 0;
        state.savings = d.savings || 0;
        state.recentTransactions = d.recentTransactions || [];
        state.analytics = d.analytics || [];
        state.categoryExpenses = d.categoryExpenses || [];
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        const tx = action.payload;
        if (!tx) return;
        state.recentTransactions = [tx, ...(state.recentTransactions || [])].slice(0, 10);
        if (tx.type === 'expense') {
          state.monthlyExpense += tx.amount;
          state.totalBalance -= tx.amount;
        } else if (tx.type === 'income') {
          state.monthlyIncome += tx.amount;
          state.totalBalance += tx.amount;
        }
        state.savings = state.monthlyIncome - state.monthlyExpense;
        state.lastFetchedAt = null;
      })
      .addCase(deleteTransaction.fulfilled, (state) => {
        state.lastFetchedAt = null;
      });
  },
});

export default dashboardSlice.reducer;
