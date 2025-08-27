import axios from 'axios';
import { config } from '../config.js';

// Alpha Vantage API config
const API_KEY = config.alphaVantageApiKey;
const BASE_URL = 'https://www.alphavantage.co/query';

// Debug: Check API key loading
console.log('StockService - API_KEY loaded:', API_KEY ? 'YES' : 'NO', API_KEY ? `(${API_KEY.substring(0, 4)}...)` : '(undefined)');

// Mock data for development/fallback
const MOCK_DATA = {
    "AAPL": {
      "Global Quote": {
        "01. symbol": "AAPL",
        "02. open": "174.21",
        "03. high": "176.82",
        "04. low": "173.45",
        "05. price": "175.28",
        "06. volume": "58427693",
        "07. latest trading day": "2025-01-21",
        "08. previous close": "174.18",
        "09. change": "1.10",
        "10. change percent": "0.63%"
      }
    },
    "GOOGL": {
      "Global Quote": {
        "01. symbol": "GOOGL",
        "02. open": "181.32",
        "03. high": "183.78",
        "04. low": "180.65",
        "05. price": "182.45",
        "06. volume": "34829163",
        "07. latest trading day": "2025-01-21",
        "08. previous close": "181.25",
        "09. change": "1.20",
        "10. change percent": "0.66%"
      }
    },
    "MSFT": {
      "Global Quote": {
        "01. symbol": "MSFT",
        "02. open": "416.25",
        "03. high": "419.65",
        "04. low": "414.92",
        "05. price": "417.82",
        "06. volume": "28743619",
        "07. latest trading day": "2025-01-21",
        "08. previous close": "415.73",
        "09. change": "2.09",
        "10. change percent": "0.50%"
      }
    },
    "NVDA": {
      "Global Quote": {
        "01. symbol": "NVDA",
        "02. open": "876.32",
        "03. high": "894.67",
        "04. low": "872.15",
        "05. price": "880.15",
        "06. volume": "63241758",
        "07. latest trading day": "2025-01-21",
        "08. previous close": "874.28",
        "09. change": "5.87",
        "10. change percent": "0.67%"
      }
    },
    "TSLA": {
      "Global Quote": {
        "01. symbol": "TSLA",
        "02. open": "174.12",
        "03. high": "177.38",
        "04. low": "172.85",
        "05. price": "175.43",
        "06. volume": "78425913",
        "07. latest trading day": "2025-01-21",
        "08. previous close": "173.62",
        "09. change": "1.81",
        "10. change percent": "1.04%"
      }
    },
    "META": {
      "Global Quote": {
        "01. symbol": "META",
        "02. open": "484.25",
        "03. high": "488.73",
        "04. low": "482.91",
        "05. price": "486.18",
        "06. volume": "23176485",
        "07. latest trading day": "2025-01-21",
        "08. previous close": "483.47",
        "09. change": "2.71",
        "10. change percent": "0.56%"
      }
    },
    "AMZN": {
      "Global Quote": {
        "01. symbol": "AMZN",
        "02. open": "179.82",
        "03. high": "182.16",
        "04. low": "179.15",
        "05. price": "180.75",
        "06. volume": "41985274",
        "07. latest trading day": "2025-01-21",
        "08. previous close": "179.24",
        "09. change": "1.51",
        "10. change percent": "0.84%"
      }
    }
  };

// Format stock data response
const formatStockData = (quote, symbol) => {
    if (!quote || !quote['Global Quote']) {
        return null;
    }
    const globalQuote = quote['Global Quote'];

    return {
        symbol: symbol || globalQuote['01. symbol'],
        price: globalQuote['05. price'],
        change: globalQuote['10. change percent'],
        changeAmount: globalQuote['09. change'],
        open: globalQuote['02. open'],
        high: globalQuote['03. high'],
        low: globalQuote['04. low'],
        volume: globalQuote['06. volume'],
        previousClose: globalQuote['08. previous close'],
        latestTradingDay: globalQuote['07. latest trading day']
    };
};

