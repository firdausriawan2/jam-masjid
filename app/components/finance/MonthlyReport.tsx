'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Transaction } from '@/app/types/finance';

interface MonthlyReportData {
  income: number;
  expense: number;
  balance: number;
  transactions: Transaction[];
}

export default function MonthlyReport() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<MonthlyReportData | null>(null);
  
  // Ambil data laporan bulanan dari API
  const fetchMonthlyReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/finance/report/monthly?year=${year}&month=${month}`);
      
      if (!response.ok) {
        throw new Error('Gagal mengambil laporan bulanan');
      }
      
      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error('Error fetching monthly report:', err);
      setError('Terjadi kesalahan saat mengambil data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [year, month]);
  
  // Ambil laporan saat komponen dimount dan saat tahun/bulan berubah
  useEffect(() => {
    fetchMonthlyReport();
  }, [fetchMonthlyReport]);
  
  // Generate tahun untuk dropdown (5 tahun terakhir)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  
  // Generate bulan untuk dropdown
  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];
  
  // Group transaksi berdasarkan kategori
  const getIncomeByCategory = () => {
    if (!report) return [];
    
    const incomeTransactions = report.transactions.filter(t => t.type === 'income');
    const categories: Record<string, number> = {};
    
    incomeTransactions.forEach(transaction => {
      const categoryName = transaction.category;
      
      if (!categories[categoryName]) {
        categories[categoryName] = 0;
      }
      
      categories[categoryName] += transaction.amount;
    });
    
    return Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / report.income) * 100,
    }));
  };
  
  const getExpenseByCategory = () => {
    if (!report) return [];
    
    const expenseTransactions = report.transactions.filter(t => t.type === 'expense');
    const categories: Record<string, number> = {};
    
    expenseTransactions.forEach(transaction => {
      const categoryName = transaction.category;
      
      if (!categories[categoryName]) {
        categories[categoryName] = 0;
      }
      
      categories[categoryName] += transaction.amount;
    });
    
    return Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / report.expense) * 100,
    }));
  };
  
  const incomeByCategory = getIncomeByCategory();
  const expenseByCategory = getExpenseByCategory();
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Laporan Bulanan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Tahun
            </label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
              Bulan
            </label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button
              onClick={fetchMonthlyReport}
              className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
            >
              Coba Lagi
            </button>
          </div>
        ) : report ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Pemasukan</h3>
                <p className="text-2xl font-bold text-green-600">Rp {report.income.toLocaleString('id-ID')}</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Pengeluaran</h3>
                <p className="text-2xl font-bold text-red-600">Rp {report.expense.toLocaleString('id-ID')}</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Saldo</h3>
                <p className={`text-2xl font-bold ${report.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Rp {report.balance.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Pemasukan berdasarkan Kategori</h3>
                
                {incomeByCategory.length === 0 ? (
                  <p className="text-gray-500">Tidak ada pemasukan untuk periode ini.</p>
                ) : (
                  <div className="space-y-3">
                    {incomeByCategory.map(({ category, amount, percentage }) => (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{category.replace('_', ' ')}</span>
                          <span>Rp {amount.toLocaleString('id-ID')} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-green-600 h-2.5 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Pengeluaran berdasarkan Kategori</h3>
                
                {expenseByCategory.length === 0 ? (
                  <p className="text-gray-500">Tidak ada pengeluaran untuk periode ini.</p>
                ) : (
                  <div className="space-y-3">
                    {expenseByCategory.map(({ category, amount, percentage }) => (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{category.replace('_', ' ')}</span>
                          <span>Rp {amount.toLocaleString('id-ID')} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-red-600 h-2.5 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Daftar Transaksi</h3>
              
              {report.transactions.length === 0 ? (
                <p className="text-gray-500">Tidak ada transaksi untuk periode ini.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deskripsi
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategori
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jumlah
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipe
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(transaction.date), 'dd/MM/yyyy')}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {transaction.description}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {transaction.category.replace('_', ' ')}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                            <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                              {transaction.type === 'income' ? '+' : '-'} Rp {transaction.amount.toLocaleString('id-ID')}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.type === 'income' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Pilih tahun dan bulan untuk melihat laporan.</p>
        )}
      </div>
    </div>
  );
} 