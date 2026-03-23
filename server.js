const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/surat', require('./routes/suratRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Frontend: http://localhost:${PORT}`);
});