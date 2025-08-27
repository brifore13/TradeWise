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
    const [loading, setLoading] = useState(false);

    // Search for stock
    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        
        try {
            setLoading(true);
            setError(null);
            const data = await searchStock(searchTerm);
            setSearchResult(data);
        } catch (error) {
            console.error('Search failed:', error);
            setError('Stock not found. Please check the symbol and try again.');
            setSearchResult(null);
        } finally {
            setLoading(false);
        }
    };

    // Add to favorites
    const handleAddFavorites = async () => {
        if (searchResult) {
            try {
                const updatedFavorites = await addFavorites(searchResult);
                setFavorites(updatedFavorites);
                setSearchResult(null);
                setSearchTerm('');
            } catch (error) {
                console.error('Failed to add to favorites', error);
                setError('Failed to add to favorites');
            }
        }
    };

    // Remove from favorites
    const handleRemoveFavorite = async (symbol) => {
        try {
            const updatedFavorites = await removeFavorite(symbol);
            setFavorites(updatedFavorites);
        } catch (error) {
            console.error('Failed to remove from favorites:', error);
            setError('Failed to remove from favorites');
        }
    };

    // Load favorites on component mount
    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const data = await getFavorites();
                setFavorites(data || []);
            } catch (error) {
                console.error('Failed to load favorites', error);
            }
        };
        loadFavorites();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="page-layout">
            {/* Navigation */}
            <nav className="nav">
                <div className="nav-container">
                    <a href="/dashboard" className="nav-logo">TradeWise</a>
                    <div className="nav-links">
                        <button onClick={() => navigate('/market')} className="nav-link active">
                            Market
                        </button>
                        <button onClick={() => navigate('/trading')} className="nav-link">
                            Trading
                        </button>
                        <button onClick={() => navigate('/portfolio')} className="nav-link">
                            Portfolio
                        </button>
                        <button onClick={() => navigate('/dashboard')} className="nav-link">
                            Dashboard
                        </button>
                        <button onClick={handleLogout} className="btn btn-primary btn-sm">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="main-layout">
                <div className="container">
                    {/* Search Section */}
                    <div className="card card-md mb-8">
                        <div className="card-header">
                            <h2 className="card-title">Stock Search</h2>
                            <button 
                                className="btn btn-ghost btn-sm"
                                onClick={() => setShowHelp(!showHelp)}
                            >
                                Help
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-secondary mb-6">
                                Search for stocks by symbol (e.g., MSFT for Microsoft Corp)
                            </p>
                        </div>

                        <div className="flex gap-4 mb-6">
                            <input 
                                type="text"
                                placeholder="Enter stock symbol..."
                                className="form-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                                onKeyPress={handleKeyPress}
                            />
                            <button
                                className="btn btn-primary"
                                onClick={handleSearch}
                                disabled={loading || !searchTerm.trim()}
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-danger">{error}</p>
                            </div>
                        )}

                        {/* Search Results */}
                        {searchResult && (
                            <div className="card-sm bg-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-primary">Search Result</h3>
                                    <button 
                                        className="btn btn-success btn-sm"
                                        onClick={handleAddFavorites}
                                    >
                                        Add to Favorites
                                    </button>
                                </div>
                                
                                <div className="stock-item">
                                    <div className="stock-header">
                                        <div>
                                            <div className="stock-symbol">{searchResult.symbol}</div>
                                        </div>
                                        <div className="stock-price">
                                            <div className="price">${parseFloat(searchResult.price).toFixed(2)}</div>
                                            <div className={`change ${parseFloat(searchResult.change) >= 0 ? 'text-success' : 'text-danger'}`}>
                                                {searchResult.change}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                
                    {/* Favorites Section */}
                    <div className="card card-md">
                        <div className="card-header">
                            <h2 className="card-title">Your Favorite Stocks</h2>
                            <div className="text-sm text-secondary">
                                {favorites.length} {favorites.length === 1 ? 'stock' : 'stocks'} saved
                            </div>
                        </div>

                        {favorites.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-secondary mb-4">No favorite stocks yet</p>
                                <p className="text-sm text-muted mb-6">
                                    Search for stocks above and add them to your favorites for quick access
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {favorites.map(stock => (
                                    <div key={stock.symbol} className="stock-item">
                                        <div className="stock-header">
                                            <div>
                                                <div className="stock-symbol">{stock.symbol}</div>
                                                {stock.name && (
                                                    <div className="stock-name">{stock.name}</div>
                                                )}
                                            </div>
                                            <div className="stock-price">
                                                <div className="price">${parseFloat(stock.price).toFixed(2)}</div>
                                                <div className={`change ${parseFloat(stock.change) >= 0 ? 'text-success' : 'text-danger'}`}>
                                                    {stock.change}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-right">
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleRemoveFavorite(stock.symbol)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Help Section */}
                    {showHelp && (
                        <div className="card card-md mt-8 bg-gray-50">
                            <h3 className="text-lg font-semibold text-primary mb-4">Market Search Help</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-primary mb-2">How to Search:</h4>
                                    <p className="text-sm text-secondary">
                                        Enter a stock symbol (like AAPL for Apple or MSFT for Microsoft) to see 
                                        current market data including price and daily change.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary mb-2">Adding Favorites:</h4>
                                    <p className="text-sm text-secondary">
                                        Save frequently watched stocks to your favorites for quick access. 
                                        Your favorites will show real-time price and change information.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary mb-2">Price Information:</h4>
                                    <p className="text-sm text-secondary">
                                        Each stock shows the current price per share and the percentage change 
                                        from the previous trading day. Green indicates positive change, red indicates negative.
                                    </p>
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                    <p className="text-xs text-secondary">
                                        <strong>Tip:</strong> Ready to trade? Click on Trading in the navigation 
                                        to buy or sell any stocks you've researched.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MarketView;