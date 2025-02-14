import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboard } from "../services/api";

const Dashboard = () => {
    const [showHelp, setShowHelp] = useState(false);
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchDashboard();
                setDashboardData(data);
            } catch (error) {
                console.error('Error loading dashboard:', error);
            }
        };
        loadData();
    }, []);

    if (!dashboardData) return <div>Loading...</div>;

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
                        <div className="value-amount">$3973.09</div>
                    </div>
                    <div className="value-item">
                        <div className="value-label">Today's Change</div>
                        <div className="value-amount positive-change">+215.67</div>
                    </div>
                </div>
            </div>
            
            {/* Grid Container */}
            <div className="grid-container">
                {/* Market Summary */}
                <div className="market-summary">
                    <h2 className="section-title">Market Summary</h2>
                    <div className="market-item">
                        <span className="market-name">S&P 500</span>
                        <span className="market-value positive-change">+0.2%</span>
                    </div>
                    <div className="market-item">
                        <span className="market-name">Dow Jones</span>
                        <span className="market-value" style={{'color': '#ef4444'}}>-1.5%</span>
                    </div>
                    <div className="market-item">
                        <span className="market-name">NASDAQ</span>
                        <span className="market-value positive-change">+0.89%</span>
                    </div>
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