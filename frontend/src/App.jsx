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

    // Initialize default devices if they do not exist
    const savedDevices = localStorage.getItem('qr-devices');
    if (!savedDevices) {
      const defaultDevices = [
        {
          id: 'PLC-001',
          name: 'Siemens S7-1200 CPU 1214C',
          serial: 'SN-S71200-982341',
          location: 'PLC Labı',
          status: 'Operasyonel',
          efficiency: 98,
          lastMaintenance: '20.05.2026',
          image: '/plc_1.jpeg',
          specs: '14 Dijital Giriş (24V DC), 10 Dijital Çıkış (Röle), 2 Analog Giriş (0-10V DC), Entegre Profinet Portu, 100 KB çalışma belleği.',
          manager: 'Ahmet Y.',
          date: '20.05.2026',
          logs: [
            { date: '20.05.2026 14:30', type: 'Durum Güncelleme', description: 'Durum: Operasyonel, Verim: %98', user: 'Ahmet Y.' },
            { date: '15.05.2026 10:15', type: 'Bakım', description: 'Periyodik bakım yapıldı, filtreler temizlendi.', user: 'Mehmet K.', maintenanceType: 'Periyodik Bakım' }
          ]
        },
        {
          id: 'PLC-002',
          name: 'Siemens S7-1500 CPU 1511-1 PN',
          serial: 'SN-S71500-112398',
          location: 'PLC Labı',
          status: 'Operasyonel',
          efficiency: 100,
          lastMaintenance: '18.05.2026',
          image: '/plc_2.jpeg',
          specs: 'Ekranlı CPU, 150 KB program belleği, 1 MB veri belleği, 2 portlu switch içeren Profinet arayüzü, 60 ns bit işlem hızı.',
          manager: 'Mehmet K.',
          date: '18.05.2026',
          logs: [
            { date: '18.05.2026 09:00', type: 'Bakım', description: 'Kalibrasyon ayarları yapıldı ve test edildi.', user: 'Mehmet K.', maintenanceType: 'Kalibrasyon' }
          ]
        },
        {
          id: 'PLC-003',
          name: 'Schneider Modicon M221 TM221CE16R',
          serial: 'SN-M221-554321',
          location: 'PLC Labı',
          status: 'Arızalı',
          efficiency: 45,
          lastMaintenance: '15.05.2026',
          image: '/plc_3.jpeg',
          specs: '9 Dijital Giriş, 7 Röle Çıkışı, 2 Analog Giriş, Ethernet portu, USB mini-B programlama portu, SD kart yuvası.',
          manager: 'Ahmet Y.',
          date: '15.05.2026',
          logs: [
            { date: '15.05.2026 16:20', type: 'Arıza Bildirimi', description: 'Tür: Bağlantı Sorunu - Açıklama: Ethernet portu üzerinden ping alınamıyor, bağlantı kesik.', user: 'Ahmet Y.' }
          ]
        }
      ];
      localStorage.setItem('qr-devices', JSON.stringify(defaultDevices));
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
