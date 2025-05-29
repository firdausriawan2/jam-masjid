'use client';

import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Transaction } from '@/app/types/finance';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  BanknotesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

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
  
  const balanceChangePercentage = calculateChangePercentage(
    currentMonthStats.balance,
    previousMonthStats.balance
  );
  
  // Format persentase
  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };
  
  const StatCard = ({ 
    title, 
    value, 
    change, 
    changeText, 
    icon: Icon, 
    positive = true,
    bgColor = 'bg-white',
    iconColor = 'text-gray-600',
    iconBg = 'bg-gray-100'
  }: {
    title: string;
    value: string;
    change?: number;
    changeText?: string;
    icon: React.ComponentType<{ className?: string }>;
    positive?: boolean;
    bgColor?: string;
    iconColor?: string;
    iconBg?: string;
  }) => (
    <div className={`${bgColor} rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`${iconBg} rounded-lg p-2`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {change !== undefined && (
          <div className="text-right">
            <div className={`flex items-center ${positive ? 'text-green-600' : 'text-red-600'}`}>
              {positive ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">{formatPercentage(change)}</span>
            </div>
            {changeText && (
              <p className="text-xs text-gray-500 mt-1">{changeText}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Keuangan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Saldo Kas"
            value={`Rp ${currentBalance.toLocaleString('id-ID')}`}
            icon={BanknotesIcon}
            bgColor="bg-gradient-to-r from-green-50 to-emerald-50"
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />
          
          <StatCard
            title="Pemasukan Bulan Ini"
            value={`Rp ${currentMonthStats.income.toLocaleString('id-ID')}`}
            change={incomeChangePercentage}
            changeText="dari bulan lalu"
            icon={ArrowUpIcon}
            positive={incomeChangePercentage >= 0}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />
          
          <StatCard
            title="Pengeluaran Bulan Ini"
            value={`Rp ${currentMonthStats.expense.toLocaleString('id-ID')}`}
            change={expenseChangePercentage}
            changeText="dari bulan lalu"
            icon={ArrowDownIcon}
            positive={expenseChangePercentage <= 0}
            iconColor="text-red-600"
            iconBg="bg-red-100"
          />
          
          <StatCard
            title="Saldo Bulan Ini"
            value={`Rp ${currentMonthStats.balance.toLocaleString('id-ID')}`}
            change={balanceChangePercentage}
            changeText="dari bulan lalu"
            icon={ChartBarIcon}
            positive={balanceChangePercentage >= 0}
            iconColor={currentMonthStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}
            iconBg={currentMonthStats.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-gray-600" />
            Transaksi Terbaru
          </h3>
          <span className="text-sm text-gray-500">{recentTransactions.length} transaksi</span>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BanknotesIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">Belum ada transaksi.</p>
            <p className="text-gray-400 text-xs mt-1">Transaksi akan muncul di sini setelah Anda menambahkannya.</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="divide-y divide-gray-100">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="py-4 flex items-center justify-between hover:bg-gray-50 rounded-lg px-2 transition-colors duration-150">
                  <div className="flex items-center space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' 
                        ? 'bg-green-100' 
                        : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowDownIcon className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {format(new Date(transaction.date), 'dd MMM yyyy')}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 capitalize">
                          {transaction.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}Rp {transaction.amount.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Overview */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ringkasan {format(now, 'MMMM yyyy')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Pemasukan</p>
                <p className="text-xl font-bold text-green-900">
                  Rp {currentMonthStats.income.toLocaleString('id-ID')}
                </p>
              </div>
              <ArrowUpIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Pengeluaran</p>
                <p className="text-xl font-bold text-red-900">
                  Rp {currentMonthStats.expense.toLocaleString('id-ID')}
                </p>
              </div>
              <ArrowDownIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className={`${currentMonthStats.balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${currentMonthStats.balance >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                  Saldo Bersih
                </p>
                <p className={`text-xl font-bold ${currentMonthStats.balance >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                  Rp {currentMonthStats.balance.toLocaleString('id-ID')}
                </p>
              </div>
              <ChartBarIcon className={`h-8 w-8 ${currentMonthStats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {(totalIncome > 0 || totalExpense > 0) && (
          <div>
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Proporsi Keuangan Total</span>
              <span>{totalTransactions} transaksi</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full relative"
                style={{ width: `${(totalIncome / (totalIncome + totalExpense)) * 100}%` }}
              >
                {(totalIncome / (totalIncome + totalExpense)) * 100 > 15 && (
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                    {Math.round((totalIncome / (totalIncome + totalExpense)) * 100)}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Pemasukan: Rp {totalIncome.toLocaleString('id-ID')}
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                Pengeluaran: Rp {totalExpense.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 