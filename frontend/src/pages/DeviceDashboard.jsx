import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function DeviceDashboard() {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [isIssueModalOpen, setIssueModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setMaintenanceModalOpen] = useState(false);

  // Minimal dummy PDF base64
  const dummyPdf = "data:application/pdf;base64,JVBERi0xLjEKJcKlwrHDqwoKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCgoyIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2VzCiAgICAgL0tpZHMgWzMgMCBSXQogICAgIC9Db3VudCAxCiAgICAgL01lZGlhQm94IFswIDAgMzAwIDE0NF0KICA+PgplbmRvYmoKCjMgMCBvYmoKICA8PCAgL1R5cGUgL1BhZ2UKICAgICAgL1BhcmVudCAyIDAgUgogICAgICAvUmVzb3VyY2VzCiAgICAgICA8PCAvRm9udAogICAgICAgICAgIDw8IC9GMQogICAgICAgICAgICAgICA8PCAvVHlwZSAvRm9udAogICAgICAgICAgICAgICAgICAvU3VidHlwZSAvVHlwZTEKICAgICAgICAgICAgICAgICAgL0Jhc2VGb250IC9UaW1lcy1Sb21hbgogICAgICAgICAgICAgICA+PgogICAgICAgICAgID4+CiAgICAgICA+PgogICAgICAvQ29udGVudHMgNCAwIFIKICA+PgplbmRvYmoKCjQgMCBvYmoKICA8PCAvTGVuZ3RoIDU1ID4+CnN0cmVhbQogIEJUCiAgICAvRjEgMTggVGYKICAgIDAgMCAwIHJnCiAgICAoVGVzdCBEb2N1bWVudCkgVGoKICBFVAplbmRzdHJlYW0KZW5kb2JqCgp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTggMDAwMDAgbiAKMDAwMDAwMDA3NyAwMDAwMCBuIAowMDAwMDAwMTc4IDAwMDAwIG4gCjAwMDAwMDA0NTcgMDAwMDAgbiAKdHJhaWxlcgogIDw8ICAvUm9vdCAxIDAgUgogICAgICAvU2l6ZSA1CiAgPj4Kc3RhcnR4cmVmCjU2NQolJUVPRgo=";

  useEffect(() => {
    // Generate a random efficiency on load to simulate dynamic data
    const interval = setInterval(() => {
        setDevice(prev => {
            if(!prev) return prev;
            const fluctuation = Math.floor(Math.random() * 5) - 2; // -2 to +2
            let newEff = prev.efficiency + fluctuation;
            if(newEff > 100) newEff = 100;
            if(newEff < 0) newEff = 0;
            return { ...prev, efficiency: newEff };
        })
    }, 5000);

    const saved = localStorage.getItem('qr-devices');
    if (saved) {
      const devices = JSON.parse(saved);
      const found = devices.find(d => d.id === id);
      if (found) {
        setDevice(found);
      } else {
        // Mock a device if not found in localstorage (e.g. scanned on a different device)
        setDevice({
          id: id,
          name: `Siemens S7-1200 PLC`,
          serial: `SN-${Math.floor(Math.random() * 1000000)}`,
          location: `Lab-01 / Panel A`,
          status: 'Operasyonel',
          efficiency: 100,
          lastMaintenance: '12.05.2024'
        });
      }
    } else {
        setDevice({
            id: id,
            name: `Siemens S7-1200 PLC`,
            serial: `SN-123456`,
            location: `Lab-01 / Panel A`,
            status: 'Operasyonel',
            efficiency: 98,
            lastMaintenance: '12.05.2024'
          });
    }

    return () => clearInterval(interval);
  }, [id]);

  if (!device) return <div className="p-xl text-center">Yükleniyor...</div>;

  const circumference = 2 * Math.PI * 56; // r=56 from the SVG
  const strokeDashoffset = circumference - (device.efficiency / 100) * circumference;

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">{device.name}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">ID: {device.id}</p>
        </div>
        <div className="flex items-center bg-secondary-container text-on-secondary-container px-md py-xs rounded-full gap-xs">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          <span className="font-label-md text-label-md">{device.status}</span>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-grid-gutter">
        
        {/* Product Photo Card */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col items-center justify-center shadow-sm">
          <div className="w-full aspect-square relative mb-md bg-white rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              className="object-contain max-h-[280px]" 
              alt="Siemens S7-1200 PLC" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtXk8GwwWioIj8g-vpJzV7n7t03NCFVvokcHoja4w391-XFKzJV8lV2d4Vu-2Hh5DSkCR35YcqrDVmVB0LNwjLUx-n7FBwps92q4tfq914lmZ6-nRWNPVvj-T04VdXJB_Qx1nr5fDO7I4-JEhU_GBn26B4Wlu8bEb86NaqPdH4N4uJZIBQE4ALN91zvPnIvt-TOoDemuAZXUjDQwX-46a-6At50lvD9A9bwB8pAWvKLZoREjfaTLGAqjaakHDjAiwtAHKmKl6OAiQ" 
            />
          </div>
          <a href={dummyPdf} download="dokuman.pdf" className="w-full flex items-center justify-center gap-sm border border-primary text-primary hover:bg-primary-container/10 px-md py-sm rounded-lg font-label-md text-label-md transition-colors">
            <span className="material-symbols-outlined">download</span>
            Teknik Dokümanı İndir
          </a>
        </div>

        {/* Stats & Info Grid */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-grid-gutter">
          
          {/* General Info Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <h3 className="font-headline-md text-headline-md mb-md border-b border-outline-variant pb-sm">Genel Bilgi</h3>
            <div className="space-y-md">
              <div className="flex justify-between items-center py-xs border-b border-surface-container-low">
                <span className="text-on-surface-variant font-label-md text-label-md">Model:</span>
                <span className="text-on-surface font-body-md text-body-md">S7-1200</span>
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

          {/* Status Gauge Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col">
            <h3 className="font-headline-md text-headline-md mb-md">Durum Değişkenleri</h3>
            <div className="flex-grow flex flex-col items-center justify-center py-md relative">
              {/* Circular Gauge Representation */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 transition-all duration-1000 ease-in-out">
                  <circle className="text-surface-container-highest" cx="64" cy="64" fill="transparent" r="56" stroke="currentColor" strokeWidth="8"></circle>
                  <circle 
                    className={`${device.efficiency < 85 ? 'text-error' : 'text-secondary'} transition-all duration-1000 ease-in-out`} 
                    cx="64" cy="64" fill="transparent" r="56" stroke="currentColor" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset} 
                    strokeWidth="8"
                    strokeLinecap="round"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`font-headline-lg text-headline-lg ${device.efficiency < 85 ? 'text-error' : 'text-secondary'} transition-colors duration-1000`}>
                    {device.efficiency}%
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Verim</span>
                </div>
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-sm animate-pulse">Canlı Veri</p>
            </div>
            <div className="mt-auto grid grid-cols-1 gap-sm pt-md">
              <button onClick={() => setDevice({...device, efficiency: 100})} className="bg-primary text-on-primary hover:opacity-90 px-md py-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-sm">
                <span className="material-symbols-outlined">sync</span>
                DURUM GÜNCELLE
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
          <div className="flex border-b border-outline-variant">
            <button className="px-lg py-md font-label-md text-label-md text-primary border-b-2 border-primary">Geçmiş Kayıtlar</button>
            <button className="px-lg py-md font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">Bakım Detayları</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase">Tarih</th>
                  <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase">İşlem</th>
                  <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase">Açıklama</th>
                  <th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase text-right">Kullanıcı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md font-body-md text-body-md">02.06.2024 11:30</td>
                  <td className="px-lg py-md font-body-md text-body-md">
                    <span className="inline-flex items-center gap-xs px-sm py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-semibold">
                      Durum Güncelleme
                    </span>
                  </td>
                  <td className="px-lg py-md font-body-md text-body-md text-on-surface-variant">Durum: Operasyonel</td>
                  <td className="px-lg py-md font-body-md text-body-md text-right">Ahmet Y.</td>
                </tr>
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md font-body-md text-body-md">15.05.2024 09:20</td>
                  <td className="px-lg py-md font-body-md text-body-md">
                    <span className="inline-flex items-center gap-xs px-sm py-1 bg-surface-container-highest text-on-surface rounded-full text-xs font-semibold">
                      Konum Değişikliği
                    </span>
                  </td>
                  <td className="px-lg py-md font-body-md text-body-md text-on-surface-variant">Lab-01 → Lab-02 / Panel A</td>
                  <td className="px-lg py-md font-body-md text-body-md text-right">Ahmet Y.</td>
                </tr>
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md font-body-md text-body-md">12.05.2024 14:10</td>
                  <td className="px-lg py-md font-body-md text-body-md">
                    <span className="inline-flex items-center gap-xs px-sm py-1 bg-primary-container/10 text-primary rounded-full text-xs font-semibold">
                      Bakım
                    </span>
                  </td>
                  <td className="px-lg py-md font-body-md text-body-md text-on-surface-variant">Periyodik bakım yapıldı.</td>
                  <td className="px-lg py-md font-body-md text-body-md text-right">Mehmet K.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Issue Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-md">
            <div className="bg-surface border border-outline-variant rounded-xl w-full max-w-[500px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="bg-error text-on-error px-lg py-md flex justify-between items-center">
                    <h3 className="font-headline-md text-headline-md flex items-center gap-sm">
                        <span className="material-symbols-outlined">report_problem</span> Arıza Bildir
                    </h3>
                    <button onClick={() => setIssueModalOpen(false)} className="hover:opacity-70">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form className="p-lg space-y-md" onSubmit={(e) => { e.preventDefault(); setIssueModalOpen(false); alert('Arıza kaydı başarıyla oluşturuldu.'); }}>
                    <div>
                        <label className="block font-label-sm text-on-surface-variant mb-xs">Arıza Türü</label>
                        <select className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-error outline-none text-body-md text-on-surface">
                            <option>Donanımsal Hata</option>
                            <option>Yazılımsal Hata</option>
                            <option>Bağlantı Sorunu</option>
                            <option>Diğer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-label-sm text-on-surface-variant mb-xs">Açıklama</label>
                        <textarea required rows="4" className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-error outline-none text-body-md text-on-surface" placeholder="Arıza detaylarını buraya yazın..."></textarea>
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
            <div className="bg-surface border border-outline-variant rounded-xl w-full max-w-[500px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="bg-primary text-on-primary px-lg py-md flex justify-between items-center">
                    <h3 className="font-headline-md text-headline-md flex items-center gap-sm">
                        <span className="material-symbols-outlined">engineering</span> Bakım Kaydı Oluştur
                    </h3>
                    <button onClick={() => setMaintenanceModalOpen(false)} className="hover:opacity-70">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form className="p-lg space-y-md" onSubmit={(e) => { e.preventDefault(); setMaintenanceModalOpen(false); alert('Bakım kaydı başarıyla oluşturuldu.'); }}>
                    <div>
                        <label className="block font-label-sm text-on-surface-variant mb-xs">Bakım Türü</label>
                        <select className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface">
                            <option>Periyodik Bakım</option>
                            <option>Parça Değişimi</option>
                            <option>Kalibrasyon</option>
                            <option>Diğer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-label-sm text-on-surface-variant mb-xs">Yapılan İşlemler</label>
                        <textarea required rows="4" className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface" placeholder="Uygulanan bakım adımlarını detaylandırın..."></textarea>
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
