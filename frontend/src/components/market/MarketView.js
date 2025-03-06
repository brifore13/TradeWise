import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addFavorites, getFavorites, removeFavorite, searchStock } from "../../services/api";

const MarketView = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState(""); 
    const [showHelp, setShowHelp] = useState(false);
    const [error, setError] = useState(null);
    const [searchResult, setSearchResult] = useState(null);
    const [favorites, setFavorites] = useState([]);

    // Search for stock
    const handleSearch = async () => {
        try {
            const data = await searchStock(searchTerm);
            setSearchResult(data);
        } catch (error) {
            console.error('Search failed:', error);
            setError('Search failed');
        }
    };

    // Add to favorites
    const handleAddFavorites = async () => {
        if (searchResult) {
            try {
                const updatedFavorites = await addFavorites(searchResult);
                setFavorites(updatedFavorites);
            } catch (error) {
                console.error('Failed to add to favorites', error)
            }
        }
    };

    // Remove from favorites
    const handleRemoveFavorite = async (symbol) => {
        try {
            const updatedFavorites = await removeFavorite(symbol);
            setFavorites(updatedFavorites)
        } catch (error) {
            console.error('Failed to remove from favorites:', error)
        }
    };

    // Load favorites
    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const data = await getFavorites();
                setFavorites(data);
            } catch (error) {
                console.error('Failed to load favorites', error)
            }
        }
        loadFavorites();
    }, []);


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
            <span>Search for stock by Symbol (ie. MSFT for Microsoft Corp)</span>

                {/* Search Bar */}
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
                {/* Show search results */}
                {searchResult && (
                    <div className="search-result">
                        <h2>Search Result</h2>
                        <div className="stock-item">
                            <div className="stock-info">
                                <div className="stock-symbol">Symbol: {searchResult.symbol}</div>
                            </div>
                            <div className="stock-price">
                                <div className="price">Price: ${parseFloat(searchResult.price).toFixed(2)}</div>
                                <div className={`change ${parseFloat(searchResult.change) >= 0 ? 'positive' : 'negative'}`}>
                                    {searchResult.change}
                                </div>
                            </div>
                        <button className="enter-button"  onClick={handleAddFavorites}>Add to Favorites</button>
                    </div>
                </div>
            )}
                
                <div className="market-data">
                    <h2 className="section-title">Favorite Stocks</h2>
                        {favorites.map(stock => (
                        <div key={stock.symbol} className="stock-item">
                            <div className="stock-info">
                                <div className="stock-symbol">{stock.symbol}</div>
                                <div className="stock-name">{stock.name}</div>
                            </div>
                            <div className="stock-price">
                                <div className="price">${parseFloat(stock.price).toFixed(2)}</div>
                                <div className={`change ${parseFloat(stock.change) >= 0 ? 'positive' : 'negative'}`}> {stock.change} </div>
                        </div>
                        <button
                            className="delete-button"
                            onClick={() => handleRemoveFavorite(stock.symbol)}
                            >Remove</button>
                    </div>
                ))}
            </div>
            {/* Help Button display */}
            {showHelp && (
                <div className="help-tooltip">
                    <div className="help-section">
                        <span className="help-title">Search Stocks:</span>
                        <p>
                            enter a Stock's symbol
                            such as MSFT for Microsoft Corp to
                            see the latest market data on a given stock. 
                        </p>
                        <p> You can save your favorite stocks for easy access by pressing 'Add to Favorite'</p>
                        <p> Each holding will list the current price of one share, as well as the
                            percentage of change in price from the previous trading day.</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MarketView;