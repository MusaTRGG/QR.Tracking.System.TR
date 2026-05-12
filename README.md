# QR Object Tracking Project

Bu proje, fiziksel varlıkların (PLC cihazları vb.) QR kodlar aracılığıyla takibi ve yönetimi için geliştirilmektedir.

## Proje Yapısı

Proje iki ana bölümden oluşmaktadır:

- **frontend/**: React, Vite ve Tailwind CSS kullanılarak geliştirilen kullanıcı arayüzü.
- **backend/**: Node.js ve Express kullanılarak geliştirilen API servisleri.

## Kurulum ve Çalıştırma

Her iki servis için de bağımlılıkları yüklemeniz gerekmektedir.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Özellikler
- Dinamik QR kod üretimi
- Cihaz bazlı dashboard ekranları
- Gerçek zamanlı durum takibi (Planlanan)
- Envanter yönetimi