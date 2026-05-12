import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedImage = localStorage.getItem('profile-image');
    if (savedImage) setProfileImage(savedImage);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem('profile-image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const activities = [
    { id: 1, icon: 'login', title: 'Sisteme giriş yapıldı.', time: 'Bugün 09:15', color: 'text-on-surface-variant' },
    { id: 2, icon: 'build', title: 'PLC-012 cihazında durum güncellemesi.', time: 'Dün 16:30', color: 'text-secondary' },
    { id: 3, icon: 'add_circle', title: 'Yeni cihaz kaydı eklendi (CEN-001).', time: '10.06.2024', color: 'text-primary' },
    { id: 4, icon: 'edit_document', title: 'Rapor dışa aktarıldı.', time: '08.06.2024', color: 'text-tertiary' },
    { id: 5, icon: 'warning', title: 'Sistem uyarısı okundu.', time: '05.06.2024', color: 'text-error' },
  ];

  const displayedActivities = showAllActivities ? activities : activities.slice(0, 3);

  return (
    <div className="max-w-[1000px] mx-auto space-y-lg">
      <div className="flex flex-col gap-sm mb-lg">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Kullanıcı Profili</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Kişisel bilgileriniz, yetkileriniz ve hesap ayarlarınız.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {/* Profile Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col items-center text-center">
            <div 
              className="w-24 h-24 rounded-full border-4 border-primary-fixed bg-surface-container-highest mb-md overflow-hidden relative cursor-pointer group"
              onClick={() => fileInputRef.current.click()}
            >
                {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <span className="material-symbols-outlined text-on-surface-variant text-[64px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">person</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white">photo_camera</span>
                </div>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />
            <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">{user?.name}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-md">{user?.email}</p>
            <div className="bg-primary-container text-on-primary-container px-md py-xs rounded-full font-label-sm uppercase tracking-wider mb-lg">
                {user?.role}
            </div>
            
            <button className="w-full bg-surface-container text-primary font-label-md py-sm rounded-lg hover:bg-surface-container-high transition-colors flex justify-center items-center gap-sm">
                <span className="material-symbols-outlined">edit</span>
                Profili Düzenle
            </button>
        </div>

        {/* Stats and Info Bento */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-md">
            
            <div className="bg-white border border-outline-variant p-md rounded-xl shadow-sm flex items-center gap-md">
                <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">fact_check</span>
                </div>
                <div>
                    <h4 className="font-body-sm text-on-surface-variant uppercase">Tamamlanan İşlemler</h4>
                    <p className="font-headline-lg text-headline-lg text-on-surface">148</p>
                </div>
            </div>

            <div className="bg-white border border-outline-variant p-md rounded-xl shadow-sm flex items-center gap-md">
                <div className="w-12 h-12 bg-tertiary-fixed rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary">engineering</span>
                </div>
                <div>
                    <h4 className="font-body-sm text-on-surface-variant uppercase">Sorumlu Cihazlar</h4>
                    <p className="font-headline-lg text-headline-lg text-on-surface">24</p>
                </div>
            </div>

            <div className="sm:col-span-2 bg-white border border-outline-variant p-lg rounded-xl shadow-sm">
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md border-b border-outline-variant pb-sm">Son Aktiviteler</h3>
                <div className="space-y-md">
                    {displayedActivities.map(act => (
                        <div key={act.id} className="flex justify-between items-center">
                            <div className="flex items-center gap-sm">
                                <span className={`material-symbols-outlined ${act.color}`}>{act.icon}</span>
                                <div>
                                    <p className="font-body-md text-on-surface">{act.title}</p>
                                    <p className="font-body-sm text-outline">{act.time}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button 
                  onClick={() => setShowAllActivities(!showAllActivities)} 
                  className="w-full mt-md text-primary font-label-md hover:underline"
                >
                  {showAllActivities ? "Daha Az Göster" : "Tümünü Gör"}
                </button>
            </div>
            
            <div className="sm:col-span-2 flex justify-end">
                 <button onClick={logout} className="border border-error text-error font-label-md px-lg py-sm rounded-lg hover:bg-error-container/20 transition-colors flex items-center gap-sm shadow-sm">
                    <span className="material-symbols-outlined">logout</span>
                    Oturumu Kapat
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}
