const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();

// CORS - permite Vercel frontend + localhost dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
}));

// Límite aumentado a 10mb para soportar imágenes en base64
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Error interno del servidor' });
});

module.exports = app;