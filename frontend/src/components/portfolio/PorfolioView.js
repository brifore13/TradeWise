import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PortfolioView = () => {
    const [showHelp, setShowHelp] = useState(false);
    const navigate = useNavigate();


    const portfolio = {
        totalValue: 3973.09,
        totalProfitLoss: 687.51,
        holdings: [
            { symbol: 'GOOG', shares: 5, value: 1005.45, profitloss: 289.45},
            { symbol: 'AAPL', shares: 12, value: 2673.36, profitloss: 450.51},
            { symbol: 'NKE', shares: 4, value: 294.28, profitloss: -52.45}
        ]
    };

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
                    <button className="help-button" onClick={() => setShowHelp(!showHelp)}>help</button>
                </div>
                <div className="summary-content">
                    <div>
                        <div className="value-label">Total Value</div>
                        <div className="value-amount">${portfolio.totalValue.toFixed(2)}</div>
                    </div>
                    <div>
                        <div className="value-label">Total Profit/Loss</div>
                        <div className={`value-amount ${portfolio.totalProfitLoss >= 0 ? 'positive' : 'negative'}`}>
                            {portfolio.totalProfitLoss >= 0 ? '+' : ''}{portfolio.totalProfitLoss.toFixed(2)}
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
                {portfolio.holdings.map(holding => (
                    <div key={holding.symbol} className="stock-item">
                        <div className="stock-info">
                            <div className="stock-symbol">{holding.symbol}</div>
                            <div className="shares-count">{holding.shares} shares</div>
                        </div>
                        <div className="stock-price">
                            <div className="value">${holding.value.toFixed(2)}</div>
                            <div className={`profit-loss ${holding.profitloss >= 0 ? 'positive' : 'negative'}`}>
                                {holding.profitloss >= 0 ? '+' : ''}{holding.profitloss.toFixed(2)}
                            </div>
                        </div>
                    </div>

                ))}
            </div>
        </div>

    )


}

export default PortfolioView;