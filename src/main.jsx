import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';
import { store, persistor } from './redux/store';
import App from './App';
import LoadingScreen from './components/ui/LoadingScreen';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'var(--card, #0f172a)',
                color: 'var(--foreground, #f8fafc)',
                border: '1px solid var(--border, rgba(255,255,255,0.12))',
                borderRadius: '16px',
                padding: '12px 18px',
                fontSize: '13px',
                fontWeight: '700',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(12px)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f43f5e',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
);
