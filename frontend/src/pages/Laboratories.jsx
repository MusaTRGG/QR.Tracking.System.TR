import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../supabaseService';

export default function Laboratories() {
  const { user } = useAuth();
  const [labs, setLabs] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [devices, setDevices] = useState([]);
  
  // Modals state
  const [isAddLabModalOpen, setAddLabModalOpen] = useState(false);
  const [isAddDeviceModalOpen, setAddDeviceModalOpen] = useState(false);
  
  // New Lab Form State
  const [newLabName, setNewLabName] = useState('');
  
  // New Device Form State
  const [deviceTemplate, setDeviceTemplate] = useState('custom');
  const [deviceName, setDeviceName] = useState('');
  const [deviceSerial, setDeviceSerial] = useState('');
  const [deviceStatus, setDeviceStatus] = useState('Operasyonel');
  const [deviceEfficiency, setDeviceEfficiency] = useState(100);
  const [deviceImage, setDeviceImage] = useState('');
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
        localStorage.setItem('qr-laboratories', JSON.stringify(currentLabs));
        localStorage.setItem('qr-devices', JSON.stringify(currentDevices));
        if (currentLabs.length > 0) {
          setActiveTab(currentLabs[0]);
        }
        success = true;
      }
    } catch (e) {
      console.warn("Backend connection failed, falling back to Supabase/localStorage", e);
    }

    if (!success && supabaseService.isConfigured()) {
      const cloudLabs = await supabaseService.getLaboratories();
      const cloudDevices = await supabaseService.getDevices();
      if (cloudLabs && cloudDevices) {
        currentLabs = cloudLabs;
        currentDevices = cloudDevices;
        setLabs(cloudLabs);
        setDevices(cloudDevices);
        localStorage.setItem('qr-laboratories', JSON.stringify(cloudLabs));
        localStorage.setItem('qr-devices', JSON.stringify(cloudDevices));
        if (cloudLabs.length > 0) {
          setActiveTab(cloudLabs[0]);
        }
        success = true;
      }
    }

    if (!success) {
      // LocalStorage fallback
      const savedLabs = localStorage.getItem('qr-laboratories');
      if (savedLabs) {
        currentLabs = JSON.parse(savedLabs);
      } else {
        currentLabs = ['PLC Labı', 'PC Labı', 'Elektronik Labı'];
        localStorage.setItem('qr-laboratories', JSON.stringify(currentLabs));
      }
      setLabs(currentLabs);
      if (currentLabs.length > 0) {
        setActiveTab(currentLabs[0]);
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

  // Update template selection
  useEffect(() => {
    if (deviceTemplate === 'plc-1200') {
      setDeviceName('Siemens S7-1200 CPU 1214C');
      setDeviceImage('');
      setDeviceSpecs('14 Dijital Giriş (24V DC), 10 Dijital Çıkış (Röle), 2 Analog Giriş (0-10V DC), Entegre Profinet Portu, 100 KB çalışma belleği.');
    } else if (deviceTemplate === 'plc-1500') {
      setDeviceName('Siemens S7-1500 CPU 1511-1 PN');
      setDeviceImage('');
      setDeviceSpecs('Ekranlı CPU, 150 KB program belleği, 1 MB veri belleği, 2 portlu switch içeren Profinet arayüzü, 60 ns bit işlem hızı.');
    } else if (deviceTemplate === 'schneider-m221') {
      setDeviceName('Schneider Modicon M221 TM221CE16R');
      setDeviceImage('');
      setDeviceSpecs('9 Dijital Giriş, 7 Röle Çıkışı, 2 Analog Giriş, Ethernet portu, USB mini-B programlama portu, SD kart yuvası.');
    } else if (deviceTemplate === 'custom') {
      setDeviceName('');
      setDeviceImage('');
      setDeviceSpecs('');
    }
  }, [deviceTemplate]);

  // Add a new laboratory tab
  const handleAddLab = async (e) => {
    e.preventDefault();
    const trimmed = newLabName.trim();
    if (!trimmed) return;

    if (labs.some(l => l.toLowerCase() === trimmed.toLowerCase())) {
      alert('Bu isimde bir laboratuvar zaten mevcut.');
      return;
    }

    let success = false;
    try {
      const res = await fetch('/api/laboratories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed })
      });
      if (res.ok) {
        const data = await res.json();
        setLabs(data);
        setActiveTab(trimmed);
        success = true;
      }
    } catch (e) {
      console.warn("Backend add lab failed, trying Supabase", e);
    }

    if (!success && supabaseService.isConfigured()) {
      const added = await supabaseService.addLaboratory(trimmed);
      if (added) {
        const updatedLabs = [...labs, trimmed];
        setLabs(updatedLabs);
        setActiveTab(trimmed);
        localStorage.setItem('qr-laboratories', JSON.stringify(updatedLabs));
        success = true;
      }
    }

    if (!success) {
      const updatedLabs = [...labs, trimmed];
      localStorage.setItem('qr-laboratories', JSON.stringify(updatedLabs));
      setLabs(updatedLabs);
      setActiveTab(trimmed);
    }

    setNewLabName('');
    setAddLabModalOpen(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDeviceImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add a new device directly to active laboratory
  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!deviceName.trim()) return;

    const newId = `PLC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const newDevice = {
      id: newId,
      name: deviceName,
      serial: deviceSerial || `SN-${Math.floor(Math.random() * 1000000)}`,
      location: activeTab, // Set location as the current active lab tab
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
          description: `Cihaz ${activeTab} bünyesine eklendi.`,
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
      console.warn("Backend add device failed, trying Supabase", e);
    }

    if (!success && supabaseService.isConfigured()) {
      const added = await supabaseService.addDevice(newDevice);
      if (added) {
        setDevices(prev => [added, ...prev]);
        success = true;
      }
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
    setDeviceImage('');
    setAddDeviceModalOpen(false);
    alert('Cihaz başarıyla bu laboratuvara eklendi.');
  };

  // Filter devices belonging to active lab
  const currentLabDevices = devices.filter(d => 
    d.location && d.location.toLowerCase().includes(activeTab.toLowerCase())
  );

  return (
    <div className="max-w-[1440px] mx-auto space-y-lg text-on-surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Laboratuvar Yönetimi</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Sınıf, atölye ve laboratuvar bazlı nesne yerleşimi ve yönetimi.</p>
        </div>
        <div className="flex gap-sm">
          <button 
            onClick={() => setAddLabModalOpen(true)}
            className="border border-outline text-on-surface hover:bg-surface-container-high px-md py-sm rounded-lg flex items-center gap-xs font-label-md text-label-md transition-colors"
          >
            <span className="material-symbols-outlined">add_box</span>
            Yeni Lab Ekle
          </button>
          <button 
            onClick={() => setAddDeviceModalOpen(true)}
            className="bg-primary text-on-primary hover:opacity-90 px-md py-sm rounded-lg flex items-center gap-xs font-label-md text-label-md transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined">add</span>
            Cihaz Ekle
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center border-b border-outline-variant bg-surface-container-low overflow-x-auto scrollbar-none">
          {labs.map((lab) => (
            <button
              key={lab}
              onClick={() => setActiveTab(lab)}
              className={`px-lg py-md font-label-md text-label-md whitespace-nowrap transition-all border-b-2 ${
                activeTab === lab 
                  ? 'text-primary border-primary font-bold bg-surface-container-lowest' 
                  : 'text-on-surface-variant border-transparent hover:bg-surface-container'
              }`}
            >
              {lab}
            </button>
          ))}
          <button 
            onClick={() => setAddLabModalOpen(true)}
            className="px-md py-md text-primary hover:bg-primary-container/10 flex items-center justify-center transition-colors"
            title="Yeni Laboratuvar Ekle"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-lg">
          <div className="flex justify-between items-center mb-lg">
            <h2 className="font-headline-md text-headline-md">{activeTab} Envanteri</h2>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Bu laboratuvarda <span className="font-bold">{currentLabDevices.length}</span> cihaz bulunuyor.
            </span>
          </div>

          {/* Device Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-grid-gutter">
            {currentLabDevices.map((dev) => (
              <div 
                key={dev.id} 
                className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group"
              >
                {/* Visual Area */}
                <div className="aspect-[4/3] bg-white relative overflow-hidden flex items-center justify-center p-md border-b border-outline-variant">
                  {dev.image ? (
                    <img 
                      src={dev.image} 
                      alt={dev.name} 
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-on-surface-variant gap-xs">
                      <span className="material-symbols-outlined text-[60px] opacity-40">developer_board</span>
                      <span className="font-label-sm text-label-sm">Görsel Yok</span>
                    </div>
                  )}
                  <div className="absolute top-sm right-sm">
                    <span className={`inline-flex items-center px-sm py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      dev.status === 'Operasyonel' ? 'bg-secondary-container text-on-secondary-container' :
                      dev.status === 'Bakımda' ? 'bg-tertiary-container text-on-tertiary-container' :
                      'bg-error-container text-on-error-container'
                    }`}>
                      {dev.status}
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-md flex-grow flex flex-col justify-between space-y-md">
                  <div>
                    <h3 className="font-label-md text-label-md text-on-surface line-clamp-1">{dev.name}</h3>
                    <p className="text-body-sm text-on-surface-variant mt-xs">ID: {dev.id}</p>
                    <p className="text-body-sm text-on-surface-variant">Seri No: {dev.serial}</p>
                  </div>

                  {/* Gauge/Bar */}
                  <div className="space-y-xs">
                    <div className="flex justify-between text-body-sm text-on-surface-variant">
                      <span>Verim Performansı</span>
                      <span className="font-bold">{dev.efficiency}%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          dev.efficiency < 70 ? 'bg-error' : 'bg-secondary'
                        }`}
                        style={{ width: `${dev.efficiency}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <Link 
                    to={`/device/${dev.id}`}
                    className="w-full flex items-center justify-center gap-xs bg-primary-container text-on-primary-container hover:bg-primary-container/85 px-md py-sm rounded-lg font-label-md text-label-md transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    Cihaz Panelini Aç
                  </Link>
                </div>
              </div>
            ))}

            {currentLabDevices.length === 0 && (
              <div className="col-span-full py-xl text-center text-on-surface-variant border border-dashed border-outline-variant rounded-xl p-lg bg-surface-container-low flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-4xl mb-sm block opacity-40">science</span>
                <h3 className="font-headline-md text-headline-md mb-xs">Laboratuvar Boş</h3>
                <p className="font-body-sm text-body-sm max-w-sm mb-md">Bu laboratuvar altında tanımlanmış herhangi bir cihaz bulunmamaktadır.</p>
                <button 
                  onClick={() => setAddDeviceModalOpen(true)}
                  className="bg-primary text-on-primary hover:opacity-90 px-md py-sm rounded-lg font-label-md text-label-md transition-all flex items-center gap-xs"
                >
                  <span className="material-symbols-outlined">add</span>
                  İlk Cihazı Ekle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Lab Modal */}
      {isAddLabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-md">
          <div className="bg-surface border border-outline-variant rounded-xl w-full max-w-[400px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-primary text-on-primary px-lg py-md flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md flex items-center gap-sm">
                <span className="material-symbols-outlined">add_box</span> Yeni Lab Ekle
              </h3>
              <button onClick={() => setAddLabModalOpen(false)} className="hover:opacity-75 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-lg space-y-md" onSubmit={handleAddLab}>
              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Laboratuvar Adı</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: PLC Labı, Bilişim Atölyesi..."
                  value={newLabName}
                  onChange={(e) => setNewLabName(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                />
              </div>
              <div className="flex justify-end gap-sm pt-sm border-t border-surface-container-highest">
                <button type="button" onClick={() => setAddLabModalOpen(false)} className="px-md py-sm font-label-md text-on-surface-variant hover:bg-surface-container rounded-lg">İptal</button>
                <button type="submit" className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:bg-primary-container transition-colors">Lab Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Device Modal */}
      {isAddDeviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-md">
          <div className="bg-surface border border-outline-variant rounded-xl w-full max-w-[550px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-primary text-on-primary px-lg py-md flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md flex items-center gap-sm">
                <span className="material-symbols-outlined">add</span> Cihaz Tanımla ({activeTab})
              </h3>
              <button onClick={() => setAddDeviceModalOpen(false)} className="hover:opacity-75 flex items-center justify-center">
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

              <div className="grid grid-cols-2 gap-md">
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
                  <label className="block font-label-sm text-on-surface-variant mb-xs">Cihaz Görseli</label>
                  <div className="flex items-center gap-sm">
                    {deviceImage ? (
                      <img src={deviceImage} alt="Önizleme" className="w-10 h-10 object-contain rounded border border-outline bg-white" />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center rounded border border-outline bg-surface-container-low text-on-surface-variant">
                        <span className="material-symbols-outlined text-[20px]">image</span>
                      </div>
                    )}
                    <label className="cursor-pointer bg-surface border border-outline-variant hover:bg-surface-container-high text-on-surface px-sm py-[7px] rounded-lg font-label-md text-label-md transition-colors flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[18px]">upload</span>
                      Görsel Seç
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>
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
                <button type="button" onClick={() => setAddDeviceModalOpen(false)} className="px-md py-sm font-label-md text-on-surface-variant hover:bg-surface-container rounded-lg">İptal</button>
                <button type="submit" className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:bg-primary-container transition-colors">Cihazı Ekle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
