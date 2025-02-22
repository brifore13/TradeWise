# market_service.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# alpha vantage API
API_KEY = 'YERZJPFR070E43GC'
BASE_URL = 'https://www.alphavantage.co/query'

# Store favorite stocks
FAVORITES_FILE = favorites.json()

# Load JSON file
def load_favorites():
    if os.path.exists(FAVORITES_FILE):
        with open(FAVORITES_FILE, 'r') as f:
            return json.load(f)
    return []

# Save to json file
def save_favorites(favorites):
    with open(FAVORITES_FILE, 'w') as f:
        json.dump(favorites, f)

# Search for stocks
@app.route('/market/search', methods=['GET'])
def search_stock():
    symbol = request.args.get('symbol', '').upper()
    try:
        # get stock quotes from alpha vantage API
        params = {
            'function': 'SYMBOL_SEARCH',
            'keywords': symbol,
            'apikey': API_KEY
        }

        response = requests.get(BASE_URL, params=params)
        data = response.json()

        # get stock data
        if 'bestMatches' in data:
            results = []
            for match in data['bestMatches']:
                # get current price for each match
                price_params = {
                    'function': 'GLOBAL_QUOTE',
                    'symbol': match['1. symbol'],
                    'apikey': API_KEY
                }
                price_response = requests.get(BASE_URL, params=price_params)
                price_data = price_response.json()

                if 'Global Quote' in price_data:
                    quote = price_data['Global Quote']
                    results.append({
                        'symbol': match['1. symbol'],
                        'name': match['2. name'],
                        'price': quote['.05 price'],
                        'change': quote['10. change percent']
                    })
            return jsonify(results)
        
        return jsonify([])
    
    except Exception as e:
        print(f"Error search stocks: {e}")
        return jsonify({'error': str(e)}), 500

# Save favorites


if __name__ == '__main__':
    print("Market service running on port 9001")
    app.run(host='127.0.0.1', port=9001, debug=True)