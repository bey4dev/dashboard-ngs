import { useState } from 'react';
import { CalendarIcon, FunnelIcon } from '@heroicons/react/24/outline';

export interface DateFilter {
  label: string;
  value: 'today' | 'yesterday' | 'week' | '2weeks' | 'month' | 'year' | 'lastYear';
  days?: number;
}

export interface DebtStatusFilter {
  label: string;
  value: 'all' | 'pending' | 'paid' | 'nitip';
  color: string;
}

interface FilterComponentProps {
  // Sales filters
  selectedDateFilter: DateFilter['value'];
  onDateFilterChange: (filter: DateFilter['value']) => void;
  
  // Debt filters
  selectedDebtFilter: DebtStatusFilter['value'];
  onDebtFilterChange: (filter: DebtStatusFilter['value']) => void;
  
  // Counts for display
  debtCounts?: {
    all: number;
    pending: number;
    paid: number;
    nitip: number;
  };
  
  // Optional props to hide specific filters
  hideDebtFilter?: boolean;
  hideDateFilter?: boolean;
}

const dateFilters: DateFilter[] = [
  { label: 'Hari Ini', value: 'today', days: 0 },
  { label: 'Kemarin', value: 'yesterday', days: 1 },
  { label: 'Minggu Ini', value: 'week', days: 7 },
  { label: '2 Minggu Lalu', value: '2weeks', days: 14 },
  { label: '1 Bulan', value: 'month', days: 30 },
  { label: 'Tahun Ini', value: 'year' },
  { label: 'Tahun Kemarin', value: 'lastYear' }
];

const debtStatusFilters: DebtStatusFilter[] = [
  { label: 'Semua Status', value: 'all', color: 'gray' },
  { label: 'Berhutang', value: 'pending', color: 'red' },
  { label: 'Lunas', value: 'paid', color: 'green' },
  { label: 'Nitip', value: 'nitip', color: 'blue' }
];

const FilterComponent: React.FC<FilterComponentProps> = ({
  selectedDateFilter,
  onDateFilterChange,
  selectedDebtFilter,
  onDebtFilterChange,
  debtCounts,
  hideDebtFilter = false,
  hideDateFilter = false
}) => {
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showDebtDropdown, setShowDebtDropdown] = useState(false);

  const getStatusColor = (value: DebtStatusFilter['value']) => {
    const filter = debtStatusFilters.find(f => f.value === value);
    return filter?.color || 'gray';
  };

  const getStatusBadgeClass = (color: string) => {
    const colorMap = {
      gray: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        
        {/* Sales Date Filter */}
        {!hideDateFilter && (
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Penjualan:</span>
            
            <div className="relative">
              <button
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                {dateFilters.find(f => f.value === selectedDateFilter)?.label}
                <FunnelIcon className="h-4 w-4" />
              </button>
              
              {showDateDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 min-w-48">
                  {dateFilters.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => {
                        onDateFilterChange(filter.value);
                        setShowDateDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                        selectedDateFilter === filter.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Debt Status Filter */}
        {!hideDebtFilter && (
          <div className="flex items-center gap-3">
            <FunnelIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Hutang:</span>
            
            <div className="relative">
              <button
                onClick={() => setShowDebtDropdown(!showDebtDropdown)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                  getStatusBadgeClass(getStatusColor(selectedDebtFilter))
                }`}
              >
                {debtStatusFilters.find(f => f.value === selectedDebtFilter)?.label}
                {debtCounts && selectedDebtFilter !== 'all' && (
                  <span className="text-xs font-semibold">
                    ({debtCounts[selectedDebtFilter]})
                  </span>
                )}
                <FunnelIcon className="h-4 w-4" />
              </button>
              
              {showDebtDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 min-w-48">
                  {debtStatusFilters.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => {
                        onDebtFilterChange(filter.value);
                        setShowDebtDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors flex items-center justify-between ${
                        selectedDebtFilter === filter.value ? getStatusBadgeClass(filter.color) : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{filter.label}</span>
                      {debtCounts && (
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          {filter.value === 'all' ? debtCounts.all : debtCounts[filter.value]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Filter Info */}
      {((selectedDateFilter !== 'week' && !hideDateFilter) || (selectedDebtFilter !== 'all' && !hideDebtFilter)) && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
            {selectedDateFilter !== 'week' && !hideDateFilter && (
              <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded text-blue-800 dark:text-blue-300">
                📅 {dateFilters.find(f => f.value === selectedDateFilter)?.label}
              </span>
            )}
            {selectedDebtFilter !== 'all' && debtCounts && !hideDebtFilter && (
              <span className={`px-2 py-1 border rounded ${getStatusBadgeClass(getStatusColor(selectedDebtFilter))}`}>
                👥 {debtStatusFilters.find(f => f.value === selectedDebtFilter)?.label} ({debtCounts[selectedDebtFilter]} records)
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Click outside to close dropdowns */}
      {(showDateDropdown || showDebtDropdown) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => {
            setShowDateDropdown(false);
            setShowDebtDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default FilterComponent;
