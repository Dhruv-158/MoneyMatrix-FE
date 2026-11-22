import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/endpoints';
import api from '@/services/api';

const persistTokens = (token, refreshToken) => {
  if (token) localStorage.setItem('token', token);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data: res } = await authService.login(credentials);
    persistTokens(res.data.token, res.data.refreshToken);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.errorMessage || err.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data: res } = await authService.register(userData);
    persistTokens(res.data.token, res.data.refreshToken);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.errorMessage || err.response?.data?.message || 'Registration failed');
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data: res } = await authService.getProfile();
    return res.data?.user || res.data;
  } catch (err) {
    return rejectWithValue(err.errorMessage || err.response?.data?.message || 'Failed to fetch user');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
    isInitialized: !!localStorage.getItem('token'),
  },
  reducers: {
    logout: (state) => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        api.post('/auth/logout', { refreshToken }).catch(() => {});
      }
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      clearTokens();
    },
    setTokens: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = Boolean(action.payload.token);
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuthInitialized: (state) => {
      state.isInitialized = true;
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isInitialized = true;
      })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isInitialized = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.isInitialized = true;
      });
  },
});

export const { logout, setTokens, clearError, setAuthInitialized, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
