from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
CORS(app)

# alpha vantage API
API_KEY = 'YERZJPFR070E43GC'
BASE_URL = 'https://www.alphavantage.co/query'

# https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo
"""
{
    "Global Quote": {
        "01. symbol": "IBM",
        "02. open": "263.8450",
        "03. high": "264.8300",
        "04. low": "261.1000",
        "05. price": "261.4800",
        "06. volume": "5667874",
        "07. latest trading day": "2025-02-21",
        "08. previous close": "264.7400",
        "09. change": "-3.2600",
        "10. change percent": "-1.2314%"
    }
}
"""

# Store favorite stocks
FAVORITES_FILE = 'favorites.json'

# create JSON file
if not os.path.exists(FAVORITES_FILE):
    with open(FAVORITES_FILE, 'w') as f:
        json.dump([], f)


# Load JSON file
def load_favorites():
    if os.path.exists(FAVORITES_FILE):
        with open(FAVORITES_FILE, 'r') as f:
            return json.load(f)
    return []


# Save to json file
def save_favorites(favorites):
    with open(FAVORITES_FILE, 'w') as f:
        json.dump(favorites, f, indent=4)


# Search for stocks
@app.route('/market/search', methods=['GET'])
def search_stock():
    symbol = request.args.get('symbol', '').upper()
    # get stock quotes from alpha vantage API
    params = {
        'function': 'GLOBAL_QUOTE',
        'symbol': symbol,
        'apikey': API_KEY
    }

    response = requests.get(BASE_URL, params=params)
    data = response.json()

    # get stock data
    if 'Global Quote' in data:
        quote = data['Global Quote']
        result = {
            'symbol': symbol,
            'price': quote['05. price'],
            'change': quote['10. change percent']
        }
        return jsonify(result)
    else:
        return jsonify({'error': 'Stock not found'})


# Save favorites
@app.route('/market/favorites', methods=['GET', 'POST'])
def handle_favorites():
    # POST request
    if request.method == 'POST':
        new_favorite = request.json
        favorites = load_favorites()

        # check if stock already in favorites
        if not any(stock['symbol'] ==
                   new_favorite['symbol'] for stock in favorites):
            favorites.append(new_favorite)
            save_favorites(favorites)
            print(f"Added to favorites: {new_favorite['symbol']}")

        return jsonify(favorites)

    # GET request
    favorites = load_favorites()
    return jsonify(favorites)


# Delete from favorites
@app.route('/market/favorites/<symbol>', methods=['DELETE'])
def remove_favorites(symbol):
    # Delete request
    try:
        favorites = load_favorites()
        # find stock and remove
        favorites = [stock for stock in favorites if stock['symbol'] != symbol]
        save_favorites(favorites)
        print(f"Removed from favorites: {symbol}")
        return jsonify(favorites)
    except Exception as e:
        print(f"Error removing favorite: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("Market service running on port 9002")
    app.run(host='127.0.0.1', port=9002, debug=True)