// Get stock price from Alpha Vantage API
const fetchFromAPI = async (symbol) => {
    if (!API_KEY) {
        throw new Error('Alpha Vantage API key not configured');
    }

    try {
        console.log(`Fetching ${symbol} from Alpha Vantage API...`);
        
        const response = await axios.get(BASE_URL, {
            params: {
                function: 'GLOBAL_QUOTE',
                symbol: symbol,
                apikey: API_KEY
            },
            timeout: 10000
        });
        
        console.log(`API Response for ${symbol}:`, response.data);

        if (response.data['Error Message']) {
            throw new Error('Invalid symbol or API error');
        }

        if (response.data['Note']) {
            throw new Error('API rate limit exceeded');
        }

        if (!response.data['Global Quote']) {
            throw new Error('No data returned from API');
        }

        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`API Error: ${error.response.status} - ${error.response.statusText}`)
        } else if (error.request) {
            throw new Error('Network error: Unable to reach stock data API')
        } else {
            throw new Error(`Request error: ${error.message}`)
        }
    }
}

// Get single stock price
const getStockPrice = async (symbol) => {
    try {
        symbol = symbol.toUpperCase();
        console.log(`Getting stock price for: ${symbol}`);

        let stockData;

        // Try API first if key is available
        if (API_KEY) {
            try {
                const apiData = await fetchFromAPI(symbol);
                stockData = formatStockData(apiData, symbol);
                console.log(`Successfully fetched ${symbol} from API`);
            } catch (apiError) {
                console.warn(`API fetch failed for ${symbol}, falling back to mock data:`, apiError.message);
                stockData = formatStockData(MOCK_DATA[symbol], symbol);
            }
        } else {
            console.warn('No API key found, using mock data');
            stockData = formatStockData(MOCK_DATA[symbol], symbol);
        }

        if (!stockData) {
            throw new Error('Stock not found');
        }

        return stockData;
    } catch (error) {
        console.error(`Error fetching stock price for ${symbol}:`, error);
        throw error;
    }
};

// Get multiple stock prices
const getMultipleStockPrices = async (symbols) => {
    try {
        const results = {};

        const fetchPromises = symbols.map(async (symbol) => {
            try {
                const stockData = await getStockPrice(symbol);
                results[symbol.toUpperCase()] = stockData;
            } catch (error) {
                console.warn(`Failed to fetch ${symbol}:`, error.message);
                results[symbol.toUpperCase()] = null;
            }
        });
        await Promise.all(fetchPromises);

        return results;
    } catch (error) {
        console.error('Error fetching multiple stock prices:', error);
        throw error;
    }
};

// Search for stocks
const searchStocks = async (query) => {
    try {
        query = query.toUpperCase();
        console.log(`Searching for: ${query}`);

        // For now, try exact match first
        try {
            const stockData = await getStockPrice(query);
            return [stockData];
        } catch (error) {
            // If exact match fails, check mock data for partial matches
            const mockSymbols = Object.keys(MOCK_DATA);
            const partialMatches = mockSymbols.filter(symbol =>
                symbol.includes(query)
            ).slice(0, 10);

            if (partialMatches.length > 0) {
                const results = await Promise.all(
                    partialMatches.map(symbol => getStockPrice(symbol))
                );
                return results.filter(Boolean);
            }

            // No matches found
            throw new Error('No stocks found matching your search');
        }
    } catch (error) {
        console.error('Error searching stocks:', error);
        throw error;
    }
}

// Validate stock symbol
const validateSymbol = async (symbol) => {
    try {
        const stockData = await getStockPrice(symbol);
        return !!stockData;
    } catch (error) {
        return false;
    }
}

// Get market summary for popular stocks
const getMarketSummary = async () => {
    try {
        const popularSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA'];
        const marketData = await getMultipleStockPrices(popularSymbols);
        
        return Object.entries(marketData)
          .filter(([_, data]) => data !== null)
          .map(([symbol, data]) => ({
            symbol,
            price: data.price,
            change: data.change,
            changeAmount: data.changeAmount
          }));
      } catch (error) {
        console.error('Error fetching market summary:', error);
        throw error;
      }
}

export {
    formatStockData,
    fetchFromAPI,
    getStockPrice,
    getMultipleStockPrices,
    searchStocks,
    validateSymbol,
    getMarketSummary
};