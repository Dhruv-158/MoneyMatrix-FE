import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProtectedRoute from './routes/ProtectedRoute';
import GuestRoute from './routes/GuestRoute';
import AppLayout from './layouts/AppLayout';
import LoadingScreen from './components/ui/LoadingScreen';
import { fetchMe } from '@/redux/slices/authSlice';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Banks = lazy(() => import('./pages/Banks'));
const CashWallet = lazy(() => import('./pages/CashWallet'));
const Emis = lazy(() => import('./pages/Emis'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Categories = lazy(() => import('./pages/Categories'));
const Reports = lazy(() => import('./pages/Reports'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));

export default function App() {
  const dispatch = useDispatch();
  const { mode } = useSelector((s) => s.theme);
  const { token, user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMe());
    }
  }, [dispatch, token, user]);

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Guest routes */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Protected routes inside layout */}
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="banks" element={<Banks />} />
          <Route path="cash-wallet" element={<CashWallet />} />
          <Route path="emis" element={<Emis />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="categories" element={<Categories />} />
          <Route path="reports" element={<Reports />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
