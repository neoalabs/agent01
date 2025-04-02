// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePortfolio } from '../context/PortfolioContext';
import Header from '../components/Layout/Header';
import PortfolioSummary from '../components/Portfolio/PortfolioSummary';
import WatchList from '../components/Portfolio/WatchList';
import AddStockForm from '../components/Portfolio/AddStockForm';
import { Search, Plus, AlertCircle } from 'lucide-react';
import stockService from '../services/stockService';
import mockStockService from '../services/mockStockService';

// Use mock service for development if API_URL is not set
const service = import.meta.env.VITE_API_URL ? stockService : mockStockService;

const Dashboard = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { fetchPortfolio, fetchWatchlist } = usePortfolio();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      fetchPortfolio();
      fetchWatchlist();
    }
  }, [isAuthenticated, navigate, fetchPortfolio, fetchWatchlist]);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setSearchError('');
    setSearchResults([]);
    
    try {
      // For demonstration, we're using a mock search
      // In a real app, you would call an API endpoint
      const mockResults = [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 182.52 },
        { symbol: 'MSFT', name: 'Microsoft Corporation', price: 417.88 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 163.20 },
        { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 178.08 },
        { symbol: 'TSLA', name: 'Tesla, Inc.', price: 172.63 }
      ].filter(item => 
        item.symbol.includes(searchQuery.toUpperCase()) || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setTimeout(() => {
        setSearchResults(mockResults);
        setSearching(false);
        
        if (mockResults.length === 0) {
          setSearchError('No stocks found matching your search.');
        }
      }, 500);
    } catch (error) {
      setSearchError('Failed to search for stocks. Please try again.');
      setSearching(false);
    }
  };
  
  const viewStockDetails = (symbol) => {
    navigate(`/stock/${symbol}`);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Welcome, {currentUser?.name || 'Investor'}!
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              View your portfolio summary, manage your investments, and analyze new opportunities.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => setShowAddStockModal(true)}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add to Portfolio
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <form onSubmit={handleSearch} className="mt-1 flex rounded-md shadow-sm">
            <div className="relative flex-grow focus-within:z-10">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300"
                placeholder="Search for stocks by symbol or name"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>
          
          {searchError && (
            <div className="mt-2 text-sm text-red-600">
              {searchError}
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white shadow-md rounded-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {searchResults.map((result) => (
                  <li key={result.symbol} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{result.symbol}</div>
                        <div className="text-sm text-gray-500">{result.name}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-gray-900 font-medium">${result.price.toFixed(2)}</div>
                        <button
                          onClick={() => viewStockDetails(result.symbol)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          View <ArrowUpRight className="ml-1 h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <PortfolioSummary />
          <WatchList />
        </div>
      </div>
      
      {/* Add Stock Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <AddStockForm onClose={() => setShowAddStockModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;