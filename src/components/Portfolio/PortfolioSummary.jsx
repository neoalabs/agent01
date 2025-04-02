// src/components/Portfolio/PortfolioSummary.jsx
import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

const PortfolioSummary = () => {
  const { portfolio, portfolioStats, loading } = usePortfolio();
  
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  const isProfitable = portfolioStats.totalGainLoss > 0;
  const gainLossPercent = portfolioStats.totalInvested > 0 
    ? ((portfolioStats.totalGainLoss / portfolioStats.totalInvested) * 100).toFixed(2)
    : 0;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Portfolio Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-md">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-blue-600">Total Value</div>
              <div className="text-2xl font-bold text-gray-800">
                ${(portfolioStats.totalValue || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="bg-gray-100 p-2 rounded-md">
              <PieChart className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-600">Total Invested</div>
              <div className="text-2xl font-bold text-gray-800">
                ${(portfolioStats.totalInvested || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
            </div>
          </div>
        </div>
        
        <div className={`bg-${isProfitable ? 'green' : 'red'}-50 p-4 rounded-lg`}>
          <div className="flex items-center">
            <div className={`bg-${isProfitable ? 'green' : 'red'}-100 p-2 rounded-md`}>
              {isProfitable ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div className="ml-3">
              <div className={`text-sm font-medium text-${isProfitable ? 'green' : 'red'}-600`}>
                Total {isProfitable ? 'Gain' : 'Loss'}
              </div>
              <div className="flex items-center">
                <div className={`text-2xl font-bold text-${isProfitable ? 'green' : 'red'}-600`}>
                  ${Math.abs(portfolioStats.totalGainLoss || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
                <div className={`ml-2 text-sm font-medium text-${isProfitable ? 'green' : 'red'}-600`}>
                  ({isProfitable ? '+' : '-'}{Math.abs(gainLossPercent)}%)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {portfolio.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">You don't have any stocks in your portfolio yet.</p>
          <button 
            onClick={() => {}} // This would open the add stock modal
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add your first stock
          </button>
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
                  Shares
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Cost
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market Value
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gain/Loss
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {portfolio.map((stock, index) => {
                const gainLoss = (stock.current_price - stock.purchase_price) * stock.shares;
                const gainLossPercent = ((stock.current_price / stock.purchase_price) - 1) * 100;
                const isProfit = gainLoss >= 0;
                
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{stock.symbol}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {stock.shares.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 4})}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      ${stock.purchase_price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      ${stock.current_price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      ${(stock.current_price * stock.shares).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-${isProfit ? 'green' : 'red'}-600`}>
                        <span>
                          ${Math.abs(gainLoss).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                        <span className="ml-2 text-sm">
                          ({isProfit ? '+' : '-'}{Math.abs(gainLossPercent).toFixed(2)}%)
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PortfolioSummary;