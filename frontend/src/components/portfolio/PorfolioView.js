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
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="page-layout">
                <div className="center-layout">
                    <div className="text-center">
                        <p className="text-secondary">Loading portfolio data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-layout">
                <div className="center-layout">
                    <div className="card card-md container-sm text-center">
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-danger mb-4">{error}</p>
                        </div>
                        <button 
                            onClick={fetchPortfolioData} 
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Try Again'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                        <button onClick={() => navigate('/portfolio')} className="nav-link active">
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
                    {/* Portfolio Summary */}
                    <div className="card card-md mb-8">
                        <div className="card-header">
                            <div className="flex justify-between items-center">
                                <h2 className="card-title">Portfolio Summary</h2>
                                <div className="flex gap-3">
                                    <button 
                                        className="btn btn-ghost btn-sm" 
                                        onClick={() => setShowHelp(!showHelp)}
                                    >
                                        Help
                                    </button>
                                    <button 
                                        className="btn btn-secondary btn-sm" 
                                        onClick={fetchPortfolioData}
                                        disabled={loading}
                                    >
                                        {loading ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-6">
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
                                <div className={`value-amount ${totalProfitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {totalProfitLoss >= 0 ? '+' : ''}${Math.abs(totalProfitLoss).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Help Section */}
                    {showHelp && (
                        <div className="card card-md mb-8 bg-gray-50">
                            <h3 className="text-lg font-semibold text-primary mb-4">Portfolio Help</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-primary mb-2">Portfolio Metrics:</h4>
                                    <div className="space-y-2 text-sm text-secondary">
                                        <p><strong>Total Value:</strong> Combined worth of cash and all stock holdings</p>
                                        <p><strong>Cash Available:</strong> Money available for new trades</p>
                                        <p><strong>Asset Value:</strong> Current market value of all your stocks</p>
                                        <p><strong>Total Profit/Loss:</strong> Gain or loss since your initial investments</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-primary mb-2">Your Holdings:</h4>
                                    <p className="text-sm text-secondary">
                                        Each holding shows the stock symbol, shares owned, current price, 
                                        total value, original cost, and profit/loss for that position.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Holdings */}
                    <div className="card card-md">
                        <div className="card-header">
                            <h2 className="card-title">Your Holdings</h2>
                            {portfolio.holdings && portfolio.holdings.length > 0 && (
                                <p className="text-sm text-secondary">
                                    {portfolio.holdings.length} {portfolio.holdings.length === 1 ? 'position' : 'positions'}
                                </p>
                            )}
                        </div>
                        
                        {!portfolio.holdings || portfolio.holdings.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-primary mb-2">No Holdings Yet</h3>
                                    <p className="text-secondary mb-4">
                                        You don't have any stock holdings yet.
                                    </p>
                                    <p className="text-sm text-muted mb-6">
                                        Visit the Trading page to buy your first stocks and start building your portfolio.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => navigate('/trading')} 
                                    className="btn btn-primary"
                                >
                                    Start Trading
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
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
                                            <div className="grid grid-cols-4 gap-4">
                                                {/* Stock Info */}
                                                <div>
                                                    <div className="stock-symbol">{holding.symbol || 'UNKNOWN'}</div>
                                                    <div className="text-sm text-secondary">{shares} shares</div>
                                                    <div className="text-xs text-muted">
                                                        Avg: ${avgPrice.toFixed(2)}
                                                    </div>
                                                </div>
                                                
                                                {/* Current Price */}
                                                <div className="text-center">
                                                    <div className="font-medium">Current Price</div>
                                                    <div className="text-lg font-semibold">
                                                        ${currentPrice.toFixed(2)}
                                                    </div>
                                                </div>
                                                
                                                {/* Current Value */}
                                                <div className="text-center">
                                                    <div className="font-medium">Market Value</div>
                                                    <div className="text-lg font-semibold">
                                                        ${currentValue.toFixed(2)}
                                                    </div>
                                                    <div className="text-xs text-muted">
                                                        Cost: ${totalCost.toFixed(2)}
                                                    </div>
                                                </div>
                                                
                                                {/* Profit/Loss */}
                                                <div className="text-right">
                                                    <div className="font-medium">Profit/Loss</div>
                                                    <div className={`text-lg font-semibold ${profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                                                        {profitLoss >= 0 ? '+' : '-'}${Math.abs(profitLoss).toFixed(2)}
                                                    </div>
                                                    <div className={`text-sm ${profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                                                        ({profitLoss >= 0 ? '+' : ''}{profitLossPercent.toFixed(1)}%)
                                                    </div>
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
                        <div className="flex justify-center gap-4 mt-8">
                            <button 
                                onClick={() => navigate('/trading')} 
                                className="btn btn-primary"
                            >
                                Make Another Trade
                            </button>
                            <button 
                                onClick={fetchPortfolioData} 
                                className="btn btn-secondary"
                                disabled={loading}
                            >
                                Update Prices
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PortfolioView;