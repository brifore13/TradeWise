from flask import Flask, jsonify
from flask_cors import CORS 
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS

# path to market service stocks
FAVORITES_FILE = "favorites.json"

# Default market data
default_market_data = {
    'SP500': '+0.2%',
    'DowJones': '+0.2%',
    'NASDAQ': '+0.2%'
}


@app.route('/dashboard')
def dashboard():
    # load favorites
    favorites = []
    if os.path.exists(FAVORITES_FILE):
        with open(FAVORITES_FILE, 'r') as f:
            favorites = json.load(f)

    # if no favorites, use defaults
    market_symbols = {}
    if not favorites:
        market_symbols = default_market_data
    else:
        for favorite in favorites:
            market_symbols[favorite['symbol']] = favorite['change']

    dashboard_data = {
        'portfolio': {
            'totalValue': 10000,
            'todaysChange': 100
        },
        'marketSummary': market_symbols
    }

    return jsonify(dashboard_data)


if __name__ == '__main__':
    print('Server starting on http://localhost:9000')
    app.run(host='127.0.0.1', port=9001, debug=True)
