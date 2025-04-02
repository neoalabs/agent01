// src/services/mockStockService.js - Mock service for development when backend is not available

const STORAGE_KEYS = {
    PORTFOLIO: 'mock_portfolio',
    WATCHLIST: 'mock_watchlist',
  };
  
  // Sample stock data for development
  const SAMPLE_STOCK_DATA = {
    'AAPL': {
      name: 'Apple Inc.',
      current_price: 182.52,
      price_change: 0.87,
      price_change_percent: 0.48,
      sector: 'Technology',
      industry: 'Consumer Electronics',
      pe_ratio: 30.21,
      market_cap: '2.85T',
      dividend_yield: 0.53,
      fifty_two_week_low: 142.35,
      fifty_two_week_high: 199.62
    },
    'MSFT': {
      name: 'Microsoft Corporation',
      current_price: 417.88,
      price_change: -3.45,
      price_change_percent: -0.82,
      sector: 'Technology',
      industry: 'Software—Infrastructure',
      pe_ratio: 36.42,
      market_cap: '3.11T',
      dividend_yield: 0.71,
      fifty_two_week_low: 293.42,
      fifty_two_week_high: 430.82
    },
    'GOOGL': {
      name: 'Alphabet Inc.',
      current_price: 163.20,
      price_change: 1.89,
      price_change_percent: 1.17,
      sector: 'Communication Services',
      industry: 'Internet Content & Information',
      pe_ratio: 25.03,
      market_cap: '2.04T',
      dividend_yield: 0.50,
      fifty_two_week_low: 115.35,
      fifty_two_week_high: 169.50
    },
    'AMZN': {
      name: 'Amazon.com, Inc.',
      current_price: 178.08,
      price_change: -0.59,
      price_change_percent: -0.33,
      sector: 'Consumer Cyclical',
      industry: 'Internet Retail',
      pe_ratio: 61.20,
      market_cap: '1.86T',
      dividend_yield: 0,
      fifty_two_week_low: 118.35,
      fifty_two_week_high: 189.77
    },
    'TSLA': {
      name: 'Tesla, Inc.',
      current_price: 172.63,
      price_change: 4.20,
      price_change_percent: 2.50,
      sector: 'Consumer Cyclical',
      industry: 'Auto Manufacturers',
      pe_ratio: 47.54,
      market_cap: '549.8B',
      dividend_yield: 0,
      fifty_two_week_low: 138.80,
      fifty_two_week_high: 299.29
    }
  };
  
  // Mock recommendations
  const MOCK_RECOMMENDATIONS = {
    'AAPL': {
      action: 'Buy',
      target_price: 210.00,
      time_horizon: 'Long-term',
      reasoning: [
        'Strong ecosystem and customer loyalty',
        'Consistent growth in services revenue',
        'Strong balance sheet with significant cash reserves',
        'Potential for new product categories'
      ],
      risk_level: 'Low'
    },
    'MSFT': {
      action: 'Buy',
      target_price: 450.00,
      time_horizon: 'Long-term',
      reasoning: [
        'Dominant position in cloud computing with Azure',
        'Stable Office 365 subscription revenue',
        'Strategic AI investments paying off',
        'Strong enterprise relationships'
      ],
      risk_level: 'Low'
    },
    'GOOGL': {
      action: 'Buy',
      target_price: 190.00,
      time_horizon: 'Medium-term',
      reasoning: [
        'Digital advertising market leader',
        'YouTube growth potential',
        'Investments in AI and cloud computing',
        'Reasonable valuation compared to peers'
      ],
      risk_level: 'Medium'
    },
    'AMZN': {
      action: 'Hold',
      target_price: 185.00,
      time_horizon: 'Medium-term',
      reasoning: [
        'E-commerce dominance',
        'AWS growth slowing but still strong',
        'Rising competition in cloud services',
        'Concerns about consumer spending in economic slowdown'
      ],
      risk_level: 'Medium'
    },
    'TSLA': {
      action: 'Sell',
      target_price: 150.00,
      time_horizon: 'Short-term',
      reasoning: [
        'Increased competition in EV market',
        'Margin pressure from price cuts',
        'Production concerns and quality issues',
        'High valuation relative to traditional automakers'
      ],
      risk_level: 'High'
    }
  };
  
  // Initialize mock storage if needed
  const initializeStorage = () => {
    if (!localStorage.getItem(STORAGE_KEYS.PORTFOLIO)) {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.WATCHLIST)) {
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify([]));
    }
  };
  
  const mockStockService = {
    // Analyze a stock (mock implementation)
    analyzeStock: async (symbol) => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      const upperSymbol = symbol.toUpperCase();
      
      if (!SAMPLE_STOCK_DATA[upperSymbol]) {
        throw new Error(`Stock not found: ${symbol}`);
      }
      
      return {
        structured_data: {
          symbol: upperSymbol,
          analysis_date: new Date().toLocaleDateString(),
          data: {
            ...SAMPLE_STOCK_DATA[upperSymbol],
            news: [
              {
                title: `${SAMPLE_STOCK_DATA[upperSymbol].name} Announces Quarterly Earnings`,
                publisher: 'Financial Times',
                link: '#',
                published_date: new Date().toLocaleDateString()
              },
              {
                title: `Analyst Upgrades ${upperSymbol} Stock Rating`,
                publisher: 'Wall Street Journal',
                link: '#',
                published_date: new Date(Date.now() - 86400000).toLocaleDateString()
              }
            ]
          },
          recommendation: MOCK_RECOMMENDATIONS[upperSymbol] || {
            action: 'Hold',
            target_price: SAMPLE_STOCK_DATA[upperSymbol].current_price * 1.1,
            time_horizon: 'Medium-term',
            reasoning: ['General market uncertainty', 'Balanced risk-reward profile'],
            risk_level: 'Medium'
          }
        },
        full_analysis: `Detailed analysis for ${SAMPLE_STOCK_DATA[upperSymbol].name} (${upperSymbol})...`
      };
    },
    
    // Get portfolio data
    getPortfolio: async () => {
      initializeStorage();
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      const portfolio = JSON.parse(localStorage.getItem(STORAGE_KEYS.PORTFOLIO));
      
      // Add current price and calculations to portfolio data
      const portfolioWithData = portfolio.map(stock => {
        const stockData = SAMPLE_STOCK_DATA[stock.symbol] || { current_price: stock.purchase_price };
        return {
          ...stock,
          current_price: stockData.current_price,
          current_value: stockData.current_price * stock.shares,
          gain_loss: (stockData.current_price - stock.purchase_price) * stock.shares,
          gain_loss_percentage: ((stockData.current_price / stock.purchase_price) - 1) * 100
        };
      });
      
      return {
        portfolio: portfolioWithData,
        total_value: portfolioWithData.reduce((sum, stock) => sum + stock.current_value, 0),
        total_invested: portfolio.reduce((sum, stock) => sum + (stock.purchase_price * stock.shares), 0),
        total_gain_loss: portfolioWithData.reduce((sum, stock) => sum + stock.gain_loss, 0)
      };
    },
    
    // Add stock to portfolio
    addToPortfolio: async (stockData) => {
      initializeStorage();
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      const { symbol, shares, purchase_price, purchase_date, notes } = stockData;
      const upperSymbol = symbol.toUpperCase();
      
      // Validate input
      if (!upperSymbol || !shares || !purchase_price) {
        throw new Error('Missing required fields');
      }
      
      const portfolio = JSON.parse(localStorage.getItem(STORAGE_KEYS.PORTFOLIO));
      
      // Check if stock already exists in portfolio
      const existingIndex = portfolio.findIndex(stock => stock.symbol === upperSymbol);
      
      if (existingIndex >= 0) {
        // Update existing stock
        const existingStock = portfolio[existingIndex];
        const totalShares = existingStock.shares + parseFloat(shares);
        const oldValue = existingStock.shares * existingStock.purchase_price;
        const newValue = parseFloat(shares) * parseFloat(purchase_price);
        const newAvgPrice = (oldValue + newValue) / totalShares;
        
        portfolio[existingIndex] = {
          ...existingStock,
          shares: totalShares,
          purchase_price: newAvgPrice,
          notes: notes || existingStock.notes
        };
      } else {
        // Add new stock
        portfolio.push({
          symbol: upperSymbol,
          shares: parseFloat(shares),
          purchase_price: parseFloat(purchase_price),
          purchase_date: purchase_date || new Date().toISOString(),
          notes: notes || ''
        });
      }
      
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio));
      
      return { message: 'Stock added to portfolio' };
    },
    
    // Remove stock from portfolio
    removeFromPortfolio: async (symbol, shares = 0) => {
      initializeStorage();
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      const upperSymbol = symbol.toUpperCase();
      const portfolio = JSON.parse(localStorage.getItem(STORAGE_KEYS.PORTFOLIO));
      
      const existingIndex = portfolio.findIndex(stock => stock.symbol === upperSymbol);
      
      if (existingIndex === -1) {
        throw new Error(`Stock ${upperSymbol} not found in portfolio`);
      }
      
      const sharesFloat = parseFloat(shares);
      
      if (sharesFloat <= 0 || sharesFloat >= portfolio[existingIndex].shares) {
        // Remove entire position
        portfolio.splice(existingIndex, 1);
      } else {
        // Partially reduce position
        portfolio[existingIndex].shares -= sharesFloat;
      }
      
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio));
      
      return { message: `Stock ${upperSymbol} updated in portfolio` };
    },
    
    // Get watchlist data
    getWatchlist: async () => {
      initializeStorage();
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      const watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST));
      
      // Add current data to watchlist symbols
      const watchlistWithData = watchlist.map(symbol => {
        const stockData = SAMPLE_STOCK_DATA[symbol];
        
        if (!stockData) {
          return { symbol, error: 'Stock data not available' };
        }
        
        return {
          symbol,
          name: stockData.name,
          current_price: stockData.current_price,
          price_change: stockData.price_change,
          price_change_percent: stockData.price_change_percent,
          sector: stockData.sector,
          pe_ratio: stockData.pe_ratio
        };
      });
      
      return { watchlist: watchlistWithData };
    },
    
    // Add stock to watchlist
    addToWatchlist: async (symbol) => {
      initializeStorage();
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      const upperSymbol = symbol.toUpperCase();
      
      // Validate symbol
      if (!SAMPLE_STOCK_DATA[upperSymbol]) {
        throw new Error(`Invalid stock symbol: ${symbol}`);
      }
      
      const watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST));
      
      // Check if already in watchlist
      if (watchlist.includes(upperSymbol)) {
        return { message: `Stock ${upperSymbol} already in watchlist` };
      }
      
      watchlist.push(upperSymbol);
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
      
      return { message: `Stock ${upperSymbol} added to watchlist` };
    },
    
    // Remove stock from watchlist
    removeFromWatchlist: async (symbol) => {
      initializeStorage();
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      const upperSymbol = symbol.toUpperCase();
      let watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST));
      
      watchlist = watchlist.filter(item => item !== upperSymbol);
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
      
      return { message: `Stock ${upperSymbol} removed from watchlist` };
    }
  };
  
  export default mockStockService;