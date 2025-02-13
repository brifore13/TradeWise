from flask import Flask, jsonify
from flask_cors import CORS
import requests


app = Flask(__name__)
CORS(app)

# Alpha Vantage API key
API_KEY = 'YERZJPFR070E43GC'
BASE_URL = 'https://www.alphavantage.co/query'


# get stock data
@app.route('api/market/stock/<symbol>')
def get_stock_price(symbol):
    try:

        # alpha vantage stock data
        params = {
            'function': 'GLOBAL_QUOTE',
            'symbol': symbol,
            'apikey': API_KEY
        }

        # request stock data
        response = requests.get(BASE_URL, params=params)
        data = response.json()

        if "Global Quote" in data:
            quote = data["Global Quote"]

            # return stock data
            return jsonify({
                "symbol": symbol,
                "price": quote['05. price'],
                "change": quote['09. change'],
                "change_percent": quote['10. change percent']
            })
        else:
            return jsonify({'error': 'Stock data not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=9001)