import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig';

// Check if configuration is set
const isConfigured = () => {
  return (
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('BURAYA_PROJECT_URL_GELECEK') &&
    !SUPABASE_ANON_KEY.includes('BURAYA_ANON_PUBLIC_KEY_GELECEK')
  );
};

const getHeaders = () => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

export const supabaseService = {
  isConfigured,

  // --- LIBRARIES (Eski Laboratories) ---
  async getLibraries() {
    if (!isConfigured()) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/libraries?select=name`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        return data.map(item => item.name);
      }
      console.error('Supabase getLibraries error:', await res.text());
      return null;
    } catch (e) {
      console.error('Supabase network error (getLibraries):', e);
      return null;
    }
  },

  async addLibrary(name) {
    if (!isConfigured()) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/libraries`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        return true;
      }
      console.error('Supabase addLibrary error:', await res.text());
      return false;
    } catch (e) {
      console.error('Supabase network error (addLibrary):', e);
      return false;
    }
  },

  // --- BOOKS (Eski Devices) ---
  async getBooks() {
    if (!isConfigured()) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/books?select=*`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
      console.error('Supabase getBooks error:', await res.text());
      return null;
    } catch (e) {
      console.error('Supabase network error (getBooks):', e);
      return null;
    }
  },

  async getBookById(id) {
    if (!isConfigured()) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/books?id=eq.${id}&select=*`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        return data.length > 0 ? data[0] : null;
      }
      console.error('Supabase getBookById error:', await res.text());
      return null;
    } catch (e) {
      console.error('Supabase network error (getBookById):', e);
      return null;
    }
  },

  async addBook(book) {
    if (!isConfigured()) return null;
    try {
      // Strip local temp client fields like createdAt
      const payload = {
        id: book.id,
        title: book.title,
        author: book.author || '',
        location: book.location,
        status: book.status || 'Müsait',
        is_in_library: book.is_in_library !== undefined ? book.is_in_library : true,
        borrowed_by: book.borrowed_by || null,
        borrowed_date: book.borrowed_date || null,
        days_to_return: book.days_to_return !== undefined ? book.days_to_return : null,
        image: book.image || '',
        summary: book.summary || '',
        logs: Array.isArray(book.logs) ? book.logs : []
      };
      
      const res = await fetch(`${SUPABASE_URL}/rest/v1/books`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        return data.length > 0 ? data[0] : payload;
      }
      console.error('Supabase addBook error:', await res.text());
      return null;
    } catch (e) {
      console.error('Supabase network error (addBook):', e);
      return null;
    }
  },

  async updateBook(id, fields) {
    if (!isConfigured()) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/books?id=eq.${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(fields)
      });
      if (res.ok) {
        const data = await res.json();
        return data.length > 0 ? data[0] : null;
      }
      console.error('Supabase updateBook error:', await res.text());
      return null;
    } catch (e) {
      console.error('Supabase network error (updateBook):', e);
      return null;
    }
  },

  async deleteBook(id) {
    if (!isConfigured()) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/books?id=eq.${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        return true;
      }
      console.error('Supabase deleteBook error:', await res.text());
      return false;
    } catch (e) {
      console.error('Supabase network error (deleteBook):', e);
      return false;
    }
  },

  async deleteAllBooks() {
    if (!isConfigured()) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/books?id=not.is.null`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        return true;
      }
      console.error('Supabase deleteAllBooks error:', await res.text());
      return false;
    } catch (e) {
      console.error('Supabase network error (deleteAllBooks):', e);
      return false;
    }
  }
};
