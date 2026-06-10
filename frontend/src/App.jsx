import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './Layout'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import DeviceDashboard from './pages/DeviceDashboard'
import Laboratories from './pages/Laboratories'
import Login from './pages/Login'
import Scanner from './pages/Scanner'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

// A wrapper for routes that require authentication
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  useEffect(() => {
    // Initialize default laboratories if they do not exist
    const savedLabs = localStorage.getItem('qr-laboratories');
    if (!savedLabs) {
      const defaultLabs = ['PLC Labı', 'PC Labı', 'Elektronik Labı'];
      localStorage.setItem('qr-laboratories', JSON.stringify(defaultLabs));
    }

    // Initialize default devices if they do not exist (start empty)
    const savedDevices = localStorage.getItem('qr-devices');
    if (!savedDevices) {
      localStorage.setItem('qr-devices', JSON.stringify([]));
    }
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="laboratories" element={<Laboratories />} />
                <Route path="device/:id" element={<DeviceDashboard />} />
                <Route path="scanner" element={<Scanner />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile" element={<Profile />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
