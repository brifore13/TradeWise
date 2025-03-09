from flask import Flask, jsonify
from flask_cors import CORS
import json
import os
import requests

app = Flask(__name__)
CORS(app)


# portfolio starting values
DEFAULT_TOTAL_VALUE = 10000
PORTFOLIO_FILE = 'portfolio.json'
TRADE_FILE = 'trades.json'
MOCK_DATA_FILE = 'alpha_vantage_mock_data.json'
API_KEY = 'K1U3DXHG00VLITUG'
BASE_URL = 'https://www.alphavantage.co/query'

# create portfolio JSON file
if not os.path.exists(PORTFOLIO_FILE):
    initial_portfolio = {
        'cash': DEFAULT_TOTAL_VALUE,
        'assets': []
    }
    with open(PORTFOLIO_FILE, 'w') as f:
        json.dump(initial_portfolio, f, indent=4)


# load portfolio data
def load_portfolio():
    with open(PORTFOLIO_FILE, 'r') as f:
        return json.load(f)


# save portfolio data
def save_portfolio(portfolio):
    with open(PORTFOLIO_FILE, 'w') as f:
        json.dump(portfolio, f, indent=4)


# load trades data
def load_trades():
    if not os.path.exists(TRADE_FILE):
        return []
    with open(TRADE_FILE, 'r') as f:
        return json.load(f)


# load mock stock data
def load_mock_data():
    if os.path.exists(MOCK_DATA_FILE):
        with open(MOCK_DATA_FILE, 'r') as f:
            return json.load(f)
 

# Get current stock price
def get_stock_price(symbol):
    # load mock data
    mock_data = load_mock_data()

    # Check if the symbol exists in mock data
    if symbol in mock_data and 'Global Quote' in mock_data[symbol]:
        price = mock_data[symbol]['Global Quote']['05. price']
        return float(price)
    else:
        print(f"Symbol not found in mock data: {symbol}")
        return 0


# Get portfolio summary
@app.route('/portfolio/summary', methods=['GET'])
def get_portfolio_summary():
    try:
        portfolio = load_portfolio()
        trades = load_trades()

        # process trades to update portfolio
        process_trades(portfolio, trades)

        # get current value of all assets
        assets = portfolio['assets']
        total_asset_value = 0

        for asset in assets:
            current_price = get_stock_price(asset['symbol'])
            asset['currentPrice'] = current_price
            asset['currentValue'] = current_price * asset['shares']
            asset['profitLoss'] = asset['currentValue'] - asset['costBasis']
            total_asset_value += asset['currentValue']

        total_value = portfolio['cash'] + total_asset_value

        save_portfolio(portfolio)

        return jsonify({
            'cash': portfolio['cash'],
            'totalAssetValue': total_asset_value,
            'totalValue': total_value,
            'holdings': assets
        })

    except Exception as e:
        print(f"Error getting portfolio summary: {e}")
        return jsonify({"error": str(e)}), 500


# Process trades to update portfolio
def process_trades(portfolio, trades):
    # recalculate assets based on trades
    portfolio['assets'] = []
    portfolio['cash'] = DEFAULT_TOTAL_VALUE

    # process each trade
    for trade in trades:
        symbol = trade['symbol']
        quantity = trade['quantity']
        price = trade['price']
        action = trade['action']
        total = trade['total']

        # find existing asset or create new one
        asset = next((a for a in portfolio['assets'] if a['symbol'] == symbol), None)

        if action == 'BUY':
            # update cash
            portfolio['cash'] -= total

            if asset:
                # Update existing asset - shares and total cost basis
                prev_total_cost = asset['costBasis']
                new_total_shares = asset['shares'] + quantity
                
                # Update the total cost basis (not per-share)
                asset['costBasis'] = prev_total_cost + total
                asset['shares'] = new_total_shares
                
                # Calculate current per-share price
                asset['perShareCost'] = asset['costBasis'] / asset['shares']
            else:
                # Add new asset with total cost basis
                portfolio['assets'].append({
                    'symbol': symbol,
                    'shares': quantity,
                    'costBasis': total,                 # Total cost basis
                    'perShareCost': total / quantity,   # Per-share cost
                    'currentPrice': price,
                    'currentValue': price * quantity,
                    'profitLoss': 0
                })

        elif action == 'SELL':
            # Update cash
            portfolio['cash'] += total
            
            if asset:
                # For selling, we need to reduce the total cost basis proportionally
                if asset['shares'] > 0:
                    sell_ratio = quantity / asset['shares']
                    cost_reduction = asset['costBasis'] * sell_ratio
                    
                    # Update shares and cost basis
                    asset['shares'] -= quantity
                    asset['costBasis'] -= cost_reduction
                    
                    if asset['shares'] <= 0:
                        # Remove asset if no shares left
                        portfolio['assets'] = [a for a in portfolio['assets'] if a['symbol'] != symbol]
                    else:
                        # Recalculate per-share cost
                        asset['perShareCost'] = asset['costBasis'] / asset['shares']

    return portfolio


if __name__ == '__main__':
    print("Potfolio service running on PORT 9004")
    app.run(host='127.0.0.1', port=9004, debug=True)
