import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

// Stock APIs - Now calling your backend
export const searchStock = async (query) => {
  try {
    const response = await api.get('/trading/search', {
      params: { q: query }
    });
    
    // Return the first result for compatibility with existing frontend code
    if (response.data.success && response.data.data.results.length > 0) {
      return response.data.data.results[0];
    } else {
      throw new Error('No stocks found');
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Stock search failed');
  }
};

export const getStockQuote = async (symbol) => {
  try {
    const response = await api.get('/trading/quote', {
      params: { symbol }
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get stock quote');
  }
};

// Trading APIs
export const executeTrade = async (tradeData) => {
  try {
    const response = await api.post('/trading/execute', tradeData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Trade execution failed');
  }
};

export const getTradeHistory = async () => {
  try {
    const response = await api.get('/trading/history');
    return response.data.data.trades;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get trade history');
  }
};

// Favorites APIs - Now using backend
export const getFavorites = async () => {
  try {
    const response = await api.get('/favorites');
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get favorites');
  }
};

export const addFavorites = async (stockData) => {
  try {
    const response = await api.post('/favorites', {
      symbol: stockData.symbol,
      name: stockData.name || stockData.symbol
    });
    
    // Return fresh favorites list
    const favorites = await getFavorites();
    return favorites;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add to favorites');
  }
};

export const removeFavorite = async (symbol) => {
  try {
    await api.delete(`/favorites/${symbol}`);
    
    // Return fresh favorites list
    const favorites = await getFavorites();
    return favorites;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to remove from favorites');
  }
};

// Portfolio APIs (you'll need to implement these in your backend)
export const getPortfolio = async () => {
  try {
    // This should call your backend portfolio endpoint when implemented
    const response = await api.get('/portfolio'); // You'll need to create this endpoint
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get portfolio');
  }
};

// Legacy aliases for backward compatibility
export const loginUser = login;
export const registerUser = register;

// Dashboard and portfolio functions (temporary implementations)
export const fetchDashboard = async () => {
  try {
    // Get portfolio data and recent trades for dashboard
    const [portfolio, trades] = await Promise.all([
      getPortfolio().catch(() => ({ cash: 10000, totalValue: 10000, holdings: [] })),
      getTradeHistory().catch(() => [])
    ]);
    
    return {
      portfolio,
      recentTrades: trades.slice(0, 5), // Last 5 trades
      marketSummary: [] // You can add market summary later
    };
  } catch (error) {
    throw new Error('Failed to fetch dashboard data');
  }
};

export const getPortfolioSummary = async () => {
  try {
    // This should eventually call your backend portfolio endpoint
    // For now, return mock data or basic portfolio info
    return {
      totalValue: 10000,
      cash: 5000,
      holdings: [],
      dayChange: 0,
      dayChangePercent: 0
    };
  } catch (error) {
    throw new Error('Failed to get portfolio summary');
  }
};

export default api;