import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { getMultipleStockPrices } from '../services/stockService.js';

const router = express.Router();

// Apply authentication to all portfolio routes
router.use(authenticateToken);

// @route   GET /api/portfolio
// @desc    Get user's portfolio with current values
// @access  Private
router.get('/', async (req, res) => {
    try {
        const userId = req.userId;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // If no holdings, return basic portfolio
        if (!user.portfolio.holdings || user.portfolio.holdings.length === 0) {
            return res.json({
                success: true,
                data: {
                    cash: user.portfolio.cash,
                    totalValue: user.portfolio.cash,
                    totalAssetValue: 0,
                    dailyChange: 0,
                    dailyChangePercent: 0,
                    holdings: []
                }
            });
        }

        // Get current prices for all holdings
        const symbols = user.portfolio.holdings.map(h => h.symbol);
        const currentPrices = await getMultipleStockPrices(symbols);

        // Update holdings with current prices and calculate values
        let totalAssetValue = 0;
        let totalDailyChange = 0;

        const updatedHoldings = user.portfolio.holdings.map(holding => {
            const currentData = currentPrices[holding.symbol];
            const currentPrice = currentData ? parseFloat(currentData.price) : holding.currentPrice;
            const previousClose = currentData ? parseFloat(currentData.previousClose) : holding.currentPrice;
            
            const currentValue = holding.shares * currentPrice;
            const previousValue = holding.shares * previousClose;
            const dailyChange = currentValue - previousValue;
            const profitLoss = currentValue - holding.totalCost;
            const profitLossPercent = (profitLoss / holding.totalCost) * 100;

            totalAssetValue += currentValue;
            totalDailyChange += dailyChange;

            // Update holding's current price
            holding.currentPrice = currentPrice;

            return {
                symbol: holding.symbol,
                shares: holding.shares,
                avgPrice: holding.avgPrice,
                currentPrice: currentPrice,
                currentValue: currentValue,
                totalCost: holding.totalCost,
                profitLoss: profitLoss,
                profitLossPercent: profitLossPercent,
                dailyChange: dailyChange,
                dailyChangePercent: previousValue > 0 ? (dailyChange / previousValue) * 100 : 0
            };
        });

        const totalValue = user.portfolio.cash + totalAssetValue;
        const dailyChangePercent = totalValue > 0 ? (totalDailyChange / (totalValue - totalDailyChange)) * 100 : 0;

        // Update user's portfolio with current values
        user.portfolio.totalAssetValue = totalAssetValue;
        user.portfolio.totalValue = totalValue;
        user.portfolio.dailyChange = totalDailyChange;
        user.portfolio.dailyChangePercent = dailyChangePercent;
        
        await user.save();

        res.json({
            success: true,
            data: {
                cash: user.portfolio.cash,
                totalValue: totalValue,
                totalAssetValue: totalAssetValue,
                dailyChange: totalDailyChange,
                dailyChangePercent: dailyChangePercent,
                holdings: updatedHoldings
            }
        });

    } catch (error) {
        console.error('Portfolio error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching portfolio'
        });
    }
});

export default router;