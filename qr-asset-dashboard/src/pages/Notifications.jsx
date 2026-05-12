import React, { useState } from 'react';

export default function Notifications() {
  const [activeFilter, setActiveFilter] = useState('Hepsi');
  const [isRosterModalOpen, setRosterModalOpen] = useState(false);
  const notifications = [
    {
      id: 1,
      title: 'PLC-S712-001 Kritik Hata!',
      message: 'Aşırı ısınma algılandı. Ünite güvenli moda alındı. Konum: Lab-02 Bölümü.',
      time: 'Bugün • 15:45',
      type: 'Kritik',
      icon: 'warning',
      colorClass: 'border-error',
      iconBg: 'bg-error-container',
      iconColor: 'text-error',
      badgeBg: 'bg-error-container text-error'
    },
    {
      id: 2,
      title: 'Bakım Gecikti',
      message: 'Mikroskop - 05 için periyodik bakım süresi 48 saat aşıldı.',
      time: 'Bugün • 14:32',
      type: 'Kritik',
      icon: 'engineering',
      colorClass: 'border-tertiary',
      iconBg: 'bg-tertiary-fixed',
      iconColor: 'text-tertiary',
      badgeBg: 'bg-tertiary-fixed text-tertiary'
    },
    {
      id: 3,
      title: 'Lens Değişimi',
      message: 'Mikroskop - 05 için 40x objektif lens başarıyla takıldı.',
      time: 'Bugün • 13:10',
      type: 'Bilgi',
      icon: 'build',
      colorClass: 'border-primary',
      iconBg: 'bg-primary-fixed',
      iconColor: 'text-primary',
      badgeBg: 'bg-primary-fixed text-primary'
    },
    {
      id: 4,
      title: 'Bakım Tamamlandı',
      message: 'Hassas terazi kalibrasyon işlemi başarıyla tamamlandı.',
      time: 'Dün • 16:45',
      type: 'Başarılı',
      icon: 'check_circle',
      colorClass: 'border-secondary',
      iconBg: 'bg-secondary-container',
      iconColor: 'text-secondary',
      badgeBg: 'bg-secondary-container text-on-secondary-container'
    },
    {
      id: 5,
      title: 'Konum Değişikliği',
      message: 'Santrifüj ünitesi Laboratuvar A\'dan Laboratuvar B\'ye taşındı.',
      time: 'Dün • 11:20',
      type: 'Hareket',
      icon: 'location_on',
      colorClass: 'border-outline-variant',
      iconBg: 'bg-surface-container-highest',
      iconColor: 'text-on-surface-variant',
      badgeBg: 'bg-surface-container-highest text-on-surface-variant'
    }
  ];

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'Hepsi') return true;
    if (activeFilter === 'Okunmamış') return n.id === 1 || n.id === 2 || n.id === 3; // Mock logic
    return n.type === activeFilter;
  });

  const filterTabs = [
    { label: 'Hepsi', count: 8 },
    { label: 'Okunmamış', count: 3 },
    { label: 'Bakım', count: 3 },
    { label: 'Arıza', count: 2 },
    { label: 'Hareket', count: 1 },
    { label: 'Sistem', count: 2 },
  ];

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-md mb-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-3xl">notifications</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Bildirimler</h1>
          </div>
          <div className="flex items-center gap-sm">
            <button className="bg-surface-container-lowest border border-outline px-md py-sm rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container transition-colors">
              Tümünü Okundu İşaretle
            </button>
            <button className="bg-surface-container-lowest border border-outline px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant flex items-center gap-xs hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filtrele
            </button>
          </div>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">Toplam {notifications.length} bildirim</p>

        {/* Filter Tabs */}
        <div className="flex gap-sm overflow-x-auto pb-xs scrollbar-hide">
          {filterTabs.map(tab => (
            <button 
              key={tab.label}
              onClick={() => setActiveFilter(tab.label)}
              className={`px-md py-xs rounded-full font-label-sm text-label-sm whitespace-nowrap transition-colors ${activeFilter === tab.label ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}
            >
              {tab.label} {tab.count > 0 && <span className={`ml-xs rounded px-1 ${activeFilter === tab.label ? 'bg-on-primary text-primary' : 'opacity-70'}`}>{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <div className="grid grid-cols-1 gap-sm">
        {filteredNotifications.length > 0 ? filteredNotifications.map((notif) => (
          <div key={notif.id} className={`bg-white border-l-4 ${notif.colorClass} rounded-lg shadow-sm p-md flex items-start gap-md group hover:shadow-md transition-shadow`}>
            <div className={`w-10 h-10 rounded-full ${notif.iconBg} flex items-center justify-center flex-shrink-0`}>
              <span className={`material-symbols-outlined ${notif.iconColor}`}>{notif.icon}</span>
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-xs">
                <h3 className="font-label-md text-label-md text-on-surface">{notif.title}</h3>
                <div className="flex items-center gap-sm">
                  <span className={`${notif.badgeBg} text-[10px] font-bold px-sm py-[2px] rounded uppercase`}>{notif.type}</span>
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">{notif.message}</p>
              <p className="font-body-sm text-body-sm text-outline mt-sm">{notif.time}</p>
            </div>
          </div>
        )) : (
            <div className="py-xl text-center text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-xl">
                Bu filtreye uygun bildirim bulunmuyor.
            </div>
        )}
      </div>

      {/* Featured Analysis Card */}
      <div className="mt-xl grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="bg-primary text-on-primary p-lg rounded-xl overflow-hidden relative shadow-lg">
          <div className="relative z-10">
            <h4 className="font-headline-md text-headline-md mb-sm">Haftalık Arıza Özeti</h4>
            <p className="font-body-md text-body-md opacity-90 mb-md">Bu hafta toplam 2 kritik arıza raporlandı. Ortalama müdahale süresi 12 dakika azaldı.</p>
            <div className="flex gap-md">
              <div>
                <p className="font-label-sm text-label-sm opacity-70 uppercase">Müdahale</p>
                <p className="font-headline-lg text-headline-lg">18 dk</p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm opacity-70 uppercase">İyileşme</p>
                <p className="font-headline-lg text-headline-lg text-secondary-fixed">%14</p>
              </div>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10">analytics</span>
        </div>
        
        <div className="bg-white border border-outline-variant p-lg rounded-xl shadow-sm flex flex-col">
          <h4 className="font-headline-md text-headline-md text-on-surface mb-sm">Ekip Durumu</h4>
          <div className="flex items-center gap-md">
            <div className="flex -space-x-3">
              <img alt="Staff 1" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5h4XXsG1TWPCy8N1Z3MdNprWSID0UWfWXh_WrSNRSFRy00w5Gsen5g62qCefeEDPXbItW0OteOifaRKGtPtPXfnVcjQWBj3tPSAMmZ1OR2TCBbRhinQl1TVokKvNjH7xCXLEqBN-dhMJFbOUO79Pw95tjkx5DxY6IP_uioCeoMe-xv5nM-AEmZOTvr3oZ2x4vsYodiVxb5vX-kDi_LJEIMC4kUZlCopFc_igQ7nP4n56kr7CG5Nmx6reKzp11odl9pmeTpum_ERU"/>
              <img alt="Staff 2" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqqOClkHtu67ntKEQneIXELsV-y_7Th77vkugDlnQ0plgUskduZtw5j8Wfw38YliGbcSV1E7gZ_JQBx2abrF7r2NlMP9XwDpg18SAntRW6eM8rO6Dc0DIM8sNIaylLZ9qI8kRTDArBd1rCl2MyTi3i2hni_bMHMZ8yVtFnCbS7NhLMbuVCYAkaj7JA8I_miwFwD3UUjhLv4v7gZ2ZOZoSJXTyY_fSjK4j7dtLsouAw2Rl5GcAo6jLmZZcFHqvq_zIc8JyBZDIp2WQ"/>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container-highest flex items-center justify-center text-label-sm text-on-surface-variant font-bold">+4</div>
            </div>
            <div className="font-body-md text-body-md text-on-surface-variant">
              Şu an aktif 6 teknik personel sahada.
            </div>
          </div>
          <button onClick={() => setRosterModalOpen(true)} className="mt-auto w-full py-sm bg-surface-container text-primary font-label-md text-label-md rounded-lg hover:bg-surface-container-high transition-colors">
            Nöbet Çizelgesini Görüntüle
          </button>
        </div>
      </div>

      {/* Roster Modal */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-md">
            <div className="bg-surface border border-outline-variant rounded-xl w-full max-w-[600px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="bg-primary text-on-primary px-lg py-md flex justify-between items-center">
                    <h3 className="font-headline-md text-headline-md">Haftalık Nöbet Çizelgesi</h3>
                    <button onClick={() => setRosterModalOpen(false)} className="hover:opacity-70">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-lg overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[400px]">
                        <thead>
                            <tr className="border-b border-outline-variant font-label-sm text-on-surface-variant">
                                <th className="py-sm">Gün</th>
                                <th className="py-sm">08:00 - 16:00</th>
                                <th className="py-sm">16:00 - 00:00</th>
                                <th className="py-sm">00:00 - 08:00</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container-highest">
                            <tr><td className="py-sm font-label-md text-on-surface">Pazartesi</td><td className="py-sm text-body-sm text-on-surface-variant">Ahmet Y.</td><td className="py-sm text-body-sm text-on-surface-variant">Mehmet K.</td><td className="py-sm text-body-sm text-on-surface-variant">Ali V.</td></tr>
                            <tr><td className="py-sm font-label-md text-on-surface">Salı</td><td className="py-sm text-body-sm text-on-surface-variant">Zeynep B.</td><td className="py-sm text-body-sm text-on-surface-variant">Ahmet Y.</td><td className="py-sm text-body-sm text-on-surface-variant">Mehmet K.</td></tr>
                            <tr><td className="py-sm font-label-md text-on-surface">Çarşamba</td><td className="py-sm text-body-sm text-on-surface-variant">Ali V.</td><td className="py-sm text-body-sm text-on-surface-variant">Zeynep B.</td><td className="py-sm text-body-sm text-on-surface-variant">Ahmet Y.</td></tr>
                        </tbody>
                    </table>
                </div>
                <div className="p-md bg-surface-container-low border-t border-outline-variant flex justify-end">
                    <button onClick={() => setRosterModalOpen(false)} className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors">
                        Kapat
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
