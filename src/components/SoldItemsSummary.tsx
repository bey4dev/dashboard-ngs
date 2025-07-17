import React from 'react';
import { Package, TrendingUp, BarChart3, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../services/googleSheets';

interface SoldItemsSummaryProps {
  summary: {
    totalQuantitySold: number;
    totalRevenue: number;
    totalItems: number;
    averageQuantityPerItem: number;
    averageRevenuePerItem: number;
    salesByCategory: Record<string, { totalQuantity: number; totalRevenue: number; itemCount: number }>;
    topSellingItems: any[];
    topRevenueItems: any[];
  };
  isLoading: boolean;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
  isLoading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <div className="animate-pulse">
          <div className="flex items-center">
            <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mr-4`}>
              <div className="w-6 h-6 bg-white/20 rounded"></div>
            </div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
      <div className="flex items-center">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mr-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default function SoldItemsSummary({ summary, isLoading }: SoldItemsSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <StatCard
            key={i}
            title=""
            value=""
            icon={Package}
            color="bg-gray-500"
            isLoading={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Terjual"
          value={`${summary.totalQuantitySold} pcs`}
          icon={Package}
          color="bg-blue-500"
          isLoading={isLoading}
        />
        
        <StatCard
          title="Total Pendapatan"
          value={formatCurrency(summary.totalRevenue)}
          icon={TrendingUp}
          color="bg-green-500"
          isLoading={isLoading}
        />
        
        <StatCard
          title="Jenis Barang"
          value={summary.totalItems.toString()}
          icon={BarChart3}
          color="bg-purple-500"
          isLoading={isLoading}
        />

        <StatCard
          title="Rata-rata per Item"
          value={formatCurrency(summary.averageRevenuePerItem)}
          icon={ShoppingBag}
          color="bg-orange-500"
          isLoading={isLoading}
        />
      </div>

      {/* Category Breakdown and Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Penjualan per Kategori
          </h3>
          
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(summary.salesByCategory).map(([category, data]) => (
                <div key={category} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {category}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {data.totalQuantity} pcs • {data.itemCount} items
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(data.totalRevenue)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            Top 5 Terlaris
          </h3>
          
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {summary.topSellingItems.slice(0, 5).map((item, index) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 w-6">
                      #{index + 1}
                    </span>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-40">
                        {item.itemName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {item.quantity} pcs
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCurrency(item.totalPrice)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
