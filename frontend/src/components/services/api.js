const BASE_URL = 'http://localhost:9000';

// Dashboard service
export const fetchDashboard = async () => {
    try {
        const response = await fetch(`${BASE_URL}/dashboard`);
        if (!response.ok) throw new Error(`HTTP error. status: ${response.status}`);
        const data = await response.json()
        return data;
    } catch (error) {
        console.error('Error fetching dashboard data', error)
        throw error;
    }
};


// Market service
export const fetchMarketData = async () => {
    try {
        const response = await fetch(`${BASE_URL}/market`);
        if(!response.ok) throw new Error(`HTTP error. status: ${response.status}`);
        data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching market data', error);
        throw error
    }
};