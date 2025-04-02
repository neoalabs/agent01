// src/pages/StockDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import Header from '../components/Layout/Header';
import AddStockForm from '../components/Portfolio/AddStockForm';
import stockService from '../services/stockService';
import mockStockService from '../services/mockStockService';
import { Eye, Plus, Star, AlertCircle, TrendingUp, TrendingDown, DollarSign, BarChart2, Clock, Info } from 'lucide-react';

// Use mock service for development if API_URL is not set
const service = import.meta.env.VITE_API_URL ? stockService : mockStockService;

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { watchlist, addToWatchlist, removeFromWatchlist } = usePortfolio();
  
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  
  const isInWatchlist = watchlist.some(item => item.symbol === symbol);
  
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const data = await service.analyzeStock(symbol);
        setStockData(data);
      } catch (err) {
        setError(`Failed to fetch data for ${symbol}: ${err.message}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (symbol) {
      fetchStockData();
    }
  }, [symbol]);
  
  const handleAddToWatchlist = async () => {
    try {
      await addToWatchlist(symbol);
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
      // Could show an error notification here
    }
  };
  
  const handleRemoveFromWatchlist = async () => {
    try {
      await removeFromWatchlist(symbol);
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
      // Could show an error notification here
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <div className="flex">
              <div className="py-1"><AlertCircle className="h-5 w-5 text-red-500 mr-2" /></div>
              <div>
                <p className="font-bold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!stockData) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <div className="flex">
              <div className="py-1"><AlertCircle className="h-5 w-5 text-yellow-500 mr-2" /></div>
              <div>
                <p className="font-bold">No Data</p>
                <p className="text-sm">No data available for the requested stock.</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const { structured_data, full_analysis } = stockData;
  const { symbol: stockSymbol, data, recommendation } = structured_data;
  
  const priceChange = data.price_change || 0;
  const priceChangePercent = data.price_change_percent || 0;
  const isPositiveChange = priceChange >= 0;
  
  const getRecommendationColor = (rec) => {
    if (rec === 'Buy' || rec === 'Strong Buy') return 'bg-green-100 text-green-800';
    if (rec === 'Hold') return 'bg-yellow-100 text-yellow-800';
    if (rec === 'Sell' || rec === 'Strong Sell') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stock Header */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{data.company_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-500 font-medium">{stockSymbol}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{data.sector || 'N/A'}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="text-3xl font-bold text-gray-900">${data.current_price}</div>
              <div className={`flex items-center gap-1 mt-1 text-${isPositiveChange ? 'green' : 'red'}-600`}>
                {isPositiveChange ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {isPositiveChange ? '+' : ''}{priceChange.toFixed(2)} ({isPositiveChange ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                </span>
                <span className="text-gray-500 ml-1">Today</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(recommendation.action)}`}>
                {recommendation.action}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <DollarSign className="h-4 w-4 mr-1" />
                Target: ${recommendation.target_price?.toFixed(2) || data.current_price}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                <Clock className="h-4 w-4 mr-1" />
                {recommendation.time_horizon || 'Medium-term'}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={isInWatchlist ? handleRemoveFromWatchlist : handleAddToWatchlist}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isInWatchlist 
                    ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200' 
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Star className={`h-4 w-4 mr-1 ${isInWatchlist ? 'fill-yellow-400' : ''}`} />
                {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
              
              <button
                onClick={() => setShowAddStockModal(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add to Portfolio
              </button>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="bg-white shadow-md rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('financials')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'financials'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Financials
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'news'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                News
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'analysis'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Analysis
              </button>
              <button
                onClick={() => setActiveTab('recommendation')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'recommendation'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Recommendation
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Info className="h-5 w-5 mr-2 text-blue-500" />
                    Company Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                        <dd className="mt-1 text-gray-900">{data.company_name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Symbol</dt>
                        <dd className="mt-1 text-gray-900">{stockSymbol}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Market Cap</dt>
                        <dd className="mt-1 text-gray-900">{data.market_cap}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Sector</dt>
                        <dd className="mt-1 text-gray-900">{data.sector || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Industry</dt>
                        <dd className="mt-1 text-gray-900">{data.industry || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">P/E Ratio</dt>
                        <dd className="mt-1 text-gray-900">{data.pe_ratio?.toFixed(2) || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Dividend Yield</dt>
                        <dd className="mt-1 text-gray-900">{data.dividend_yield ? `${(data.dividend_yield * 100).toFixed(2)}%` : 'N/A'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
                    Stock Performance
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Current Price</dt>
                        <dd className="mt-1 text-gray-900">${data.current_price}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Price Change</dt>
                        <dd className={`mt-1 text-${isPositiveChange ? 'green' : 'red'}-600`}>
                          {isPositiveChange ? '+' : ''}{priceChange.toFixed(2)} ({isPositiveChange ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">52-Week Low</dt>
                        <dd className="mt-1 text-gray-900">${data['52_week_low']?.toFixed(2) || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">52-Week High</dt>
                        <dd className="mt-1 text-gray-900">${data['52_week_high']?.toFixed(2) || 'N/A'}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Target Price (Analyst Consensus)</dt>
                        <dd className="mt-1 text-gray-900">${recommendation.target_price?.toFixed(2) || 'N/A'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'financials' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Metrics</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">P/E Ratio</dt>
                      <dd className="mt-1 text-xl font-semibold text-gray-900">{data.pe_ratio?.toFixed(2) || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Dividend Yield</dt>
                      <dd className="mt-1 text-xl font-semibold text-gray-900">{data.dividend_yield ? `${(data.dividend_yield * 100).toFixed(2)}%` : 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Market Cap</dt>
                      <dd className="mt-1 text-xl font-semibold text-gray-900">{data.market_cap}</dd>
                    </div>
                  </dl>
                </div>
                
                <p className="text-gray-600 italic">
                  Detailed financial statements would be displayed here in a production environment, including
                  income statements, balance sheets, and cash flow statements over multiple quarters or years.
                </p>
              </div>
            )}
            
            {activeTab === 'news' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Latest News</h3>
                
                {data.news && data.news.length > 0 ? (
                  <div className="space-y-4">
                    {data.news.map((article, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900">{article.title}</h4>
                        <div className="flex items-center mt-2 text-sm">
                          <span className="text-gray-500">{article.publisher}</span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-gray-500">{article.published_date}</span>
                        </div>
                        {article.link && (
                          <a 
                            href={article.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                          >
                            Read more <ArrowUpRight className="h-3 w-3 ml-1" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No recent news available for this stock.</p>
                )}
              </div>
            )}
            
            {activeTab === 'analysis' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Technical & Fundamental Analysis</h3>
                
                {full_analysis ? (
                  <div className="bg-gray-50 p-4 rounded-lg prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                      {full_analysis}
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-600">Detailed analysis not available for this stock.</p>
                )}
              </div>
            )}
            
            {activeTab === 'recommendation' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Recommendation</h3>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(recommendation.action)}`}>
                          {recommendation.action}
                        </span>
                      </div>
                      
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Target Price</dt>
                          <dd className="mt-1 text-xl font-bold text-gray-900">${recommendation.target_price?.toFixed(2) || 'N/A'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Current Price</dt>
                          <dd className="mt-1 text-xl font-bold text-gray-900">${data.current_price}</dd>
                        </div>
                        
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Time Horizon</dt>
                          <dd className="mt-1 text-gray-900">{recommendation.time_horizon || 'Medium-term'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Risk Level</dt>
                          <dd className="mt-1 text-gray-900">{recommendation.risk_level || 'Medium'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Reasoning</h3>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {recommendation.reasoning && recommendation.reasoning.length > 0 ? (
                        <ul className="space-y-2">
                          {recommendation.reasoning.map((reason, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">Detailed reasoning not available.</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-blue-500 mr-2" />
                    <p className="text-sm text-blue-800">
                      This recommendation is provided for informational purposes only and should not be considered as investment advice.
                      Always do your own research and consider consulting with a financial advisor before making investment decisions.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Stock Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <AddStockForm 
              initialSymbol={stockSymbol}
              initialPrice={data.current_price}
              onClose={() => setShowAddStockModal(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDetail;