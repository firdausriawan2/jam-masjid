'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { 
  PlusIcon, 
  ChartBarIcon, 
  CreditCardIcon, 
  DocumentChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';
import TransactionList from './TransactionList';
import TransactionForm from './TransactionForm';
import FinanceDashboard from './FinanceDashboard';
import MonthlyReport from './MonthlyReport';
import YearlyReport from './YearlyReport';
import { Transaction, FinanceData } from '@/app/types/finance';

type TabType = 'dashboard' | 'add-transaction' | 'transactions' | 'monthly-report' | 'yearly-report';

export default function FinancePageContent() {
  const [financeData, setFinanceData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Fetch data dari API
  const fetchFinanceData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/finance');
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data keuangan');
      }
      
      const data = await response.json();
      setFinanceData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching finance data:', err);
      setError('Terjadi kesalahan saat mengambil data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch data saat komponen dimount
  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);
  
  // Fungsi untuk add transaction
  const handleAddTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/finance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menambahkan transaksi');
      }
      
      // Refresh data
      fetchFinanceData();
      
      return { success: true };
    } catch (err: unknown) {
      console.error('Error adding transaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui';
      return { success: false, error: errorMessage };
    }
  };
  
  // Fungsi untuk delete transaction
  const handleDeleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/finance?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menghapus transaksi');
      }
      
      // Refresh data
      fetchFinanceData();
      
      return { success: true };
    } catch (err: unknown) {
      console.error('Error deleting transaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui';
      return { success: false, error: errorMessage };
    }
  };
  
  // Fungsi untuk update transaction
  const handleUpdateTransaction = async (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const response = await fetch('/api/finance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mengupdate transaksi');
      }
      
      // Refresh data
      fetchFinanceData();
      
      return { success: true };
    } catch (err: unknown) {
      console.error('Error updating transaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui';
      return { success: false, error: errorMessage };
    }
  };

  const navigationItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: ChartBarIcon,
      description: 'Ringkasan keuangan',
    },
    {
      id: 'add-transaction',
      name: 'Tambah Transaksi',
      icon: PlusIcon,
      description: 'Input transaksi baru',
    },
    {
      id: 'transactions',
      name: 'Daftar Transaksi',
      icon: CreditCardIcon,
      description: 'Kelola semua transaksi',
    },
    {
      id: 'monthly-report',
      name: 'Laporan Bulanan',
      icon: CalendarIcon,
      description: 'Analisis per bulan',
    },
    {
      id: 'yearly-report',
      name: 'Laporan Tahunan',
      icon: DocumentChartBarIcon,
      description: 'Analisis per tahun',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data keuangan...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Terjadi Kesalahan</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchFinanceData}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="ml-2 lg:ml-0">
                <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600 mr-2" />
                  Manajemen Kas Masjid
                </h1>
              </div>
            </div>
            
            {financeData && (
              <div className="hidden sm:block">
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                  <div className="text-sm text-green-800 font-medium">
                    Saldo Kas: Rp {financeData.currentBalance.toLocaleString('id-ID')}
                  </div>
                  <div className="text-xs text-green-600">
                    Terakhir diperbarui: {format(new Date(financeData.lastUpdated), 'dd MMM yyyy, HH:mm')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out lg:static absolute inset-y-0 left-0 z-40 w-64 bg-white shadow-lg lg:shadow-none border-r border-gray-200`}>
          <div className="h-full flex flex-col">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as TabType);
                        setSidebarOpen(false);
                      }}
                      className={`${
                        activeTab === item.id
                          ? 'bg-green-100 border-green-500 text-green-700'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } w-full group border-l-4 py-3 px-3 flex items-start text-left transition-colors duration-200`}
                    >
                      <Icon
                        className={`${
                          activeTab === item.id ? 'text-green-500' : 'text-gray-400'
                        } mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200`}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs mt-1 opacity-75">{item.description}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Overlay untuk mobile */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 z-30 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Mobile balance display */}
                {financeData && (
                  <div className="sm:hidden mb-6">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                      <div className="text-lg font-semibold">
                        Rp {financeData.currentBalance.toLocaleString('id-ID')}
                      </div>
                      <div className="text-sm opacity-90">
                        Saldo Kas • {format(new Date(financeData.lastUpdated), 'dd MMM yyyy')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Content Area */}
                <div className="transition-all duration-300 ease-in-out">
                  {activeTab === 'dashboard' && financeData && (
                    <FinanceDashboard 
                      transactions={financeData.transactions}
                      currentBalance={financeData.currentBalance}
                    />
                  )}

                  {activeTab === 'add-transaction' && (
                    <div className="max-w-2xl">
                      <TransactionForm 
                        onSubmit={handleAddTransaction} 
                        onCancel={() => setActiveTab('dashboard')} 
                      />
                    </div>
                  )}

                  {activeTab === 'transactions' && financeData && (
                    <TransactionList 
                      transactions={financeData.transactions}
                      onDelete={handleDeleteTransaction}
                      onUpdate={handleUpdateTransaction}
                    />
                  )}

                  {activeTab === 'monthly-report' && (
                    <MonthlyReport />
                  )}

                  {activeTab === 'yearly-report' && (
                    <YearlyReport />
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 