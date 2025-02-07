import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage'
import Dashboard from './components/dashboard/Dashboard'
import MarketView from './components/market/MarketView'
import TradingView from './components/trading/TradingView'
import PortfolioView from './components/portfolio/PorfolioView'
import './app.css';

function App() {
  return (
    <Router> 
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/market" element={<MarketView />} />
        <Route path="/trading" element={<TradingView />} />
        <Route path="/portfolio" element={<PortfolioView />} />
      </Routes>
    </Router>
  );
}

export default App;
