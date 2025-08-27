import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPortfolioSummary } from "../../services/api";

const PortfolioView = () => {
    const [showHelp, setShowHelp] = useState(false);
    const navigate = useNavigate();
    const [portfolio, setPortfolio] = useState({
        totalValue: 0,
        totalAssetValue: 0,
        cash: 0,
        holdings: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch portfolio data on component mount
    useEffect(() => {
        fetchPortfolioData();
    }, []);

    const fetchPortfolioData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPortfolioSummary();
            console.log('Portfolio data received:', data);
            setPortfolio(data || {
                totalValue: 0,
                totalAssetValue: 0,
                cash: 0,
                holdings: []
            });
        } catch (err) {
            console.error('Portfolio fetch error:', err);
            setError('Failed to load portfolio data');
        } finally {
            setLoading(false);
        }
    };

    // Safe calculation of total profit/loss
    const calculateTotalProfitLoss = () => {
        if (!portfolio.holdings || portfolio.holdings.length === 0) {
            return 0;
        }
        
        return portfolio.holdings.reduce((total, holding) => {
            const shares = holding.shares || 0;
            const currentPrice = holding.currentPrice || 0;
            const totalCost = holding.totalCost || 0;
            
            const currentValue = shares * currentPrice;
            const profitLoss = currentValue - totalCost;
            
            return total + profitLoss;
        }, 0);
    };

    const totalProfitLoss = calculateTotalProfitLoss();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/');
    };

    if (loading) {
        return (
            <div className="portfolio-container">
                <div className="loading">Loading portfolio data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="portfolio-container">
                <div className="error-container">
                    <div className="error-message">{error}</div>
                    <button onClick={fetchPortfolioData} className="refresh-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="portfolio-container">
            {/* Navigation */}
            <nav className="nav-bar">
                <span className="nav-logo">TradeWise</span>
                <div className="nav-links">
                    <button onClick={() => navigate('/market')} className="nav-button">
                        Market
                    </button>
                    <button onClick={() => navigate('/trading')} className="nav-button">
                        Trading
                    </button>
                    <button onClick={() => navigate('/portfolio')} className="nav-button">
                        Portfolio
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="nav-button">
                        Dashboard
                    </button>
                    <button onClick={handleLogout} className="logout">
                        Logout
                    </button>
                </div>
            </nav>

            {/* Portfolio Summary */}
            <div className="portfolio-summary">
                <div className="summary-header">
                    <h2 className="section-title">Portfolio Summary</h2>
                    <div className="action-buttons">
                        <button 
                            className="help-button" 
                            onClick={() => setShowHelp(!showHelp)}
                        >
                            Help
                        </button>
                        <button 
                            className="refresh-button" 
                            onClick={fetchPortfolioData}
                            disabled={loading}
                        >
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                <div className="summary-content">
                    <div className="value-item">
                        <div className="value-label">Total Value</div>
                        <div className="value-amount">
                            ${(portfolio.totalValue || 0).toFixed(2)}
                        </div>
                    </div>
                    <div className="value-item">
                        <div className="value-label">Cash Available</div>
                        <div className="value-amount">
                            ${(portfolio.cash || 0).toFixed(2)}
                        </div>
                    </div>
                    <div className="value-item">
                        <div className="value-label">Asset Value</div>
                        <div className="value-amount">
                            ${(portfolio.totalAssetValue || 0).toFixed(2)}
                        </div>
                    </div>
                    <div className="value-item">
                        <div className="value-label">Total Profit/Loss</div>
                        <div className={`value-amount ${totalProfitLoss >= 0 ? 'positive' : 'negative'}`}>
                            {totalProfitLoss >= 0 ? '+' : ''}${Math.abs(totalProfitLoss).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Help Section */}
            {showHelp && (
                <div className="help-tooltip">
                    <div className="help-section">
                        <div className="help-title">Portfolio Overview</div>
                        <p className="help-text">
                            Your portfolio shows all your investments and cash in one place.
                        </p>
                    </div>
                    <div className="help-section">
                        <div className="help-title">Portfolio Metrics</div>
                        <p className="help-text">
                            <strong>Total Value:</strong> Combined worth of cash and all stock holdings.<br/>
                            <strong>Cash Available:</strong> Money available for new trades.<br/>
                            <strong>Asset Value:</strong> Current market value of all your stocks.<br/>
                            <strong>Total Profit/Loss:</strong> Gain or loss since your initial investments.
                        </p>
                    </div>
                    <div className="help-section">
                        <div className="help-title">Your Holdings</div>
                        <p className="help-text">
                            Each holding shows the stock symbol, number of shares owned, current price per share, 
                            total value, original cost, and profit/loss for that position.
                        </p>
                    </div>
                </div>
            )}

            {/* Holdings */}
            <div className="holdings-container">
                <h2 className="section-title">Your Holdings</h2>
                
                {!portfolio.holdings || portfolio.holdings.length === 0 ? (
                    <div className="no-holdings">
                        <p>You don't have any stock holdings yet.</p>
                        <p>Visit the <strong>Trading</strong> page to buy your first stocks!</p>
                        <button 
                            onClick={() => navigate('/trading')} 
                            className="action-button"
                        >
                            Start Trading
                        </button>
                    </div>
                ) : (
                    <div className="holdings-list">
                        {portfolio.holdings.map((holding, index) => {
                            // Safe calculations for each holding
                            const shares = holding.shares || 0;
                            const currentPrice = holding.currentPrice || 0;
                            const totalCost = holding.totalCost || 0;
                            const avgPrice = holding.avgPrice || 0;
                            
                            const currentValue = shares * currentPrice;
                            const profitLoss = currentValue - totalCost;
                            const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
                            
                            return (
                                <div key={holding.symbol || index} className="stock-item">
                                    <div className="stock-info">
                                        <div className="stock-symbol">{holding.symbol || 'UNKNOWN'}</div>
                                        <div className="shares-count">{shares} shares</div>
                                        <div className="avg-price">
                                            Avg Price: ${avgPrice.toFixed(2)}
                                        </div>
                                    </div>
                                    
                                    <div className="stock-metrics">
                                        <div className="current-price">
                                            Current: ${currentPrice.toFixed(2)}
                                        </div>
                                        <div className="current-value">
                                            Value: ${currentValue.toFixed(2)}
                                        </div>
                                    </div>
                                    
                                    <div className="stock-performance">
                                        <div className="cost-basis">
                                            Cost: ${totalCost.toFixed(2)}
                                        </div>
                                        <div className={`profit-loss ${profitLoss >= 0 ? 'positive' : 'negative'}`}>
                                            {profitLoss >= 0 ? '+' : '-'}${Math.abs(profitLoss).toFixed(2)}
                                            <span className="percent">
                                                ({profitLoss >= 0 ? '+' : ''}{profitLossPercent.toFixed(1)}%)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Portfolio Actions */}
            {portfolio.holdings && portfolio.holdings.length > 0 && (
                <div className="portfolio-actions">
                    <button 
                        onClick={() => navigate('/trading')} 
                        className="action-button"
                    >
                        Make Another Trade
                    </button>
                    <button 
                        onClick={fetchPortfolioData} 
                        className="refresh-button"
                        disabled={loading}
                    >
                        Update Prices
                    </button>
                </div>
            )}
        </div>
    );
};

export default PortfolioView;