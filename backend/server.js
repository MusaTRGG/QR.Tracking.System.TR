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
    return { laboratories: [], devices: [] };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing to database file", error);
  }
}

// 1. Laboratories Endpoints
app.get('/api/laboratories', (req, res) => {
  const db = readDB();
  res.json(db.laboratories || []);
});

app.post('/api/laboratories', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: "Geçersiz laboratuvar adı." });
  }
  const db = readDB();
  if (db.laboratories.some(l => l.toLowerCase() === name.trim().toLowerCase())) {
    return res.status(400).json({ error: "Laboratuvar zaten mevcut." });
  }
  db.laboratories.push(name.trim());
  writeDB(db);
  res.json(db.laboratories);
});

// 2. Devices Endpoints
app.get('/api/devices', (req, res) => {
  const db = readDB();
  res.json(db.devices || []);
});

app.get('/api/devices/:id', (req, res) => {
  const db = readDB();
  const found = db.devices.find(d => d.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: "Cihaz bulunamadı." });
  }
  res.json(found);
});

app.post('/api/devices', (req, res) => {
  const newDevice = req.body;
  if (!newDevice || !newDevice.id || !newDevice.name) {
    return res.status(400).json({ error: "Cihaz verisi eksik veya geçersiz." });
  }
  
  const db = readDB();
  // Check if device already exists
  const exists = db.devices.some(d => d.id === newDevice.id);
  if (exists) {
    return res.status(400).json({ error: "Bu ID'ye sahip bir cihaz zaten kayıtlı." });
  }
  
  db.devices.push(newDevice);
  writeDB(db);
  res.status(201).json(newDevice);
});

app.put('/api/devices/:id', (req, res) => {
  const updatedFields = req.body;
  const db = readDB();
  const index = db.devices.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Cihaz bulunamadı." });
  }
  db.devices[index] = { ...db.devices[index], ...updatedFields };
  writeDB(db);
  res.json(db.devices[index]);
});

app.post('/api/devices/:id/logs', (req, res) => {
  const { log } = req.body;
  if (!log || !log.date || !log.type) {
    return res.status(400).json({ error: "Günlük verisi eksik veya geçersiz." });
  }
  const db = readDB();
  const index = db.devices.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Cihaz bulunamadı." });
  }
  
  const currentDevice = db.devices[index];
  
  // Update state attributes depending on action
  let updatedEfficiency = currentDevice.efficiency;
  let updatedStatus = currentDevice.status;
  let updatedLastMaintenance = currentDevice.lastMaintenance;
  
  if (log.type === 'Arıza Bildirimi') {
    updatedStatus = 'Arızalı';
    updatedEfficiency = Math.floor(Math.random() * 20 + 30);
  } else if (log.type === 'Bakım') {
    updatedStatus = 'Operasyonel';
    updatedEfficiency = 100;
    updatedLastMaintenance = log.date.split(' ')[0] || new Date().toLocaleDateString('tr-TR');
  } else if (log.type === 'Durum Güncelleme') {
    updatedStatus = 'Operasyonel';
    updatedEfficiency = 100;
  }
  
  const updatedLogs = [log, ...(currentDevice.logs || [])];
  
  db.devices[index] = {
    ...currentDevice,
    status: updatedStatus,
    efficiency: updatedEfficiency,
    lastMaintenance: updatedLastMaintenance,
    logs: updatedLogs
  };
  
  writeDB(db);
  res.json(db.devices[index]);
});

// 3. Delete All Devices Endpoint
app.delete('/api/devices', (req, res) => {
  const db = readDB();
  db.devices = [];
  writeDB(db);
  res.json({ message: "Tüm cihazlar başarıyla silindi." });
});

// 4. Delete Device Endpoint
app.delete('/api/devices/:id', (req, res) => {
  const db = readDB();
  const exists = db.devices.some(d => d.id === req.params.id);
  if (!exists) {
    return res.status(404).json({ error: "Cihaz bulunamadı." });
  }
  db.devices = db.devices.filter(d => d.id !== req.params.id);
  writeDB(db);
  res.json({ message: "Cihaz başarıyla silindi." });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
