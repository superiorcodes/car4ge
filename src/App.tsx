import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Vehicles } from './pages/Vehicles';
import { Maintenance } from './pages/Maintenance';
import { Garages } from './pages/Garages';
import { Login } from './pages/Login';
import { Landing } from './pages/Landing';
import ProfileSettings from './pages/ProfileSettings';
import AccountManagement from './pages/AccountManagement';
import { Notifications } from './pages/Notifications';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-purple-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {user ? (
        <>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="garages" element={<Garages />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="account-management" element={<AccountManagement />} />
          </Route>
          <Route path="/login" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;