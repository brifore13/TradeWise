import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const holdingSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        uppercase: true
    },
    shares: {
        type: Number,
        required: true,
        min: 0
    },
    avgPrice: {
        type: Number,
        required: true,
        min: 0
    },
    totalCost: {
        type: Number,
        required: true,
        min: 0
    },
    currentPrice: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const portfolioSchema = new mongoose.Schema({
    cash: {
        type: Number,
        default: 10000,
        min: 0
    },
    totalValue: {
        type: Number,
        default: 10000
    },
    totalAssetValue: {
        type: Number,
        default: 0
    },
    dailyChange: {
        type: Number,
        default: 0
    },
    dailyChangePercent: {
        type: Number,
        default: 0
    },
    holdings: [holdingSchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const favoriteSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        uppercase: true
    },
    name: {
        type: String,
        default: function() { return this.symbol; }
    },
    lastPrice: String,
    lastChange: String,
    lastChangeAmount: String,
    addedAt: {
        type: Date, 
        default: Date.now
    }
});

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [ /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false
    },
    portfolio: {
        type: portfolioSchema,
        default: () => ({})
    },
    favorites: [favoriteSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    refreshTokens: [{
        token: String,
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 604800 // 7 days
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: {virtuals: true }
})

// Virtual for full name
userSchema.virtual('fullname').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for portfolio profit/loss
userSchema.virtual('portfolio.totalProfitLoss').get(function() {
    if (!this.portfolio.holdings || this.portfolio.holdings.length === 0) {
        return 0;
    } 

    return this.portfolio.holdings.reduce((total, holding) => {
        const currentValue = holding.shares * holding.currentPrice;
        const profitLoss = currentValue - holding.totalCost;
        return total + profitLoss
    }, 0)
})

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ 'portfolio.holdings.symbol': 1 });
userSchema.index({ 'favorites.symbol': 1 });

// save middleware to hash password
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        // hash password with cost 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next()
    } catch (error) {
        next(error);
    }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

// Method to update portfolio value
userSchema.methods.updatePortfolioValue = function() {
    if (!this.portfolio.holdings || this.portfolio.holdings.length === 0) {
        this.portfolio.totalAssetValue = 0;
        this.portfolio.totalValue = this.portfolio.cash;
        return;
    }

    this.portfolio.totalAssetValue = this.portfolio.holdings.reduce((total, holding) => {
        return total + (holding.shares * holding.currentPrice);
    }, 0);

    this.portfolio.totalValue = this.portfolio.cash + this.portfolio.totalAssetValue;
    this.portfolio.lastUpdated = new Date();
}

// Method to add holding or update existing
userSchema.methods.addHolding = function(symbol, shares, price) {
    const existingHolding = this.portfolio.holdings.find(h => h.symbol === symbol);
    
    if (existingHolding) {
      // Update existing holding (weighted average price)
      const totalCost = existingHolding.totalCost + (shares * price);
      const totalShares = existingHolding.shares + shares;
      
      existingHolding.shares = totalShares;
      existingHolding.avgPrice = totalCost / totalShares;
      existingHolding.totalCost = totalCost;
      existingHolding.lastUpdated = new Date();
    } else {
      // Add new holding
      this.portfolio.holdings.push({
        symbol,
        shares,
        avgPrice: price,
        totalCost: shares * price,
        currentPrice: price
      });
    }
  };

//  Method to remove shares from holdings
userSchema.methods.removeHolding = function(symbol, shares) {
    const holding = this.portfolio.holdings.find(h => h.symbol === symbol);
    
    if (!holding) {
        throw new Error('Holding not found');
    }
    
    if (holding.shares < shares) {
        throw new Error('Insufficient shares');
    }
    
    if (holding.shares === shares) {
        // Remove holding completely
        this.portfolio.holdings = this.portfolio.holdings.filter(h => h.symbol !== symbol);
    } else {
        // Reduce shares proportionally
        const sellRatio = shares / holding.shares;
        holding.totalCost -= holding.totalCost * sellRatio;
        holding.shares -= shares;
        holding.lastUpdated = new Date();
    }
};

// Method to clean up expired refresh tokens
userSchema.methods.cleanupRefreshTokens = function() {
    const now = new Date();
    this.refreshTokens = this.refreshTokens.filter(tokenObj => {
        return tokenObj.createdAt.getTime() + (7 * 24 * 60 * 60 * 1000) > now.getTime();
});
};
  
export default mongoose.model('User', userSchema);