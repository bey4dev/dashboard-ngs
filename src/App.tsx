import { useState, useEffect, useMemo } from 'react';
import type { DebtData, SalesData, TransactionData, SoldItemData, CategorySalesData } from './services/googleSheets';
import { fetchDebtData, fetchSalesData, fetchTransactionData, fetchSoldItemsData, fetchCategorySalesData, filterSalesByDate, filterDebtsByStatus, filterTransactionsByDate, filterSoldItemsByDate, getSoldItemsSummary } from './services/googleSheets';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import DashboardCharts from './components/DashboardCharts';
import DebtTable from './components/DebtTable';
import SalesTable from './components/SalesTable';
import TransactionTable from './components/TransactionTable';
import FilterComponent from './components/FilterComponent';
import LoginPage from './components/LoginPage';
import AuthCallback from './components/AuthCallback';
import ErrorBoundary from './components/ErrorBoundary';
import type { DateFilter, DebtStatusFilter } from './components/FilterComponent';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppRouter() {
  const { theme } = useTheme();
  
  // Check for auth callback and process it
  if (window.location.pathname === '/auth/callback') {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <AuthCallback />
      </div>
    );
  }

  // Clear any auth callback related parameters from URL if we're not on callback page
  if (window.location.search.includes('code=') || window.location.search.includes('error=')) {
    // Clean up URL without triggering a page reload
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const { theme } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Modern loading component
  const ModernLoadingScreen = () => (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative text-center">
          {/* Modern loader */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Outer ring */}
              <div className="w-24 h-24 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-pulse"></div>
              
              {/* Middle ring */}
              <div className="absolute top-2 left-2 w-20 h-20 border-4 border-blue-400 dark:border-blue-600 rounded-full animate-spin border-t-transparent"></div>
              
              {/* Inner ring */}
              <div className="absolute top-4 left-4 w-16 h-16 border-4 border-blue-600 dark:border-blue-400 rounded-full animate-spin border-t-transparent border-r-transparent" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
              
              {/* Center */}
              <div className="absolute top-8 left-8 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-float"></div>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Dashboard Nogogini
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Memuat aplikasi...
          </p>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Always call hooks in the same order
  if (authLoading) {
    return <ModernLoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <LoginPage />
      </div>
    );
  }

  return <DashboardContent />;
}

