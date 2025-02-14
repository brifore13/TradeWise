import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMarketData } from "../../services/api"

const MarketView = () => {
    const navigate = useNavigate();
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");  // Add this
    const [showHelp, setShowHelp] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = () => {
        // TODO: Implement search functionality
        console.log("Searching for:", searchTerm);
    };

    useEffect(() => {
        const loadMarketData = async () => {
            try {
                setLoading(true);
                const data = await fetchMarketData();
                setStocks(data);
                console.log(data)
                setError(null);
            } catch (error) {
                console.error('Error loading market data:', error);
                setError('Failed to load market data');
            } finally {
                setLoading(false)
            }
        };

        loadMarketData();
        const interval = setInterval(loadMarketData, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div>Loading market data...</div>;
    if (error) return <div>Error: {error}</div>


    return (
        <div className="market-container">
            {/* Navigation */}
            <nav className="nav-bar">
                <span className="nav-logo">TradeWise</span>
                <div className="nav-links">
                    <button onClick={() => navigate('/market')} className="nav-button">Market</button>
                    <button onClick={() => navigate('/trading')} className="nav-button">Trading</button>
                    <button onClick={() => navigate('/portfolio')} className="nav-button">Portfolio</button>
                    <button onClick={() => navigate('/dashboard')} className="nav-button">Dashboard</button>
                    <button onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/login')}}
                        className="logout"> logout
                    </button>
                </div>
            </nav>


                <div className="search-container">
                    <input 
                        type="text"
                        placeholder="Search stocks..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        className="enter-button"
                        onClick={handleSearch}
                        >Enter</button>
                    <button 
                        className="help-button"
                        onClick={() => setShowHelp(!showHelp)}
                        >help
                    </button>
                </div>

                {showHelp && (
                <div className="help-tooltip">
                    <div className="help-section">
                        <span className="help-title">Search Stocks:</span>
                        <p>
                            enter a Stock's symbol
                            such as GOOG or a stock's name such as "Google" or "Alphabet Inc" to
                            see the latest market data on a given stock. 
                        </p>
                        <p>Each holding will list the current price of one share, as well as the
                        percentage of change in price for the current trading day.</p>
                    </div>
                </div>
            )}

                <div className="market-data">
                    <h2 className="section-title">Market Data</h2>
                        {stocks.map(stock => (
                        <div key={stock.symbol} className="stock-item">
                            <div className="stock-info">
                                <div className="stock-symbol">{stock.symbol}</div>
                                <div className="stock-name">{stock.name}</div>
                            </div>
                            <div className="stock-price">
                                <div className="price">${parseFloat(stock.price).toFixed(2)}</div>
                            <div className={`change ${parseFloat(stock.change) >= 0 ? 'positive' : 'negative'}`}>
                                {stock.change_percent}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MarketView;