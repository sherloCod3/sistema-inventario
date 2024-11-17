import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InventoryPage from './pages/InventoryPage';
import LoginPage from './pages/LoginPage';
import { AppProvider } from './providers/AppProvider';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<InventoryPage />} />
              </Route>
            </Routes>
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;