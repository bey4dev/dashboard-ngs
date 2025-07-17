import React, { useState, useMemo } from 'react';
import type { SoldItemData } from '../services/googleSheets';
import { formatCurrency } from '../services/googleSheets';
import { Package, Search, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

interface SoldItemsTableProps {
  soldItems: SoldItemData[];
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 10;

// Fungsi untuk mendapatkan item pagination dengan ellipsis
const getPaginationItems = (currentPage: number, totalPages: number): (number | string)[] => {
  const delta = 2; // Jumlah halaman yang ditampilkan di sekitar halaman aktif
  const items: (number | string)[] = [];

  if (totalPages <= 7) {
    // Jika total halaman <= 7, tampilkan semua
    for (let i = 1; i <= totalPages; i++) {
      items.push(i);
    }
  } else {
    // Selalu tampilkan halaman pertama
    items.push(1);

    if (currentPage - delta > 2) {
      items.push('...');
    }

    // Tampilkan halaman di sekitar halaman aktif
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (currentPage + delta < totalPages - 1) {
      items.push('...');
    }

    // Selalu tampilkan halaman terakhir (jika tidak sama dengan halaman pertama)
    if (totalPages > 1) {
      items.push(totalPages);
    }
  }

  return items;
};

export default function SoldItemsTable({ soldItems, isLoading }: SoldItemsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter dan sorting data
  const filteredAndSortedItems = useMemo(() => {
    if (!soldItems.length) return [];
    
    let filtered = soldItems;
    
    // Filter berdasarkan search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = soldItems.filter(item =>
        item.itemName.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.customerName?.toLowerCase().includes(searchLower) ||
        formatCurrency(item.totalPrice).toLowerCase().includes(searchLower) ||
        item.notes?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort berdasarkan tanggal terbaru
    return filtered.sort((a, b) => {
      const dateA = new Date(a.saleDate);
      const dateB = new Date(b.saleDate);
      return dateB.getTime() - dateA.getTime();
    });
  }, [soldItems, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredAndSortedItems.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <Package className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
          <div>Data Barang Terjual</div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-normal">
          {filteredAndSortedItems.length} dari {soldItems.length} items
        </div>
      </h2>

      {/* Search Box */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari nama barang, kategori, customer, atau harga..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Barang & Kategori
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Qty & Harga
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total Harga
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tanggal & Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Catatan
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.itemName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.category}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {item.quantity} pcs
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    @ {formatCurrency(item.unitPrice)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(item.totalPrice)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {item.saleDate}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.customerName || 'N/A'}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 max-w-32 truncate">
                    {item.notes || '-'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredAndSortedItems.length)} dari {filteredAndSortedItems.length} data
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {getPaginationItems(currentPage, totalPages).map((page, index) => (
                page === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
      
      {filteredAndSortedItems.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Tidak ada barang yang cocok dengan pencarian' : 'Tidak ada data barang terjual'}
          </p>
        </div>
      )}
    </div>
  );
}
