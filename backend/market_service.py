# market_service.py
from flask import Flask, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# alpha vantage API
API_KEY = 'YERZJPFR070E43GC'
BASE_URL = 'https://www.alphavantage.co/query'

# Default stocks
DEFAULT_STOCKS = ['AAPL', 'GOOGL', 'MSFT']

# get market data
@app.route('/market')
def get_market_data():
    try:
        stock_data = []
        for symbol in DEFAULT_STOCKS:
            params = {
                'function': 'GLOBAL_QUOTE',
                'symbol': symbol,
                'apikey': API_KEY
            }

            response = requests.get(BASE_URL, params=params)
            data = response.json()

            if "Global Quote" in data:
                quote = data["Global Quote"]
                stock_data.append({
                    'symbol': symbol,
                    'price': quote['05. price'],
                    'change': quote['09. change'],
                    'change_percent': quote['10. change percent']
                })
        print('Sending stock data:', stock_data)
        return jsonify(stock_data)

    except Exception as e:
        print(f"Error fetching market data: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("Market service running on port 9001")
    app.run(host='127.0.0.1', port=9001, debug=True)