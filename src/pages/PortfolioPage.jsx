// src/pages/PortfolioPage.jsx - Dedicated portfolio management page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePortfolio } from '../context/PortfolioContext';
import Header from '../components/Layout/Header';
import PortfolioSummary from '../components/Portfolio/PortfolioSummary';
import AddStockForm from '../components/Portfolio/AddStockForm';
import { Plus, Trash2, Edit, AlertCircle } from 'lucide-react';

const PortfolioPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { portfolio, fetchPortfolio, removeFromPortfolio, loading, error } = usePortfolio();
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      fetchPortfolio();
    }
  }, [isAuthenticated, navigate, fetchPortfolio]);
  
  const openAddStockModal = (stock = null) => {
    setSelectedStock(stock);
    setShowAddStockModal(true);
  };
  
  const openConfirmDeleteModal = (stock) => {
    setSelectedStock(stock);
    setConfirmDeleteModalOpen(true);
  };
  
  const handleRemoveFromPortfolio = async () => {
    if (!selectedStock) return;
    
    try {
      await removeFromPortfolio(selectedStock.symbol);
      setConfirmDeleteModalOpen(false);
      setSelectedStock(null);
    } catch (error) {
      console.error('Failed to remove stock from portfolio:', error);
      // Could show an error notification here
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Your Portfolio
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your investments and track performance over time.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => openAddStockModal()}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Stock
            </button>
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
          <PortfolioSummary />
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Portfolio Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Detailed view of all your investments.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {portfolio.length === 0 ? (
                <div className="text-center p-8 bg-gray-50">
                  <p className="text-gray-500">You don't have any stocks in your portfolio yet.</p>
                  <button 
                    onClick={() => openAddStockModal()}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add your first stock
                  </button>
                </div>
              ) : (
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
                        Purchase Price
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purchase Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {portfolio.map((stock, index) => {
                      const gainLoss = (stock.current_price - stock.purchase_price) * stock.shares;
                      const gainLossPercent = ((stock.current_price / stock.purchase_price) - 1) * 100;
                      const isProfit = gainLoss >= 0;
                      const purchaseDate = new Date(stock.purchase_date).toLocaleDateString();
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="font-medium text-gray-900">{stock.symbol}</div>
                            </div>
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
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {purchaseDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2 justify-end">
                              <button
                                onClick={() => openAddStockModal(stock)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit position"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => openConfirmDeleteModal(stock)}
                                className="text-red-600 hover:text-red-900"
                                title="Remove from portfolio"
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
      
      {/* Add/Edit Stock Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <AddStockForm
              initialSymbol={selectedStock?.symbol}
              initialShares={selectedStock?.shares}
              initialPrice={selectedStock?.purchase_price}
              initialDate={selectedStock?.purchase_date}
              initialNotes={selectedStock?.notes}
              isEdit={!!selectedStock}
              onClose={() => {
                setShowAddStockModal(false);
                setSelectedStock(null);
              }}
            />
          </div>
        </div>
      )}
      
      {/* Confirm Delete Modal */}
      {confirmDeleteModalOpen && selectedStock && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Removal</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove {selectedStock.shares} shares of {selectedStock.symbol} from your portfolio?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setConfirmDeleteModalOpen(false);
                  setSelectedStock(null);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveFromPortfolio}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;