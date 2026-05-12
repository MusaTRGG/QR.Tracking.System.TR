import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Inventory() {
  const devices = [
    {
      id: 'LAB-M05',
      name: 'Mikroskop - 05',
      location: 'Laboratuvar B',
      manager: 'Ahmet Y.',
      date: '20.06.2024',
      status: 'Operasyonel',
      statusClass: 'bg-secondary-container text-on-secondary-container',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDq5SMovhV3ZzOGfQDkYG1fbcAqk8BC4JN7t7IVXlroCYSN4YCiuXRZgP-Je2dMYyZOKmq_M3kJcriVWYcf0-TUCos97zJxg1Q-gKseRkvVQK0zTeMKvjvqV_Rc72c2Wf0_656Mf4WosO4IGe9j1hzsXw2Ujzaf_WxEEKeFx18SZy6FzXeJQKkpRrS13iVw9wmi9cM6kci8nofdSoX9TwQzBw_DCmGPInu5FMJSVFAzCjy5jqT1CrG1R1SEAi5Q3hhJAVHbw-tHPOU'
    },
    {
      id: 'PLC-012',
      name: 'Siemens S7-1500',
      location: 'Laboratuvar A',
      manager: 'Mehmet K.',
      date: '18.06.2024',
      status: 'Bakımda',
      statusClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAI8MfjM4hJYp8wdLVUv-lO1xmUHr1xsrrO3i5gQ2obHtfqsfc68GC-otgpBa2M1GzbEkLYhbTGwpq8OSKAAD3q-9stx4LWjWR1EaTWSZo4M2T7CXqD5fBPRc0MrrNwa607_6vJ15lUDUNA5XsgW2pbVpddxRcMuqPt7q6VwxoklChrxf5gK_1pmPzBIOgVlp6B7o47UFI33EQJ69TFofvLoLo75N2BOiSfkS5jEapdWUSdcnLKrcgeNmYQE96ZhByTYsfcLoS4UtI'
    },
    {
      id: 'OSC-442',
      name: 'Osiloskop DPO',
      location: 'Laboratuvar B',
      manager: 'Ahmet Y.',
      date: '15.06.2024',
      status: 'Arızalı',
      statusClass: 'bg-error-container text-on-error-container',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZj_zk-3O2q1k53BTm51lB1_RpHJS5QkYk8_YmJzQLM0yvcWrxbPxNPm_VjRYPGuIyUxqJ1L5mWleRTUIGR2SvKYt5_sXpyNnjMJEbkNRYW9vyMyXpR5Ho53svXPt3aGjTRj601gNKzWnaxahL0qo8y5DiMTtrUqUkIKe0FxEPsHI6sRAKxBksHU5goYEBFtH1eokCftvwV97iF07DYE6v08_BHOB8qol-F-7QzPANWfcW9ml0uwnWhtW978Qs_7xCk5yiWTHp5JI'
    },
    {
      id: 'CEN-001',
      name: 'Santrifüj X-100',
      location: 'Laboratuvar A',
      manager: 'Mehmet K.',
      date: '10.06.2024',
      status: 'Operasyonel',
      statusClass: 'bg-secondary-container text-on-secondary-container',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBH-GEIKaLt3h2eTcsTnCEF53lS_0AVFckr_gL4MK0c_nR6kW4TNTsnNURLk_EOvGsLZ9bW7N5-sYWN5NYPCJ1UGLLg22JMhMyZT0SZDvzZ0y8do80V1ZKTg9phVniCKbXYAFwv9uA4HvJ2GsyvPM9iw7GhbAq5_n5TNWT9SMS_Joepx7Jj1HjmwBFFMBPXiEUya0djLEE81dfAkiAEGe0_a4lf5iJWJwcdyHRSxD9C80oOmdMJqjUtlSTiUSm3syE607qOQ-no7dY'
    }
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10; // Mock total pages

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-lg">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Cihaz Envanteri</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Laboratuvar genelindeki tüm aktif ve pasif cihazların listesi.</p>
        </div>
        <button className="bg-primary text-on-primary px-lg py-sm rounded-lg flex items-center gap-sm font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm">
          <span className="material-symbols-outlined">add</span>
          Yeni Cihaz Ekle
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-md items-end">
          <div className="space-y-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Cihaz Ara</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input className="w-full pl-xl pr-sm py-sm border border-outline-variant rounded-lg text-body-md bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Model, ID veya İsim..." type="text"/>
            </div>
          </div>
          <div className="space-y-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Cihaz Tipi</label>
            <select className="w-full px-sm py-sm border border-outline-variant rounded-lg text-body-md bg-surface-container-low focus:ring-2 focus:ring-primary outline-none">
              <option>Tümü</option>
              <option>PLC</option>
              <option>Mikroskop</option>
              <option>Osiloskop</option>
              <option>Analizör</option>
            </select>
          </div>
          <div className="space-y-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Konum</label>
            <select className="w-full px-sm py-sm border border-outline-variant rounded-lg text-body-md bg-surface-container-low focus:ring-2 focus:ring-primary outline-none">
              <option>Tüm Lablar</option>
              <option>Laboratuvar A</option>
              <option>Laboratuvar B</option>
              <option>Depo-01</option>
            </select>
          </div>
          <div className="space-y-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Durum</label>
            <select className="w-full px-sm py-sm border border-outline-variant rounded-lg text-body-md bg-surface-container-low focus:ring-2 focus:ring-primary outline-none">
              <option>Herkes</option>
              <option>Operasyonel</option>
              <option>Bakımda</option>
              <option>Arızalı</option>
            </select>
          </div>
          <div className="flex gap-sm">
            <button className="flex-grow py-sm px-md border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-high transition-colors">Temizle</button>
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
              {devices.map((device, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-lg py-md">
                    <img className="w-12 h-12 object-cover rounded-lg border border-outline-variant" alt={device.name} src={device.image} />
                  </td>
                  <td className="px-lg py-md max-w-[200px]">
                    <div className="font-label-md text-label-md text-on-surface truncate">{device.name}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant truncate">{device.id}</div>
                  </td>
                  <td className="px-lg py-md font-body-md text-body-md text-on-surface">{device.location}</td>
                  <td className="px-lg py-md font-body-md text-body-md text-on-surface">{device.manager}</td>
                  <td className="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">{device.date}</td>
                  <td className="px-lg py-md">
                    <span className={`inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm ${device.statusClass}`}>
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
            </tbody>
          </table>
        </div>
        <div className="px-lg py-md bg-surface-container-low border-t border-outline-variant flex flex-col sm:flex-row gap-sm items-center justify-between">
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            Toplam <span className="font-bold">42</span> cihaz listeleniyor.
          </div>
          <div className="flex items-center gap-base">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            
            {[1, 2, 3].map(page => (
               <button 
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border font-label-sm text-label-sm transition-colors ${currentPage === page ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant hover:bg-surface-container-high text-on-surface'}`}>
                {page}
              </button>
            ))}
            
            <span className="px-xs text-on-surface-variant">...</span>
            <button 
                onClick={() => handlePageChange(10)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border font-label-sm text-label-sm transition-colors ${currentPage === 10 ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant hover:bg-surface-container-high text-on-surface'}`}>
                10
            </button>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
