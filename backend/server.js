import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import authRoutes from './routes/auth.js';
import tradingRoutes from './routes/trading.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with detailed logging
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tradewise', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Connected Successfully!');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

//  ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/trading', tradingRoutes);

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'TradeWise Backend Running!',
    endpoints: {
      auth: '/api/auth',
      trading: '/api/trading',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      quote: 'GET /api/trading/quote?symbol=AAPL',
      execute: 'POST /api/trading/execute',
      history: 'GET /api/trading/history'
    }
  });
});

// Health check with database status
app.get('/health', async (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start Server
const server = app.listen(PORT, (err) => {
  if (err) {
    console.error('Server failed to start:', err);
    process.exit(1);
  }
  console.log(`TradeWise server running on port ${PORT}`);
  console.log(`Auth: http://localhost:${PORT}/api/auth`);
  console.log(`Trading: http://localhost:${PORT}/api/trading`);
});

// Error handling
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use!`);
    process.exit(1);
  } 
});


export default app;