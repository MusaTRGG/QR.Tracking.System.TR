import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  
  const fetchDevices = async () => {
    let success = false;
    try {
      const res = await fetch('/api/devices');
      if (res.ok) {
        const data = await res.json();
        setDevices(data);
        localStorage.setItem('qr-devices', JSON.stringify(data));
        success = true;
      }
    } catch (e) {
      console.warn("Backend connection failed, falling back to localStorage", e);
    }
    
    if (!success) {
      const saved = localStorage.getItem('qr-devices');
      if (saved) {
        setDevices(JSON.parse(saved));
      }
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const createDevice = async () => {
    const newId = `PLC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const newDevice = {
      id: newId,
      name: `Siemens S7-1200 PLC`,
      serial: `SN-${Math.floor(Math.random() * 1000000)}`,
      location: `PLC Labı`,
      status: 'Operasyonel',
      efficiency: Math.floor(Math.random() * 20 + 80), // 80-100
      lastMaintenance: new Date().toLocaleDateString('tr-TR'),
      image: '',
      specs: '14 Dijital Giriş (24V DC), 10 Dijital Çıkış (Röle), 2 Analog Giriş (0-10V DC), Entegre Profinet Portu, 100 KB çalışma belleği.',
      manager: 'Ahmet Y.',
      date: new Date().toLocaleDateString('tr-TR'),
      logs: [
        {
          date: new Date().toLocaleString('tr-TR'),
          type: 'Sistem',
          description: 'Test cihazı otomatik olarak üretildi.',
          user: 'Sistem'
        }
      ]
    };
    
    let success = false;
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDevice)
      });
      if (res.ok) {
        const added = await res.json();
        setDevices(prev => [added, ...prev]);
        success = true;
      }
    } catch (e) {
      console.warn("Backend test device creation failed, sync to localStorage only", e);
    }
    
    const saved = localStorage.getItem('qr-devices');
    const localDevs = saved ? JSON.parse(saved) : [];
    const updated = [newDevice, ...localDevs];
    localStorage.setItem('qr-devices', JSON.stringify(updated));
    if (!success) {
      setDevices(updated);
    }
  };

  const clearDevices = async () => {
    if (window.confirm("Tüm envanteri temizlemek istediğinize emin misiniz?")) {
      let success = false;
      try {
        const res = await fetch('/api/devices', {
          method: 'DELETE'
        });
        if (res.ok) {
          setDevices([]);
          success = true;
        }
      } catch (e) {
        console.warn("Backend clear failed, sync to localStorage only", e);
      }
      
      setDevices([]);
      localStorage.removeItem('qr-devices');
    }
  };

  // Use the current local IP/hostname to generate QR
  const baseUrl = `${window.location.protocol}//${window.location.host}/device`;

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Featured Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
        <div className="bg-primary text-on-primary p-lg rounded-xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <h4 className="font-headline-md text-headline-md mb-sm">Toplam Cihaz</h4>
                <p className="font-headline-xl text-headline-xl">{devices.length > 0 ? devices.length : 0}</p>
                <p className="font-body-sm text-body-sm opacity-80 mt-xs">Sistemde kayıtlı aktif envanter sayısı</p>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10">inventory_2</span>
        </div>
        
        <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm">
            <h4 className="font-headline-md text-headline-md text-on-surface mb-sm">Sistem Durumu</h4>
            <div className="flex items-center gap-md mt-md">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">check_circle</span>
                </div>
                <div>
                    <p className="font-label-md text-label-md text-secondary">Tüm Sistemler Normal</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Son kontrol: 2 dk önce</p>
                </div>
            </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm">
            <h4 className="font-headline-md text-headline-md text-on-surface mb-sm">Hızlı İşlemler</h4>
            <div className="flex flex-col gap-sm">
                <button onClick={createDevice} className="w-full flex items-center justify-center gap-xs bg-primary text-on-primary hover:opacity-90 px-md py-sm rounded-lg font-label-md text-label-md transition-colors">
                    <span className="material-symbols-outlined">add</span>
                    Yeni Test Cihazı Üret
                </button>
                <button onClick={clearDevices} className="w-full flex items-center justify-center gap-xs border border-error text-error hover:bg-error-container/20 px-md py-sm rounded-lg font-label-md text-label-md transition-colors">
                    <span className="material-symbols-outlined">delete</span>
                    Envanteri Temizle
                </button>
            </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Son Eklenen Cihazlar & QR Kodlar</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Hızlı erişim ve test paneli</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-grid-gutter">
        {devices.map(device => (
          <div key={device.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
            <div className="w-full flex justify-between items-start mb-md border-b border-surface-container-low pb-sm">
                <div>
                    <h3 className="font-label-md text-label-md text-on-surface">{device.id}</h3>
                    <p className="text-body-sm text-on-surface-variant line-clamp-1">{device.name}</p>
                </div>
                <div className="bg-secondary-container text-on-secondary-container px-sm py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {device.status}
                </div>
            </div>
            
            <div className="bg-white p-2 rounded-lg border border-outline-variant mb-md">
              <QRCodeSVG value={`${baseUrl}/${device.id}`} size={140} />
            </div>
            
            <Link to={`/device/${device.id}`} className="w-full mt-auto flex justify-center items-center gap-xs border border-primary text-primary hover:bg-primary-container/10 px-md py-sm rounded-lg font-label-md text-label-md transition-colors">
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              Paneli Aç
            </Link>
          </div>
        ))}
        {devices.length === 0 && (
            <div className="col-span-full py-xl text-center text-on-surface-variant bg-surface-container border border-dashed border-outline rounded-xl">
                <span className="material-symbols-outlined text-4xl mb-sm block opacity-50">qr_code_2</span>
                <p>Henüz kayıtlı cihaz bulunmuyor. Test için "Yeni Test Cihazı Üret" butonuna tıklayın.</p>
            </div>
        )}
      </div>
    </div>
  );
}
