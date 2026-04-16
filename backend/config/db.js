const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      maxPoolSize: 3,
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 30000,
    });
    console.log(`✅ MongoDB conectado: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ Error MongoDB:', error.message);
    setTimeout(connectDB, 15000);
  }
};

mongoose.connection.on('disconnected', () => {
  setTimeout(connectDB, 5000);
});

module.exports = connectDB;
