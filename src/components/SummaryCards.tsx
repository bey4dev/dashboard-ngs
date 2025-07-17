import React from 'react';
import type { DebtData, SalesData, CategorySalesData } from '../services/googleSheets';
import { formatCurrency, getDebtSummary, getSalesSummary } from '../services/googleSheets';
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  ShoppingBag,
  User,
  Package,
  Store,
  Gamepad2,
  Monitor
} from 'lucide-react';

interface SummaryCardsProps {
  debts: DebtData[];
  sales: SalesData[];
  soldItemsSummary: {
    totalQuantitySold: number;
    totalRevenue: number;
    totalItems: number;
    averageQuantityPerItem: number;
    averageRevenuePerItem: number;
    salesByCategory: Record<string, { totalQuantity: number; totalRevenue: number; itemCount: number }>;
    topSellingItems: any[];
    topRevenueItems: any[];
  };
  categorySalesData?: CategorySalesData[];
  isLoading: boolean;
  hideDebtSummary?: boolean;
  showOnlyDebtSummary?: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ 
  debts, 
  sales, 
  soldItemsSummary, 
  categorySalesData = [], 
  isLoading, 
  hideDebtSummary = false, 
  showOnlyDebtSummary = false 
}) => {
  // Function to get icon and color for each platform
  const getPlatformIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('lokalan')) {
      return { icon: Store, color: 'bg-green-500' };
    } else if (name.includes('itemku')) {
      return { icon: Gamepad2, color: 'bg-blue-500' };
    } else if (name.includes('vcgamer')) {
      return { icon: Monitor, color: 'bg-purple-500' };
    }
    return { icon: Package, color: 'bg-gray-500' };
  };

  const debtSummary = getDebtSummary(debts);
  const salesSummary = getSalesSummary(sales);
  
  // Calculate debt status counts
  const debtStatusCounts = {
    all: debts.length,
    pending: debts.filter(debt => {
      const statusLower = debt.statusTagihan?.toLowerCase() || '';
      return debt.status === 'pending' || (!statusLower.includes('lunas') && !statusLower.includes('nitip') && !statusLower.includes('titip'));
    }).length,
    paid: debts.filter(debt => {
      const statusLower = debt.statusTagihan?.toLowerCase() || '';
      return statusLower.includes('lunas') || debt.status === 'paid';
    }).length,
    nitip: debts.filter(debt => {
      const statusLower = debt.statusTagihan?.toLowerCase() || '';
      return statusLower.includes('nitip') || statusLower.includes('titip') || debt.status === 'nitip';
    }).length
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    isLoading: cardLoading 
  }: { 
    title: string; 
    value: string; 
    icon: React.ElementType; 
    color: string;
    isLoading: boolean;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          {cardLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mt-2"></div>
            </div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  // If showing only debt summary, return special layout for debt tab
  if (showOnlyDebtSummary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Debt Statistics */}
        <StatCard
          title="Total Berhutang"
          value={formatCurrency(debtSummary.hutang)}
          icon={AlertCircle}
          color="bg-red-500"
          isLoading={isLoading}
        />
        
        <StatCard
          title="Total Nitip"
          value={formatCurrency(debtSummary.nitip)}
          icon={User}
          color="bg-blue-500"
          isLoading={isLoading}
        />

        <StatCard
          title="Sudah Lunas"
          value={formatCurrency(debtSummary.lunas)}
          icon={CheckCircle}
          color="bg-green-500"
          isLoading={isLoading}
        />
        
        <StatCard
          title="Total Keseluruhan"
          value={formatCurrency(debtSummary.total)}
          icon={CreditCard}
          color="bg-gray-600"
          isLoading={isLoading}
        />

        {/* Detailed Debt Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:col-span-2 lg:col-span-4 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
            Detail Summary Hutang Player
          </h3>
          
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  Status Berhutang
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Jumlah Player</span>
                    <span className="font-medium text-gray-900 dark:text-white">{debtStatusCounts.pending} orang</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Hutang</span>
                    <span className="font-medium text-red-600">{formatCurrency(debtSummary.hutang)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <User className="w-4 h-4 text-blue-500 mr-2" />
                  Status Nitip
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Jumlah Player</span>
                    <span className="font-medium text-gray-900 dark:text-white">{debtStatusCounts.nitip} orang</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Nitip</span>
                    <span className="font-medium text-blue-600">{formatCurrency(debtSummary.nitip)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Status Lunas
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Jumlah Player</span>
                    <span className="font-medium text-gray-900 dark:text-white">{debtStatusCounts.paid} orang</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Lunas</span>
                    <span className="font-medium text-green-600">{formatCurrency(debtSummary.lunas)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${hideDebtSummary ? 'lg:grid-cols-4' : 'lg:grid-cols-4'} gap-6 mb-8`}>
      {/* Sales Summary */}
      <StatCard
        title="Total Penjualan Emas"
        value={formatCurrency(salesSummary.totalRevenue)}
        icon={TrendingUp}
        color="bg-yellow-500"
        isLoading={isLoading}
      />
      
      <StatCard
        title="Total Pembelian Emas"
        value={formatCurrency(salesSummary.totalPurchase)}
        icon={ShoppingBag}
        color="bg-blue-500"
        isLoading={isLoading}
      />

      <StatCard
        title="Total Profit"
        value={formatCurrency(salesSummary.totalProfit)}
        icon={DollarSign}
        color="bg-green-500"
        isLoading={isLoading}
      />
      
      <StatCard
        title="Transaksi Emas"
        value={`${soldItemsSummary.totalQuantitySold} pcs`}
        icon={Package}
        color="bg-purple-500"
        isLoading={isLoading}
      />

      {/* Player Debt Summary - only show if not hidden */}
      {!hideDebtSummary && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:col-span-2 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
            Summary Hutang Player
          </h3>
          
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Sisa Hutang</span>
                </div>
                <span className="font-medium text-red-600">
                  {formatCurrency(debtSummary.hutang)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Sisa Nitip</span>
                </div>
                <span className="font-medium text-blue-600">
                  {formatCurrency(debtSummary.nitip)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Sudah Lunas</span>
                </div>
                <span className="font-medium text-green-600">
                  {formatCurrency(debtSummary.lunas)}
                </span>
              </div>
              
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Keseluruhan</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(debtSummary.total)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gold Trading Performance */}
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200 ${hideDebtSummary ? 'md:col-span-2 lg:col-span-4' : 'md:col-span-2'}`}>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-500" />
          Performa Trading Emas
        </h3>
        
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Rata-rata Profit per Transaksi</span>
              <span className="font-medium text-green-600">
                {formatCurrency(salesSummary.totalProfit / salesSummary.totalTransactions || 0)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Total Transaksi Emas</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {salesSummary.totalTransactions} transaksi
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Margin Profit</span>
              <span className="font-medium text-blue-600">
                {salesSummary.totalPurchase > 0 
                  ? ((salesSummary.totalProfit / salesSummary.totalPurchase) * 100).toFixed(2) + '%'
                  : '0%'
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Category Sales Performance */}
      {categorySalesData.length > 0 && (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200 ${hideDebtSummary ? 'md:col-span-2 lg:col-span-4' : 'md:col-span-2'}`}>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-500" />
            Performa Penjualan Platform
          </h3>
          
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {categorySalesData.map((category) => {
                const { icon: Icon, color } = getPlatformIcon(category.categoryName);
                return (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {category.displayName}
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {category.totalQuantity} pcs terjual
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(category.totalRevenue)}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {/* Total Summary */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">Total Semua Platform</span>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {categorySalesData.reduce((sum, cat) => sum + cat.totalQuantity, 0)} pcs
                    </p>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(categorySalesData.reduce((sum, cat) => sum + cat.totalRevenue, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SummaryCards;
