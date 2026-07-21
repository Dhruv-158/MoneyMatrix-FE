import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subscriptionService } from '@/services/endpoints';

// Subscription fields: _id, title, amount, frequency, startDate, nextDueDate, paymentMethod, bankId, isActive, note, iconUrl, imageUrl
export const fetchSubscriptions = createAsyncThunk('subscriptions/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data: res } = await subscriptionService.getAll();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch subscriptions');
  }
});

export const createSubscription = createAsyncThunk('subscriptions/create', async (subData, { rejectWithValue }) => {
  try {
    const { data: res } = await subscriptionService.create(subData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create subscription');
  }
});

export const updateSubscription = createAsyncThunk('subscriptions/update', async ({ id, ...subData }, { rejectWithValue }) => {
  try {
    const { data: res } = await subscriptionService.update(id, subData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update subscription');
  }
});

export const deleteSubscription = createAsyncThunk('subscriptions/delete', async (id, { rejectWithValue }) => {
  try {
    await subscriptionService.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete subscription');
  }
});

export const toggleSubscriptionStatus = createAsyncThunk('subscriptions/toggle', async ({ id, isActive }, { rejectWithValue }) => {
  try {
    const { data: res } = await subscriptionService.toggleStatus(id, isActive);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to toggle subscription');
  }
});

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => { state.loading = true; })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchSubscriptions.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createSubscription.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        const idx = state.list.findIndex(s => s._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.list = state.list.filter(s => s._id !== action.payload);
      })
      .addCase(toggleSubscriptionStatus.fulfilled, (state, action) => {
        const idx = state.list.findIndex(s => s._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      });
  },
});

export default subscriptionSlice.reducer;
