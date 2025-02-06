from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# BasicRoutes
@app.get("/api/market/{symbol}")
async def get_stock_price(symbol: str):
    return {"symbol": symbol, "price": 100.00}


@app.get("/api/portfolio")
async def get_portfolio():
    return {
        "total_value": 10000,
        "holdings": [
            {"symbol": "AAPL", "shares": 10, "value": 1500},
            {"symbol": "GOOGL", "shares": 5, "value": 2500}
        ]
    }


@app.post("/api/trade")
async def execute_trade(trade_data: dict):
    return {"status": "success", "message": "Trade executed"}