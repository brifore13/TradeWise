import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { executeTrade } from "../../services/api";


const TradeView = () => {
    const navigate = useNavigate();
    const [showHelp, setShowHelp] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [tradeResult, setTradeResult] = useState(null);
    const [error, setError] = useState(null)
    const [quoteData, setQuoteData] = useState(null);
    const [order, setOrder] = useState({
        symbol: '',
        quantity: '',
        action: 'BUY',
    });

    const calculateTotal = () => {
        const price = quoteData ? quoteData.price : 0;
        return (parseFloat(order.quantity) || 0) * price;
    }

    //  fetch stock quote data
    const fetchStockQuote = async(symbol) => {
        if (!symbol) return;

        try {
            setError(null);
            const data = await getStockQuote(symbol);
            setQuoteData(data);
        } catch (error) {
            console.error('Error fetching quote', error);
            setError('Could not get current price');
        }
    }

    //  change quote when symbol changes
    useEffect(() => {
        if(order.symbol) {
            const timeoutId = setTimeout(() => {
                fetchStockQuote(order.symbol);
            })
            return () => clearTimeout(timeoutId)
        }
    }, [order.symbol]);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!order.symbol || !order.quantity) {
            setError('Please enter both symbol and quantity');
            return;
        }
        //  get current quote
        try {
            await fetchStockQuote(order.symbol);
            setShowConfirmation(true);
        } catch (error) {
            setError('Could not get current price for this stock');
        }
    }

    const handleConfirmOrder = async () => {
        try {
            setError(null);
            const result = await executeTrade({
                symbol: order.symbol,
                quantity: parseInt(order.quantity),
                action: order.action
            });

            setTradeResult(result.trade)
            // Reset
            setShowConfirmation(false)
            setOrder({
                symbol: '',
                quantity: '',
                action: 'BUY'
            })
        } catch (error) {
            setError(error.message);
            setShowConfirmation(false);
        }
    };

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

                    <form onSubmit={handlePlaceOrder}>
                        <input
                            type="text"
                            placeholder="Stock Symbol (e.g. AAPL)"
                            className="input-field"
                            value={order.symbol}
                            onChange={(e) => setOrder({...order, symbol: e.target.value})}
                        />
                        <input 
                            type="number"
                            min="0"
                            placeholder="Quantity"
                            className="input-field"
                            value={order.quantity}
                            onChange={(e) => setOrder({...order, quantity: e.target.value})}
                        />

                        <div className="total-display">Total transaction: ${calculateTotal().toFixed(2)}</div>

                        <div className="trade-button">
                            <button 
                                type="button"
                                className={"buy-button"}
                                onClick={() => setOrder({...order, action: 'BUY'})}
                                > Buy
                            </button>
                            <button
                                type="button"
                                className="sell-button"
                                onClick={() => setOrder({...order, action: 'sell'})}
                                >Sell
                            </button>
                        </div>

                        <button
                            type="submit" className="place-order-button"
                            >Place Order
                        </button>
                    </form>
                </div>

                {tradeResult && (
                    <div className="trade-result">
                        <h3>Trade executed</h3>
                        <p>You completed a {tradeResult.action} for {tradeResult.quantity} 
                        shares of {tradeResult.symbol} at ${tradeResult.price.toFixed(2)}</p>
                        <p>Total: ${tradeResult.total.toFixed(2)}</p>
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

                {showConfirmation && (
                    <div className="confirmation-display">
                        <div className="confirmation-content"> 
                            <h3>Confirm Transaction</h3>
                            <p>
                                You are about to {order.action.toLowerCase()} {order.quantity} shares of {order.symbol} stock at 
                                ${quoteData?.price.toFixed(2)} each for a total of ${calculateTotal().toFixed(2)}.
                            </p>
                            <p className="warning">this cannot be undone</p>
                            <div className="confirmation-buttons">
                                <button className="confirm-button" onClick={handleConfirm}>Confirm</button>
                                <button className="cancel-button" onClick={() => setShowConfirmation(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )

}

export default TradeView