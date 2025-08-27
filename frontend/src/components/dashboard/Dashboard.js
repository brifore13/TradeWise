import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboard, getFavorites, getTradeHistory } from "../../services/api";

const Dashboard = () => {
    const [showHelp, setShowHelp] = useState(false);
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState({
        portfolio: {
            totalValue: 0,
            todaysChange: 0,
            holdings: []
        },
        marketSummary: {}
    });
    const [favorites, setFavorites] = useState([]);
    const [recentTrade, setRecentTrade] = useState(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const data = await fetchDashboard();
                setDashboardData(data);
            } catch (error) {
                console.error('Error loading dashboard:', error);
            }
        };
        loadDashboardData();
    }, []);

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const data = await getFavorites();
                setFavorites(data);
            } catch (error) {
                console.error('Error loading favorites:', error);
            }
        };
        loadFavorites();
    }, []);

    useEffect(() => {
        const loadRecentTrade = async () => {
            try {
                const trades = await getTradeHistory();
                if (trades && trades.length > 0) {
                    const sortedTrades = [...trades].sort((a, b) =>
                        new Date(b.timestamp) - new Date(a.timestamp)
                    );
                    setRecentTrade(sortedTrades[0]);
                }
            } catch (error) {
                console.error('Error loading trade history:', error);
            }
        };
        loadRecentTrade();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="page-layout">
            {/* Navigation */}
            <nav className="nav">
                <div className="nav-container">
                    <a href="/dashboard" className="nav-logo">TradeWise</a>
                    <div className="nav-links">
                        <button onClick={() => navigate('/market')} className="nav-link">
                            Market
                        </button>
                        <button onClick={() => navigate('/trading')} className="nav-link">
                            Trading
                        </button>
                        <button onClick={() => navigate('/portfolio')} className="nav-link">
                            Portfolio
                        </button>
                        <button onClick={() => navigate('/dashboard')} className="nav-link active">
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
                    {/* Portfolio Overview */}
                    <div className="card card-md mb-8">
                        <div className="card-header">
                            <div className="flex justify-between items-center">
                                <h2 className="card-title">Portfolio Overview</h2>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setShowHelp(!showHelp)}
                                >
                                    Help
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="value-item">
                                <div className="value-label">Total Value</div>
                                <div className="value-amount">
                                    ${dashboardData.portfolio.totalValue.toFixed(2)}
                                </div>
                            </div>
                            <div className="value-item">
                                <div className="value-label">Today's Change</div>
                                <div className={`value-amount ${dashboardData.portfolio.todaysChange >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {dashboardData.portfolio.todaysChange >= 0 ? '+' : ''}
                                    ${Math.abs(dashboardData.portfolio.todaysChange).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Grid Container */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Market Favorites */}
                        <div className="card card-md">
                            <h3 className="card-title">Your Market Favorites</h3>
                            <div className="space-y-4">
                                {favorites.length > 0 ? (
                                    favorites.map(stock => (
                                        <div key={stock.symbol} className="flex justify-between items-center">
                                            <span className="font-medium text-primary">{stock.symbol}</span>
                                            <span className={`font-semibold ${!stock.change.includes('-') ? 'text-success' : 'text-danger'}`}>
                                                {stock.change}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-secondary text-center">
                                        No favorites yet. Visit the Market page to add some!
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Most Recent Trade */}
                        <div className="card card-md">
                            <h3 className="card-title">Most Recent Trade</h3>
                            {recentTrade ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-secondary">Action:</span>
                                        <span className={`font-semibold ${recentTrade.action === 'BUY' ? 'text-success' : 'text-danger'}`}>
                                            {recentTrade.action}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-secondary">Symbol:</span>
                                        <span className="font-medium">{recentTrade.symbol}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-secondary">Quantity:</span>
                                        <span className="font-medium">{recentTrade.quantity} shares</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-secondary">Price:</span>
                                        <span className="font-medium">${parseFloat(recentTrade.price).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-3 mt-3">
                                        <span className="font-semibold">Total:</span>
                                        <span className="font-bold">${parseFloat(recentTrade.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-sm text-secondary mb-4">
                                        No trades recorded yet.
                                    </p>
                                    <button 
                                        onClick={() => navigate('/trading')} 
                                        className="btn btn-primary btn-sm"
                                    >
                                        Make Your First Trade
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Help Tooltip */}
                    {showHelp && (
                        <div className="card card-md mt-8 bg-gray-50">
                            <h3 className="text-lg font-semibold text-primary mb-4">Dashboard Help</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-primary mb-2">Portfolio Overview:</h4>
                                    <p className="text-sm text-secondary">
                                        Total Value is the combined value of all your assets. 
                                        Today's Change shows how your portfolio has performed today.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary mb-2">Market Favorites:</h4>
                                    <p className="text-sm text-secondary">
                                        Quick snapshot of your favorite stocks' performance for today.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary mb-2">Recent Trade:</h4>
                                    <p className="text-sm text-secondary">
                                        Shows details of your most recent trade activity.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary mb-2">Navigation:</h4>
                                    <p className="text-sm text-secondary">
                                        Use the navigation bar to access Market data, Trading tools, and Portfolio management.
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

export default Dashboard;