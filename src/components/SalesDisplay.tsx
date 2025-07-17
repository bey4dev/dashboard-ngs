import React from 'react';
import { Package, TrendingUp } from 'lucide-react';
import type { CategorySalesData } from '../services/googleSheets';

interface SalesDisplayProps {
  categorySalesData: CategorySalesData[];
  isLoading?: boolean;
}

const SalesDisplay: React.FC<SalesDisplayProps> = ({ 
  categorySalesData, 
  isLoading = false 
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!categorySalesData || categorySalesData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 text-center">
        <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Data penjualan belum tersedia
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Data Penjualan
        </h3>
      </div>

      {/* Sales Data */}
      <div className="space-y-3">
        {categorySalesData.map((item) => (
          <div 
            key={item.id}
            className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
          >
            <div className="flex items-center space-x-2">
              <span className="text-gray-900 dark:text-white font-medium">
                Penjualan {item.displayName}:
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {item.totalQuantity} pcs
              </span>
            </div>
            <div className="text-gray-900 dark:text-white font-semibold">
              {formatCurrency(item.totalRevenue)}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      {categorySalesData.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-900 dark:text-white font-semibold">
              Total Penjualan:
            </span>
            <div className="text-right">
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                {categorySalesData.reduce((sum, item) => sum + item.totalQuantity, 0)} pcs
              </div>
              <div className="text-gray-900 dark:text-white font-bold">
                {formatCurrency(categorySalesData.reduce((sum, item) => sum + item.totalRevenue, 0))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDisplay;
