from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
CORS(app)

# alpha vantage API
API_KEY = 'K1U3DXHG00VLITUG'
BASE_URL = 'https://www.alphavantage.co/query'

# JSON files
FAVORITES_FILE = 'favorites.json'
MOCK_DATA_FILE = 'alpha_vantage_mock_data.json'

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


# load mock data
def load_mock_data():
    if os.path.exists(MOCK_DATA_FILE):
        with open(MOCK_DATA_FILE, 'r') as f:
            return json.load(f)


# Search for stocks
@app.route('/market/search', methods=['GET'])
def search_stock():
    symbol = request.args.get('symbol', '').upper()
    mock_data = load_mock_data()

    # get stock data
    if symbol in mock_data and 'Global Quote' in mock_data[symbol]:
        quote = mock_data[symbol]['Global Quote']
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
    print("Market service running on PORT 9002")
    app.run(host='127.0.0.1', port=9002, debug=True)