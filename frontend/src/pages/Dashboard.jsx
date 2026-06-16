import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { supabaseService } from '../supabaseService';

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  
  const fetchBooks = async () => {
    let success = false;
    try {
      const res = await fetch('/api/books');
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
        localStorage.setItem('qr-books', JSON.stringify(data));
        success = true;
      }
    } catch (e) {
      console.warn("Backend connection failed, falling back to Supabase/localStorage", e);
    }
    
    if (!success) {
      if (supabaseService.isConfigured()) {
        const cloudData = await supabaseService.getBooks();
        if (cloudData) {
          setBooks(cloudData);
          localStorage.setItem('qr-books', JSON.stringify(cloudData));
          success = true;
        }
      }
    }

    if (!success) {
      const saved = localStorage.getItem('qr-books');
      if (saved) {
        setBooks(JSON.parse(saved));
      }
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const createBook = async () => {
    const defaultBooks = [
      { title: 'Nutuk', author: 'Mustafa Kemal Atatürk', location: 'Beylikdüzü Kütüphanesi', specs: 'Türkiye Cumhuriyeti\'nin kuruluş belgesi niteliğindeki tarihi eser.' },
      { title: 'Suç ve Ceza', author: 'Fyodor Dostoyevski', location: 'Esenyurt Kütüphanesi', specs: 'Raskolnikov adlı bir gencin işlediği cinayet ve sonrasındaki vicdan azabını konu alan klasik roman.' },
      { title: 'Simyacı', author: 'Paulo Coelho', location: 'Avcılar Kütüphanesi', specs: 'Kendi kişisel menkıbesini gerçekleştirmek üzere yola çıkan Endülüslü çoban Santiago\'nun öyküsü.' }
    ];
    
    const randomTemplate = defaultBooks[Math.floor(Math.random() * defaultBooks.length)];
    const newId = `BK-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const newBook = {
      id: newId,
      title: randomTemplate.title,
      author: randomTemplate.author,
      location: randomTemplate.location,
      status: 'Müsait',
      is_in_library: true,
      borrowed_by: null,
      borrowed_date: null,
      days_to_return: null,
      image: '',
      summary: randomTemplate.specs,
      manager: 'Kütüphane Görevlisi',
      date: new Date().toLocaleDateString('tr-TR'),
      logs: [
        {
          date: new Date().toLocaleString('tr-TR'),
          type: 'Sistem',
          description: 'Kitap kütüphane envanterine kaydedildi.',
          user: 'Sistem'
        }
      ]
    };
    
    let success = false;
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook)
      });
      if (res.ok) {
        const added = await res.json();
        setBooks(prev => [added, ...prev]);
        success = true;
      }
    } catch (e) {
      console.warn("Backend test book creation failed, trying Supabase", e);
    }

    if (!success && supabaseService.isConfigured()) {
      const added = await supabaseService.addBook(newBook);
      if (added) {
        setBooks(prev => [added, ...prev]);
        success = true;
      }
    }
    
    const saved = localStorage.getItem('qr-books');
    const localBooks = saved ? JSON.parse(saved) : [];
    const updated = [newBook, ...localBooks];
    localStorage.setItem('qr-books', JSON.stringify(updated));
    if (!success) {
      setBooks(updated);
    }
  };

  const clearBooks = async () => {
    if (window.confirm("Tüm envanteri temizlemek istediğinize emin misiniz?")) {
      let success = false;
      try {
        const res = await fetch('/api/books', {
          method: 'DELETE'
        });
        if (res.ok) {
          setBooks([]);
          success = true;
        }
      } catch (e) {
        console.warn("Backend clear failed, trying Supabase", e);
      }

      if (!success && supabaseService.isConfigured()) {
        const deleted = await supabaseService.deleteAllBooks();
        if (deleted) {
          setBooks([]);
          success = true;
        }
      }
      
      setBooks([]);
      localStorage.removeItem('qr-books');
    }
  };

  // Stats calculations
  const totalBooks = books.length;
  const borrowedBooks = books.filter(b => b.status === 'Ödünç Verildi').length;
  const availableBooks = books.filter(b => b.status === 'Müsait').length;

  // Use the current local IP/hostname to generate QR
  const baseUrl = `${window.location.protocol}//${window.location.host}/book`;

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Featured Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
        <div className="bg-primary text-on-primary p-lg rounded-xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <h4 className="font-headline-md text-headline-md mb-sm">Toplam Kitap</h4>
                <p className="font-headline-xl text-headline-xl">{totalBooks}</p>
                <p className="font-body-sm text-body-sm opacity-80 mt-xs">Kütüphane sisteminde kayıtlı toplam kitap</p>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10">library_books</span>
        </div>
        
        <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm flex justify-between items-center">
            <div>
                <h4 className="font-headline-md text-headline-md text-on-surface mb-sm">Müsait / Ödünç Durumu</h4>
                <div className="flex gap-md mt-md">
                    <div>
                        <p className="font-label-sm text-label-sm text-success">MÜSAİT</p>
                        <p className="font-headline-lg text-headline-lg text-success">{availableBooks}</p>
                    </div>
                    <div>
                        <p className="font-label-sm text-label-sm text-error">ÖDÜNÇ</p>
                        <p className="font-headline-lg text-headline-lg text-error">{borrowedBooks}</p>
                    </div>
                </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant text-[50px] opacity-35">menu_book</span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm">
            <h4 className="font-headline-md text-headline-md text-on-surface mb-sm">Hızlı İşlemler</h4>
            <div className="flex flex-col gap-sm">
                <button onClick={createBook} className="w-full flex items-center justify-center gap-xs bg-primary text-on-primary hover:opacity-90 px-md py-sm rounded-lg font-label-md text-label-md transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">add</span>
                    Yeni Test Kitabı Üret
                </button>
                <button onClick={clearBooks} className="w-full flex items-center justify-center gap-xs border border-error text-error hover:bg-error-container/20 px-md py-sm rounded-lg font-label-md text-label-md transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">delete</span>
                    Envanteri Temizle
                </button>
            </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Kütüphane Kitapları & QR Kodlar</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Kitap QR kodlarını taratarak veya yazdırarak durum kontrolü yapabilirsiniz.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-grid-gutter">
        {books.map(book => (
          <div key={book.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
            <div className="w-full flex justify-between items-start mb-md border-b border-surface-container-low pb-sm">
                <div className="flex-grow pr-xs">
                    <h3 className="font-label-md text-label-md text-on-surface">{book.id}</h3>
                    <p className="text-body-sm text-on-surface font-semibold line-clamp-1">{book.title}</p>
                    <p className="text-[10px] text-on-surface-variant line-clamp-1">{book.author}</p>
                </div>
                <div className={`px-sm py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${book.status === 'Müsait' ? 'bg-success/15 text-success' : 'bg-error/15 text-error'}`}>
                    {book.status}
                </div>
            </div>
            
            <div className="bg-white p-2 rounded-lg border border-outline-variant mb-md">
              <QRCodeSVG value={`${baseUrl}/${book.id}`} size={140} />
            </div>
            
            <Link to={`/book/${book.id}`} className="w-full mt-auto flex justify-center items-center gap-xs border border-primary text-primary hover:bg-primary-container/10 px-md py-sm rounded-lg font-label-md text-label-md transition-colors">
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              Kitap Bilgilerini Aç
            </Link>
          </div>
        ))}
        {books.length === 0 && (
            <div className="col-span-full py-xl text-center text-on-surface-variant bg-surface-container border border-dashed border-outline rounded-xl">
                <span className="material-symbols-outlined text-4xl mb-sm block opacity-50">qr_code_2</span>
                <p>Henüz kayıtlı kitap bulunmuyor. Test için "Yeni Test Kitabı Üret" butonuna tıklayın.</p>
            </div>
        )}
      </div>
    </div>
  );
}
