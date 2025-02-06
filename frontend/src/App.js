import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <Router> 
      <Routes>
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
