import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/', icon: 'dashboard', label: 'Ana Sayfa' },
    { path: '/scanner', icon: 'qr_code_scanner', label: 'Tarayıcı' },
    { path: '/inventory', icon: 'menu_book', label: 'Kitaplar' },
    { path: '/libraries', icon: 'local_library', label: 'Kütüphaneler' },
    { path: '/reports', icon: 'assessment', label: 'Raporlar' },
    { path: '/notifications', icon: 'notifications', label: 'Bildirimler' },
    { path: '/settings', icon: 'settings', label: 'Ayarlar' },
  ];

  return (
    <div className="text-on-surface bg-surface min-h-screen font-body-md">
      {/* TopAppBar */}
      <header className="bg-primary text-on-primary font-headline-md text-headline-md docked full-width top-0 flex justify-between items-center h-header-height px-md w-full fixed z-40 shadow-sm">
        <div className="flex items-center gap-md">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-on-primary hover:opacity-80 transition-opacity">
            QR KÜTÜPHANE
          </Link>
        </div>
        <div className="flex items-center gap-md">
          <button onClick={toggleTheme} className="hover:bg-primary-container/20 p-xs rounded-full transition-opacity active:opacity-70 flex items-center justify-center">
            <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <Link to="/notifications" className="hover:bg-primary-container/20 p-xs rounded-full transition-opacity active:opacity-70 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 bg-error text-on-error text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">3</span>
          </Link>
          <div className="flex items-center gap-sm cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/profile')}>
            <div className="text-right hidden md:block">
              <span className="text-label-md font-label-md block">{user?.name}</span>
              <span className="text-label-sm opacity-80 block">{user?.role}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border-2 border-on-primary/20">
              <span className="material-symbols-outlined w-full h-full flex items-center justify-center bg-surface-container-high text-primary">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col p-md gap-sm w-sidebar-width h-[calc(100vh-64px)] bg-[#0f172a] fixed left-0 top-header-height border-r border-[#1e293b] z-30 text-slate-200">
        <nav className="flex flex-col gap-xs flex-grow">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`flex items-center gap-md px-md py-sm rounded-lg transition-all duration-200 ${isActive ? 'bg-primary text-white shadow-md font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <span className="material-symbols-outlined">{link.icon}</span>
                <span className="font-label-md text-label-md">{link.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto pt-md border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-sm px-sm py-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors font-label-md text-label-md">
            <span className="material-symbols-outlined">logout</span>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-[84px] pb-24 md:pb-md px-md md:pl-[280px] md:pr-lg min-h-screen bg-background">
        <Outlet />
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full flex justify-around items-center py-sm bg-surface border-t border-outline-variant z-50 shadow-lg">
        <Link to="/" className={`flex flex-col items-center justify-center ${location.pathname === '/' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-sm text-label-sm">Panel</span>
        </Link>
        <Link to="/scanner" className={`flex flex-col items-center justify-center ${location.pathname === '/scanner' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}>
          <span className="material-symbols-outlined">qr_code_scanner</span>
          <span className="font-label-sm text-label-sm">Tarayıcı</span>
        </Link>
        <Link to="/inventory" className={`flex flex-col items-center justify-center ${location.pathname === '/inventory' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}>
          <span className="material-symbols-outlined">menu_book</span>
          <span className="font-label-sm text-label-sm">Kitaplar</span>
        </Link>
        <Link to="/libraries" className={`flex flex-col items-center justify-center ${location.pathname === '/libraries' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}>
          <span className="material-symbols-outlined">local_library</span>
          <span className="font-label-sm text-label-sm">Kütüphane</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center justify-center ${location.pathname === '/profile' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}>
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-sm text-label-sm">Profil</span>
        </Link>
      </nav>
    </div>
  );
}
