import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const [notificationsEnabled, setNotifications] = useState(true);
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="max-w-[800px] mx-auto space-y-lg">
      <div className="flex flex-col gap-sm mb-lg">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Sistem Ayarları</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Uygulama tercihlerinizi buradan yönetebilirsiniz.</p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm space-y-md">
        
        <div className="flex items-center justify-between pb-sm border-b border-surface-container">
            <div>
                <h3 className="font-headline-md text-on-surface">Bildirimler</h3>
                <p className="font-body-sm text-on-surface-variant">Uygulama içi ve e-posta bildirimleri</p>
            </div>
            <button 
                onClick={() => setNotifications(!notificationsEnabled)}
                className={`w-12 h-6 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${notificationsEnabled ? 'left-7' : 'left-1'}`}></div>
            </button>
        </div>

        <div className="flex items-center justify-between pb-sm border-b border-surface-container">
            <div>
                <h3 className="font-headline-md text-on-surface">Karanlık Mod</h3>
                <p className="font-body-sm text-on-surface-variant">Arayüz temasını değiştirin</p>
            </div>
            <button 
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-primary' : 'bg-surface-container-highest'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isDarkMode ? 'left-7' : 'left-1'}`}></div>
            </button>
        </div>

        <div className="flex flex-col gap-xs pt-sm">
            <h3 className="font-headline-md text-on-surface">Veri Yönetimi</h3>
            <p className="font-body-sm text-on-surface-variant mb-sm">Cihaz üzerindeki lokal verileri temizle</p>
            <button className="self-start border border-error text-error px-md py-sm rounded-lg font-label-md hover:bg-error-container/20 transition-colors">
                Önbelleği Temizle
            </button>
        </div>

      </div>
    </div>
  );
}
