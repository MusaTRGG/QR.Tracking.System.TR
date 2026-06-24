import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../supabaseService';

export default function DeviceDashboard() {
  const { id } = useParams();
  const { user } = useAuth();
  const [device, setDevice] = useState(null);
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'maintenance'
  const [isIssueModalOpen, setIssueModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  // Edit Cihaz Form State
  const [editName, setEditName] = useState('');
  const [editSerial, setEditSerial] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSpecs, setEditSpecs] = useState('');
  const [editImage, setEditImage] = useState('');

  // Hızlı İşlemler Form State
  const [issueType, setIssueType] = useState('Donanımsal Hata');
  const [issueDesc, setIssueDesc] = useState('');
  const [maintType, setMaintType] = useState('Periyodik Bakım');
  const [maintDesc, setMaintDesc] = useState('');

  // Minimal dummy PDF base64
  const dummyPdf = "data:application/pdf;base64,JVBERi0xLjEKJcKlwrHDqwoKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCgoyIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2VzCiAgICAgL0tpZHMgWzMgMCBSXQogICAgIC9Db3VudCAxCiAgICAgL01lZGlhQm94IFswIDAgMzAwIDE0UF0KICA+PgplbmRvYmoKCjMgMCBvYmoKICA8PCAgL1R5cGUgL1BhZ2UKICAgICAgL1BhcmVudCAyIDAgUgogICAgICAvUmVzb3VyY2VzCiAgICAgICA8PCAvRm9udAogICAgICAgICAgIDw8IC9GMQogICAgICAgICAgICAgICA8PCAvVHlwZSAvRm9udAogICAgICAgICAgICAgICAgICAvU3VidHlwZSAvVHlwZTEKICAgICAgICAgICAgICAgICAgL0Jhc2VGb250IC9UaW1lcy1Sb21hbgogICAgICAgICAgICAgICA+PgogICAgICAgICAgID4+CiAgICAgICA+PgogICAgICAvQ29udGVudHMgNCAwIFIKICA+PgplbmRvYmoKCjQgMCBvYmoKICA8PCAvTGVuZ3RoIDU1ID4+CnN0cmVhbQogIEJUCiAgICAvRjEgMTggVGYKICAgIDAgMCAwIHJnCiAgICAoVGVzdCBEb2N1bWVudCkgVGoKICBFVAplbmRzdHJlYW0KZW5kb2JqCgp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTggMDAwMDAgbiAKMDAwMDAwMDA3NyAwMDAwMCBuIAowMDAwMDAwMTgzIDAwMDAwIG4gCjAwMDAwMDA0NTcgMDAwMDAgbiAKdHJhaWxlcgogIDw8ICAvUm9vdCAxIDAgUgogICAgICAvU2l6ZSA1CiAgPj4Kc3RhcnR4cmVmCjU2NQolJUVPRgo=";

  const [loading, setLoading] = useState(true);

  const fetchDevice = async () => {
    setLoading(true);
    let success = false;
    let data = null;

    try {
      const response = await fetch(`/api/devices/${id}`);
      if (response.ok) {
        data = await response.json();
        success = true;
      }
    } catch (e) {
      console.warn("Backend connection failed, trying Supabase/localStorage", e);
    }

    if (!success && supabaseService.isConfigured()) {
      const cloudData = await supabaseService.getDeviceById(id);
      if (cloudData) {
        data = cloudData;
        success = true;
      }
    }

    if (success && data) {
      setDevice(data);
      setEditName(data.name || '');
      setEditSerial(data.serial || '');
      setEditLocation(data.location || '');
      setEditSpecs(data.specs || '');
      setEditImage(data.image || '');
      
      // Sync back to localStorage
      const saved = localStorage.getItem('qr-devices');
      if (saved) {
        const devices = JSON.parse(saved);
        const foundIdx = devices.findIndex(d => d.id === id);
        if (foundIdx !== -1) {
          devices[foundIdx] = data;
          localStorage.setItem('qr-devices', JSON.stringify(devices));
        }
      }
      setLoading(false);
      return;
    }

    // LocalStorage fallback
    const saved = localStorage.getItem('qr-devices');
    if (saved) {
      const devices = JSON.parse(saved);
      const found = devices.find(d => d.id === id);
      if (found) {
        setDevice(found);
        setEditName(found.name || '');
        setEditSerial(found.serial || '');
        setEditLocation(found.location || '');
        setEditSpecs(found.specs || '');
        setEditImage(found.image || '');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDevice();

    // Fluctuating efficiency (only UI fluctuation)
    const interval = setInterval(() => {
      setDevice(prev => {
        if (!prev) return prev;
        if (prev.status === 'Arızalı') return prev;
        const fluctuation = Math.floor(Math.random() * 5) - 2;
        let newEff = (prev.efficiency || 98) + fluctuation;
        if (newEff > 100) newEff = 100;
        if (newEff < 0) newEff = 0;
        return { ...prev, efficiency: newEff };
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div className="p-xl text-center text-on-surface">Yükleniyor...</div>;

  if (!device) {
    return (
      <div className="max-w-[600px] mx-auto text-center space-y-md py-xl">
        <span className="material-symbols-outlined text-error text-5xl">error</span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Cihaz Bulunamadı</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Aradığınız "{id}" ID'li cihaz veritabanında bulunamadı. Lütfen QR kodunun doğru olduğundan emin olun veya envanter sayfasından yeni bir cihaz ekleyin.
        </p>
        <Link to="/inventory" className="inline-flex items-center justify-center bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md hover:opacity-90 transition-all">
          Envantere Geri Dön
        </Link>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 56;
  const strokeDashoffset = circumference - ((device.efficiency || 0) / 100) * circumference;

  const updateDevice = async (updatedFields, newLog) => {
    let success = false;
    let finalDeviceState = null;
    try {
      let response;
      if (newLog) {
        response = await fetch(`/api/devices/${id}/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ log: newLog })
        });
      } else {
        response = await fetch(`/api/devices/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFields)
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        setDevice(data);
        finalDeviceState = data;
        success = true;
      }
    } catch (e) {
      console.warn("Backend update failed, trying Supabase", e);
    }

    if (!success && supabaseService.isConfigured()) {
      const currentDev = await supabaseService.getDeviceById(id);
      if (currentDev) {
        let updatedDevFields = { ...updatedFields };
        if (newLog) {
          let updatedEfficiency = currentDev.efficiency;
          let updatedStatus = currentDev.status;
          let updatedLastMaintenance = currentDev.lastMaintenance;
          
          if (newLog.type === 'Arıza Bildirimi') {
            updatedStatus = 'Arızalı';
            updatedEfficiency = Math.floor(Math.random() * 20 + 30);
          } else if (newLog.type === 'Bakım') {
            updatedStatus = 'Operasyonel';
            updatedEfficiency = 100;
            updatedLastMaintenance = newLog.date.split(' ')[0] || new Date().toLocaleDateString('tr-TR');
          } else if (newLog.type === 'Durum Güncelleme') {
            updatedStatus = 'Operasyonel';
            updatedEfficiency = 100;
          }
          
          updatedDevFields = {
            ...updatedDevFields,
            status: updatedStatus,
            efficiency: updatedEfficiency,
            lastMaintenance: updatedLastMaintenance,
            logs: [newLog, ...(currentDev.logs || [])]
          };
        }
        
        const updated = await supabaseService.updateDevice(id, updatedDevFields);
        if (updated) {
          setDevice(updated);
          finalDeviceState = updated;
          success = true;
        }
      }
    }

    // Sync to localStorage as fallback
    const saved = localStorage.getItem('qr-devices');
    if (saved) {
      const devices = JSON.parse(saved);
      const foundIdx = devices.findIndex(d => d.id === id);
      if (foundIdx !== -1) {
        if (success && finalDeviceState) {
          devices[foundIdx] = finalDeviceState;
        } else {
          const currentDev = devices[foundIdx];
          let updatedDev = { ...currentDev, ...updatedFields };
          if (newLog) {
            let updatedEfficiency = currentDev.efficiency;
            let updatedStatus = currentDev.status;
            let updatedLastMaintenance = currentDev.lastMaintenance;
            
            if (newLog.type === 'Arıza Bildirimi') {
              updatedStatus = 'Arızalı';
              updatedEfficiency = Math.floor(Math.random() * 20 + 30);
            } else if (newLog.type === 'Bakım') {
              updatedStatus = 'Operasyonel';
              updatedEfficiency = 100;
              updatedLastMaintenance = newLog.date.split(' ')[0] || new Date().toLocaleDateString('tr-TR');
            } else if (newLog.type === 'Durum Güncelleme') {
              updatedStatus = 'Operasyonel';
              updatedEfficiency = 100;
            }
            
            updatedDev = {
              ...currentDev,
              ...updatedFields,
              status: updatedStatus,
              efficiency: updatedEfficiency,
              lastMaintenance: updatedLastMaintenance,
              logs: [newLog, ...(currentDev.logs || [])]
            };
          }
          devices[foundIdx] = updatedDev;
          if (!success) {
            setDevice(updatedDev);
          }
        }
        localStorage.setItem('qr-devices', JSON.stringify(devices));
      }
    }
  };

  const handleStatusUpdate = () => {
    const newLog = {
      date: new Date().toLocaleString('tr-TR'),
      type: 'Durum Güncelleme',
      description: 'Durum: Operasyonel, Verim: %100',
      user: user?.name || 'Ahmet Y.'
    };
    updateDevice({ status: 'Operasyonel', efficiency: 100 }, newLog);
    alert('Cihaz verimi başarıyla kalibre edildi.');
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    const newLog = {
      date: new Date().toLocaleString('tr-TR'),
      type: 'Arıza Bildirimi',
      description: `Tür: ${issueType} - Açıklama: ${issueDesc}`,
      user: user?.name || 'Ahmet Y.'
    };
    updateDevice({ status: 'Arızalı' }, newLog);
    setIssueModalOpen(false);
    setIssueDesc('');
    alert('Arıza kaydı başarıyla oluşturuldu.');
  };

  const handleMaintenanceSubmit = (e) => {
    e.preventDefault();
    const newLog = {
      date: new Date().toLocaleString('tr-TR'),
      type: 'Bakım',
      description: `Yapılan İşlemler: ${maintDesc}`,
      maintenanceType: maintType,
      user: user?.name || 'Mehmet K.'
    };
    updateDevice({ status: 'Operasyonel', efficiency: 100, lastMaintenance: new Date().toLocaleDateString('tr-TR') }, newLog);
    setMaintenanceModalOpen(false);
    setMaintDesc('');
    alert('Bakım kaydı başarıyla oluşturuldu.');
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const newLog = {
      date: new Date().toLocaleString('tr-TR'),
      type: 'Bilgi Güncelleme',
      description: 'Cihaz bilgileri ve görseli kullanıcı tarafından güncellendi.',
      user: user?.name || 'Yönetici'
    };
    const updatedFields = {
      name: editName,
      serial: editSerial,
      location: editLocation,
      specs: editSpecs,
      image: editImage,
      logs: [newLog, ...(device.logs || [])]
    };
    updateDevice(updatedFields); // Note: Call without newLog to trigger a PUT update
    setEditModalOpen(false);
    alert('Cihaz bilgileri başarıyla güncellendi.');
  };

  const handleDeleteDevice = async () => {
    if (window.confirm("Bu cihazı envanterden kalıcı olarak silmek istediğinize emin misiniz?")) {
      let success = false;
      try {
        const response = await fetch(`/api/devices/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          success = true;
        }
      } catch (e) {
        console.warn("Backend delete failed, trying Supabase", e);
      }

      if (!success && supabaseService.isConfigured()) {
        const deleted = await supabaseService.deleteDevice(id);
        if (deleted) {
          success = true;
        }
      }

      // Sync with localStorage
      const saved = localStorage.getItem('qr-devices');
      if (saved) {
        const devices = JSON.parse(saved);
        const filtered = devices.filter(d => d.id !== id);
        localStorage.setItem('qr-devices', JSON.stringify(filtered));
      }

      alert("Cihaz envanterden silindi.");
      window.location.href = '/inventory';
    }
  };

  // Filter logs based on active tab
  const filteredLogs = activeTab === 'history' 
    ? (device.logs || []) 
    : (device.logs || []).filter(log => log.type === 'Bakım');

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <div className="flex items-center gap-sm">
            <h1 className="font-headline-xl text-headline-xl text-on-surface">{device.name}</h1>
            <button 
              onClick={() => setEditModalOpen(true)}
              className="text-on-surface-variant hover:text-primary p-xs rounded-full hover:bg-surface-container-high transition-colors flex items-center justify-center"
              title="Cihaz Bilgilerini Düzenle"
            >
              <span className="material-symbols-outlined text-[24px]">edit</span>
            </button>
            <button 
              onClick={handleDeleteDevice}
              className="text-on-surface-variant hover:text-error p-xs rounded-full hover:bg-surface-container-high transition-colors flex items-center justify-center"
              title="Cihazı Sil"
            >
              <span className="material-symbols-outlined text-[24px]">delete</span>
            </button>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">ID: {device.id}</p>
        </div>
        <div className="flex items-center bg-secondary-container text-on-secondary-container px-md py-xs rounded-full gap-xs w-fit">
          <span className={`w-2 h-2 rounded-full ${device.status === 'Operasyonel' ? 'bg-secondary' : device.status === 'Bakımda' ? 'bg-tertiary' : 'bg-error'}`}></span>
          <span className="font-label-md text-label-md">{device.status}</span>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-grid-gutter">
        
        {/* Product Photo Card */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col items-center justify-center shadow-sm">
          <div className="w-full aspect-square relative mb-md bg-white rounded-lg flex items-center justify-center overflow-hidden border border-outline-variant">
            {device.image ? (
              <img 
                className="object-contain max-h-[280px] w-full h-full" 
                alt={device.name} 
                src={device.image} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-on-surface-variant gap-sm">
                <span className="material-symbols-outlined text-[80px] opacity-40">developer_board</span>
                <span className="font-label-md text-label-md">Görsel Eklenmemiş</span>
              </div>
            )}
          </div>
          <a href={dummyPdf} download={`${device.id}_dokuman.pdf`} className="w-full flex items-center justify-center gap-sm border border-primary text-primary hover:bg-primary-container/10 px-md py-sm rounded-lg font-label-md text-label-md transition-colors">
            <span className="material-symbols-outlined">download</span>
            Teknik Dokümanı İndir
          </a>
        </div>

        {/* Stats & Info Grid */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-grid-gutter">
          
          {/* General Info Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-headline-md text-headline-md mb-md border-b border-outline-variant pb-sm">Genel Bilgi</h3>
              <div className="space-y-md">
                <div className="flex justify-between items-center py-xs border-b border-surface-container-low">
                  <span className="text-on-surface-variant font-label-md text-label-md">Cihaz Adı:</span>
                  <span className="text-on-surface font-body-md text-body-md">{device.name}</span>
                </div>
                <div className="flex justify-between items-center py-xs border-b border-surface-container-low">
                  <span className="text-on-surface-variant font-label-md text-label-md">Seri No:</span>
                  <span className="text-on-surface font-body-md text-body-md">{device.serial}</span>
                </div>
                <div className="flex justify-between items-center py-xs border-b border-surface-container-low">
                  <span className="text-on-surface-variant font-label-md text-label-md">Konum:</span>
                  <span className="text-on-surface font-body-md text-body-md">{device.location}</span>
                </div>
                <div className="flex justify-between items-center py-xs">
                  <span className="text-on-surface-variant font-label-md text-label-md">Son Bakım:</span>
                  <span className="text-on-surface font-body-md text-body-md">{device.lastMaintenance}</span>
                </div>
              </div>
            </div>
            {device.specs && (
              <div className="mt-lg pt-md border-t border-outline-variant">
                <h4 className="font-label-md text-label-md text-on-surface-variant uppercase mb-xs tracking-wider">Teknik Özellikler</h4>
                <p className="text-body-md text-on-surface bg-surface-container-low p-sm rounded-lg whitespace-pre-wrap font-mono text-[13px]">{device.specs}</p>
              </div>
            )}
          </div>

          {/* Status Gauge Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col">
            <h3 className="font-headline-md text-headline-md mb-md">Durum Değişkenleri</h3>
            <div className="flex-grow flex flex-col items-center justify-center py-md relative">
              {/* Circular Gauge Representation */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 transition-all duration-1000 ease-in-out">
                  <circle className="text-surface-container-highest" cx="64" cy="64" fill="transparent" r="56" stroke="currentColor" strokeWidth="8"></circle>
                  <circle 
                    className={`${device.efficiency < 70 ? 'text-error' : device.status === 'Arızalı' ? 'text-error' : 'text-secondary'} transition-all duration-1000 ease-in-out`} 
                    cx="64" cy="64" fill="transparent" r="56" stroke="currentColor" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset} 
                    strokeWidth="8"
                    strokeLinecap="round"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`font-headline-lg text-headline-lg ${device.efficiency < 70 ? 'text-error' : device.status === 'Arızalı' ? 'text-error' : 'text-secondary'} transition-colors duration-1000`}>
                    {device.efficiency}%
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Verim</span>
                </div>
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-sm animate-pulse">Canlı Veri</p>
            </div>
            <div className="mt-auto grid grid-cols-1 gap-sm pt-md">
              <button onClick={handleStatusUpdate} className="bg-primary text-on-primary hover:opacity-90 px-md py-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-sm transition-opacity">
                <span className="material-symbols-outlined">sync</span>
                DURUMU KALİBRE ET
              </button>
            </div>
          </div>

          {/* Fast Actions Card */}
          <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-md tracking-wider">Hızlı İşlemler</h3>
            <div className="flex flex-wrap gap-md">
              <button onClick={() => setIssueModalOpen(true)} className="flex-1 min-w-[200px] flex items-center justify-center gap-md border border-error text-error hover:bg-error-container/20 px-md py-sm rounded-lg font-label-md text-label-md transition-colors">
                <span className="material-symbols-outlined">report_problem</span>
                Arıza Bildir
              </button>
              <button onClick={() => setMaintenanceModalOpen(true)} className="flex-1 min-w-[200px] flex items-center justify-center gap-md border border-primary text-primary hover:bg-primary-container/10 px-md py-sm rounded-lg font-label-md text-label-md transition-colors">
                <span className="material-symbols-outlined">engineering</span>
                Bakım Kaydı Oluştur
              </button>
            </div>
          </div>

        </div>

        {/* Tabbed Table Section */}
        <div className="col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="flex border-b border-outline-variant bg-surface-container-low">
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-lg py-md font-label-md text-label-md transition-colors border-b-2 ${activeTab === 'history' ? 'text-primary border-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container border-transparent'}`}
            >
              Geçmiş Kayıtlar
            </button>
            <button 
              onClick={() => setActiveTab('maintenance')}
              className={`px-lg py-md font-label-md text-label-md transition-colors border-b-2 ${activeTab === 'maintenance' ? 'text-primary border-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container border-transparent'}`}
            >
              Bakım Detayları
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase">Tarih</th>
                  <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase">{activeTab === 'history' ? 'İşlem' : 'Bakım Türü'}</th>
                  <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase">Açıklama</th>
                  <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase text-right">Kullanıcı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-md font-body-md text-body-md whitespace-nowrap">{log.date}</td>
                    <td className="px-lg py-md font-body-md text-body-md whitespace-nowrap">
                      <span className={`inline-flex items-center gap-xs px-sm py-1 rounded-full text-xs font-semibold ${
                        log.type === 'Arıza Bildirimi' ? 'bg-error-container text-on-error-container' :
                        log.type === 'Bakım' ? 'bg-primary-container text-on-primary-container' :
                        log.type === 'Durum Güncelleme' ? 'bg-secondary-container text-on-secondary-container' :
                        'bg-surface-container-highest text-on-surface'
                      }`}>
                        {activeTab === 'history' ? log.type : (log.maintenanceType || 'Periyodik Bakım')}
                      </span>
                    </td>
                    <td className="px-lg py-md font-body-md text-body-md text-on-surface-variant">{log.description}</td>
                    <td className="px-lg py-md font-body-md text-body-md text-right whitespace-nowrap">{log.user}</td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-lg py-xl text-center text-on-surface-variant">
                      Kayıt bulunmuyor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Info Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-md">
            <div className="bg-surface border border-outline-variant rounded-xl w-full max-w-[550px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 text-on-surface">
                <div className="bg-primary text-on-primary px-lg py-md flex justify-between items-center">
                    <h3 className="font-headline-md text-headline-md flex items-center gap-sm">
                        <span className="material-symbols-outlined">edit</span> Cihaz Bilgilerini Düzenle
                    </h3>
                    <button onClick={() => setEditModalOpen(false)} className="hover:opacity-70 flex items-center justify-center">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form className="p-lg space-y-md" onSubmit={handleEditSubmit}>
                    <div>
                        <label className="block font-label-sm text-on-surface-variant mb-xs">Cihaz Adı</label>
                        <input 
                          type="text" 
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                        />
                    </div>
                    <div>
                        <label className="block font-label-sm text-on-surface-variant mb-xs">Seri Numarası</label>
                        <input 
                          type="text" 
                          required
                          value={editSerial}
                          onChange={(e) => setEditSerial(e.target.value)}
                          className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                        />
                    </div>
                    <div>
                        <label className="block font-label-sm text-on-surface-variant mb-xs">Konum (Laboratuvar)</label>
                        <input 
                          type="text" 
                          required
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                          placeholder="Örn: PLC Labı"
                        />
                    </div>
                    <div>
                        <label className="block font-label-sm text-on-surface-variant mb-xs">Cihaz Görseli (Fotoğraf)</label>
                        <div className="flex items-center gap-sm">
                            {editImage ? (
                                <img src={editImage} alt="Önizleme" className="w-12 h-12 object-contain rounded border border-outline bg-white" />
                            ) : (
                                <div className="w-12 h-12 flex items-center justify-center rounded border border-outline bg-surface-container-low text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[24px]">image</span>
                                </div>
                            )}
                            <label className="cursor-pointer bg-surface border border-outline-variant hover:bg-surface-container-high text-on-surface px-sm py-[7px] rounded-lg font-label-md text-label-md transition-colors flex items-center gap-xs">
                                <span className="material-symbols-outlined text-[18px]">upload</span>
                                Görsel Yükle / Değiştir
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleEditImageChange} 
                                  className="hidden" 
                                />
                            </label>
                            {editImage && (
                                <button 
                                  type="button" 
                                  onClick={() => setEditImage('')}
                                  className="text-error hover:bg-error-container/10 px-sm py-xs rounded font-label-sm text-label-sm transition-colors"
                                >
                                  Görseli Kaldır
                                </button>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block font-label-sm text-on-surface-variant mb-xs">Teknik Özellikler</label>
                        <textarea 
                          rows="4" 
                          value={editSpecs}
                          onChange={(e) => setEditSpecs(e.target.value)}
                          className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                          placeholder="Teknik özellikleri buraya yazabilirsiniz..."
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-sm pt-sm border-t border-surface-container-highest">
                        <button type="button" onClick={() => setEditModalOpen(false)} className="px-md py-sm font-label-md text-on-surface-variant hover:bg-surface-container rounded-lg">İptal</button>
                        <button type="submit" className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors">Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Issue Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-md">
            <div className="bg-surface border border-outline-variant rounded-xl w-full max-w-[500px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 text-on-surface">
                <div className="bg-error text-on-error px-lg py-md flex justify-between items-center">
                    <h3 className="font-headline-md text-headline-md flex items-center gap-sm">
                        <span className="material-symbols-outlined">report_problem</span> Arıza Bildir
                    </h3>
                    <button onClick={() => setIssueModalOpen(false)} className="hover:opacity-70 flex items-center justify-center">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form className="p-lg space-y-md" onSubmit={handleIssueSubmit}>
                    <div>
                        <label className="block font-label-sm text-on-surface-variant mb-xs">Arıza Türü</label>
                        <select 
                          value={issueType}
                          onChange={(e) => setIssueType(e.target.value)}
                          className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-error outline-none text-body-md text-on-surface"
                        >
                            <option value="Donanımsal Hata">Donanımsal Hata</option>
                            <option value="Yazılımsal Hata">Yazılımsal Hata</option>
                            <option value="Bağlantı Sorunu">Bağlantı Sorunu</option>
                            <option value="Diğer">Diğer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-label-sm text-on-surface-variant mb-xs">Açıklama</label>
                        <textarea 
                          required 
                          rows="4" 
                          value={issueDesc}
                          onChange={(e) => setIssueDesc(e.target.value)}
                          className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-error outline-none text-body-md text-on-surface" 
                          placeholder="Arıza detaylarını buraya yazın..."
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-sm pt-sm border-t border-surface-container-highest">
                        <button type="button" onClick={() => setIssueModalOpen(false)} className="px-md py-sm font-label-md text-on-surface-variant hover:bg-surface-container rounded-lg">İptal</button>
                        <button type="submit" className="bg-error text-on-error px-md py-sm rounded-lg font-label-md hover:bg-error-container hover:text-on-error-container transition-colors">Gönder</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-md">
            <div className="bg-surface border border-outline-variant rounded-xl w-full max-w-[500px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 text-on-surface">
                <div className="bg-primary text-on-primary px-lg py-md flex justify-between items-center">
                    <h3 className="font-headline-md text-headline-md flex items-center gap-sm">
                        <span className="material-symbols-outlined">engineering</span> Bakım Kaydı Oluştur
                    </h3>
                    <button onClick={() => setMaintenanceModalOpen(false)} className="hover:opacity-75 flex items-center justify-center">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form className="p-lg space-y-md" onSubmit={handleMaintenanceSubmit}>
                    <div>
                        <label className="block font-label-sm text-on-surface-variant mb-xs">Bakım Türü</label>
                        <select 
                          value={maintType}
                          onChange={(e) => setMaintType(e.target.value)}
                          className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                        >
                            <option value="Periyodik Bakım">Periyodik Bakım</option>
                            <option value="Parça Değişimi">Parça Değişimi</option>
                            <option value="Kalibrasyon">Kalibrasyon</option>
                            <option value="Diğer">Diğer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-label-sm text-on-surface-variant mb-xs">Yapılan İşlemler</label>
                        <textarea 
                          required 
                          rows="4" 
                          value={maintDesc}
                          onChange={(e) => setMaintDesc(e.target.value)}
                          className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface" 
                          placeholder="Uygulanan bakım adımlarını detaylandırın..."
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-sm pt-sm border-t border-surface-container-highest">
                        <button type="button" onClick={() => setMaintenanceModalOpen(false)} className="px-md py-sm font-label-md text-on-surface-variant hover:bg-surface-container rounded-lg">İptal</button>
                        <button type="submit" className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors">Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
