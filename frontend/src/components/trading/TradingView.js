import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { executeTrade, getStockQuote } from "../../services/api";


const TradeView = () => {
    const navigate = useNavigate();
    const [showHelp, setShowHelp] = useState(false);
    const [stockData, setStockData] = useState(null);
    const [totalPrice, setTotalPrice] = useState(null)
    const [tradeResult, setTradeResult] = useState(null);
    const [error, setError] = useState(null)
    const [order, setOrder] = useState({
        symbol: '',
        quantity: '',
        action: 'BUY',
    });

    //  Find Stock
    const handleLocateStock = async () => {
        try {
            setError(null);
            const data = await getStockQuote(order.symbol);
            setStockData(data);
        } catch (error) {
            setError('Stock not found');
            setStockData(null)
        }
    }

    //  Calculate total price
    const handleCalculateTotal = () => {
        if (!stockData || !order.quantity) {
            setError('Please enter quantity and stock');
            return;
        }
        const total = parseFloat(stockData.price) * parseInt(order.quantity);
        setTotalPrice(total);
    }

    // execute trade
    const handleExecuteTrade = async () => {
        if (!stockData || !order.quantity || totalPrice === null) {
            setError('Calculate total price first')
            return;
        }
        try {
            setError(null);
            const result = await executeTrade({
                symbol: order.symbol,
                quantity: parseInt(order.quantity),
                action: order.action,
                price: parseFloat(stockData.price),
                totalPrice: totalPrice
            });

            setTradeResult(result.trade);

            // reset form
            setOrder({
                symbol: '',
                quantity: '',
                action: 'BUY'
            });
            setStockData(null)
            setTotalPrice(null)

        } catch (error) {
            setError('Failed to execute trade: ' + error.message);
        }
    }

    return (
        <div className="dashboard-container">
            <nav className="nav-bar">
                <span className="nav-logo">TradeWise</span>
                <div className="nav-links">
                    <button onClick={() => navigate('/market')} className="nav-button">Market</button>
                    <button onClick={() => navigate('/trading')} className="nav-button">Trading</button>
                    <button onClick={() => navigate('/portfolio')} className="nav-button">Portfolio</button>
                    <button onClick={() => navigate('/dashboard')} className="nav-button">Dashboard</button>
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/login')}}
                        className="logout">logout
                    </button>
                </div>
            </nav>

            <div className="trade-container">
                <div className="order-form">
                    <div className="form-header">
                        <h2 className="form-title">Place Order</h2>
                        <button 
                            className="help-button"
                            onClick={() => setShowHelp(!showHelp)}>help
                        </button>

                        {error && <div className="error-message">{error}</div>}
                    </div>

                    {/* Stock symbol search */}
                    <div className="input-row">
                        <input
                            type="text"
                            placeholder="Stock Symbol (e.g. AAPL)"
                            className="input-field"
                            value={order.symbol}
                            onChange={(e) => setOrder({...order, symbol: e.target.value.toUpperCase()})}
                        />
                        <button
                            type="button"
                            className="buy-button"
                            onClick={handleLocateStock}
                        >
                            Locate Stock
                        </button>
                    </div>

                    {/* Display Stock info */}
                    {stockData && (
                        <div className="stock-info">
                            <div className="stock-name">{order.symbol}</div>
                            <div className="stock-price">Price: ${parseFloat(stockData.price).toFixed(2)}</div>
                            <div className={`stock-change ${parseFloat(stockData.change) >= 0 ? 'positive' : 'negative'}`}>
                                Change: {stockData.change}
                            </div>
                        </div>
                    )}

                    {/* Quantity Input */}
                <div className="input-row">
                    <input
                        type="number"
                        placeholder="Quantity"
                        className="input-field"
                        value={order.quantity}
                        onChange={(e) => setOrder({...order, quantity: e.target.value})}
                        disabled={!stockData}
                    />
                    <button 
                        type="button" 
                        className="action-button" 
                        onClick={handleCalculateTotal}
                        disabled={!stockData || !order.quantity}
                    >
                        Calculate Total
                    </button>
                </div>
                
                {/* Display Total */}
                {totalPrice !== null && (
                    <div className="total-price">
                        Total Price: ${totalPrice.toFixed(2)}
                    </div>
                )}
                
                {/* Buy/Sell Buttons */}
                <div className="action-buttons">
                    <button
                        type="button"
                        className={`trade-action ${order.action === 'BUY' ? 'buy-button' : ''}`}
                        onClick={() => setOrder({...order, action: 'BUY'})}
                    >
                        Buy
                    </button>
                    <button
                        type="button"
                        className={`trade-action ${order.action === 'SELL' ? 'sell-button' : ''}`}
                        onClick={() => setOrder({...order, action: 'SELL'})}
                    >
                        Sell
                    </button>
                </div>
                
                {/* Place Order Button */}
                <button 
                    type="button" 
                    className="place-order-button"
                    onClick={handleExecuteTrade}
                    disabled={totalPrice === null}
                >
                    Place Order
                </button>
                
                {/* Trade Result */}
                {tradeResult && (
                    <div className="trade-result">
                        <h3>Order Executed Successfully</h3>
                        <p>You created a {tradeResult.action.toLowerCase()} order of {tradeResult.quantity} shares of {tradeResult.symbol} for a total of ${tradeResult.total.toFixed(2)}.</p>
                    </div>
                )}



                {showHelp && (
                    <div className="help-content">
                        <h3 className="help-title">To Place an Order:</h3>
                        <ol>
                            <li>Enter the stock symbol that you wish to buy or sell.</li>
                            <li>Enter the quantity you wish to buy or sell.</li>
                            <li>View Total Transaction to see the total amount needed for purchase or the total return of a sell.</li>
                            <li>Select Buy to make a purchase or Select Sell to sell a stock you already own.</li>
                            <li>Press Place Order button</li>
                            <li>A confirmation button will appear to confirm your decision. Once confirm is pressed, it cannot be undone.</li>
                        </ol>
                    </div>
                )}
            </div>
        </div>
        </div>
    )
}

export default TradeView;