import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const TradeView = () => {
    const navigate = useNavigate();
    const [showHelp, setShowHelp] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [order, setOrder] = useState({
        symbol: '',
        quantity: '',
        type: 'buy',
        total: 0
    });

    const calculateTotal = () => {
        const mockPrice = 234.00;
        return (mockPrice * order.quantity).toFixed(2);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (order.symbol && order.quantity) {
            const total = calculateTotal();
            setOrder(prev => ({ ...prev, total }));
            setShowConfirmation(true);
        }
    };

    const handleConfirm = () => {
        setShowConfirmation(false);
    }

    return (
        <div className="dashboard-container">
            <nav className="nav-bar">
                <span className="nav-logo">TradeWise</span>
                <div className="nav-links">
                    <button onClick={() => navigate('/market')} className="nav-button">Market</button>
                    <button onClick={() => navigate('/trading')} className="nav-button">Trading</button>
                    <button onClick={() => navigate('/portfolio')} className="nav-button">Portfolio</button>
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
                    </div>

                    <form onSubmit={handleSubmit}>
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

                        <div className="total-display">Total transaction: ${calculateTotal}</div>

                        <div className="trade-button">
                            <button 
                                type="button"
                                className='buy-button'
                                onClick={() => setOrder({...order, type: 'buy'})}
                                > Buy
                            </button>
                            <button
                                type="button"
                                className='sell-button'
                                onClick={() => setOrder({...order, type: 'sell'})}
                                >Sell
                            </button>
                        </div>

                        <button
                            type="submit" className="place-order-button"
                            >Place Order
                        </button>
                    </form>
                </div>

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
                                You are about to {order.type} {order.quantity} shares of {order.symbol} stock at 
                                $234.00 each for a total of ${order.total}.
                            </p>
                            <p className="warning">this cannot be undone</p>
                            <div className="confirmation-buttons">
                                <button className="confirmation-button" onClick={handleConfirm}>Confirm</button>
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