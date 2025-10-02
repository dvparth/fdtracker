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
// Configure CORS to allow the frontend to send/receive cookies for auth.
// Support both local development and the deployed frontend by allowing
// a small whitelist and echoing allowed origins.
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000', 'https://localhost:3000'].filter(Boolean);
const corsOptions = {
  origin: function (origin, callback) {
    // Log the origin for easier debugging on hosted logs
    console.log('[cors] request origin:', origin);
    // Allow requests with no origin (like curl, mobile clients)
    if (!origin) return callback(null, true);
    // Allow explicit configured origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('[cors] origin allowed (explicit):', origin);
      return callback(null, true);
    }
    // Allow Netlify-hosted frontend previews and sites (*.netlify.app)
    try {
      const lc = origin.toLowerCase();
      if (lc.endsWith('.netlify.app')) {
        console.log('[cors] origin allowed (netlify):', origin);
        return callback(null, true);
      }
    } catch (e) {
      // ignore
    }
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    console.warn('[cors] origin rejected:', origin);
    return callback(new Error(msg), false);
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// Ensure preflight requests are handled
app.options('*', cors(corsOptions));

// Add a small middleware to explicitly set credentials header for clarity in logs
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  // echo the origin if allowed (useful in logs/debug)
  const origin = req.headers.origin;
  if (origin && allowedOrigins.indexOf(origin) !== -1) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  next();
});
app.use(express.json());
app.use(cookieParser());
// Simple request logger to help debug routing on hosted platforms (visible in service logs)
app.use((req, res, next) => {
  console.log(`[req] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});
// Initialize passport strategies
setupPassport();
app.use(require('passport').initialize());

// Auth routes
app.use('/auth', authRoutes);

// Protect API endpoints (optional): requireAuth middleware can be applied per-route.
app.use('/api/deposits', depositRoutes);

// Simple health and root endpoints to help verify the server is running (useful in prod)
app.get('/health', (req, res) => {
  console.log('[health] /health requested');
  return res.json({ ok: true, uptime: process.uptime() });
});
app.get('/', (req, res) => {
  console.log('[root] / requested');
  return res.send('FD Tracker backend');
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Start the HTTP server regardless of MongoDB availability so auth routes are reachable
// Bind to 0.0.0.0 to ensure the process accepts external connections in containerized environments
app.listen(PORT, '0.0.0.0', () => {
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
