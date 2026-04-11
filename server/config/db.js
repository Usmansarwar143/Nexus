const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    // Try local MongoDB first, fall back to in-memory server
    const mongoUri = process.env.MONGODB_URI;
    
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log(`MongoDB connected: ${mongoose.connection.host}`);
    } catch {
      console.log('Local MongoDB not available. Starting in-memory MongoDB...');
      mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`MongoDB Memory Server connected: ${memoryUri}`);
      
      // Auto-seed when using memory server (data is lost on restart)
      console.log('Auto-seeding in-memory database...');
      await require('../seed').seedData();
    }
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const getMongoServer = () => mongoServer;

module.exports = { connectDB, getMongoServer };
