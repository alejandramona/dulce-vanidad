const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const migrateRoutes = require('./routes/migrate');

const app = express();

// CORS abierto — acepta cualquier vercel.app y localhost sin necesitar variable de entorno
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com') ||
      origin.startsWith('http://localhost')
    ) {
      return callback(null, true);
    }
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    callback(new Error('No permitido por CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/migrate', migrateRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: err.message || 'Error interno' });
});

module.exports = app;