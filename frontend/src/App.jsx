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
    // Initialize default libraries if they do not exist
    const savedLibraries = localStorage.getItem('qr-libraries');
    if (!savedLibraries) {
      const defaultLibraries = ['Beylikdüzü Kütüphanesi', 'Esenyurt Kütüphanesi', 'Avcılar Kütüphanesi'];
      localStorage.setItem('qr-libraries', JSON.stringify(defaultLibraries));
    }

    // Initialize default books if they do not exist (start empty)
    const savedBooks = localStorage.getItem('qr-books');
    if (!savedBooks) {
      localStorage.setItem('qr-books', JSON.stringify([]));
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
                <Route path="libraries" element={<Laboratories />} />
                <Route path="book/:id" element={<DeviceDashboard />} />
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
