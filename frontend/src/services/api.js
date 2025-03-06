//// LOGIN SERVICES
// Login User
export const loginUser = async (credentials) => {
    try {
        console.log('Attempting login with:', credentials)
        const response = await fetch(`http://localhost:9000/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        const data = await response.json()

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Login failed');
        }

        console.log('login successful')
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// register user
export const registerUser = async (userData) => {
    try {
        const response = await fetch(`http://localhost:9000/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        })
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}




//// DASHBOARD SERVICE
export const fetchDashboard = async () => {
    try {
        const response = await fetch(`http://localhost:9001/dashboard`);
        if (!response.ok) throw new Error(`HTTP error. status: ${response.status}`);
        const data = await response.json()
        console.log('Dashboard data received: ', data)
        return data;
    } catch (error) {
        console.error('Error fetching dashboard data', error)
        throw error;
    }
};


//// MARKET SERVICE
// Find stock
export const searchStock = async(symbol) => {
    try {
        console.log('Searching for stock:', symbol);
        const response = await fetch(`http://localhost:9002/market/search?symbol=${symbol}`);
        if (!response.ok) throw new Error(`HTTP error. status ${response.status}`);
        return await response.json()
    } catch (error) {
        console.error('Search error:', error);
        throw error;
    }
}

// GET favorites
export const getFavorites = async () => {
    try {
        console.log('Fetching favorites')
        const response = await fetch(`http://localhost:9002/market/favorites`);
        if (!response.ok) throw new Error(`HTTP error. status ${response.status}`);
        return await response.json()
    } catch (error) {
        console.error('Error getting favorites:', error);
        throw error;
    }
}

// POST favorites
export const addFavorites = async (stock) => {
    try {
        console.log(`Add ${stock.symbol} to favorites`)
        const response = await fetch(`http://localhost:9002/market/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stock)
        });
        if (!response.ok) throw new Error(`HTTP error. status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error adding to favorites', error);
        throw error;
    }
}

// DELETE favorites
export const removeFavorite = async (symbol) => {
    try {
        console.log(`Removing ${symbol} from favorites`)
        const response = await fetch(`http://localhost:9002/market/favorites/${symbol}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`HTTP error. status: ${response.status}`)
        return await response.json();
    } catch (error) {
        console.error('Error removing favorite:', error)
        throw error;
    }
}


//// TRADING
// POST Execute trade
export const executeTrade = async (tradData) => {
    try {
        console.log(`Executing ${tradeData.action} order for ${tradeData.quantity}`)
        const response = await fetch('https://localhost:9003/trading/execute', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(tradData)
        });

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `HTTP error. status: ${response.status}`)
        }
        return await response.json();
    } catch (error) {
        console.error('Error executing trade:', error);
        throw error;
    }
}

// GET trade history
export const getTradHistory = async () => {
    try {
        const response = await fetch('http://localhost:9003/trading/history');
        if (!response.ok) {
            throw new Error(`HTTP error. status ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching trade history', error)
        throw error;
    }
}