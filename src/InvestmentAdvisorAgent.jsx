import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, DollarSign, BarChart2, Search, Info, FileText, Briefcase } from 'lucide-react';

const InvestmentAdvisorAgent = () => {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data to simulate API responses
  const mockAnalyzeStock = (symbol) => {
    setLoading(true);
    setError('');
    
    // Simulate API call delay
    setTimeout(() => {
      if (!symbol || symbol.length < 1) {
        setError('Please enter a valid stock symbol');
        setLoading(false);
        return;
      }
      
      const mockData = {
        companyInfo: {
          name: symbol.toUpperCase() === 'AAPL' ? 'Apple Inc.' : 
                 symbol.toUpperCase() === 'MSFT' ? 'Microsoft Corporation' : 
                 symbol.toUpperCase() === 'GOOGL' ? 'Alphabet Inc.' : 
                 `${symbol.toUpperCase()} Corporation`,
          symbol: symbol.toUpperCase(),
          currentPrice: Math.round(100 + Math.random() * 900) / 10,
          marketCap: `$${Math.round(10 + Math.random() * 990) / 10}B`,
          sector: ['Technology', 'Finance', 'Healthcare', 'Consumer Goods', 'Energy'][Math.floor(Math.random() * 5)],
          peRatio: Math.round(10 + Math.random() * 40) / 10,
          fiftyTwoWeekLow: Math.round(50 + Math.random() * 400) / 10,
          fiftyTwoWeekHigh: Math.round(100 + Math.random() * 900) / 10,
        },
        financialMetrics: {
          revenue: `$${Math.round(1 + Math.random() * 99)}B`,
          netIncome: `$${Math.round(1 + Math.random() * 20)}B`,
          eps: Math.round(1 + Math.random() * 199) / 10,
          revenueGrowth: `${Math.round(-10 + Math.random() * 60)}%`,
          profitMargin: `${Math.round(5 + Math.random() * 35)}%`,
          debtToEquity: Math.round(10 + Math.random() * 150) / 100,
          cashOnHand: `$${Math.round(1 + Math.random() * 50)}B`,
          freeCashFlow: `$${Math.round(1 + Math.random() * 15)}B`,
        },
        marketAnalysis: {
          sentiment: ['Bullish', 'Somewhat Bullish', 'Neutral', 'Somewhat Bearish', 'Bearish'][Math.floor(Math.random() * 5)],
          volatility: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
          momentum: ['Strong Positive', 'Positive', 'Neutral', 'Negative', 'Strong Negative'][Math.floor(Math.random() * 5)],
          sectorPerformance: `${Math.round(-10 + Math.random() * 30)}%`,
          analystRecommendations: {
            buy: Math.floor(Math.random() * 20),
            hold: Math.floor(Math.random() * 15),
            sell: Math.floor(Math.random() * 10),
          }
        },
        investmentRecommendation: {
          recommendation: ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'][Math.floor(Math.random() * 5)],
          targetPrice: Math.round((100 + Math.random() * 900) / 10 * (0.8 + Math.random() * 0.4)),
          timeHorizon: ['Short-term', 'Medium-term', 'Long-term'][Math.floor(Math.random() * 3)],
          riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
          reasoning: [
            "Strong financial performance and market position",
            "Undervalued compared to industry peers",
            "Recent product launches expected to drive growth",
            "Concerns about increasing competition",
            "Declining profit margins and revenue growth",
            "Potential regulatory challenges ahead"
          ].sort(() => 0.5 - Math.random()).slice(0, 3),
          catalysts: [
            "Upcoming product announcement",
            "Potential acquisition targets",
            "Expansion into new markets",
            "Cost-cutting initiatives",
            "Share buyback program",
            "Industry consolidation"
          ].sort(() => 0.5 - Math.random()).slice(0, 2),
        },
        news: [
          {
            title: `${symbol.toUpperCase()} Reports Quarterly Earnings Above Expectations`,
            source: 'Financial Times',
            date: '2 days ago',
            sentiment: 'Positive'
          },
          {
            title: `New Product Launch From ${symbol.toUpperCase()} Receives Mixed Reviews`,
            source: 'Wall Street Journal',
            date: '1 week ago',
            sentiment: 'Neutral'
          },
          {
            title: `${symbol.toUpperCase()} Announces Expansion Into International Markets`,
            source: 'Bloomberg',
            date: '2 weeks ago',
            sentiment: 'Positive'
          },
          {
            title: `Industry Analysis: How ${symbol.toUpperCase()} Compares To Competitors`,
            source: 'CNBC',
            date: '3 weeks ago',
            sentiment: 'Neutral'
          },
        ]
      };
      
      setAnalysis(mockData);
      setLoading(false);
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mockAnalyzeStock(symbol);
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment.includes('Positive') || sentiment === 'Bullish') return 'text-green-600';
    if (sentiment.includes('Negative') || sentiment === 'Bearish') return 'text-red-600';
    return 'text-yellow-600';
  };

  const getRecommendationColor = (rec) => {
    if (rec === 'Strong Buy' || rec === 'Buy') return 'bg-green-100 text-green-800';
    if (rec === 'Hold') return 'bg-yellow-100 text-yellow-800';
    if (rec === 'Sell' || rec === 'Strong Sell') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Calculate recommendation score for the meter visualization
  const getRecommendationScore = (rec) => {
    const scores = {
      'Strong Buy': 100,
      'Buy': 75,
      'Hold': 50,
      'Sell': 25,
      'Strong Sell': 0
    };
    return scores[rec] || 50;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white rounded-lg shadow">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Advisor Agent</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enter a stock symbol to get comprehensive analysis and investment recommendations powered by AI
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 flex flex-col md:flex-row gap-4 justify-center">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter stock symbol (e.g., AAPL)"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {loading ? 'Analyzing...' : 'Analyze Stock'}
        </button>
      </form>

      {error && (
        <div className="mb-8 p-4 bg-red-50 rounded-md border border-red-200 flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Analyzing stock data and generating recommendations...</p>
        </div>
      )}

      {analysis && !loading && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          {/* Company Header */}
          <div className="bg-white p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{analysis.companyInfo.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-500 font-medium">{analysis.companyInfo.symbol}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">{analysis.companyInfo.sector}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-3xl font-bold text-gray-900">${analysis.companyInfo.currentPrice}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`font-medium ${Math.random() > 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.random() > 0.5 ? '+' : '-'}{Math.round(Math.random() * 500) / 100}%
                  </span>
                  <span className="text-gray-500">Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white border-b border-gray-200">
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
                Financial Metrics
              </button>
              <button
                onClick={() => setActiveTab('market')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'market'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Market Analysis
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'news'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                News & Events
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

          {/* Content Sections */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Info className="mr-2 h-5 w-5 text-blue-500" />
                      Company Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Market Cap</p>
                        <p className="font-medium">{analysis.companyInfo.marketCap}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">P/E Ratio</p>
                        <p className="font-medium">{analysis.companyInfo.peRatio}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">52-Week Low</p>
                        <p className="font-medium">${analysis.companyInfo.fiftyTwoWeekLow}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">52-Week High</p>
                        <p className="font-medium">${analysis.companyInfo.fiftyTwoWeekHigh}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <BarChart2 className="mr-2 h-5 w-5 text-blue-500" />
                      Key Performance Metrics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Revenue</p>
                        <p className="font-medium">{analysis.financialMetrics.revenue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Net Income</p>
                        <p className="font-medium">{analysis.financialMetrics.netIncome}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">EPS</p>
                        <p className="font-medium">${analysis.financialMetrics.eps}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Revenue Growth</p>
                        <p className="font-medium">{analysis.financialMetrics.revenueGrowth}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Briefcase className="mr-2 h-5 w-5 text-blue-500" />
                    Investment Summary
                  </h3>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(analysis.investmentRecommendation.recommendation)}`}>
                          {analysis.investmentRecommendation.recommendation}
                        </span>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Target Price</p>
                        <p className="text-xl font-bold">${analysis.investmentRecommendation.targetPrice}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Time Horizon</p>
                          <p className="font-medium">{analysis.investmentRecommendation.timeHorizon}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Risk Level</p>
                          <p className="font-medium">{analysis.investmentRecommendation.riskLevel}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-2">Reasoning</p>
                      <ul className="list-disc pl-5 space-y-1 mb-3">
                        {analysis.investmentRecommendation.reasoning.map((reason, idx) => (
                          <li key={idx} className="text-sm">{reason}</li>
                        ))}
                      </ul>
                      <p className="text-sm text-gray-500 mb-2">Potential Catalysts</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {analysis.investmentRecommendation.catalysts.map((catalyst, idx) => (
                          <li key={idx} className="text-sm">{catalyst}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
                    Market Sentiment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Market Sentiment</p>
                      <p className={`font-medium mt-1 ${getSentimentColor(analysis.marketAnalysis.sentiment)}`}>
                        {analysis.marketAnalysis.sentiment}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Momentum</p>
                      <p className={`font-medium mt-1 ${getSentimentColor(analysis.marketAnalysis.momentum)}`}>
                        {analysis.marketAnalysis.momentum}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sector Performance</p>
                      <p className={`font-medium mt-1 ${parseFloat(analysis.marketAnalysis.sectorPerformance) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analysis.marketAnalysis.sectorPerformance}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Metrics Tab */}
            {activeTab === 'financials' && (
              <div>
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue & Profitability</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Revenue</p>
                      <p className="text-xl font-bold mt-1">{analysis.financialMetrics.revenue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Net Income</p>
                      <p className="text-xl font-bold mt-1">{analysis.financialMetrics.netIncome}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">EPS</p>
                      <p className="text-xl font-bold mt-1">${analysis.financialMetrics.eps}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Revenue Growth</p>
                      <p className={`text-xl font-bold mt-1 ${parseFloat(analysis.financialMetrics.revenueGrowth) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analysis.financialMetrics.revenueGrowth}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Profit Margin</p>
                      <p className="text-xl font-bold mt-1">{analysis.financialMetrics.profitMargin}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Debt to Equity</p>
                      <p className="text-xl font-bold mt-1">{analysis.financialMetrics.debtToEquity}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cash & Liquidity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Cash on Hand</p>
                      <p className="text-xl font-bold mt-1">{analysis.financialMetrics.cashOnHand}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Free Cash Flow</p>
                      <p className="text-xl font-bold mt-1">{analysis.financialMetrics.freeCashFlow}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Valuation Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">P/E Ratio</p>
                      <p className="text-xl font-bold mt-1">{analysis.companyInfo.peRatio}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Market Cap</p>
                      <p className="text-xl font-bold mt-1">{analysis.companyInfo.marketCap}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Market Analysis Tab */}
            {activeTab === 'market' && (
              <div>
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Market Sentiment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Overall Sentiment</p>
                      <p className={`text-xl font-bold mt-1 ${getSentimentColor(analysis.marketAnalysis.sentiment)}`}>
                        {analysis.marketAnalysis.sentiment}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Volatility</p>
                      <p className="text-xl font-bold mt-1">
                        {analysis.marketAnalysis.volatility}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Momentum</p>
                      <p className={`text-xl font-bold mt-1 ${getSentimentColor(analysis.marketAnalysis.momentum)}`}>
                        {analysis.marketAnalysis.momentum}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sector Analysis</h3>
                  <div>
                    <p className="text-sm text-gray-500">Sector Performance (YTD)</p>
                    <p className={`text-xl font-bold mt-1 ${parseFloat(analysis.marketAnalysis.sectorPerformance) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analysis.marketAnalysis.sectorPerformance}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {analysis.companyInfo.name} is in the {analysis.companyInfo.sector} sector, which has 
                      {parseFloat(analysis.marketAnalysis.sectorPerformance) > 0 ? ' outperformed ' : ' underperformed '}
                      the broader market year-to-date.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Analyst Recommendations</h3>
                  <div className="flex items-center mb-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{ width: `${(analysis.marketAnalysis.analystRecommendations.buy / (analysis.marketAnalysis.analystRecommendations.buy + analysis.marketAnalysis.analystRecommendations.hold + analysis.marketAnalysis.analystRecommendations.sell)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-500">Buy</p>
                      <p className="text-xl font-bold text-green-600">{analysis.marketAnalysis.analystRecommendations.buy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hold</p>
                      <p className="text-xl font-bold text-yellow-600">{analysis.marketAnalysis.analystRecommendations.hold}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sell</p>
                      <p className="text-xl font-bold text-red-600">{analysis.marketAnalysis.analystRecommendations.sell}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* News Tab */}
            {activeTab === 'news' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Latest News & Events</h3>
                <div className="space-y-4">
                  {analysis.news.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <div className="flex items-center mt-2 text-sm">
                        <span className="text-gray-500">{item.source}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-gray-500">{item.date}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className={`${getSentimentColor(item.sentiment)}`}>{item.sentiment}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation Tab */}
            {activeTab === 'recommendation' && (
              <div>
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 md:border-r md:border-gray-200 md:pr-6 mb-6 md:mb-0">
                      <div className="text-center mb-6">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium ${getRecommendationColor(analysis.investmentRecommendation.recommendation)}`}>
                          {analysis.investmentRecommendation.recommendation}
                        </span>
                      </div>
                      
                      <div className="mb-6">
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">
                                Sell
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                                Buy
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                            <div style={{ width: `${getRecommendationScore(analysis.investmentRecommendation.recommendation)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-sm text-gray-500">Target Price</p>
                          <p className="text-2xl font-bold">${analysis.investmentRecommendation.targetPrice}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {analysis.investmentRecommendation.targetPrice > analysis.companyInfo.currentPrice 
                              ? `+${((analysis.investmentRecommendation.targetPrice / analysis.companyInfo.currentPrice - 1) * 100).toFixed(1)}% upside`
                              : `${((analysis.investmentRecommendation.targetPrice / analysis.companyInfo.currentPrice - 1) * 100).toFixed(1)}% downside`}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Current Price</p>
                          <p className="text-2xl font-bold">${analysis.companyInfo.currentPrice}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-500">Time Horizon</p>
                          <p className="font-medium">{analysis.investmentRecommendation.timeHorizon}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Risk Level</p>
                          <p className="font-medium">{analysis.investmentRecommendation.riskLevel}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 md:pl-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Thesis</h3>
                      
                      <div className="mb-6">
                        <p className="text-sm text-gray-500 mb-2">Key Reasons for Recommendation</p>
                        <ul className="list-disc pl-5 space-y-2">
                          {analysis.investmentRecommendation.reasoning.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mb-6">
                        <p className="text-sm text-gray-500 mb-2">Potential Catalysts</p>
                        <ul className="list-disc pl-5 space-y-2">
                          {analysis.investmentRecommendation.catalysts.map((catalyst, idx) => (
                            <li key={idx}>{catalyst}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Risks to Consider</p>
                        <ul className="list-disc pl-5 space-y-2">
                          <li>Market volatility could impact short-term performance</li>
                          <li>Competitive pressures in the {analysis.companyInfo.sector} sector</li>
                          <li>Potential regulatory changes affecting the industry</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-200 shadow-sm">
                  <div className="flex items-start">
                    <Info className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-medium text-blue-900 mb-2">AI Advisory Disclaimer</h3>
                      <p className="text-sm text-blue-800">
                        This analysis is generated by an AI investment advisor for informational purposes only. It is not intended to be investment advice, nor a recommendation to buy or sell any securities. Always conduct your own research and consult with a qualified financial advisor before making investment decisions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Powered by AI investment analysis tools. For demonstration purposes only.</p>
      </div>
    </div>
  );
};

export default InvestmentAdvisorAgent;