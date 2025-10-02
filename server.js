const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const depositRoutes = require('./routes/deposits');
const authRoutes = require('./routes/auth');
const setupPassport = require('./auth/passport');
const cookieParser = require('cookie-parser');
const { requireAuth } = require('./middleware/authMiddleware');

const app = express();
// When running behind a proxy (Render, Heroku, etc.) trust the first proxy so
// secure cookies and req.protocol work as expected. Only enable in production.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
// Configure CORS to allow the frontend to send/receive cookies for auth
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
// Initialize passport strategies
setupPassport();
app.use(require('passport').initialize());

// Auth routes
app.use('/auth', authRoutes);

// Protect API endpoints (optional): requireAuth middleware can be applied per-route.
app.use('/api/deposits', depositRoutes);

// Simple health and root endpoints to help verify the server is running (useful in prod)
app.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));
app.get('/', (req, res) => res.send('FD Tracker backend'));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Start the HTTP server regardless of MongoDB availability so auth routes are reachable
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Try to connect to MongoDB if MONGO_URI is provided; log errors but don't crash the server
if (MONGO_URI) {
  mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
} else {
  console.warn('MONGO_URI not set — skipping MongoDB connection.');
}
