require('dotenv').config(); // Load environment variables at the very top

const express = require('express');
const cors = require('cors'); // 1. Import the cors package
const authRoutes = require('./routes/authRoutes');
const excelRoutes = require('./routes/excelRoutes');

const app = express();

// --- CORS Configuration ---
// 2. Configure CORS to allow requests ONLY from your Vite/React frontend
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174','https://cargo-backend-black.vercel.app'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions)); // 3. Use the cors middleware with your specific options

// --- Other Middleware ---
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// --- Routes ---
// The CORS middleware is now in place, so these routes will be correctly handled
app.use('/api/auth', authRoutes);
app.use('/api/excels', excelRoutes); // All excel routes are now prefixed with /api/excels

// Basic root route
app.get('/', (req, res) => {
    res.send('GVS Cargo API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));