'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TransactionList from './TransactionList';
import TransactionForm from './TransactionForm';
import FinanceDashboard from './FinanceDashboard';
import MonthlyReport from './MonthlyReport';
import YearlyReport from './YearlyReport';
import { Transaction, FinanceData } from '@/app/types/finance';

export default function FinancePageContent() {
  const [financeData, setFinanceData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={fetchFinanceData}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-full overflow-hidden">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Manajemen Kas Masjid</h1>
      
      {financeData && (
        <div className="mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded-lg shadow">
          <h2 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Saldo Kas: <span className="font-bold text-green-600">Rp {financeData.currentBalance.toLocaleString('id-ID')}</span></h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Terakhir diperbarui: {format(new Date(financeData.lastUpdated), 'dd MMMM yyyy, HH:mm')}
          </p>
        </div>
      )}
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-4 sm:mb-6 w-full grid grid-cols-5 gap-1 sm:gap-2">
          <TabsTrigger value="add-transaction" className="flex flex-col items-center justify-center py-2 px-1 sm:py-3 sm:px-2 bg-blue-50 hover:bg-blue-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-[10px] sm:text-xs">Tambah</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex flex-col items-center justify-center py-2 px-1 sm:py-3 sm:px-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span className="text-[10px] sm:text-xs">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex flex-col items-center justify-center py-2 px-1 sm:py-3 sm:px-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-[10px] sm:text-xs">Transaksi</span>
          </TabsTrigger>
          <TabsTrigger value="monthly-report" className="flex flex-col items-center justify-center py-2 px-1 sm:py-3 sm:px-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-[10px] sm:text-xs">Bulanan</span>
          </TabsTrigger>
          <TabsTrigger value="yearly-report" className="flex flex-col items-center justify-center py-2 px-1 sm:py-3 sm:px-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[10px] sm:text-xs">Tahunan</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          {financeData && (
            <FinanceDashboard 
              transactions={financeData.transactions}
              currentBalance={financeData.currentBalance}
            />
          )}
        </TabsContent>
        
        <TabsContent value="transactions">
          {financeData && (
            <TransactionList 
              transactions={financeData.transactions}
              onDelete={handleDeleteTransaction}
              onUpdate={handleUpdateTransaction}
            />
          )}
        </TabsContent>
        
        <TabsContent value="monthly-report">
          <MonthlyReport />
        </TabsContent>
        
        <TabsContent value="yearly-report">
          <YearlyReport />
        </TabsContent>
        
        <TabsContent value="add-transaction">
          <TransactionForm onSubmit={handleAddTransaction} onCancel={() => {}} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 