import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    symbol: {
        type: String,
        required: [true, 'Stock symbol is required'],
        uppercase: true,
        trim: true,
        index: true
    },
    action: {
        type: String,
        required: [true, 'Trade action is required'],
        enum: {
            values: ['BUY', 'SELL'],
            message: 'Action must be either BUY or SELL'
        }
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'],
        validate: {
            validator: Number.isInteger,
            message: 'Quantity must be a whole number'
        }
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0.0001, 'Price must be greater than 0']
    },
    total: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0.01, 'Total must be greater than 0']
    },
    fees: {
        type: Number,
        default: 0,
        min: [0, 'Fees cannot be negative']
    },
    status: {
        type: String,
        enum: ['PENDING', 'EXECUTED', 'CANCELLED', 'FAILED'],
        default: 'EXECUTED'
    },
    orderType: {
        type: String,
        enum: ['MARKET', 'LIMIT', 'STOP'],
        default: 'MARKET'
    },
    executedAt: {
        type: Date,
        default: Date.now
    },
    // Portfolio values at time of trade
    portfolioSnapshot: {
        cashBefore: Number,
        cashAfter: Number,
        totalValueBefore: Number,
        totalValueAfter: Number
    },
    // Market data at time of trade
    marketData: {
        askPrice: Number,
        bidPrice: Number,
        volume: Number
    },
    // Additional 
    source: {
        type: String,
        enum: ['WEB', 'MOBILE', 'API'],
        default: 'WEB'
    },
    ipAddress: String,
    userAgent: String
    }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
tradeSchema.index({ user: 1, createdAt: -1 });
tradeSchema.index({ symbol: 1, createdAt: -1 });
tradeSchema.index({ user: 1, symbol: 1, createdAt: -1 });
tradeSchema.index({ action: 1, createdAt: -1 });

//  format Total
tradeSchema.virtual('formattedTotal').get(function() {
    return `$${this.total.toFixed(2)}`;
});

// Static method to get trade statistics for a user
tradeSchema.static.getTradeStates = function(userId, timeframe = '30d') {
    const now = new Date();
    let startDate;

    switch (timeframe) {
        case '1d':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // All time
}

return this.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: startDate },
        status: 'EXECUTED'
      }
    },
    {
      $group: {
        _id: null,
        totalTrades: { $sum: 1 },
        totalVolume: { $sum: '$total' },
        buyTrades: {
          $sum: { $cond: [{ $eq: ['$action', 'BUY'] }, 1, 0] }
        },
        sellTrades: {
          $sum: { $cond: [{ $eq: ['$action', 'SELL'] }, 1, 0] }
        },
        avgTradeSize: { $avg: '$total' },
        totalFees: { $sum: '$fees' }
      }
    }
  ]);
};

// Static method to get most traded symbols for a user
tradeSchema.statics.getMostTradedSymbols = function(userId, limit = 10) {
    return this.aggregate([
      {
        $match: {
          user: userId,
          status: 'EXECUTED'
        }
      },
      {
        $group: {
          _id: '$symbol',
          tradeCount: { $sum: 1 },
          totalVolume: { $sum: '$total' },
          lastTradeDate: { $max: '$createdAt' }
        }
      },
      {
        $sort: { tradeCount: -1, totalVolume: -1 }
      },
      {
        $limit: limit
      }
    ]);
  };

export default mongoose.model('Trade', tradeSchema)