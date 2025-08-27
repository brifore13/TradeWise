import express from 'express';
import User from '../models/User.js';
import Trade from '../models/Trade.js';
import cors from 'cors';
import { getStockPrice, searchStocks } from '../services/stockService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to trading routes
router.use(authenticateToken);

// @route   GET /api/trading/search
// @desc    Search for stocks
// @access  Private
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const searchResults = await searchStocks(q.trim());

        res.json({
            success: true,
            data: {
                query: q,
                results: searchResults,
                count: searchResults.length
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error searching stocks'
        });
    }
});

// @route   GET /api/trading/quote
// @desc    Get stock quote for trading
// @access  Private
router.get('/quote', async (req, res) => {
    try {
        const { symbol } = req.query;

        if (!symbol) {
            return res.status(400).json({
                success: false,
                message: 'Symbol is required'
            });
        }

        const stockData = await getStockPrice(symbol.toUpperCase());

        res.json({
            success: true,
            data: stockData
        });
    } catch (error) {
        console.error('Quote error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stock quote'
        });
    }
});

// @route   POST /api/trading/execute
// @desc    Execute a trade (BUY or SELL)
// @access  Private
router.post('/execute', async (req, res) => {
    try {
      const { symbol, quantity, action } = req.body;
      const userId = req.userId;
  
      // Basic validation
      if (!symbol || !quantity || !action) {
        return res.status(400).json({
          success: false,
          message: 'Symbol, quantity, and action are required'
        });
      }
  
      // Get current stock price
      const stockData = await getStockPrice(symbol.toUpperCase());
      const currentPrice = parseFloat(stockData.price);
      const total = quantity * currentPrice;
  
      // Get user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
  
      // Portfolio snapshot before trade
      const portfolioSnapshot = {
        cashBefore: user.portfolio.cash,
        totalValueBefore: user.portfolio.totalValue
      };
  
      // Execute trade based on action
      if (action === 'BUY') {
        // Check if user has enough cash
        if (user.portfolio.cash < total) {
          return res.status(400).json({
            success: false,
            message: `Insufficient funds. Need $${total.toFixed(2)}, have $${user.portfolio.cash.toFixed(2)}`
          });
        }
        
        // Execute buy
        user.portfolio.cash -= total;
        user.addHolding(symbol.toUpperCase(), quantity, currentPrice);
        
      } else if (action === 'SELL') {
        // Check if user has enough shares
        const holding = user.portfolio.holdings.find(h => h.symbol === symbol.toUpperCase());
        
        if (!holding || holding.shares < quantity) {
          const availableShares = holding ? holding.shares : 0;
          return res.status(400).json({
            success: false,
            message: `Insufficient shares. Need ${quantity}, have ${availableShares}`
          });
        }
        
        // Execute sell
        user.portfolio.cash += total;
        user.removeHolding(symbol.toUpperCase(), quantity);
      }
  
      // Update portfolio value
      user.updatePortfolioValue();
  
      // Complete portfolio snapshot
      portfolioSnapshot.cashAfter = user.portfolio.cash;
      portfolioSnapshot.totalValueAfter = user.portfolio.totalValue;
  
      // Create trade record
      const trade = new Trade({
        user: userId,
        symbol: symbol.toUpperCase(),
        quantity: Number(quantity),
        action: action.toUpperCase(),
        price: currentPrice,
        total,
        portfolioSnapshot
      });
  
      // Save everything
      await Promise.all([
        trade.save(),
        user.save()
      ]);
  
      // Return success
      res.status(201).json({
        success: true,
        message: `${action} order executed successfully`,
        data: {
          trade: {
            id: trade._id,
            symbol: trade.symbol,
            action: trade.action,
            quantity: trade.quantity,
            price: trade.price,
            total: trade.total
          },
          portfolio: {
            cash: user.portfolio.cash,
            totalValue: user.portfolio.totalValue
          }
        }
      });
  
    } catch (error) {
      console.error('Trade execution error:', error);
      res.status(500).json({
        success: false,
        message: 'Error executing trade'
      });
    }
  });

// @route   GET /api/trading/history
// @desc    Get user's trade history
// @access  Private
router.get('/history', async (req, res) => {
    try {
        const userId = req.userId;

        const trades = await Trade.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .select('symbol action quantity price total createdAt');

        res.json({
            success: true,
            data: { trades }
        });
    } catch (error) {
        console.error('Trade history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching trade history'
        });
    }   
});

export default router;