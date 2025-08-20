const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helment');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const marketRoutes = require('./routes/market');
const tradingRoutes = require('./routes/trading');
const portfolioRoutes = require('./routes/portfolio');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth')

const app = express();

//  Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}))

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env/RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,  // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,  // limit each IP to 100 per windowsMS
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter)

// Logging middleware
if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tradewise', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
})

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/market', authenticateToken, marketRoutes);
app.use('/api/trading', authenticateToken, tradingRoutes);
app.use('/api/portfolio', authenticateToken, portfolioRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed.');
        process.exit(0);
    });
});

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`TradeWise server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    if (process.env.NODE_ENV === 'development') {
        console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    };
});

module.exports = app;