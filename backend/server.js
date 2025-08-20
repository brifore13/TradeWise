import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

// Load environment variables
dotenv.config();

console.log('🔍 Environment Debug Info:');
console.log('PORT from env:', process.env.PORT);
console.log('MONGODB_URI from env:', process.env.MONGODB_URI);

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(express.json());

// MongoDB connection with detailed logging
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/tradewise');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tradewise', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Connected Successfully!');
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Host: ${conn.connection.host}:${conn.connection.port}`);
    
    // Test the connection with a simple query
    const admin = mongoose.connection.db.admin();
    const result = await admin.ping();
    console.log('MongoDB Ping:', result);
    
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('ECONNREFUSED')) {
      console.log('MongoDB is not running. Try:');
      console.log('brew services start mongodb/brew/mongodb-community');
    } else if (error.message.includes('Authentication failed')) {
      console.log('Authentication issue. Check your MongoDB credentials.');
    }
    
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'TradeWise Backend Server Running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    database: {
      status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      name: mongoose.connection.name
    }
  });
});

// Health check with database status
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const dbStatus = mongoose.connection.readyState;
    const dbStatusText = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };

    // Ping database
    let dbPing = null;
    if (dbStatus === 1) {
      const admin = mongoose.connection.db.admin();
      dbPing = await admin.ping();
    }

    res.json({
      status: 'OK',
      server: 'TradeWise Backend',
      version: '1.0.0',
      port: PORT,
      database: {
        status: dbStatusText[dbStatus],
        ping: dbPing,
        name: mongoose.connection.name,
        host: mongoose.connection.host
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database health check failed',
      error: error.message
    });
  }
});

// Test endpoint to create a user
app.post('/test-user', async (req, res) => {
  try {
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@tradewise.com',
      password: 'TestPassword123!'
    });

    await testUser.save();

    res.json({
      success: true,
      message: 'Test user created successfully!',
      user: {
        id: testUser._id,
        name: testUser.fullName,
        email: testUser.email,
        portfolio: testUser.portfolio
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Database info endpoint
app.get('/db-info', async (req, res) => {
  try {
    const admin = mongoose.connection.db.admin();
    const dbStats = await mongoose.connection.db.stats();
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    res.json({
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      stats: {
        collections: dbStats.collections,
        dataSize: dbStats.dataSize,
        indexSize: dbStats.indexSize,
        storageSize: dbStats.storageSize
      },
      collections: collections.map(col => col.name)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get database info',
      message: error.message
    });
  }
});

// Handle server errors
const server = app.listen(PORT, (err) => {
  if (err) {
    console.error('Server failed to start:', err);
    process.exit(1);
  }
  console.log(`TradeWise server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Visit: http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use!`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    server.close(() => {
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    server.close(() => {
      process.exit(0);
    });
  });
});

export default app;