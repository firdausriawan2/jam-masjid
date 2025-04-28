'use client';

import { useState, useEffect } from 'react';
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
  const fetchFinanceData = async () => {
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
  };
  
  // Fetch data saat komponen dimount
  useEffect(() => {
    fetchFinanceData();
  }, []);
  
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
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Manajemen Kas Masjid</h1>
      
      {financeData && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">Saldo Kas: <span className="font-bold text-green-600">Rp {financeData.currentBalance.toLocaleString('id-ID')}</span></h2>
          <p className="text-sm text-gray-500">
            Terakhir diperbarui: {format(new Date(financeData.lastUpdated), 'dd MMMM yyyy, HH:mm')}
          </p>
        </div>
      )}
      
      <Tabs defaultValue="dashboard">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transaksi</TabsTrigger>
          <TabsTrigger value="monthly-report">Laporan Bulanan</TabsTrigger>
          <TabsTrigger value="yearly-report">Laporan Tahunan</TabsTrigger>
          <TabsTrigger value="add-transaction">Tambah Transaksi</TabsTrigger>
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
          <TransactionForm onSubmit={handleAddTransaction} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 