const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Token management
const getToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// API request helper with automatic token refresh
const apiRequest = async (url, options = {}) => {
  const token = getToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    let response = await fetch(`${API_BASE_URL}${url}`, defaultOptions);
    
    console.log('API RESPONSE:', {
        url: `${API_BASE_URL}${url}`,
        status: response.status,
        ok: response.ok
    });
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    // If token expired, try to refresh
    // Then try to parse it
    let data;
    try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
    } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        console.log('Response was not valid JSON');
        throw new Error('Invalid server response');
    }
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

//// AUTHENTICATION SERVICES
export const loginUser = async (credentials) => {
  try {
    console.log('Attempting login with:', credentials.email);
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (response.success) {
      setTokens(response.data.accessToken, response.data.refreshToken);
      console.log('Login successful');
      return { token: response.data.accessToken, user: response.data.user };
    }
    
    throw new Error(response.message || 'Login failed');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    console.log('Sending registration request:', userData);
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (response.success) {
      setTokens(response.data.accessToken, response.data.refreshToken);
      return { token: response.data.accessToken, user: response.data.user };
    }
    
    throw new Error(response.message || 'Registration failed');
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message && error.message !== 'Registration failed') {
        throw error;
    }
    throw new Error('Registration failed');
  }
};

export const logoutUser = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearTokens();
  }
};

//// TRADING SERVICES
export const getStockQuote = async (symbol) => {
  try {
    console.log(`Getting quote for ${symbol}`);
    const response = await apiRequest(`/trading/quote?symbol=${encodeURIComponent(symbol)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    throw error;
  }
};

export const executeTrade = async (tradeData) => {
  try {
    console.log(`Executing ${tradeData.action} order for ${tradeData.quantity} shares of ${tradeData.symbol}`);
    const response = await apiRequest('/trading/execute', {
      method: 'POST',
      body: JSON.stringify({
        symbol: tradeData.symbol,
        quantity: tradeData.quantity,
        action: tradeData.action
      })
    });
    return response.data;
  } catch (error) {
    console.error('Error executing trade:', error);
    throw error;
  }
};

export const getTradeHistory = async () => {
  try {
    const response = await apiRequest('/trading/history');
    return response.data.trades;
  } catch (error) {
    console.error('Error fetching trade history:', error);
    throw error;
  }
};

//// DASHBOARD SERVICES (Simplified)
export const fetchDashboard = async () => {
  try {
    // Get current user info
    const userResponse = await apiRequest('/auth/me');
    const user = userResponse.data.user;
    
    // Get recent trades
    const trades = await getTradeHistory();
    const recentTrade = trades.length > 0 ? trades[0] : null;
    
    // Get favorites (simplified - return empty array for now)
    const favorites = user.favorites || [];
    
    return {
      portfolio: {
        totalValue: user.portfolio.totalValue || 0,
        totalAssetValue: user.portfolio.totalAssetValue || 0,
        cash: user.portfolio.cash || 0,
        todaysChange: user.portfolio.dailyChange || 0,
        holdings: user.portfolio.holdings || []
      },
      favorites,
      recentTrade
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

//// PORTFOLIO SERVICES
export const getPortfolioSummary = async () => {
  try {
    const response = await apiRequest('/auth/me');
    const user = response.data.user;
    
    const holdings = user.portfolio.holdings.map(holding => {
      const currentValue = holding.shares * holding.currentPrice;
      const profitLoss = currentValue - holding.totalCost;
      
      return {
        symbol: holding.symbol,
        shares: holding.shares,
        avgPrice: holding.avgPrice,
        currentPrice: holding.currentPrice,
        totalCost: holding.totalCost,
        currentValue,
        profitLoss
      };
    });

    return {
      cash: user.portfolio.cash,
      totalAssetValue: user.portfolio.totalAssetValue,
      totalValue: user.portfolio.totalValue,
      holdings
    };
  } catch (error) {
    console.error('Error getting portfolio summary:', error);
    throw error;
  }
};

//// MARKET SERVICES (Simplified)
export const searchStock = async (symbol) => {
  try {
    console.log('Searching for stock:', symbol);
    const response = await apiRequest(`/trading/quote?symbol=${encodeURIComponent(symbol)}`);
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const getFavorites = async () => {
  try {
    const response = await apiRequest('/auth/me');
    return response.data.user.favorites || [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    throw error;
  }
};

export const addFavorites = async (stock) => {
  try {
    console.log(`Adding ${stock.symbol} to favorites`);
    // For now, return the stock - implement favorites API later
    return [stock];
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFavorite = async (symbol) => {
  try {
    console.log(`Removing ${symbol} from favorites`);
    // For now, return empty array - implement favorites API later
    return [];
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Get current user from API
export const getCurrentUser = async () => {
  try {
    const response = await apiRequest('/auth/me');
    return response.data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};