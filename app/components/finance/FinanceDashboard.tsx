'use client';

import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Transaction } from '@/app/types/finance';

interface FinanceDashboardProps {
  transactions: Transaction[];
  currentBalance: number;
}

export default function FinanceDashboard({ transactions, currentBalance }: FinanceDashboardProps) {
  // Hitung jumlah transaksi
  const totalTransactions = transactions.length;
  
  // Hitung total pemasukan dan pengeluaran
  const { totalIncome, totalExpense } = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.totalIncome += transaction.amount;
        } else {
          acc.totalExpense += transaction.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );
  }, [transactions]);
  
  // Hitung transaksi bulan ini
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);
  
  const currentMonthStats = useMemo(() => {
    const monthlyTransactions = transactions.filter(
      (t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startOfCurrentMonth && transactionDate <= endOfCurrentMonth;
      }
    );
    
    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    return {
      transactions: monthlyTransactions,
      income,
      expense,
      balance: income - expense
    };
  }, [transactions, startOfCurrentMonth, endOfCurrentMonth]);
  
  // Hitung transaksi bulan sebelumnya (untuk perbandingan)
  const startOfPrevMonth = startOfMonth(subMonths(now, 1));
  const endOfPrevMonth = endOfMonth(subMonths(now, 1));
  
  const previousMonthStats = useMemo(() => {
    const monthlyTransactions = transactions.filter(
      (t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startOfPrevMonth && transactionDate <= endOfPrevMonth;
      }
    );
    
    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [transactions, startOfPrevMonth, endOfPrevMonth]);
  
  // Transaksi terbaru (5 transaksi terakhir)
  const recentTransactions = transactions.slice(0, 5);
  
  // Hitung persentase perubahan dari bulan sebelumnya
  const calculateChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  
  const incomeChangePercentage = calculateChangePercentage(
    currentMonthStats.income,
    previousMonthStats.income
  );
  
  const expenseChangePercentage = calculateChangePercentage(
    currentMonthStats.expense,
    previousMonthStats.expense
  );
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Saldo Kas</h3>
          <p className="text-2xl font-bold text-gray-900">Rp {currentBalance.toLocaleString('id-ID')}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pemasukan Bulan Ini</h3>
          <p className="text-2xl font-bold text-green-600">Rp {currentMonthStats.income.toLocaleString('id-ID')}</p>
          <div className="flex items-center mt-1 text-xs">
            <span className={`flex items-center ${incomeChangePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {incomeChangePercentage >= 0 ? (
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {Math.abs(incomeChangePercentage).toFixed(1)}% dari bulan lalu
            </span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pengeluaran Bulan Ini</h3>
          <p className="text-2xl font-bold text-red-600">Rp {currentMonthStats.expense.toLocaleString('id-ID')}</p>
          <div className="flex items-center mt-1 text-xs">
            <span className={`flex items-center ${expenseChangePercentage <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {expenseChangePercentage <= 0 ? (
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              ) : (
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {Math.abs(expenseChangePercentage).toFixed(1)}% dari bulan lalu
            </span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Transaksi</h3>
          <p className="text-2xl font-bold text-blue-600">{totalTransactions}</p>
          <p className="text-xs text-gray-500 mt-1">
            {currentMonthStats.transactions.length} transaksi bulan ini
          </p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Transaksi Terbaru</h3>
        
        {recentTransactions.length === 0 ? (
          <p className="text-gray-500">Belum ada transaksi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
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
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-right">
                      <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'income' ? '+' : '-'} Rp {transaction.amount.toLocaleString('id-ID')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Statistik Bulan {format(now, 'MMMM yyyy')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Pemasukan</h4>
            <p className="text-xl font-bold text-green-600">Rp {currentMonthStats.income.toLocaleString('id-ID')}</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Pengeluaran</h4>
            <p className="text-xl font-bold text-red-600">Rp {currentMonthStats.expense.toLocaleString('id-ID')}</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Saldo Bulan Ini</h4>
            <p className={`text-xl font-bold ${currentMonthStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Rp {currentMonthStats.balance.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 