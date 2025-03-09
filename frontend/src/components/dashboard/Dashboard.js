import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboard, getFavorites } from "../../services/api";

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
                        <div className="value-label">Change over Time</div>
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

                {/* Quick Trade */}
                <div className="quick-trade">
                    <h2 className="section-title">Quick Trade</h2>
                    <button className="trade-buttons buy-button">Buy</button>
                    <button className="trade-buttons sell-button">Sell</button>
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