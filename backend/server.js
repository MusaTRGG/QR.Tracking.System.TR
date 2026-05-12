import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'QR Asset Tracking API is running...' });
});

// Device Routes (Placeholder for now)
app.get('/api/devices', (req, res) => {
    // This will eventually fetch from a database
    res.json([]);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
