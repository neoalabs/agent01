// src/services/stockService.js - Stock data service

import api from './api';

const stockService = {
  // Analyze a stock using the CrewAI workflow
  analyzeStock: async (symbol) => {
    try {
      const response = await api.get(`/analyze/${symbol}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error(`Failed to analyze stock: ${symbol}`);
    }
  },
  
  // Get portfolio data
  getPortfolio: async () => {
    try {
      const response = await api.get('/portfolio');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch portfolio data');
    }
  },
  
  // Add stock to portfolio
  addToPortfolio: async (stockData) => {
    try {
      const response = await api.post('/portfolio/add', stockData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to add stock to portfolio');
    }
  },
  
  // Remove stock from portfolio
  removeFromPortfolio: async (symbol, shares = 0) => {
    try {
      const response = await api.post('/portfolio/remove', { symbol, shares });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to remove stock from portfolio');
    }
  },
  
  // Get watchlist data
  getWatchlist: async () => {
    try {
      const response = await api.get('/watchlist');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch watchlist data');
    }
  },
  
  // Add stock to watchlist
  addToWatchlist: async (symbol) => {
    try {
      const response = await api.post('/watchlist/add', { symbol });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to add stock to watchlist');
    }
  },
  
  // Remove stock from watchlist
  removeFromWatchlist: async (symbol) => {
    try {
      const response = await api.post('/watchlist/remove', { symbol });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to remove stock from watchlist');
    }
  }
};

export default stockService;