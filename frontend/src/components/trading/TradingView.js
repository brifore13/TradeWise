import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { executeTrade, getStockQuote } from "../../services/api";

const TradeView = () => {
    const navigate = useNavigate();
    const [showHelp, setShowHelp] = useState(false);
    const [stockData, setStockData] = useState(null);
    const [totalPrice, setTotalPrice] = useState(null);
    const [tradeResult, setTradeResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState({
        symbol: '',
        quantity: '',
        action: 'BUY',
    });

    const handleLocateStock = async () => {
        try {
            setError(null);
            setLoading(true);
            console.log('Locating stock:', order.symbol); // Debug log
            
            const data = await getStockQuote(order.symbol);
            console.log('Stock data received:', data); // Debug log
            
            setStockData(data);
        } catch (error) {
            console.error('Stock lookup error:', error); // Debug log
            setError('Stock not found: ' + error.message);
            setStockData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCalculateTotal = () => {
        if (!stockData || !order.quantity) {
            setError('Please enter quantity and locate stock first');
            return;
        }
        
        const quantity = parseInt(order.quantity);
        const price = parseFloat(stockData.price);
        
        if (quantity <= 0) {
            setError('Quantity must be greater than 0');
            return;
        }
        
        const total = price * quantity;
        setTotalPrice(total);
        setError(null);
        
        console.log('Total calculated:', { quantity, price, total }); // Debug log
    };

    const handleExecuteTrade = async () => {
        if (!stockData || !order.quantity || totalPrice === null) {
            setError('Please calculate total price first');
            return;
        }
        
        try {
            setError(null);
            setLoading(true);
            
            console.log('Executing trade:', { // Debug log
                symbol: order.symbol,
                quantity: parseInt(order.quantity),
                action: order.action
            });

            // Send only the data the backend expects
            const result = await executeTrade({
                symbol: order.symbol,
                quantity: parseInt(order.quantity),
                action: order.action
            });

            console.log('Trade result:', result); // Debug log

            // Access the correct nested data structure
            setTradeResult(result.data.trade);

            // Reset form
            setOrder({
                symbol: '',
                quantity: '',
                action: 'BUY'
            });
            setStockData(null);
            setTotalPrice(null);

        } catch (error) {
            console.error('Trade execution error:', error); // Debug log
            setError('Failed to execute trade: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

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
                        <button onClick={() => navigate('/trading')} className="nav-link active">
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
                <div className="container-sm">
                    <div className="card card-md">
                        {/* Header */}
                        <div className="card-header">
                            <div className="flex justify-between items-center">
                                <h2 className="card-title">Place Order</h2>
                                <button 
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setShowHelp(!showHelp)}
                                >
                                    Help
                                </button>
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-danger">{error}</p>
                            </div>
                        )}

                        {/* Stock Symbol Search */}
                        <div className="form-group">
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Stock Symbol (e.g. AAPL)"
                                    className="form-input"
                                    value={order.symbol}
                                    onChange={(e) => setOrder({...order, symbol: e.target.value.toUpperCase()})}
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleLocateStock}
                                    disabled={!order.symbol.trim() || loading}
                                >
                                    {loading ? 'Locating...' : 'Locate Stock'}
                                </button>
                            </div>
                        </div>

                        {/* Display Stock Info */}
                        {stockData && (
                            <div className="card-sm bg-gray-50 mb-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg text-primary">{order.symbol}</h3>
                                        <p className="text-lg font-medium">
                                            ${parseFloat(stockData.price).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-medium ${parseFloat(stockData.changeAmount) >= 0 ? 'text-success' : 'text-danger'}`}>
                                            Change: {stockData.change}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quantity Input */}
                        <div className="form-group">
                            <div className="flex gap-4">
                                <input
                                    type="number"
                                    placeholder="Quantity"
                                    className="form-input"
                                    value={order.quantity}
                                    onChange={(e) => setOrder({...order, quantity: e.target.value})}
                                    disabled={!stockData}
                                    min="1"
                                />
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={handleCalculateTotal}
                                    disabled={!stockData || !order.quantity}
                                >
                                    Calculate Total
                                </button>
                            </div>
                        </div>
                        
                        {/* Display Total */}
                        {totalPrice !== null && (
                            <div className="card-sm bg-gray-50 mb-6">
                                <div className="text-center">
                                    <p className="text-sm text-secondary mb-2">Total Price</p>
                                    <p className="text-2xl font-bold text-primary">
                                        ${totalPrice.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {/* Buy/Sell Toggle */}
                        <div className="form-group">
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    className={`btn flex-1 ${order.action === 'BUY' ? 'btn-success' : 'btn-secondary'}`}
                                    onClick={() => setOrder({...order, action: 'BUY'})}
                                >
                                    Buy
                                </button>
                                <button
                                    type="button"
                                    className={`btn flex-1 ${order.action === 'SELL' ? 'btn-danger' : 'btn-secondary'}`}
                                    onClick={() => setOrder({...order, action: 'SELL'})}
                                >
                                    Sell
                                </button>
                            </div>
                        </div>
                        
                        {/* Place Order Button */}
                        <button 
                            type="button" 
                            className="btn btn-primary btn-full btn-lg"
                            onClick={handleExecuteTrade}
                            disabled={totalPrice === null || loading}
                        >
                            {loading ? 'Placing Order...' : `Place ${order.action} Order`}
                        </button>
                        
                        {/* Trade Result */}
                        {tradeResult && (
                            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                                <h3 className="font-semibold text-success mb-3">Order Executed Successfully!</h3>
                                <p className="text-sm text-secondary">
                                    You created a <strong>{tradeResult.action.toLowerCase()}</strong> order of{' '}
                                    <strong>{tradeResult.quantity} shares</strong> of{' '}
                                    <strong>{tradeResult.symbol}</strong> for a total of{' '}
                                    <strong>${tradeResult.total.toFixed(2)}</strong>.
                                </p>
                                <div className="mt-4">
                                    <button 
                                        onClick={() => navigate('/portfolio')} 
                                        className="btn btn-secondary btn-sm"
                                    >
                                        View Portfolio
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Help Content */}
                        {showHelp && (
                            <div className="mt-8 card-sm bg-gray-50">
                                <h3 className="font-semibold text-primary mb-4">How to Place an Order:</h3>
                                <ol className="space-y-2 text-sm text-secondary">
                                    <li><strong>1.</strong> Enter the stock symbol you wish to buy or sell</li>
                                    <li><strong>2.</strong> Click "Locate Stock" to get current price information</li>
                                    <li><strong>3.</strong> Enter the quantity of shares you want to trade</li>
                                    <li><strong>4.</strong> Click "Calculate Total" to see the transaction amount</li>
                                    <li><strong>5.</strong> Choose "Buy" to purchase or "Sell" to sell shares</li>
                                    <li><strong>6.</strong> Click "Place Order" to execute the trade</li>
                                </ol>
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="text-xs text-secondary">
                                        <strong>Note:</strong> Once an order is placed and confirmed, it cannot be undone. 
                                        Make sure to review all details carefully.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TradeView;