import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const MarketView = () => {
    const [showHelp, setShowHelp] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = () => {
        console.log('Searching for:', searchTerm);
      };

    const stocks = [
        { symbol: 'GOOG', name: 'Alphabet Inc.', price: 201.09, change: '+2.4%' },
        { symbol: 'AAPL', name: 'Apple Inc.', price: 222.78, change: '-1.8%' },
        { symbol: 'NKE', name: 'NIKE, Inc.', price: 73.57, change: '-0.07%' }
      ];

    

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
                                <div className="price">${stock.price}</div>
                            <div className={`change ${stock.change.startsWith('+') ? 'positive' : 'negative'}`}>
                                {stock.change}
                            </div>
                            </div>
                        </div>
        ))}
                </div>
        </div>
    )
}

export default MarketView;