import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Inventory() {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [labs, setLabs] = useState([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLocation, setSearchLocation] = useState('Tüm Lablar');
  const [searchStatus, setSearchStatus] = useState('Herkes');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Add Device Modal State
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [deviceTemplate, setDeviceTemplate] = useState('custom');
  const [deviceName, setDeviceName] = useState('');
  const [deviceSerial, setDeviceSerial] = useState('');
  const [deviceLocation, setDeviceLocation] = useState('');
  const [deviceStatus, setDeviceStatus] = useState('Operasyonel');
  const [deviceEfficiency, setDeviceEfficiency] = useState(100);
  const [deviceImage, setDeviceImage] = useState('/plc_1.jpeg');
  const [deviceSpecs, setDeviceSpecs] = useState('');

  const fetchLabsAndDevices = async () => {
    let currentLabs = [];
    let currentDevices = [];
    let success = false;
    
    try {
      const labsRes = await fetch('/api/laboratories');
      const devicesRes = await fetch('/api/devices');
      if (labsRes.ok && devicesRes.ok) {
        currentLabs = await labsRes.json();
        currentDevices = await devicesRes.json();
        setLabs(currentLabs);
        setDevices(currentDevices);
        if (currentLabs.length > 0) {
          setDeviceLocation(currentLabs[0]);
        }
        success = true;
      }
    } catch (e) {
      console.warn("Backend connection failed, falling back to localStorage", e);
    }

    if (!success) {
      // LocalStorage fallback
      const savedLabs = localStorage.getItem('qr-laboratories');
      if (savedLabs) {
        currentLabs = JSON.parse(savedLabs);
      } else {
        currentLabs = ['PLC Labı', 'PC Labı', 'Elektronik Labı'];
      }
      setLabs(currentLabs);
      if (currentLabs.length > 0) {
        setDeviceLocation(currentLabs[0]);
      }

      const savedDevices = localStorage.getItem('qr-devices');
      if (savedDevices) {
        currentDevices = JSON.parse(savedDevices);
        setDevices(currentDevices);
      }
    }
  };

  useEffect(() => {
    fetchLabsAndDevices();
  }, []);

  // Update form fields based on template selection
  useEffect(() => {
    if (deviceTemplate === 'plc-1200') {
      setDeviceName('Siemens S7-1200 CPU 1214C');
      setDeviceImage('/plc_1.jpeg');
      setDeviceSpecs('14 Dijital Giriş (24V DC), 10 Dijital Çıkış (Röle), 2 Analog Giriş (0-10V DC), Entegre Profinet Portu, 100 KB çalışma belleği.');
    } else if (deviceTemplate === 'plc-1500') {
      setDeviceName('Siemens S7-1500 CPU 1511-1 PN');
      setDeviceImage('/plc_2.jpeg');
      setDeviceSpecs('Ekranlı CPU, 150 KB program belleği, 1 MB veri belleği, 2 portlu switch içeren Profinet arayüzü, 60 ns bit işlem hızı.');
    } else if (deviceTemplate === 'schneider-m221') {
      setDeviceName('Schneider Modicon M221 TM221CE16R');
      setDeviceImage('/plc_3.jpeg');
      setDeviceSpecs('9 Dijital Giriş, 7 Röle Çıkışı, 2 Analog Giriş, Ethernet portu, USB mini-B programlama portu, SD kart yuvası.');
    } else if (deviceTemplate === 'custom') {
      setDeviceName('');
      setDeviceImage('/plc_1.jpeg');
      setDeviceSpecs('');
    }
  }, [deviceTemplate]);

  // Filter Logic
  const filteredDevices = devices.filter(d => {
    const matchesSearch = !searchTerm || 
      (d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.id && d.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.serial && d.serial.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesLocation = searchLocation === 'Tüm Lablar' ||
      (d.location && d.location.toLowerCase() === searchLocation.toLowerCase());
      
    const matchesStatus = searchStatus === 'Herkes' ||
      (d.status && d.status.toLowerCase() === searchStatus.toLowerCase());
      
    return matchesSearch && matchesLocation && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage) || 1;
  const currentDevices = filteredDevices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSearchLocation('Tüm Lablar');
    setSearchStatus('Herkes');
    setCurrentPage(1);
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!deviceName.trim()) return;

    const newId = `PLC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const newDevice = {
      id: newId,
      name: deviceName,
      serial: deviceSerial || `SN-${Math.floor(Math.random() * 1000000)}`,
      location: deviceLocation,
      status: deviceStatus,
      efficiency: parseInt(deviceEfficiency) || 100,
      lastMaintenance: new Date().toLocaleDateString('tr-TR'),
      image: deviceImage,
      specs: deviceSpecs,
      manager: user?.name || 'Ahmet Y.',
      date: new Date().toLocaleDateString('tr-TR'),
      logs: [
        {
          date: new Date().toLocaleString('tr-TR'),
          type: 'Sistem',
          description: `Cihaz ${deviceLocation} bünyesine eklendi.`,
          user: user?.name || 'Sistem'
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
      console.warn("Backend add device failed, sync to localStorage only", e);
    }

    // Sync to localStorage
    const saved = localStorage.getItem('qr-devices');
    const localDevs = saved ? JSON.parse(saved) : [];
    const updatedDevices = [newDevice, ...localDevs];
    localStorage.setItem('qr-devices', JSON.stringify(updatedDevices));
    if (!success) {
      setDevices(updatedDevices);
    }

    // Reset Form
    setDeviceTemplate('custom');
    setDeviceName('');
    setDeviceSerial('');
    setDeviceStatus('Operasyonel');
    setDeviceEfficiency(100);
    setDeviceSpecs('');
    setAddModalOpen(false);
    alert('Cihaz başarıyla envantere eklendi.');
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-lg text-on-surface">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Cihaz Envanteri</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Laboratuvar genelindeki tüm aktif ve pasif cihazların listesi.</p>
        </div>
        <button 
          onClick={() => setAddModalOpen(true)}
          className="bg-primary text-on-primary px-lg py-sm rounded-lg flex items-center gap-sm font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined">add</span>
          Yeni Cihaz Ekle
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md items-end">
          <div className="space-y-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Cihaz Ara</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input 
                className="w-full pl-xl pr-sm py-sm border border-outline-variant rounded-lg text-body-md bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface" 
                placeholder="Model, ID veya Seri No..." 
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          
          <div className="space-y-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Konum</label>
            <select 
              className="w-full px-sm py-sm border border-outline-variant rounded-lg text-body-md bg-surface-container-low focus:ring-2 focus:ring-primary outline-none text-on-surface"
              value={searchLocation}
              onChange={(e) => { setSearchLocation(e.target.value); setCurrentPage(1); }}
            >
              <option value="Tüm Lablar">Tüm Lablar</option>
              {labs.map(lab => (
                <option key={lab} value={lab}>{lab}</option>
              ))}
            </select>
          </div>

          <div className="space-y-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Durum</label>
            <select 
              className="w-full px-sm py-sm border border-outline-variant rounded-lg text-body-md bg-surface-container-low focus:ring-2 focus:ring-primary outline-none text-on-surface"
              value={searchStatus}
              onChange={(e) => { setSearchStatus(e.target.value); setCurrentPage(1); }}
            >
              <option value="Herkes">Herkes</option>
              <option value="Operasyonel">Operasyonel</option>
              <option value="Bakımda">Bakımda</option>
              <option value="Arızalı">Arızalı</option>
            </select>
          </div>

          <div className="flex gap-sm">
            <button 
              onClick={handleClearFilters}
              className="w-full py-sm px-md border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Görsel</th>
                <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Cihaz Adı / ID</th>
                <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Konum</th>
                <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Sorumlu</th>
                <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Son İşlem</th>
                <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Durum</th>
                <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {currentDevices.map((device, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-lg py-sm">
                    <img className="w-12 h-12 object-contain rounded-lg border border-outline-variant bg-white" alt={device.name} src={device.image || '/plc_1.jpeg'} />
                  </td>
                  <td className="px-lg py-md max-w-[250px]">
                    <div className="font-label-md text-label-md text-on-surface truncate">{device.name}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant truncate">{device.id} (S/N: {device.serial})</div>
                  </td>
                  <td className="px-lg py-md font-body-md text-body-md text-on-surface">{device.location}</td>
                  <td className="px-lg py-md font-body-md text-body-md text-on-surface">{device.manager}</td>
                  <td className="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">{device.date || device.lastMaintenance}</td>
                  <td className="px-lg py-md">
                    <span className={`inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm ${
                      device.status === 'Operasyonel' ? 'bg-secondary-container text-on-secondary-container' :
                      device.status === 'Bakımda' ? 'bg-tertiary-container text-on-tertiary-container' :
                      'bg-error-container text-on-error-container'
                    }`}>
                      {device.status}
                    </span>
                  </td>
                  <td className="px-lg py-md text-right">
                    <Link to={`/device/${device.id}`} className="inline-block text-primary hover:bg-primary-container/10 px-md py-sm rounded-lg font-label-md text-label-md transition-colors">
                      Gözat
                    </Link>
                  </td>
                </tr>
              ))}
              {currentDevices.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-lg py-xl text-center text-on-surface-variant">
                    Aranan kriterlere uygun cihaz bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-lg py-md bg-surface-container-low border-t border-outline-variant flex flex-col sm:flex-row gap-sm items-center justify-between">
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            Toplam <span className="font-bold">{filteredDevices.length}</span> cihaz listeleniyor. (Sayfa {currentPage}/{totalPages})
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-base">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                 <button 
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border font-label-sm text-label-sm transition-colors ${currentPage === page ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant hover:bg-surface-container-high text-on-surface'}`}
                >
                  {page}
                </button>
              ))}
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Device Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-md text-on-surface">
          <div className="bg-surface border border-outline-variant rounded-xl w-full max-w-[550px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-primary text-on-primary px-lg py-md flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md flex items-center gap-sm">
                <span className="material-symbols-outlined">add</span> Yeni Cihaz Tanımla
              </h3>
              <button onClick={() => setAddModalOpen(false)} className="hover:opacity-75 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-lg space-y-md" onSubmit={handleAddDevice}>
              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Hazır Şablon Kullan</label>
                <select 
                  value={deviceTemplate}
                  onChange={(e) => setDeviceTemplate(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                >
                  <option value="custom">Özel Tanımlı Boş Cihaz</option>
                  <option value="plc-1200">Siemens S7-1200 PLC Şablonu</option>
                  <option value="plc-1500">Siemens S7-1500 PLC Şablonu</option>
                  <option value="schneider-m221">Schneider Modicon M221 Şablonu</option>
                </select>
              </div>

              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Cihaz Adı</label>
                <input 
                  type="text" 
                  required
                  placeholder="Cihaz model veya ismini girin..."
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="block font-label-sm text-on-surface-variant mb-xs">Seri Numarası</label>
                  <input 
                    type="text" 
                    placeholder="Örn: SN-123456"
                    value={deviceSerial}
                    onChange={(e) => setDeviceSerial(e.target.value)}
                    className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-on-surface-variant mb-xs">Başlangıç Verimi (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={deviceEfficiency}
                    onChange={(e) => setDeviceEfficiency(e.target.value)}
                    className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-md">
                <div>
                  <label className="block font-label-sm text-on-surface-variant mb-xs">Konum (Lab)</label>
                  <select 
                    value={deviceLocation}
                    onChange={(e) => setDeviceLocation(e.target.value)}
                    className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                  >
                    {labs.map(lab => (
                      <option key={lab} value={lab}>{lab}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-label-sm text-on-surface-variant mb-xs">Durum</label>
                  <select 
                    value={deviceStatus}
                    onChange={(e) => setDeviceStatus(e.target.value)}
                    className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                  >
                    <option value="Operasyonel">Operasyonel</option>
                    <option value="Bakımda">Bakımda</option>
                    <option value="Arızalı">Arızalı</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-sm text-on-surface-variant mb-xs">Görsel Seçimi</label>
                  <select 
                    value={deviceImage}
                    onChange={(e) => setDeviceImage(e.target.value)}
                    className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                  >
                    <option value="/plc_1.jpeg">Görsel 1 (Siemens S7-1200)</option>
                    <option value="/plc_2.jpeg">Görsel 2 (Siemens S7-1500)</option>
                    <option value="/plc_3.jpeg">Görsel 3 (Schneider Modicon)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Teknik Özellikler</label>
                <textarea 
                  rows="3"
                  placeholder="Kanal bilgileri, çalışma hızı vb. özellikleri yazın..."
                  value={deviceSpecs}
                  onChange={(e) => setDeviceSpecs(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                ></textarea>
              </div>

              <div className="flex justify-end gap-sm pt-sm border-t border-surface-container-highest">
                <button type="button" onClick={() => setAddModalOpen(false)} className="px-md py-sm font-label-md text-on-surface-variant hover:bg-surface-container rounded-lg">İptal</button>
                <button type="submit" className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:bg-primary-container transition-colors">Cihazı Ekle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
