// src/components/Portfolio/WatchList.jsx
import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Plus, Trash2, Eye, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';

const WatchList = () => {
  const { watchlist, loading, removeFromWatchlist, addToPortfolio } = usePortfolio();
  
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  const handleRemoveFromWatchlist = async (symbol) => {
    try {
      await removeFromWatchlist(symbol);
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
      // Could show an error notification here
    }
  };
  
  const [addStockModalOpen, setAddStockModalOpen] = React.useState(false);
  const [selectedStock, setSelectedStock] = React.useState(null);
  
  const openAddStockModal = (stock) => {
    setSelectedStock(stock);
    setAddStockModalOpen(true);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Watchlist</h2>
      
      {watchlist.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Your watchlist is empty.</p>
          <p className="text-gray-500 mt-1">Add stocks to your watchlist to monitor them.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
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
                          onClick={() => window.open(`/stock/${stock.symbol}`, '_blank')}
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
        </div>
      )}
      
      {/* Modal for adding stock to portfolio would go here */}
      {/* This is just a placeholder - you would need to implement the actual modal */}
      {addStockModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <AddStockForm
              initialSymbol={selectedStock?.symbol}
              initialPrice={selectedStock?.current_price}
              onClose={() => setAddStockModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchList;