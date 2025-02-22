from flask import Flask, jsonify
from flask_cors import CORS  # Add this import

app = Flask(__name__)
CORS(app)  # Enable CORS


@app.route('/dashboard')
def dashboard():
    dashboard_data = {
        'portfolio': {
            'totalValue': 10000,
            'todaysChange': 100,
        },
        'marketSummary': {
            'SP500': '+0.2%',
            'DowJones': '+0.2%',
            'NASDAQ': '+0.2%'
        }
    }
    return jsonify(dashboard_data)


if __name__ == '__main__':
    print('Server starting on http://localhost:9000')
    app.run(host='127.0.0.1', port=9001, debug=True)
