# market_service.py
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/market')
def get_market_data():
    # Hardcoded stock data for now
    stocks_data = [
        {
            'symbol': 'GOOG',
            'name': 'Alphabet Inc.',
            'price': 201.09,
            'change': '+2.4%'
        },
        {
            'symbol': 'AAPL',
            'name': 'Apple Inc.',
            'price': 222.78,
            'change': '-1.8%'
        },
        {
            'symbol': 'NKE',
            'name': 'NIKE, Inc.',
            'price': 73.57,
            'change': '-0.07%'
        }
    ]
    return jsonify(stocks_data)


if __name__ == '__main__':
    print("Market service running on port 9001")
    app.run(port=9001, debug=True)