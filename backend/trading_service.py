from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import requests

app = Flask(app)
CORS(app)

# Store trades
TRADE_FILE = 'trades.json'

# Alpha Vantage API
API_KEY = 'YERZJPFR070E43GC'
BASE_URL = 'https://www.alphavantage.co/query'

# create trade file
if not os.path.exists(TRADE_FILE):
    with open(TRADE_FILE, 'w') as f:
        json.dump([], f)


# load trades
def load_trades():
    with open(TRADE_FILE, 'r') as f:
        return json.load(f)


# save trades
def save_trades(trades):
    with open(TRADE_FILE, 'w') as f:
        json.dump(trades, f, indent=4)


# Execute trade
@app.route('/trading/execute', methods=['POST'])
def execute_trade():
    try:
        trade_data = request.json

        # validate trade
        required_fields = ['symbol', 'quantity', 'action']
        if not all(field in trade_data for field in required_fields):
            return jsonify({'error': 'Missing required trade info'}), 400
        
        symbol = trade_data['symbol'].upper()
        quantity = int(trade_data['quantity'])
        action = trade_data['action'].upper()

        # get current stock price
        params = {
            'function': 'GLOBAL_QUOTE',
            'symbol': symbol,
            'apikey': API_KEY
        }

        response = requests.get(BASE_URL, params=params)
        price_data = response.json()

        if 'Global Quote' not in price_data:
            return jsonify({'error': 'Stock not found'}), 404
        
        price = float(price_data['Global Quote']['05. price'])
        total_value = price * quantity

        # record trade
        trade_record = {
            'symbol': symbol,
            'quantity': quantity,
            'action': action,
            'price': price,
            'total': total_value,
            'timestamp': import_time()
        }

        # save trade history
        trades = load_trades()
        trades.append(trade_record)
        save_trades(trades)

        return jsonify({
            'success': True,
            'trade': trade_record
        })
    
    except Exception as e:
        print(f"Error executing trade: {e}")
        return jsonify({'error': str(e)}), 500
    

# get trade history
@app.route('/trading/history', methods=['GET'])
def get_trade_history():
    try:
        trades = load_trades()
        return jsonify(trades)
    except Exception as e:
        print(f"Error getting tade history: {e}")
        return jsonify({'error': str(e)}), 500


def import_time():
    from datetime import datetime
    return datetime.now().isoformat()


if __name__ == '__main__':
    print("Trading service running on port 9003")
    app.run(host='127.0.0.1', port=9003, debug=True)