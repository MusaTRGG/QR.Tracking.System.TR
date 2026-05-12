import React from 'react';

export default function Reports() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-lg flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mb-md">
        <span className="material-symbols-outlined text-[48px] text-primary">assessment</span>
      </div>
      <h1 className="font-headline-xl text-headline-xl text-on-surface">Raporlar Modülü</h1>
      <p className="font-body-md text-on-surface-variant max-w-md">Gelişmiş analitik ve raporlama özellikleri çok yakında bu ekranda aktif olacaktır. Mevcut özetlere Dashboard üzerinden ulaşabilirsiniz.</p>
      
      <button className="mt-md bg-surface-container-high text-on-surface font-label-md px-lg py-sm rounded-lg hover:bg-surface-container-highest transition-colors">
        Taslak Rapor İndir (Demo)
      </button>
    </div>
  );
}
