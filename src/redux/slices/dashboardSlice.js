import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '@/services/endpoints';

// Backend returns: { success, message, data: { totalBalance, cashBalance, totalBankBalance, monthlyIncome, monthlyExpense, savings, recentTransactions, analytics } }
export const fetchDashboard = createAsyncThunk('dashboard/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data: res } = await dashboardService.get(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard');
  }
});

import { createTransaction, deleteTransaction } from './transactionSlice';

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
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
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
        if (action.payload) {
          state.recentTransactions.unshift(action.payload);
          if (action.payload.type === 'expense') {
            state.monthlyExpense += action.payload.amount;
            state.totalBalance -= action.payload.amount;
          } else if (action.payload.type === 'income') {
            state.monthlyIncome += action.payload.amount;
            state.totalBalance += action.payload.amount;
          }
          state.savings = state.monthlyIncome - state.monthlyExpense;
        }
      });
  },
});

export default dashboardSlice.reducer;
