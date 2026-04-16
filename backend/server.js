require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

process.on('unhandledRejection', (err) => console.error('unhandledRejection:', err.message));
process.on('uncaughtException', (err) => console.error('uncaughtException:', err.message));
