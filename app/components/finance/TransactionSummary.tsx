import { useMemo } from 'react';
import { Transaction } from '@/app/types/finance';

interface TransactionSummaryProps {
  transactions: Transaction[];
}

export default function TransactionSummary({ transactions }: TransactionSummaryProps) {
  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    return { totalIncome, totalExpense, balance };
  }, [transactions]);
  
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Ringkasan Keuangan</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-green-600 mb-1">Total Pemasukan</div>
            <div className="text-lg sm:text-xl font-bold text-green-700">
              Rp {summary.totalIncome.toLocaleString('id-ID')}
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-red-600 mb-1">Total Pengeluaran</div>
            <div className="text-lg sm:text-xl font-bold text-red-700">
              Rp {summary.totalExpense.toLocaleString('id-ID')}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-blue-600 mb-1">Saldo</div>
            <div className={`text-lg sm:text-xl font-bold ${summary.balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
              Rp {summary.balance.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 