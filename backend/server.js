const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Helper functions to read/write JSON file database
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database file, returning empty structure", error);
    return { libraries: [], books: [] };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing to database file", error);
  }
}

// 1. Libraries Endpoints
app.get('/api/libraries', (req, res) => {
  const db = readDB();
  res.json(db.libraries || []);
});

app.post('/api/libraries', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: "Geçersiz kütüphane adı." });
  }
  const db = readDB();
  if (db.libraries.some(l => l.toLowerCase() === name.trim().toLowerCase())) {
    return res.status(400).json({ error: "Kütüphane zaten mevcut." });
  }
  db.libraries.push(name.trim());
  writeDB(db);
  res.json(db.libraries);
});

// 2. Books Endpoints
app.get('/api/books', (req, res) => {
  const db = readDB();
  res.json(db.books || []);
});

app.get('/api/books/:id', (req, res) => {
  const db = readDB();
  const found = db.books.find(b => b.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: "Kitap bulunamadı." });
  }
  res.json(found);
});

app.post('/api/books', (req, res) => {
  const newBook = req.body;
  if (!newBook || !newBook.id || !newBook.title) {
    return res.status(400).json({ error: "Kitap verisi eksik veya geçersiz." });
  }
  
  const db = readDB();
  const exists = db.books.some(b => b.id === newBook.id);
  if (exists) {
    return res.status(400).json({ error: "Bu ID'ye sahip bir kitap zaten kayıtlı." });
  }
  
  db.books.push(newBook);
  writeDB(db);
  res.status(201).json(newBook);
});

app.put('/api/books/:id', (req, res) => {
  const updatedFields = req.body;
  const db = readDB();
  const index = db.books.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Kitap bulunamadı." });
  }
  db.books[index] = { ...db.books[index], ...updatedFields };
  writeDB(db);
  res.json(db.books[index]);
});

app.post('/api/books/:id/logs', (req, res) => {
  const { log } = req.body;
  if (!log || !log.date || !log.type) {
    return res.status(400).json({ error: "Günlük verisi eksik veya geçersiz." });
  }
  const db = readDB();
  const index = db.books.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Kitap bulunamadı." });
  }
  
  const currentBook = db.books[index];
  
  let updatedStatus = currentBook.status;
  let updatedIsInLibrary = currentBook.is_in_library;
  let updatedBorrowedBy = currentBook.borrowed_by;
  let updatedBorrowedDate = currentBook.borrowed_date;
  let updatedDaysToReturn = currentBook.days_to_return;
  
  if (log.type === 'Ödünç Alma') {
    updatedStatus = 'Ödünç Verildi';
    updatedIsInLibrary = false;
    updatedBorrowedBy = log.user;
    updatedBorrowedDate = log.date.split(' ')[0] || new Date().toLocaleDateString('tr-TR');
    updatedDaysToReturn = log.daysToReturn || 14; // Default 14 days
  } else if (log.type === 'İade Etme') {
    updatedStatus = 'Müsait';
    updatedIsInLibrary = true;
    updatedBorrowedBy = null;
    updatedBorrowedDate = null;
    updatedDaysToReturn = null;
  }
  
  const updatedLogs = [log, ...(currentBook.logs || [])];
  
  db.books[index] = {
    ...currentBook,
    status: updatedStatus,
    is_in_library: updatedIsInLibrary,
    borrowed_by: updatedBorrowedBy,
    borrowed_date: updatedBorrowedDate,
    days_to_return: updatedDaysToReturn,
    logs: updatedLogs
  };
  
  writeDB(db);
  res.json(db.books[index]);
});

// 3. Delete All Books Endpoint
app.delete('/api/books', (req, res) => {
  const db = readDB();
  db.books = [];
  writeDB(db);
  res.json({ message: "Tüm kitaplar başarıyla silindi." });
});

// 4. Delete Book Endpoint
app.delete('/api/books/:id', (req, res) => {
  const db = readDB();
  const exists = db.books.some(b => b.id === req.params.id);
  if (!exists) {
    return res.status(404).json({ error: "Kitap bulunamadı." });
  }
  db.books = db.books.filter(b => b.id !== req.params.id);
  writeDB(db);
  res.json({ message: "Kitap başarıyla silindi." });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
