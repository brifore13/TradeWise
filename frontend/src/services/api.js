// Login Services
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

// Register User
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




// Dashboard service
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


// Market service
export const fetchMarketData = async () => {
    try {
        console.log('Fetching market data...');
        const response = await fetch(`http://localhost:9001/market`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Market data received:', data);
        return data;
    } catch (error) {
        console.error('Error fetching market data:', error);
        throw error;
    }
};