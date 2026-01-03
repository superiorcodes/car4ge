import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Vehicles } from './pages/Vehicles';
import { Maintenance } from './pages/Maintenance';
import { Garages } from './pages/Garages';
import { Login } from './pages/Login';
import ProfileSettings from './pages/ProfileSettings';
import AccountManagement from './pages/AccountManagement';
import { Notifications } from './pages/Notifications';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="garages" element={<Garages />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="account-management" element={<AccountManagement />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;