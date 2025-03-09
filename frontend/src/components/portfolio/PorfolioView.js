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


// fetch portfolio component
    useEffect(() => {
        fetchPortfolioData();
    }, []);

    const fetchPortfolioData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPortfolioSummary();
            setPortfolio(data);
        } catch (err) {
            setError('Failed to load portfolio data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // Calculate profit/loss
    const totalProfitLoss = portfolio.holdings.reduce((total, holding) => total + holding.profitLoss, 0)


    return (
        <div className="portfolio-container">
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
                        navigate('/login');
                    }} className="logout">logout</button>
                </div>
            </nav>

            <div className="portfolio-summary">
                <div className="summary-header">
                    <h2 className="section-title">Portfolio Summary</h2>
                    <div className="action-buttons">
                        <button className="help-button" onClick={() => setShowHelp(!showHelp)}>help</button>
                        <button className="refresh-button" onClick={fetchPortfolioData}>refresh</button>
                    </div>
                </div>
                <div className="summary-content">
                    <div>
                        <div className="value-label">Total Value</div>
                        <div className="value-amount">${portfolio.totalValue.toFixed(2)}</div>
                    </div>
                    <div>
                        <div className="value-label">Cash Available</div>
                        <div className="value-amount">${portfolio.cash.toFixed(2)}</div>
                    </div>
                    <div>
                        <div className="value-label">Asset Value</div>
                        <div className="value-amount">${portfolio.totalAssetValue.toFixed(2)}</div>
                    </div>
                    <div>
                        <div className="value-label">Total Profit/Loss</div>
                        <div className={`value-amount ${totalProfitLoss >= 0 ? 'positive' : 'negative'}`}>
                                {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLoss.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            {showHelp && (
                <div className="help-tooltip">
                <div className="help-section">
                    <span className="help-title">Portfolio:</span>
                        <p>Your portfolio page showcases all your holdings in one place.</p>
                    <span className="help-title">Portfolio Summary:</span>
                        <p>Total Value: The net worth of all your current stock holdings.</p>
                        <p>Total Profit/Loss: The net profit or loss of all combined holdings since your first investment.</p>
                </div>
                <div className="help-section">
                    <span className="help-title">Your Holdings:</span>
                        <p>The stock symbol, amount of shares, total value of shares, and total change in value of shares since purchase.</p>
                </div>
                </div>
            )}

            <div className="holdings-container">
                <h2 className="section-title">Your Holdings</h2>
                {portfolio.holdings.length === 0 ? (
                            <div className="no-holdings">You don't have any holdings yet. Visit the Trading page to buy stocks.</div>
                        ) : (
                            portfolio.holdings.map(holding => (
                                <div key={holding.symbol} className="stock-item">
                                    <div className="stock-info">
                                        <div className="stock-symbol">{holding.symbol}</div>
                                        <div className="shares-count">{holding.shares} shares</div>
                                        <div className="current-price">Current Price: ${holding.currentPrice.toFixed(2)}</div>
                                    </div>
                                    <div className="stock-price">
                                        <div className="value">Value: ${holding.currentValue.toFixed(2)}</div>
                                        <div className="cost-basis">Cost Basis: ${holding.costBasis.toFixed(2)}</div>
                                        <div className={`profit-loss ${holding.profitLoss >= 0 ? 'positive' : 'negative'}`}>
                                            {holding.profitLoss >= 0 ? '+' : ''}{holding.profitLoss.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                </div>
        </div>
    )
}

export default PortfolioView;