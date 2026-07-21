import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportService } from '@/services/endpoints';

// Backend report response: { summary: { income, expense, transfer }, netSavings, cashBalance, bankBalances, categoryWiseExpenses, bankWiseExpenses }
export const fetchReport = createAsyncThunk('reports/fetch', async ({ type, params }, { rejectWithValue }) => {
  try {
    const serviceFn = type === 'daily' ? reportService.getDaily : type === 'yearly' ? reportService.getYearly : reportService.getMonthly;
    const { data: res } = await serviceFn(params);
    return { type, data: res.data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch report');
  }
});

const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    activeTab: 'monthly',
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    setActiveTab: (state, action) => { state.activeTab = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReport.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.activeTab = action.payload.type;
      })
      .addCase(fetchReport.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { setActiveTab } = reportSlice.actions;
export default reportSlice.reducer;
