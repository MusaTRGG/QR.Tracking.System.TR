import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../supabaseService';

export default function Inventory() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [libraries, setLibraries] = useState([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLocation, setSearchLocation] = useState('Tüm Kütüphaneler');
  const [searchStatus, setSearchStatus] = useState('Herkes');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Add Book Modal State
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [bookTemplate, setBookTemplate] = useState('custom');
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookLocation, setBookLocation] = useState('');
  const [bookStatus, setBookStatus] = useState('Müsait');
  const [bookImage, setBookImage] = useState('');
  const [bookSummary, setBookSummary] = useState('');

  const fetchLibrariesAndBooks = async () => {
    let currentLibraries = [];
    let currentBooks = [];
    let success = false;
    
    try {
      const libsRes = await fetch('/api/libraries');
      const booksRes = await fetch('/api/books');
      if (libsRes.ok && booksRes.ok) {
        currentLibraries = await libsRes.json();
        currentBooks = await booksRes.json();
        setLibraries(currentLibraries);
        setBooks(currentBooks);
        localStorage.setItem('qr-libraries', JSON.stringify(currentLibraries));
        localStorage.setItem('qr-books', JSON.stringify(currentBooks));
        if (currentLibraries.length > 0) {
          setBookLocation(currentLibraries[0]);
        }
        success = true;
      }
    } catch (e) {
      console.warn("Backend connection failed, falling back to Supabase/localStorage", e);
    }

    if (!success && supabaseService.isConfigured()) {
      const cloudLibraries = await supabaseService.getLibraries();
      const cloudBooks = await supabaseService.getBooks();
      if (cloudLibraries && cloudBooks) {
        currentLibraries = cloudLibraries;
        currentBooks = cloudBooks;
        setLibraries(cloudLibraries);
        setBooks(cloudBooks);
        localStorage.setItem('qr-libraries', JSON.stringify(cloudLibraries));
        localStorage.setItem('qr-books', JSON.stringify(cloudBooks));
        if (cloudLibraries.length > 0) {
          setBookLocation(cloudLibraries[0]);
        }
        success = true;
      }
    }

    if (!success) {
      const savedLibraries = localStorage.getItem('qr-libraries');
      if (savedLibraries) {
        currentLibraries = JSON.parse(savedLibraries);
      } else {
        currentLibraries = ['Beylikdüzü Kütüphanesi', 'Esenyurt Kütüphanesi', 'Avcılar Kütüphanesi'];
      }
      setLibraries(currentLibraries);
      if (currentLibraries.length > 0) {
        setBookLocation(currentLibraries[0]);
      }

      const savedBooks = localStorage.getItem('qr-books');
      if (savedBooks) {
        currentBooks = JSON.parse(savedBooks);
        setBooks(currentBooks);
      }
    }
  };

  useEffect(() => {
    fetchLibrariesAndBooks();
  }, []);

  // Update form fields based on template selection
  useEffect(() => {
    if (bookTemplate === 'nutuk') {
      setBookTitle('Nutuk');
      setBookAuthor('Mustafa Kemal Atatürk');
      setBookImage('');
      setBookSummary('Türkiye Cumhuriyeti\'nin kuruluş aşamalarını, Kurtuluş Savaşı\'nı ve inkılapları birinci ağızdan anlatan ulu önder Atatürk\'ün başeseri.');
    } else if (bookTemplate === 'sucveceza') {
      setBookTitle('Suç ve Ceza');
      setBookAuthor('Fyodor Dostoyevski');
      setBookImage('');
      setBookSummary('Hukuk öğrencisi Raskolnikov\'un teorik doğrular adına işlediği cinayet sonrasında yaşadığı ruhsal kırılmaları ve ahlaki dönüşümü anlatan başyapıt.');
    } else if (bookTemplate === 'simyaci') {
      setBookTitle('Simyacı');
      setBookAuthor('Paulo Coelho');
      setBookImage('');
      setBookSummary('Endülüslü bir çobanın hazinesini bulmak adına çıktığı mistik ve felsefi yolculukta kendini tanıma sürecini aktaran sembolik roman.');
    } else if (bookTemplate === 'custom') {
      setBookTitle('');
      setBookAuthor('');
      setBookImage('');
      setBookSummary('');
    }
  }, [bookTemplate]);

  // Filter Logic
  const filteredBooks = books.filter(b => {
    const matchesSearch = !searchTerm || 
      (b.title && b.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.id && b.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.author && b.author.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesLocation = searchLocation === 'Tüm Kütüphaneler' ||
      (b.location && b.location.toLowerCase() === searchLocation.toLowerCase());
      
    const matchesStatus = searchStatus === 'Herkes' ||
      (b.status && b.status.toLowerCase() === searchStatus.toLowerCase());
      
    return matchesSearch && matchesLocation && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage) || 1;
  const currentBooksList = filteredBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSearchLocation('Tüm Kütüphaneler');
    setSearchStatus('Herkes');
    setCurrentPage(1);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBookImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!bookTitle.trim()) return;

    const newId = `BK-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const newBook = {
      id: newId,
      title: bookTitle,
      author: bookAuthor || 'Bilinmeyen Yazar',
      location: bookLocation,
      status: bookStatus,
      is_in_library: bookStatus === 'Müsait',
      borrowed_by: null,
      borrowed_date: null,
      days_to_return: null,
      image: bookImage,
      summary: bookSummary,
      manager: user?.name || 'Kütüphane Görevlisi',
      date: new Date().toLocaleDateString('tr-TR'),
      logs: [
        {
          date: new Date().toLocaleString('tr-TR'),
          type: 'Sistem',
          description: `Kitap ${bookLocation} envanterine kaydedildi.`,
          user: user?.name || 'Sistem'
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
      console.warn("Backend add book failed, trying Supabase", e);
    }

    if (!success && supabaseService.isConfigured()) {
      const added = await supabaseService.addBook(newBook);
      if (added) {
        setBooks(prev => [added, ...prev]);
        success = true;
      }
    }

    // Sync to localStorage
    const saved = localStorage.getItem('qr-books');
    const localBooks = saved ? JSON.parse(saved) : [];
    const updatedBooks = [newBook, ...localBooks];
    localStorage.setItem('qr-books', JSON.stringify(updatedBooks));
    if (!success) {
      setBooks(updatedBooks);
    }

    // Reset Form
    setBookTemplate('custom');
    setBookTitle('');
    setBookAuthor('');
    setBookStatus('Müsait');
    setBookSummary('');
    setBookImage('');
    setAddModalOpen(false);
    alert('Kitap başarıyla envantere eklendi.');
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-lg text-on-surface">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Kitap Envanteri</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Kütüphane şubelerimizdeki kayıtlı tüm kitaplar ve müsaitlik durumları</p>
        </div>
        <button 
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-xs bg-primary text-on-primary hover:opacity-90 px-md py-sm rounded-lg font-label-md text-label-md transition-colors shadow-md cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Yeni Kitap Ekle
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-sm flex flex-col md:flex-row gap-md items-center justify-between">
        <div className="flex flex-col md:flex-row gap-sm flex-grow w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-grow max-w-[400px]">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Kitap adı, yazar veya ISBN/ID ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-xl pr-sm py-[7px] border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
            />
          </div>

          {/* Location Filter */}
          <select 
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="p-[7px] border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface focus:ring-2 focus:ring-primary outline-none min-w-[200px]"
          >
            <option value="Tüm Kütüphaneler">Tüm Kütüphaneler</option>
            {libraries.map(lib => (
                <option key={lib} value={lib}>{lib}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select 
            value={searchStatus}
            onChange={(e) => setSearchStatus(e.target.value)}
            className="p-[7px] border border-outline-variant rounded-lg bg-surface text-body-md text-on-surface focus:ring-2 focus:ring-primary outline-none min-w-[150px]"
          >
            <option value="Herkes">Tüm Durumlar</option>
            <option value="Müsait">Müsait</option>
            <option value="Ödünç Verildi">Ödünç Verildi</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || searchLocation !== 'Tüm Kütüphaneler' || searchStatus !== 'Herkes') && (
          <button 
            onClick={handleClearFilters}
            className="text-primary hover:bg-primary/10 px-md py-xs rounded-lg font-label-md text-label-md transition-colors flex items-center gap-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
            Temizle
          </button>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-outline-variant font-label-md text-label-md text-on-surface-variant bg-surface-container-low">
                <th className="py-md px-lg w-[100px]">Görsel</th>
                <th className="py-md px-lg">Kitap Adı / ID</th>
                <th className="py-md px-lg">Yazar</th>
                <th className="py-md px-lg">Bulunduğu Kütüphane</th>
                <th className="py-md px-lg">Ödünç Alan / Durum</th>
                <th className="py-md px-lg text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {currentBooksList.map((book) => (
                <tr key={book.id} className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="py-md px-lg">
                    {book.image ? (
                      <img src={book.image} alt={book.title} className="w-12 h-16 object-contain rounded border border-outline-variant bg-white" />
                    ) : (
                      <div className="w-12 h-16 flex flex-col items-center justify-center rounded border border-outline bg-surface-container-low text-on-surface-variant">
                        <span className="material-symbols-outlined text-[20px] mb-[2px]">menu_book</span>
                        <span className="text-[8px] font-bold">KAPAK</span>
                      </div>
                    )}
                  </td>
                  <td className="py-md px-lg">
                    <span className="font-label-md text-label-md text-on-surface block">{book.title}</span>
                    <span className="text-body-sm text-on-surface-variant block mt-[2px]">{book.id}</span>
                  </td>
                  <td className="py-md px-lg font-body-md text-body-md text-on-surface-variant">
                    {book.author}
                  </td>
                  <td className="py-md px-lg font-body-md text-body-md text-on-surface-variant">
                    {book.location}
                  </td>
                  <td className="py-md px-lg">
                    <div className="flex flex-col gap-[3px]">
                      <span className={`self-start px-sm py-[2px] rounded-full text-[10px] font-bold uppercase tracking-wider ${book.status === 'Müsait' ? 'bg-success/15 text-success' : 'bg-error/15 text-error'}`}>
                        {book.status}
                      </span>
                      {!book.is_in_library && book.borrowed_by && (
                        <span className="text-[10px] text-on-surface-variant">
                          {book.borrowed_by} • {book.days_to_return} gün kaldı
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-md px-lg text-right">
                    <Link 
                      to={`/book/${book.id}`}
                      className="inline-flex items-center justify-center gap-xs border border-primary text-primary hover:bg-primary-container/10 px-md py-xs rounded-lg font-label-md text-label-md transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      Gözat
                    </Link>
                  </td>
                </tr>
              ))}
              {currentBooksList.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-xl text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-xs block opacity-40">library_books</span>
                    Kayıtlı kitap bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="bg-surface-container-low px-lg py-md border-t border-outline-variant flex justify-between items-center text-body-sm text-on-surface-variant">
            <span>Toplam {filteredBooks.length} kitaptan {(currentPage-1)*itemsPerPage + 1} - {Math.min(currentPage*itemsPerPage, filteredBooks.length)} arası gösteriliyor</span>
            <div className="flex items-center gap-xs">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-outline hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => handlePageChange(idx + 1)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-label-sm ${currentPage === idx + 1 ? 'bg-primary text-on-primary' : 'border border-outline hover:bg-surface-container-high'}`}
                >
                  {idx + 1}
                </button>
              ))}
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-outline hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Book Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-md">
          <div className="bg-surface border border-outline-variant rounded-xl w-full max-w-[600px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 text-on-surface max-h-[90vh] flex flex-col">
            <div className="bg-primary text-on-primary px-lg py-md flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md flex items-center gap-sm">
                <span className="material-symbols-outlined">menu_book</span> Yeni Kitap Ekle
              </h3>
              <button onClick={() => setAddModalOpen(false)} className="hover:opacity-75 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form className="p-lg space-y-md overflow-y-auto flex-grow" onSubmit={handleAddBook}>
              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Hızlı Şablon</label>
                <select 
                  value={bookTemplate}
                  onChange={(e) => setBookTemplate(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                >
                  <option value="custom">-- Manuel Kitap Girişi --</option>
                  <option value="nutuk">Atatürk - Nutuk</option>
                  <option value="sucveceza">Dostoyevski - Suç ve Ceza</option>
                  <option value="simyaci">Paulo Coelho - Simyacı</option>
                </select>
              </div>

              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Kitap Adı</label>
                <input 
                  type="text" 
                  required
                  placeholder="Kitabın adını yazın"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                />
              </div>

              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Yazar</label>
                <input 
                  type="text" 
                  required
                  placeholder="Yazar adını yazın"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                />
              </div>

              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Hangi Kütüphanede?</label>
                <select 
                  value={bookLocation}
                  onChange={(e) => setBookLocation(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                >
                  {libraries.map(lib => (
                      <option key={lib} value={lib}>{lib}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Kapak Görseli</label>
                <div className="flex items-center gap-sm">
                  {bookImage ? (
                    <img src={bookImage} alt="Önizleme" className="w-12 h-16 object-contain rounded border border-outline-variant bg-white" />
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
                  placeholder="Kitap özetini buraya yazabilirsiniz..."
                  value={bookSummary}
                  onChange={(e) => setBookSummary(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                ></textarea>
              </div>

              <div className="flex justify-end gap-sm pt-sm border-t border-surface-container-highest">
                <button type="button" onClick={() => setAddModalOpen(false)} className="px-md py-sm font-label-md text-on-surface-variant hover:bg-surface-container rounded-lg">İptal</button>
                <button type="submit" className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm cursor-pointer">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
