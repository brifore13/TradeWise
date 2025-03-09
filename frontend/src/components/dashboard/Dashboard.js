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
    const [recentTrade, setRecentTrade] = useState(null)

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

    // Get market favorites
    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const data = await getFavorites();
                setFavorites(data);
            } catch (error) {
                console.error('Error loading favorites:', error)
            }
        };
        loadFavorites();
    }, []);

    // Get recent trade
    useEffect(() => {
        const loadRecentTrade = async () => {
            try {
                const trades = await getTradeHistory();
                // sort trade by most recent
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
    }, [])


    return (
        <div className="dashboard-container">
            {/* Navigation */}
            <nav className="nav-bar">
                <span className="nav-logo">TradeWise</span>
                <div className="nav-links">
                    <button onClick={() => navigate('/market')} className="nav-button">Market</button>
                    <button onClick={() => navigate('/trading')} className="nav-button">Trading</button>
                    <button onClick={() => navigate('/portfolio')} className="nav-button">Portfolio</button>
                    <button onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/login');
                        }}
                        className="logout"
                    > logout
                    </button>
                </div>
            </nav>
            
            {/* Portfolio Overview */}
            <div className="portfolio-overview">
                <div className="overview-title">
                    <span className="section-title">Portfolio Overview</span>
                    <button
                        className="help-button"
                        onClick={() => setShowHelp(!showHelp)}
                    >help
                    </button>
                </div>
                <div className="values-container">
                    <div className="value-item">
                        <div className="value-label">Total Value</div>
                        <div className="value-amount">
                            ${dashboardData.portfolio.totalValue.toFixed(2)}
                        </div>
                    </div>
                    <div className="value-item">
                        <div className="value-label">Today's Change</div>
                        <div className={`value-amount ${dashboardData.portfolio.todaysChange >= 0 ? 'positive' : 'negative'}`}>
                            {dashboardData.portfolio.todaysChange >= 0 ? '+' : ''}
                            ${Math.abs(dashboardData.portfolio.todaysChange).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Grid Container */}
            <div className="grid-container">
                {/* Market Summary */}
                <div className="market-summary">
                    <h2 className="section-title">Your Market Favorites</h2>
                    {favorites.map(stock => (
                        <div key={stock.symbol} className="market-item">
                            <span className="market-name">{stock.symbol}</span>
                            <span className={`market-value ${!stock.change.includes('-') ? 'positive' : 'negative'}`}>
                                {stock.change}
                            </span>

                        </div>
                    ))

                    }
                </div>

                {/* Most Recent Trade */}
                <div className="grid-container">
                    {recentTrade ? (
                        <div className="market-summary">
                            <h2 className="section-title">Most Recent Trade</h2>
                            <div className="trade-row">
                                <span className="market-name">Action:</span>
                                <span className={`market-value ${recentTrade.action === 'BUY' ? 'buy-text' : 'sell-text'}`}>
                                    {recentTrade.action}
                                </span>
                            </div>
                            <div className="trade-row">
                                <span className="market-name">Symbol:</span>
                                <span className="market-value">{recentTrade.symbol}</span>
                            </div>
                            <div className="trade-row">
                                <span className="market-name">Quantity:</span>
                                <span className="market-value">{recentTrade.quantity} shares</span>
                            </div>
                            <div className="trade-row">
                                <span className="market-name">Price:</span>
                                <span className="market-value">${parseFloat(recentTrade.price).toFixed(2)}</span>
                            </div>
                            <div className="trade-row">
                                <span className="market-name">Total:</span>
                                <span className="market-value">${parseFloat(recentTrade.total).toFixed(2)}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="no-trades">No trades recorded yet. Visit the Trading page to make your first trade.</div>
                    )}
                </div>
            </div>

            {/* Help Tooltip */}
            {showHelp && (
                <div className="help-tooltip">
                <div className="help-section">
                    <div className="help-title">Portfolio Overview:</div>
                    <p className="help-text">
                    Total Value is the value of all your combined assets.
                    Today's Change is the change in the value of all assets as of the current time.
                    </p>
                </div>
                <div className="help-section">
                    <div className="help-title">Market Summary:</div>
                    <p className="help-text">snapshot of market trends for today.</p>
                </div>
                <div className="help-section">
                    <div className="help-title">Quick Trade:</div>
                    <p className="help-text">buy and sell quickly, if you already know a move you would like to make.</p>
                </div>
                <div className="help-section">
                    <div className="help-title">Navigate:</div>
                    <p className="help-text">use the upper left navigation bar to see details about the market, make a trade, or manage your portfolio.</p>
                </div>
                </div>
            )}
        </div>

    )
}


export default Dashboard