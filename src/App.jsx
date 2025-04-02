// src/App.jsx - Updated main App component with router
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PortfolioProvider } from './context/PortfolioContext';
import Dashboard from './pages/Dashboard';
import PortfolioPage from './pages/PortfolioPage';
import WatchlistPage from './pages/WatchlistPage';
import StockDetail from './pages/StockDetail';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import LandingPage from './pages/LandingPage';
import PrivateRoute from './components/Auth/PrivateRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/portfolio" 
              element={
                <PrivateRoute>
                  <PortfolioPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/watchlist" 
              element={
                <PrivateRoute>
                  <WatchlistPage />
                </PrivateRoute>
              } 
            />
            <Route path="/stock/:symbol" element={<StockDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </PortfolioProvider>
    </AuthProvider>
  );
}

export default App;