function DashboardContent() {
  const { theme } = useTheme();
  
  // State declarations - always call these hooks
  const [debts, setDebts] = useState<DebtData[]>([]);
  const [sales, setSales] = useState<SalesData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [soldItems, setSoldItems] = useState<SoldItemData[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'debts'>('dashboard');
  
  // Filter states
  const [selectedDateFilter, setSelectedDateFilter] = useState<DateFilter['value']>('week');
  const [selectedDebtFilter, setSelectedDebtFilter] = useState<DebtStatusFilter['value']>('pending');

  // Filtered data using useMemo for performance
  const filteredSales = useMemo(() => {
    return filterSalesByDate(sales, selectedDateFilter);
  }, [sales, selectedDateFilter]);

  const filteredDebts = useMemo(() => {
    return filterDebtsByStatus(debts, selectedDebtFilter);
  }, [debts, selectedDebtFilter]);

  const filteredTransactions = useMemo(() => {
    return filterTransactionsByDate(transactions, selectedDateFilter);
  }, [transactions, selectedDateFilter]);

  const filteredSoldItems = useMemo(() => {
    return filterSoldItemsByDate(soldItems, selectedDateFilter);
  }, [soldItems, selectedDateFilter]);

  // Summary data with memoization
  const soldItemsSummary = useMemo(() => {
    return getSoldItemsSummary(filteredSoldItems);
  }, [filteredSoldItems]);

  // Fetch category sales data with date filter when filter changes
  useEffect(() => {
    const fetchFilteredCategorySales = async () => {
      try {
        const filteredCategorySalesData = await fetchCategorySalesData(selectedDateFilter);
        setCategorySales(filteredCategorySalesData);
      } catch (error) {
        console.error('Failed to fetch filtered category sales data:', error);
      }
    };

    // Only fetch if we have initial data loaded
    if (!isLoading) {
      fetchFilteredCategorySales();
    }
  }, [selectedDateFilter, isLoading]);

  // All data fetching function
  const fetchAllData = async () => {
    setIsLoading(true);
    
    try {
      const [debtResult, salesResult, transactionResult, soldItemsResult, categorySalesResult] = await Promise.allSettled([
        fetchDebtData(),
        fetchSalesData(),
        fetchTransactionData(),
        fetchSoldItemsData(),
        fetchCategorySalesData()
      ]);

      // Handle debt data
      if (debtResult.status === 'fulfilled') {
        setDebts(debtResult.value);
      } else {
        console.error('Failed to fetch debt data:', debtResult.reason);
        setDebts([]);
      }

      // Handle sales data
      if (salesResult.status === 'fulfilled') {
        setSales(salesResult.value);
      } else {
        console.error('Failed to fetch sales data:', salesResult.reason);
        setSales([]);
      }

      // Handle transaction data
      if (transactionResult.status === 'fulfilled') {
        setTransactions(transactionResult.value);
      } else {
        console.error('Failed to fetch transaction data:', transactionResult.reason);
        setTransactions([]);
      }

      // Handle sold items data
      if (soldItemsResult.status === 'fulfilled') {
        setSoldItems(soldItemsResult.value);
      } else {
        console.error('Failed to fetch sold items data:', soldItemsResult.reason);
        setSoldItems([]);
      }

      // Handle category sales data
      if (categorySalesResult.status === 'fulfilled') {
        setCategorySales(categorySalesResult.value);
      } else {
        console.error('Failed to fetch category sales data:', categorySalesResult.reason);
        setCategorySales([]);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Unexpected error during data fetching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <Header 
          onRefresh={fetchAllData} 
          isLoading={isLoading} 
          lastUpdated={lastUpdated}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('debts')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'debts'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  Data Hutang
                </button>
              </nav>
            </div>
          </div>

          {activeTab === 'dashboard' ? (
            <>
              {/* Filter Component */}
              <div className="mb-8">
                <FilterComponent
                  selectedDateFilter={selectedDateFilter}
                  onDateFilterChange={setSelectedDateFilter}
                  selectedDebtFilter={selectedDebtFilter}
                  onDebtFilterChange={setSelectedDebtFilter}
                  hideDebtFilter={true}
                  hideDateFilter={false}
                />
              </div>

              {/* Dashboard Charts */}
              <div className="mb-8">
                <DashboardCharts
                  sales={filteredSales}
                  categorySalesData={categorySales}
                  isLoading={isLoading}
                />
              </div>

              {/* Data Tables */}
              <div className="space-y-8">
                <TransactionTable 
                  transactions={filteredTransactions} 
                  isLoading={isLoading} 
                />
                <SalesTable 
                  sales={filteredSales} 
                  isLoading={isLoading} 
                />
              </div>
            </>
          ) : (
            <>
              {/* Debt Filter Component */}
              <div className="mb-8">
                <FilterComponent
                  selectedDateFilter={selectedDateFilter}
                  onDateFilterChange={setSelectedDateFilter}
                  selectedDebtFilter={selectedDebtFilter}
                  onDebtFilterChange={setSelectedDebtFilter}
                  hideDebtFilter={false}
                  hideDateFilter={true}
                />
              </div>

              {/* Debt Summary Cards */}
              <div className="mb-8">
                <SummaryCards
                  debts={filteredDebts}
                  sales={filteredSales}
                  soldItemsSummary={soldItemsSummary}
                  categorySalesData={categorySales}
                  isLoading={isLoading}
                  hideDebtSummary={false}
                  showOnlyDebtSummary={true}
                />
              </div>

              {/* Debt Table */}
              <DebtTable 
                debts={filteredDebts} 
                isLoading={isLoading} 
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
