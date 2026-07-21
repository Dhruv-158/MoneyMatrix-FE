import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitialized } = useSelector((s) => s.auth);
  
  // Wait for auth initialization to prevent redirect flickering
  if (!isInitialized) return <LoadingScreen />;
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
