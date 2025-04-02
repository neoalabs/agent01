// src/pages/WatchlistPage.jsx - Dedicated watchlist management page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePortfolio } from '../context/PortfolioContext';
import Header from '../components/Layout/Header';
import AddStockForm from '../components/Portfolio/AddStockForm';
import { Search, Plus, Trash2, Eye, ArrowUpRight, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const WatchlistPage = () => {
  const { isAuthenticated } = useAuth();
  const { watchlist, fetchWatchlist, addToWatchlist, removeFromWatchlist, addToPortfolio, loading, error } = usePortfolio();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const navigate = useNavigate();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      fetchWatchlist();
    }
  }, [isAuthenticated, navigate, fetchWatchlist]);
  
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
  
  const handleAddToWatchlist = async (symbol) => {
    try {
      await addToWatchlist(symbol);
      // Clear search results after adding
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
      // Could show an error notification here
    }
  };
  
  const handleRemoveFromWatchlist = async (symbol) => {
    try {
      await removeFromWatchlist(symbol);
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
      // Could show an error notification here
    }
  };
  
  const openAddStockModal = (stock) => {
    setSelectedStock(stock);
    setShowAddStockModal(true);
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
              Your Watchlist
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Track stocks you're interested in and quickly add them to your portfolio.
            </p>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <div className="flex">
              <div className="py-1"><AlertCircle className="h-5 w-5 text-red-500 mr-2" /></div>
              <div>
                <p className="font-bold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
        
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
                placeholder="Search for stocks to add to your watchlist"
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
                {searchResults.map((result) => {
                  const isInWatchlist = watchlist.some(item => item.symbol === result.symbol);
                  
                  return (
                    <li key={result.symbol} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{result.symbol}</div>
                          <div className="text-sm text-gray-500">{result.name}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-gray-900 font-medium">${result.price.toFixed(2)}</div>
                          
                          {isInWatchlist ? (
                            <button
                              onClick={() => handleRemoveFromWatchlist(result.symbol)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddToWatchlist(result.symbol)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Add to Watchlist
                            </button>
                          )}
                          
                          <button
                            onClick={() => viewStockDetails(result.symbol)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            View <ArrowUpRight className="ml-1 h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Your Watchlist
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Stocks you're monitoring for potential investment.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {watchlist.length === 0 ? (
                <div className="text-center p-8 bg-gray-50">
                  <p className="text-gray-500">Your watchlist is empty.</p>
                  <p className="mt-1 text-gray-500">Search for stocks above to add them to your watchlist.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Symbol
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Change
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sector
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {watchlist.map((stock, index) => {
                      const priceChange = stock.price_change || 0;
                      const priceChangePercent = stock.price_change_percent || 0;
                      const isPositive = priceChange >= 0;
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{stock.symbol}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-500">{stock.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            ${stock.current_price?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center text-${isPositive ? 'green' : 'red'}-600`}>
                              {isPositive ? (
                                <TrendingUp className="h-4 w-4 mr-1" />
                              ) : (
                                <TrendingDown className="h-4 w-4 mr-1" />
                              )}
                              <span>
                                {isPositive ? '+' : ''}{priceChange.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </span>
                              <span className="ml-1">
                                ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {stock.sector || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2 justify-end">
                              <button
                                onClick={() => openAddStockModal(stock)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Add to portfolio"
                              >
                                <Plus className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => viewStockDetails(stock.symbol)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View details"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleRemoveFromWatchlist(stock.symbol)}
                                className="text-red-600 hover:text-red-900"
                                title="Remove from watchlist"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Add Stock Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <AddStockForm
              initialSymbol={selectedStock?.symbol}
              initialPrice={selectedStock?.current_price}
              onClose={() => {
                setShowAddStockModal(false);
                setSelectedStock(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;