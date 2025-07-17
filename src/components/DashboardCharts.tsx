import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag,
  Package,
  BarChart3,
  PieChart,
  Activity,
  Store,
  Gamepad2,
  Monitor
} from 'lucide-react';
import type { SalesData, CategorySalesData } from '../services/googleSheets';
import { formatCurrency, getSalesSummary } from '../services/googleSheets';

interface DashboardChartsProps {
  sales: SalesData[];
  categorySalesData: CategorySalesData[];
  isLoading: boolean;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ 
  sales, 
  categorySalesData, 
  isLoading 
}) => {
  const salesSummary = getSalesSummary(sales);

  // Calculate metrics
  const totalSalesRevenue = salesSummary.totalRevenue;
  const totalPurchase = salesSummary.totalPurchase;
  const totalProfit = salesSummary.totalProfit;
  const totalTransactions = salesSummary.totalTransactions;
  const profitMargin = totalPurchase > 0 ? (totalProfit / totalPurchase) * 100 : 0;

  // Platform data for charts
  const platformData = categorySalesData.map(platform => ({
    name: platform.displayName,
    value: platform.totalRevenue,
    quantity: platform.totalQuantity,
    color: platform.categoryName.includes('lokalan') ? '#10b981' : 
           platform.categoryName.includes('itemku') ? '#3b82f6' : '#8b5cf6'
  }));

  const totalPlatformRevenue = platformData.reduce((sum, platform) => sum + platform.value, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-green-100 text-sm">+{profitMargin.toFixed(1)}%</span>
            </div>
            <h3 className="text-lg font-medium text-green-100 mb-1">Total Penjualan Emas</h3>
            <p className="text-2xl font-bold">{formatCurrency(totalSalesRevenue)}</p>
          </div>
        </div>

        {/* Total Purchase */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-blue-100 text-sm">{totalTransactions} tx</span>
            </div>
            <h3 className="text-lg font-medium text-blue-100 mb-1">Total Pembelian Emas</h3>
            <p className="text-2xl font-bold">{formatCurrency(totalPurchase)}</p>
          </div>
        </div>

        {/* Total Profit */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-purple-100 text-sm">{profitMargin.toFixed(1)}%</span>
            </div>
            <h3 className="text-lg font-medium text-purple-100 mb-1">Total Profit</h3>
            <p className="text-2xl font-bold">{formatCurrency(totalProfit)}</p>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-orange-100 text-sm">avg {formatCurrency(totalProfit / totalTransactions || 0)}</span>
            </div>
            <h3 className="text-lg font-medium text-orange-100 mb-1">Transaksi Emas</h3>
            <p className="text-2xl font-bold">{totalTransactions} <span className="text-lg font-normal">transaksi</span></p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Performance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Performa Platform</h3>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Revenue Distribution</span>
          </div>

          <div className="space-y-4">
            {platformData.map((platform, index) => {
              const percentage = totalPlatformRevenue > 0 ? (platform.value / totalPlatformRevenue) * 100 : 0;
              const Icon = platform.name === 'Lokalan' ? Store : 
                          platform.name === 'itemku' ? Gamepad2 : Monitor;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center`} 
                           style={{ backgroundColor: platform.color }}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">{platform.name}</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{platform.quantity} pcs</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(platform.value)}
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: platform.color 
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trading Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Trading Metrics</h3>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Performance Indicators</span>
          </div>

          <div className="space-y-6">
            {/* Profit Margin Circle */}
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${profitMargin * 2.51} 251`}
                    className="text-green-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profitMargin.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Profit Margin</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalProfit / totalTransactions || 0)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg Profit/Tx</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {(totalSalesRevenue / totalTransactions || 0).toFixed(0)}g
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg Gold/Tx</div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                <span className="font-medium text-green-600">{formatCurrency(totalSalesRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Cost</span>
                <span className="font-medium text-red-600">{formatCurrency(totalPurchase)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-white">Net Profit</span>
                  <span className="font-bold text-green-600">{formatCurrency(totalProfit)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Distribution Pie Chart (Visual) */}
      {platformData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Revenue Distribution</h3>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total: {formatCurrency(totalPlatformRevenue)}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Visual Pie Chart */}
            <div className="flex justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                  {platformData.map((platform, index) => {
                    const percentage = totalPlatformRevenue > 0 ? (platform.value / totalPlatformRevenue) * 100 : 0;
                    const previousPercentages = platformData.slice(0, index).reduce((sum, p) => 
                      sum + (totalPlatformRevenue > 0 ? (p.value / totalPlatformRevenue) * 100 : 0), 0
                    );
                    const strokeDasharray = `${percentage * 2.51} 251`;
                    const strokeDashoffset = -previousPercentages * 2.51;
                    
                    return (
                      <circle
                        key={index}
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={platform.color}
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500 ease-out"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {platformData.reduce((sum, p) => sum + p.quantity, 0)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total pcs</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-4">
              {platformData.map((platform, index) => {
                const percentage = totalPlatformRevenue > 0 ? (platform.value / totalPlatformRevenue) * 100 : 0;
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: platform.color }}
                      ></div>
                      <span className="font-medium text-gray-900 dark:text-white">{platform.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">{percentage.toFixed(1)}%</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{platform.quantity} pcs</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCharts;
