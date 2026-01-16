import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import DashboardLayout from './pages/Dashboard';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import { AppProvider, useApp } from './context/AppContext';

// Auth wrapper
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  // Check if user is authenticated via context (which checks local storage on init)
  // We might want to show a loader if init is not done, but for simplicity:
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" />;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />

          {/* Protected Dashboard Routes */}
          <Route 
            path="/*" 
            element={
              <AuthGuard>
                <DashboardLayout />
              </AuthGuard>
            } 
          />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
