const BASE_URL = 'http://localhost:9000';

// Dashboard service
export const fetchDashboard = async () => {
    try {
        const response = await fetch(`${BASE_URL}/dashboard`);
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
        const response = await fetch(`${BASE_URL}/market`);
        
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