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
  const [deviceAuthor, setDeviceAuthor] = useState('');
  const [deviceStatus, setDeviceStatus] = useState('Müsait');
  const [deviceImage, setDeviceImage] = useState('');
  const [deviceSpecs, setDeviceSpecs] = useState('');

  const fetchLabsAndDevices = async () => {
    let currentLabs = [];
    let currentDevices = [];
    let success = false;
    
    try {
      const labsRes = await fetch('/api/libraries');
      const devicesRes = await fetch('/api/books');
      if (labsRes.ok && devicesRes.ok) {
        currentLabs = await labsRes.json();
        currentDevices = await devicesRes.json();
        setLabs(currentLabs);
        setDevices(currentDevices);
        localStorage.setItem('qr-libraries', JSON.stringify(currentLabs));
        localStorage.setItem('qr-books', JSON.stringify(currentDevices));
        if (currentLabs.length > 0) {
          setActiveTab(currentLabs[0]);
        }
        success = true;
      }
    } catch (e) {
      console.warn("Backend connection failed, falling back to Supabase/localStorage", e);
    }

    if (!success && supabaseService.isConfigured()) {
      const cloudLabs = await supabaseService.getLibraries();
      const cloudDevices = await supabaseService.getBooks();
      if (cloudLabs && cloudDevices) {
        currentLabs = cloudLabs;
        currentDevices = cloudDevices;
        setLabs(cloudLabs);
        setDevices(cloudDevices);
        localStorage.setItem('qr-libraries', JSON.stringify(cloudLabs));
        localStorage.setItem('qr-books', JSON.stringify(cloudDevices));
        if (cloudLabs.length > 0) {
          setActiveTab(cloudLabs[0]);
        }
        success = true;
      }
    }

    if (!success) {
      // LocalStorage fallback
      const savedLabs = localStorage.getItem('qr-libraries');
      if (savedLabs) {
        currentLabs = JSON.parse(savedLabs);
      } else {
        currentLabs = ['Beylikdüzü Kütüphanesi', 'Esenyurt Kütüphanesi', 'Avcılar Kütüphanesi'];
        localStorage.setItem('qr-libraries', JSON.stringify(currentLabs));
      }
      setLabs(currentLabs);
      if (currentLabs.length > 0) {
        setActiveTab(currentLabs[0]);
      }

      const savedDevices = localStorage.getItem('qr-books');
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
    if (deviceTemplate === 'nutuk') {
      setDeviceName('Nutuk');
      setDeviceAuthor('Mustafa Kemal Atatürk');
      setDeviceImage('');
      setDeviceSpecs('Türkiye Cumhuriyeti\'nin kuruluşunu anlatan tarihi eser.');
    } else if (deviceTemplate === 'sucveceza') {
      setDeviceName('Suç ve Ceza');
      setDeviceAuthor('Fyodor Dostoyevski');
      setDeviceImage('');
      setDeviceSpecs('Dostoyevski\'nin vicdan ve ceza konulu ünlü romanı.');
    } else if (deviceTemplate === 'simyaci') {
      setDeviceName('Simyacı');
      setDeviceAuthor('Paulo Coelho');
      setDeviceImage('');
      setDeviceSpecs('Kişisel efsanesini arayan bir çobanın öyküsü.');
    } else if (deviceTemplate === 'custom') {
      setDeviceName('');
      setDeviceAuthor('');
      setDeviceImage('');
      setDeviceSpecs('');
    }
  }, [deviceTemplate]);

  // Add a new library branch tab
  const handleAddLab = async (e) => {
    e.preventDefault();
    const trimmed = newLabName.trim();
    if (!trimmed) return;

    if (labs.some(l => l.toLowerCase() === trimmed.toLowerCase())) {
      alert('Bu isimde bir kütüphane şubesi zaten mevcut.');
      return;
    }

    let success = false;
    try {
      const res = await fetch('/api/libraries', {
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
      console.warn("Backend add library failed, trying Supabase", e);
    }

    if (!success && supabaseService.isConfigured()) {
      const added = await supabaseService.addLibrary(trimmed);
      if (added) {
        const updatedLabs = [...labs, trimmed];
        setLabs(updatedLabs);
        setActiveTab(trimmed);
        localStorage.setItem('qr-libraries', JSON.stringify(updatedLabs));
        success = true;
      }
    }

    if (!success) {
      const updatedLabs = [...labs, trimmed];
      localStorage.setItem('qr-libraries', JSON.stringify(updatedLabs));
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

  // Add a new book directly to active library
  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!deviceName.trim()) return;

    const newId = `BK-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const newDevice = {
      id: newId,
      title: deviceName,
      author: deviceAuthor || 'Bilinmeyen Yazar',
      location: activeTab,
      status: deviceStatus,
      is_in_library: deviceStatus === 'Müsait',
      borrowed_by: null,
      borrowed_date: null,
      days_to_return: null,
      image: deviceImage,
      summary: deviceSpecs,
      manager: user?.name || 'Kütüphane Görevlisi',
      date: new Date().toLocaleDateString('tr-TR'),
      logs: [
        {
          date: new Date().toLocaleString('tr-TR'),
          type: 'Sistem',
          description: `Kitap ${activeTab} envanterine kaydedildi.`,
          user: user?.name || 'Sistem'
        }
      ]
    };

    let success = false;
    try {
      const res = await fetch('/api/books', {
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
      console.warn("Backend add book failed, trying Supabase", e);
    }

    if (!success && supabaseService.isConfigured()) {
      const added = await supabaseService.addDevice(newDevice);
      if (added) {
        setDevices(prev => [added, ...prev]);
        success = true;
      }
    }

    // Sync to localStorage
    const saved = localStorage.getItem('qr-books');
    const localDevs = saved ? JSON.parse(saved) : [];
    const updatedDevices = [newDevice, ...localDevs];
    localStorage.setItem('qr-books', JSON.stringify(updatedDevices));
    if (!success) {
      setDevices(updatedDevices);
    }

    // Reset Form
    setDeviceTemplate('custom');
    setDeviceName('');
    setDeviceAuthor('');
    setDeviceStatus('Müsait');
    setDeviceSpecs('');
    setDeviceImage('');
    setAddDeviceModalOpen(false);
    alert('Kitap başarıyla bu şubeye eklendi.');
  };

  // Filter books belonging to active library
  const currentLabDevices = devices.filter(d => 
    d.location && d.location.toLowerCase().includes(activeTab.toLowerCase())
  );

  return (
    <div className="max-w-[1440px] mx-auto space-y-lg text-on-surface">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Kütüphane Şubeleri</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Şubelerimizdeki kitapları filtreleyin veya yeni bir şube ekleyin</p>
        </div>
        <button 
          onClick={() => setAddLabModalOpen(true)}
          className="flex items-center gap-xs bg-primary text-on-primary hover:opacity-90 px-md py-sm rounded-lg font-label-md text-label-md transition-colors shadow-md cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Yeni Şube Ekle
        </button>
      </div>

      {/* Tabs list of libraries */}
      <div className="flex gap-xs border-b border-outline-variant overflow-x-auto pb-xs scrollbar-hide">
        {labs.map(labName => (
          <button 
            key={labName}
            onClick={() => setActiveTab(labName)}
            className={`px-lg py-sm font-label-md text-label-md whitespace-nowrap transition-colors border-b-2 ${activeTab === labName ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          >
            {labName}
          </button>
        ))}
      </div>

      {/* Active Tab Panel */}
      {activeTab && (
        <div className="space-y-md">
          <div className="flex justify-between items-center bg-surface-container-low p-md rounded-xl border border-outline-variant">
            <h3 className="font-headline-md text-headline-md text-on-surface">{activeTab} Kitaplığı</h3>
            <button 
              onClick={() => setAddDeviceModalOpen(true)}
              className="flex items-center gap-xs bg-primary text-on-primary hover:opacity-90 px-md py-xs rounded-lg font-label-sm text-label-sm transition-colors shadow cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Bu Şubeye Kitap Ekle
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-grid-gutter">
            {currentLabDevices.map(book => (
              <div key={book.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
                <div className="w-full flex justify-between items-start mb-md border-b border-surface-container-low pb-sm">
                  <div className="flex-grow pr-xs">
                    <h4 className="font-headline-md text-[13px] text-on-surface line-clamp-1">{book.title}</h4>
                    <p className="text-[10px] text-on-surface-variant line-clamp-1">{book.author}</p>
                  </div>
                  <span className={`px-sm py-[2px] rounded-full text-[9px] font-bold uppercase ${book.status === 'Müsait' ? 'bg-success/15 text-success' : 'bg-error/15 text-error'}`}>
                    {book.status}
                  </span>
                </div>
                {book.image ? (
                  <img src={book.image} alt={book.title} className="w-24 h-32 object-contain rounded border border-outline-variant bg-white mb-md" />
                ) : (
                  <div className="w-24 h-32 flex flex-col items-center justify-center rounded border border-outline bg-surface-container-low text-on-surface-variant mb-md">
                    <span className="material-symbols-outlined text-3xl mb-xs">menu_book</span>
                    <span className="text-[10px] font-bold">KAPAK RESMİ</span>
                  </div>
                )}
                <Link to={`/book/${book.id}`} className="w-full flex justify-center items-center gap-xs border border-primary text-primary hover:bg-primary-container/10 px-md py-xs rounded-lg font-label-md text-label-md transition-colors mt-auto">
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  Kitap Paneli
                </Link>
              </div>
            ))}
            {currentLabDevices.length === 0 && (
              <div className="col-span-full py-xl text-center text-on-surface-variant bg-surface-container-low border border-dashed border-outline rounded-xl">
                Bu şubeye henüz kitap kaydedilmemiş.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Library Branch Modal */}
      {isAddLabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-md">
          <div className="bg-surface border border-outline-variant rounded-xl w-full max-w-[450px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 text-on-surface">
            <div className="bg-primary text-on-primary px-lg py-md flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md flex items-center gap-sm">
                <span className="material-symbols-outlined">local_library</span> Yeni Şube Ekle
              </h3>
              <button onClick={() => setAddLabModalOpen(false)} className="hover:opacity-70 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-lg space-y-md" onSubmit={handleAddLab}>
              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Kütüphane Şubesi Adı</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: Beylikdüzü Kütüphanesi"
                  value={newLabName}
                  onChange={(e) => setNewLabName(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                />
              </div>
              <div className="flex justify-end gap-sm pt-sm border-t border-surface-container-highest">
                <button type="button" onClick={() => setAddLabModalOpen(false)} className="px-md py-sm font-label-md text-on-surface-variant hover:bg-surface-container rounded-lg">İptal</button>
                <button type="submit" className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer">Şube Ekle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Book directly Modal */}
      {isAddDeviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-md">
          <div className="bg-surface border border-outline-variant rounded-xl w-full max-w-[550px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 text-on-surface max-h-[90vh] flex flex-col">
            <div className="bg-primary text-on-primary px-lg py-md flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md flex items-center gap-sm">
                <span className="material-symbols-outlined">add</span> {activeTab} Şubesine Kitap Ekle
              </h3>
              <button onClick={() => setAddDeviceModalOpen(false)} className="hover:opacity-75 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-lg space-y-md overflow-y-auto flex-grow" onSubmit={handleAddDevice}>
              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Şablon Seç</label>
                <select 
                  value={deviceTemplate}
                  onChange={(e) => setDeviceTemplate(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                >
                  <option value="custom">-- Manuel Giriş --</option>
                  <option value="nutuk">Nutuk - Atatürk</option>
                  <option value="sucveceza">Suç ve Ceza - Dostoyevski</option>
                  <option value="simyaci">Simyacı - Paulo Coelho</option>
                </select>
              </div>

              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Kitap Adı</label>
                <input 
                  type="text" 
                  required
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                />
              </div>

              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Yazar</label>
                <input 
                  type="text" 
                  required
                  value={deviceAuthor}
                  onChange={(e) => setDeviceAuthor(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                />
              </div>

              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Kapak Görseli</label>
                <div className="flex items-center gap-sm">
                  {deviceImage ? (
                    <img src={deviceImage} alt="Önizleme" className="w-12 h-16 object-contain rounded border border-outline bg-white" />
                  ) : (
                    <div className="w-12 h-16 flex items-center justify-center rounded border border-outline bg-surface-container-low text-on-surface-variant">
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

              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Kitap Özeti</label>
                <textarea 
                  rows="3" 
                  value={deviceSpecs}
                  onChange={(e) => setDeviceSpecs(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                  placeholder="Kitap özetini buraya ekleyin..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-sm pt-sm border-t border-surface-container-highest">
                <button type="button" onClick={() => setAddDeviceModalOpen(false)} className="px-md py-sm font-label-md text-on-surface-variant hover:bg-surface-container rounded-lg">İptal</button>
                <button type="submit" className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer shadow">Kitap Ekle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
