import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function Home() {
  const [devices, setDevices] = useState([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('qr-devices');
    if (saved) {
      setDevices(JSON.parse(saved));
    }
  }, []);

  const createDevice = () => {
    const newId = `PLC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const newDevice = {
      id: newId,
      name: `Siemens S7-1200 PLC`,
      serial: `SN-${Math.floor(Math.random() * 1000000)}`,
      location: `Lab-0${Math.floor(Math.random() * 5 + 1)} / Panel ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
      status: 'Operasyonel',
      efficiency: Math.floor(Math.random() * 20 + 80), // 80-100
      lastMaintenance: new Date().toLocaleDateString('tr-TR'),
      createdAt: new Date().getTime()
    };
    
    const updated = [newDevice, ...devices];
    setDevices(updated);
    localStorage.setItem('qr-devices', JSON.stringify(updated));
  };

  const clearDevices = () => {
    setDevices([]);
    localStorage.removeItem('qr-devices');
  }

  // Use the current local IP/hostname to generate QR
  const baseUrl = `${window.location.protocol}//${window.location.host}/device`;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Envanter Listesi</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Sisteme kayıtlı test cihazları ve QR kodları</p>
        </div>
        <div className="flex gap-md">
            <button onClick={clearDevices} className="flex items-center gap-xs border border-error text-error hover:bg-error-container/20 px-md py-sm rounded-lg font-label-md text-label-md transition-colors">
                <span className="material-symbols-outlined">delete</span>
                Temizle
            </button>
            <button onClick={createDevice} className="flex items-center gap-xs bg-primary text-on-primary hover:opacity-90 px-md py-sm rounded-lg font-label-md text-label-md transition-colors">
            <span className="material-symbols-outlined">add</span>
            Yeni Cihaz Oluştur
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-grid-gutter">
        {devices.map(device => (
          <div key={device.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm flex flex-col items-center">
            <div className="w-full flex justify-between items-start mb-md border-b border-surface-container-low pb-sm">
                <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">{device.id}</h3>
                    <p className="text-body-sm text-on-surface-variant">{device.name}</p>
                </div>
                <div className="bg-secondary-container text-on-secondary-container px-sm py-1 rounded-full text-xs font-bold">
                    {device.status}
                </div>
            </div>
            
            <div className="bg-white p-2 rounded-lg border border-outline-variant mb-md">
              <QRCodeSVG value={`${baseUrl}/${device.id}`} size={160} />
            </div>
            
            <p className="text-xs text-on-surface-variant text-center break-all mb-md bg-surface-container-low p-2 rounded w-full">
              {`${baseUrl}/${device.id}`}
            </p>

            <Link to={`/device/${device.id}`} className="w-full flex justify-center items-center gap-xs border border-primary text-primary hover:bg-primary-container/10 px-md py-sm rounded-lg font-label-md text-label-md transition-colors">
              <span className="material-symbols-outlined">visibility</span>
              Dashboard'u Aç
            </Link>
          </div>
        ))}
        {devices.length === 0 && (
            <div className="col-span-full py-xl text-center text-on-surface-variant bg-surface-container border border-dashed border-outline rounded-xl">
                <span className="material-symbols-outlined text-4xl mb-sm block opacity-50">qr_code_2</span>
                <p>Henüz kayıtlı cihaz bulunmuyor. Test için "Yeni Cihaz Oluştur" butonuna tıklayın.</p>
            </div>
        )}
      </div>
    </div>
  );
}
