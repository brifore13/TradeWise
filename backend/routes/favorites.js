import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { getStockPrice } from '../services/stockService.js';

const router = express.Router();

// Apply authentication to all favorites routes
router.use(authenticateToken);

// @route   GET /api/favorites
// @desc    Get user's favorite stocks
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

        // Get fresh stock data for each favorite
        const favoritesWithData = await Promise.all(
            user.favorites.map(async (favorite) => {
                try {
                    const stockData = await getStockPrice(favorite.symbol);
                    return {
                        symbol: favorite.symbol,
                        name: favorite.name,
                        price: stockData.price,
                        change: stockData.change,
                        changeAmount: stockData.changeAmount,
                        addedAt: favorite.addedAt
                    };
                } catch (error) {
                    console.warn(`Failed to get fresh data for ${favorite.symbol}:`, error.message);
                    // Return stored data if API fails
                    return {
                        symbol: favorite.symbol,
                        name: favorite.name,
                        price: favorite.lastPrice || '0.00',
                        change: favorite.lastChange || '0.00%',
                        changeAmount: favorite.lastChangeAmount || '0.00',
                        addedAt: favorite.addedAt
                    };
                }
            })
        );

        res.json({
            success: true,
            data: favoritesWithData
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching favorites'
        });
    }
});

// @route   POST /api/favorites
// @desc    Add stock to favorites
// @access  Private
router.post('/', async (req, res) => {
    try {
        const userId = req.userId;
        const { symbol, name } = req.body;

        if (!symbol) {
            return res.status(400).json({
                success: false,
                message: 'Symbol is required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already in favorites
        const alreadyExists = user.favorites.some(fav => fav.symbol === symbol.toUpperCase());
        if (alreadyExists) {
            return res.status(400).json({
                success: false,
                message: 'Stock already in favorites'
            });
        }

        // Get current stock data
        let stockData;
        try {
            stockData = await getStockPrice(symbol.toUpperCase());
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid stock symbol'
            });
        }

        // Add to favorites
        user.favorites.push({
            symbol: symbol.toUpperCase(),
            name: name || symbol.toUpperCase(),
            lastPrice: stockData.price,
            lastChange: stockData.change,
            lastChangeAmount: stockData.changeAmount,
            addedAt: new Date()
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Stock added to favorites',
            data: {
                symbol: symbol.toUpperCase(),
                name: name || symbol.toUpperCase(),
                price: stockData.price,
                change: stockData.change,
                changeAmount: stockData.changeAmount
            }
        });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding to favorites'
        });
    }
});

// @route   DELETE /api/favorites/:symbol
// @desc    Remove stock from favorites
// @access  Private
router.delete('/:symbol', async (req, res) => {
    try {
        const userId = req.userId;
        const { symbol } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Remove from favorites
        const initialLength = user.favorites.length;
        user.favorites = user.favorites.filter(fav => fav.symbol !== symbol.toUpperCase());
        
        if (user.favorites.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Stock not found in favorites'
            });
        }

        await user.save();

        res.json({
            success: true,
            message: 'Stock removed from favorites'
        });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing from favorites'
        });
    }
});

export default router;