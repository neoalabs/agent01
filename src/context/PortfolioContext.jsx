// src/context/PortfolioContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import stockService from '../services/stockService';
import mockStockService from '../services/mockStockService';
import { useAuth } from './AuthContext';

// Use mock service for development if API_URL is not set
const service = import.meta.env.VITE_API_URL ? stockService : mockStockService;

const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  const [portfolio, setPortfolio] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    totalInvested: 0,
    totalGainLoss: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load portfolio data when authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      fetchPortfolio();
      fetchWatchlist();
    }
  }, [isAuthenticated]);

  const fetchPortfolio = async () => {
    if (!isAuthenticated()) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await service.getPortfolio();
      setPortfolio(data.portfolio);
      setPortfolioStats({
        totalValue: data.total_value,
        totalInvested: data.total_invested,
        totalGainLoss: data.total_gain_loss
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch portfolio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchlist = async () => {
    if (!isAuthenticated()) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await service.getWatchlist();
      setWatchlist(data.watchlist);
    } catch (err) {
      setError(err.message || 'Failed to fetch watchlist');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToPortfolio = async (stockData) => {
    try {
      setLoading(true);
      setError(null);
      await service.addToPortfolio(stockData);
      await fetchPortfolio(); // Refresh portfolio data
    } catch (err) {
      setError(err.message || 'Failed to add stock to portfolio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromPortfolio = async (symbol, shares = 0) => {
    try {
      setLoading(true);
      setError(null);
      await service.removeFromPortfolio(symbol, shares);
      await fetchPortfolio(); // Refresh portfolio data
    } catch (err) {
      setError(err.message || 'Failed to remove stock from portfolio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (symbol) => {
    try {
      setLoading(true);
      setError(null);
      await service.addToWatchlist(symbol);
      await fetchWatchlist(); // Refresh watchlist data
    } catch (err) {
      setError(err.message || 'Failed to add stock to watchlist');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (symbol) => {
    try {
      setLoading(true);
      setError(null);
      await service.removeFromWatchlist(symbol);
      await fetchWatchlist(); // Refresh watchlist data
    } catch (err) {
      setError(err.message || 'Failed to remove stock from watchlist');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    portfolio,
    watchlist,
    portfolioStats,
    loading,
    error,
    fetchPortfolio,
    fetchWatchlist,
    addToPortfolio,
    removeFromPortfolio,
    addToWatchlist,
    removeFromWatchlist
  };

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};