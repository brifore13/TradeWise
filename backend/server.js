import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';                
import User from './models/User.js';
import authRoutes from './routes/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with detailed logging
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tradewise', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connection Successful');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message); 
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);

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
    },
    endpoints: {
      auth: '/api/auth',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      refresh: 'POST /api/auth/refresh',
      logout: 'POST /api/auth/logout',
      me: 'GET /api/auth/me'
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

//  404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Handle server errors
const server = app.listen(PORT, (err) => {
  console.log(`TradeWise server running on port ${PORT}`);
  console.log(`Auth endpoints: http://localhost:${PORT}/api/auth`)
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