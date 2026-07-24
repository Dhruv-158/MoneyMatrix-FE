import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

// Manual storage adapter — fixes ESM incompatibility with redux-persist/lib/storage in Vite
const storage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
};

import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import bankReducer from './slices/bankSlice';
import transactionReducer from './slices/transactionSlice';
import cashReducer from './slices/cashSlice';
import categoryReducer from './slices/categorySlice';
import emiReducer from './slices/emiSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import reportReducer from './slices/reportSlice';
import themeReducer from './slices/themeSlice';
import modalReducer from './slices/modalSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  banks: bankReducer,
  transactions: transactionReducer,
  cash: cashReducer,
  categories: categoryReducer,
  emis: emiReducer,
  subscriptions: subscriptionReducer,
  reports: reportReducer,
  theme: themeReducer,
  modal: modalReducer,
});

const persistConfig = {
  key: 'fintrack',
  storage,
  whitelist: ['auth'], // Only persist auth state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
