import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../supabaseService';

export default function DeviceDashboard() {
  const { id } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isBorrowModalOpen, setBorrowModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  // Edit Book Form State
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editImage, setEditImage] = useState('');

  // Borrow Form State
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowDays, setBorrowDays] = useState(14);

  const fetchBook = async () => {
    setLoading(true);
    let success = false;
    let data = null;

    try {
      const response = await fetch(`/api/books/${id}`);
      if (response.ok) {
        data = await response.json();
        success = true;
      }
    } catch (e) {
      console.warn("Backend connection failed, trying Supabase/localStorage", e);
    }

    if (!success && supabaseService.isConfigured()) {
      const cloudData = await supabaseService.getBookById(id);
      if (cloudData) {
        data = cloudData;
        success = true;
      }
    }

    if (success && data) {
      setBook(data);
      setEditTitle(data.title || '');
      setEditAuthor(data.author || '');
      setEditLocation(data.location || '');
      setEditSummary(data.summary || '');
      setEditImage(data.image || '');
      
      // Sync back to localStorage
      const saved = localStorage.getItem('qr-books');
      if (saved) {
        const books = JSON.parse(saved);
        const foundIdx = books.findIndex(b => b.id === id);
        if (foundIdx !== -1) {
          books[foundIdx] = data;
          localStorage.setItem('qr-books', JSON.stringify(books));
        }
      }
      setLoading(false);
      return;
    }

    // LocalStorage fallback
    const saved = localStorage.getItem('qr-books');
    if (saved) {
      const books = JSON.parse(saved);
      const found = books.find(b => b.id === id);
      if (found) {
        setBook(found);
        setEditTitle(found.title || '');
        setEditAuthor(found.author || '');
        setEditLocation(found.location || '');
        setEditSummary(found.summary || '');
        setEditImage(found.image || '');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  if (loading) return <div className="p-xl text-center text-on-surface">Yükleniyor...</div>;

  if (!book) {
    return (
      <div className="max-w-[600px] mx-auto text-center space-y-md py-xl">
        <span className="material-symbols-outlined text-error text-5xl">error</span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Kitap Bulunamadı</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Aradığınız "{id}" ID'li kitap veritabanında bulunamadı. Lütfen QR kodunun doğru olduğundan emin olun veya kitaplar sayfasından yeni bir kitap ekleyin.
        </p>
        <Link to="/inventory" className="inline-flex items-center justify-center bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md hover:opacity-90 transition-all">
          Kitap Envanterine Git
        </Link>
      </div>
    );
  }

  const updateBook = async (updatedFields, newLog) => {
    let success = false;
    let finalBookState = null;
    try {
      let response;
      if (newLog) {
        response = await fetch(`/api/books/${id}/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ log: newLog })
        });
      } else {
        response = await fetch(`/api/books/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFields)
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        setBook(data);
        finalBookState = data;
        success = true;
      }
    } catch (e) {
      console.warn("Backend update failed, trying Supabase", e);
    }

    if (!success && supabaseService.isConfigured()) {
      const currentBook = await supabaseService.getBookById(id);
      if (currentBook) {
        let updatedBookFields = { ...updatedFields };
        if (newLog) {
          let updatedStatus = currentBook.status;
          let updatedIsInLibrary = currentBook.is_in_library;
          let updatedBorrowedBy = currentBook.borrowed_by;
          let updatedBorrowedDate = currentBook.borrowed_date;
          let updatedDaysToReturn = currentBook.days_to_return;
          
          if (newLog.type === 'Ödünç Alma') {
            updatedStatus = 'Ödünç Verildi';
            updatedIsInLibrary = false;
            updatedBorrowedBy = newLog.user;
            updatedBorrowedDate = newLog.date.split(' ')[0] || new Date().toLocaleDateString('tr-TR');
            updatedDaysToReturn = newLog.daysToReturn || 14;
          } else if (newLog.type === 'İade Etme') {
            updatedStatus = 'Müsait';
            updatedIsInLibrary = true;
            updatedBorrowedBy = null;
            updatedBorrowedDate = null;
            updatedDaysToReturn = null;
          }
          
          updatedBookFields = {
            ...updatedBookFields,
            status: updatedStatus,
            is_in_library: updatedIsInLibrary,
            borrowed_by: updatedBorrowedBy,
            borrowed_date: updatedBorrowedDate,
            days_to_return: updatedDaysToReturn,
            logs: [newLog, ...(currentBook.logs || [])]
          };
        }
        
        const updated = await supabaseService.updateBook(id, updatedBookFields);
        if (updated) {
          setBook(updated);
          finalBookState = updated;
          success = true;
        }
      }
    }

    // Sync to localStorage as fallback
    const saved = localStorage.getItem('qr-books');
    if (saved) {
      const books = JSON.parse(saved);
      const foundIdx = books.findIndex(b => b.id === id);
      if (foundIdx !== -1) {
        if (success && finalBookState) {
          books[foundIdx] = finalBookState;
        } else {
          const currentBook = books[foundIdx];
          let updatedDev = { ...currentBook, ...updatedFields };
          if (newLog) {
            let updatedStatus = currentBook.status;
            let updatedIsInLibrary = currentBook.is_in_library;
            let updatedBorrowedBy = currentBook.borrowed_by;
            let updatedBorrowedDate = currentBook.borrowed_date;
            let updatedDaysToReturn = currentBook.days_to_return;
            
            if (newLog.type === 'Ödünç Alma') {
              updatedStatus = 'Ödünç Verildi';
              updatedIsInLibrary = false;
              updatedBorrowedBy = newLog.user;
              updatedBorrowedDate = newLog.date.split(' ')[0] || new Date().toLocaleDateString('tr-TR');
              updatedDaysToReturn = newLog.daysToReturn || 14;
            } else if (newLog.type === 'İade Etme') {
              updatedStatus = 'Müsait';
              updatedIsInLibrary = true;
              updatedBorrowedBy = null;
              updatedBorrowedDate = null;
              updatedDaysToReturn = null;
            }
            
            updatedDev = {
              ...currentBook,
              ...updatedFields,
              status: updatedStatus,
              is_in_library: updatedIsInLibrary,
              borrowed_by: updatedBorrowedBy,
              borrowed_date: updatedBorrowedDate,
              days_to_return: updatedDaysToReturn,
              logs: [newLog, ...(currentBook.logs || [])]
            };
          }
          books[foundIdx] = updatedDev;
          if (!success) {
            setBook(updatedDev);
          }
        }
        localStorage.setItem('qr-books', JSON.stringify(books));
      }
    }
  };

  const handleBorrowSubmit = (e) => {
    e.preventDefault();
    if (!borrowerName.trim()) return;

    const newLog = {
      date: new Date().toLocaleString('tr-TR'),
      type: 'Ödünç Alma',
      description: `${borrowerName} isimli üyeye ${borrowDays} günlüğüne ödünç verildi.`,
      user: borrowerName,
      daysToReturn: parseInt(borrowDays)
    };

    updateBook({}, newLog);
    setBorrowModalOpen(false);
    setBorrowerName('');
    alert('Kitap başarıyla ödünç verildi.');
  };

  const handleReturnSubmit = () => {
    if (window.confirm("Bu kitabın kütüphaneye iade edildiğini onaylıyor musunuz?")) {
      const newLog = {
        date: new Date().toLocaleString('tr-TR'),
        type: 'İade Etme',
        description: 'Kitap kütüphaneye teslim edildi, rafa yerleştirildi.',
        user: user?.name || 'Kütüphane Görevlisi'
      };
      updateBook({}, newLog);
      alert('Kitap başarıyla iade alındı.');
    }
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
      description: 'Kitap bilgileri ve kapak görseli güncellendi.',
      user: user?.name || 'Kütüphane Görevlisi'
    };
    const updatedFields = {
      title: editTitle,
      author: editAuthor,
      location: editLocation,
      summary: editSummary,
      image: editImage,
      logs: [newLog, ...(book.logs || [])]
    };
    updateBook(updatedFields);
    setEditModalOpen(false);
    alert('Kitap bilgileri başarıyla güncellendi.');
  };

  const handleDeleteBook = async () => {
    if (window.confirm("Bu kitabı envanterden kalıcı olarak silmek istediğinize emin misiniz?")) {
      let success = false;
      try {
        const response = await fetch(`/api/books/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          success = true;
        }
      } catch (e) {
        console.warn("Backend delete failed, trying Supabase", e);
      }

      if (!success && supabaseService.isConfigured()) {
        const deleted = await supabaseService.deleteBook(id);
        if (deleted) {
          success = true;
        }
      }

      // Sync with localStorage
      const saved = localStorage.getItem('qr-books');
      if (saved) {
        const books = JSON.parse(saved);
        const filtered = books.filter(b => b.id !== id);
        localStorage.setItem('qr-books', JSON.stringify(filtered));
      }

      alert("Kitap envanterden silindi.");
      window.location.href = '/inventory';
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto text-on-surface">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md mb-lg border-b border-outline-variant pb-md">
        <div>
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-3xl">menu_book</span>
            <h1 className="font-headline-xl text-headline-xl">{book.title}</h1>
            <button 
              onClick={() => setEditModalOpen(true)}
              className="text-on-surface-variant hover:text-primary p-xs rounded-full hover:bg-surface-container-high transition-colors flex items-center justify-center cursor-pointer"
              title="Kitap Bilgilerini Düzenle"
            >
              <span className="material-symbols-outlined text-[24px]">edit</span>
            </button>
            <button 
              onClick={handleDeleteBook}
              className="text-on-surface-variant hover:text-error p-xs rounded-full hover:bg-surface-container-high transition-colors flex items-center justify-center cursor-pointer"
              title="Kitabı Sil"
            >
              <span className="material-symbols-outlined text-[24px]">delete</span>
            </button>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Yazar: {book.author} | ISBN/ID: {book.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-grid-gutter">
        {/* Left Side: Book Cover & Main Info */}
        <div className="lg:col-span-1 space-y-md">
          <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-sm flex flex-col items-center">
            {book.image ? (
              <img src={book.image} alt={book.title} className="w-full max-w-[200px] object-contain rounded border border-outline bg-white shadow-md mb-md" />
            ) : (
              <div className="w-full max-w-[200px] aspect-[3/4] flex flex-col items-center justify-center rounded border border-outline bg-surface-container-low text-on-surface-variant mb-md shadow-inner">
                <span className="material-symbols-outlined text-6xl mb-xs">menu_book</span>
                <span className="text-sm font-bold">KAPAK FOTOĞRAFI</span>
              </div>
            )}
            
            <div className="w-full text-center space-y-sm">
              <span className={`inline-block px-md py-xs rounded-full font-bold text-label-md uppercase tracking-wider ${book.status === 'Müsait' ? 'bg-success/15 text-success' : 'bg-error/15 text-error'}`}>
                {book.status}
              </span>
              <p className="text-body-sm text-on-surface-variant">Konum: <span className="font-semibold">{book.location}</span></p>
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-sm space-y-md">
            <h3 className="font-headline-md text-headline-md border-b border-surface-container pb-xs">Durum İşlemleri</h3>
            
            {book.status === 'Müsait' ? (
              <div className="space-y-xs">
                <p className="text-body-sm text-on-surface-variant">Kitap kütüphanede ve ödünç verilmeye hazır durumda.</p>
                <button 
                  onClick={() => setBorrowModalOpen(true)}
                  className="w-full bg-primary text-on-primary hover:opacity-90 px-md py-sm rounded-lg font-label-md text-label-md transition-colors flex items-center justify-center gap-xs cursor-pointer shadow"
                >
                  <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                  Kitabı Ödünç Ver
                </button>
              </div>
            ) : (
              <div className="space-y-sm">
                <div className="p-sm bg-error/15 text-error border border-error/20 rounded-lg space-y-xs">
                  <p className="text-label-md font-bold">Ödünç Alındı</p>
                  <p className="text-body-sm">Ödünç Alan: <span className="font-semibold">{book.borrowed_by}</span></p>
                  <p className="text-body-sm">Alma Tarihi: <span className="font-semibold">{book.borrowed_date}</span></p>
                  <p className={`text-body-sm font-bold flex items-center gap-xs ${book.days_to_return <= 3 ? 'text-error animate-pulse' : 'text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-[16px]">alarm</span>
                    Geri Teslim Süresi: {book.days_to_return} Gün
                  </p>
                </div>
                <button 
                  onClick={handleReturnSubmit}
                  className="w-full bg-success text-on-success hover:opacity-90 px-md py-sm rounded-lg font-label-md text-label-md transition-colors flex items-center justify-center gap-xs cursor-pointer shadow"
                >
                  <span className="material-symbols-outlined text-[18px]">keyboard_return</span>
                  Kitabı İade Al
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Book Details & Logs */}
        <div className="lg:col-span-2 space-y-md">
          {/* Summary / About */}
          <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-sm space-y-xs">
            <h3 className="font-headline-md text-headline-md border-b border-surface-container pb-xs">Kitap Özeti</h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {book.summary || 'Bu kitap için henüz bir özet eklenmemiş.'}
            </p>
          </div>

          {/* History Logs */}
          <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-sm space-y-md">
            <h3 className="font-headline-md text-headline-md border-b border-surface-container pb-xs">Kitap Hareket Geçmişi</h3>
            
            <div className="relative border-l-2 border-outline-variant pl-lg ml-md space-y-md py-sm">
              {(book.logs || []).map((log, index) => (
                <div key={index} className="relative">
                  {/* Timeline icon */}
                  <span className={`absolute -left-[32px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-surface ${log.type === 'Ödünç Alma' ? 'bg-error text-white' : log.type === 'İade Etme' ? 'bg-success text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {log.type === 'Ödünç Alma' ? 'assignment_ind' : log.type === 'İade Etme' ? 'keyboard_return' : 'info'}
                    </span>
                  </span>
                  <div>
                    <span className="font-label-md text-label-md text-on-surface block">{log.type}</span>
                    <p className="text-body-md text-on-surface-variant mt-xs">{log.description}</p>
                    <p className="text-[10px] text-outline mt-xs">{log.date} • İşlemi Yapan: {log.user}</p>
                  </div>
                </div>
              ))}
              {(book.logs || []).length === 0 && (
                <p className="text-body-sm text-on-surface-variant">Henüz bir hareket kaydı bulunmuyor.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Book Modal */}
      {isBorrowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-md">
          <div className="bg-surface border border-outline-variant rounded-xl w-full max-w-[450px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 text-on-surface">
            <div className="bg-primary text-on-primary px-lg py-md flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md flex items-center gap-sm">
                <span className="material-symbols-outlined">assignment_ind</span> Kitabı Ödünç Ver
              </h3>
              <button onClick={() => setBorrowModalOpen(false)} className="hover:opacity-70 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-lg space-y-md" onSubmit={handleBorrowSubmit}>
              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Ödünç Alan Üyenin Adı Soyadı</label>
                <input 
                  type="text" 
                  required
                  placeholder="Üye adını yazın"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                />
              </div>

              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Ödünç Verme Süresi (Gün)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  max="90"
                  value={borrowDays}
                  onChange={(e) => setBorrowDays(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                />
              </div>

              <div className="flex justify-end gap-sm pt-sm border-t border-surface-container-highest">
                <button type="button" onClick={() => setBorrowModalOpen(false)} className="px-md py-sm font-label-md text-on-surface-variant hover:bg-surface-container rounded-lg">İptal</button>
                <button type="submit" className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer shadow">Kitabı Teslim Et</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-md">
          <div className="bg-surface border border-outline-variant rounded-xl w-full max-w-[550px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 text-on-surface max-h-[90vh] flex flex-col">
            <div className="bg-primary text-on-primary px-lg py-md flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md flex items-center gap-sm">
                <span className="material-symbols-outlined">edit</span> Kitap Bilgilerini Güncelle
              </h3>
              <button onClick={() => setEditModalOpen(false)} className="hover:opacity-75 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form className="p-lg space-y-md overflow-y-auto flex-grow" onSubmit={handleEditSubmit}>
              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Kitap Adı</label>
                <input 
                  type="text" 
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                />
              </div>

              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Yazar</label>
                <input 
                  type="text" 
                  required
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                />
              </div>

              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Kütüphane Şubesi</label>
                <input 
                  type="text" 
                  required
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                />
              </div>

              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Kapak Görseli</label>
                <div className="flex items-center gap-sm">
                  {editImage ? (
                    <img src={editImage} alt="Önizleme" className="w-12 h-16 object-contain rounded border border-outline bg-white" />
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
                      onChange={handleEditImageChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Kitap Özeti</label>
                <textarea 
                  rows="4" 
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none text-body-md text-on-surface"
                ></textarea>
              </div>

              <div className="flex justify-end gap-sm pt-sm border-t border-surface-container-highest">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-md py-sm font-label-md text-on-surface-variant hover:bg-surface-container rounded-lg">İptal</button>
                <button type="submit" className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer shadow">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
