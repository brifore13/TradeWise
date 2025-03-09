from flask import Flask, jsonify
from flask_cors import CORS
import json
import os
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS

# path to market service stocks
FAVORITES_FILE = "favorites.json"
PORTFOLIO_FILE = "portfolio.json"


@app.route('/dashboard')
def dashboard():
    # Load favorites
    favorites = []
    if os.path.exists(FAVORITES_FILE):
        with open(FAVORITES_FILE, 'r') as f:
            favorites = json.load(f)

    # Load portfolio data directly from file
    portfolio_data = load_portfolio_data()

    # If no favorites, use defaults
    market_symbols = {}
    for favorite in favorites:
        market_symbols[favorite['symbol']] = favorite['change']

    # Calculate today's change as total profit/loss
    holdings = portfolio_data.get('assets', [])
    todays_change = sum(holding.get('profitLoss', 0) for holding in holdings)

    dashboard_data = {
        'portfolio': {
            'totalValue': calculate_total_value(portfolio_data),
            'todaysChange': todays_change,
            'holdings': holdings
        },
        'marketSummary': market_symbols
    }

    return jsonify(dashboard_data)


def load_portfolio_data():
    """Load portfolio data directly from portfolio.json file"""
    try:
        if os.path.exists(PORTFOLIO_FILE):
            with open(PORTFOLIO_FILE, 'r') as f:
                return json.load(f)
        else:
            print(f"Portfolio file not found: {PORTFOLIO_FILE}")
            return {'cash': 10000, 'assets': []}
    except Exception as e:
        print(f"Error loading portfolio data: {str(e)}")
        return {'cash': 10000, 'assets': []}


def calculate_total_value(portfolio_data):
    """Calculate total portfolio value from cash and assets"""
    cash = portfolio_data.get('cash', 10000)
    assets = portfolio_data.get('assets', [])
    
    total_asset_value = sum(asset.get('currentValue', 0) for asset in assets)
    return cash + total_asset_value


if __name__ == '__main__':
    print('Dashboard service running on PORT 9001')
    app.run(host='127.0.0.1', port=9001, debug=True)
