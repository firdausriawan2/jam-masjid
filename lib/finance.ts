import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction, FinanceData, TransactionType, IncomeCategory, ExpenseCategory } from '@/app/types/finance';

// Path ke file JSON
const dataFilePath = path.join(process.cwd(), 'public', 'data', 'finance.json');

// Fungsi untuk membaca data keuangan dari file JSON
export async function getFinanceData(): Promise<FinanceData> {
  try {
    // Cek apakah file ada
    if (!fs.existsSync(dataFilePath)) {
      // Jika file tidak ada, buat file baru dengan data kosong
      const initialData: FinanceData = {
        transactions: [],
        currentBalance: 0,
        lastUpdated: new Date().toISOString()
      };
      
      // Pastikan direktori ada
      const dir = path.dirname(dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    
    const fileData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(fileData) as FinanceData;
  } catch (error) {
    console.error('Error reading finance data:', error);
    return {
      transactions: [],
      currentBalance: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

// Fungsi untuk menyimpan data keuangan ke file JSON
export async function saveFinanceData(data: FinanceData): Promise<void> {
  try {
    // Pastikan direktori ada
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Update lastUpdated
    data.lastUpdated = new Date().toISOString();
    
    // Tulis ke file
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving finance data:', error);
    throw new Error('Gagal menyimpan data keuangan');
  }
}

// Fungsi untuk menambahkan transaksi baru
export async function addTransaction(
  type: TransactionType,
  category: string,
  amount: number,
  description: string,
  date: string,
  proofUrl?: string
): Promise<Transaction> {
  const data = await getFinanceData();
  
  const newTransaction: Transaction = {
    id: uuidv4(),
    date,
    type,
    category: category as (IncomeCategory | ExpenseCategory),
    amount,
    description,
    proofUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Update saldo
  if (type === 'income') {
    data.currentBalance += amount;
  } else {
    data.currentBalance -= amount;
  }
  
  // Tambah transaksi baru di awal array (untuk menampilkan yang terbaru)
  data.transactions.unshift(newTransaction);
  
  // Simpan data
  await saveFinanceData(data);
  
  return newTransaction;
}

// Fungsi untuk mengambil transaksi berdasarkan ID
export async function getTransactionById(id: string): Promise<Transaction | null> {
  const data = await getFinanceData();
  const transaction = data.transactions.find(t => t.id === id);
  return transaction || null;
}

// Fungsi untuk mengupdate transaksi
export async function updateTransaction(
  id: string,
  updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>
): Promise<Transaction | null> {
  const data = await getFinanceData();
  const transactionIndex = data.transactions.findIndex(t => t.id === id);
  
  if (transactionIndex === -1) {
    return null;
  }
  
  const oldTransaction = data.transactions[transactionIndex];
  
  // Jika amount berubah, update saldo
  if (updates.amount !== undefined && updates.amount !== oldTransaction.amount) {
    if (oldTransaction.type === 'income') {
      data.currentBalance = data.currentBalance - oldTransaction.amount + (updates.amount || 0);
    } else {
      data.currentBalance = data.currentBalance + oldTransaction.amount - (updates.amount || 0);
    }
  }
  
  // Jika tipe transaksi berubah, update saldo
  if (updates.type !== undefined && updates.type !== oldTransaction.type) {
    if (oldTransaction.type === 'income' && updates.type === 'expense') {
      data.currentBalance -= (updates.amount || oldTransaction.amount) * 2;
    } else if (oldTransaction.type === 'expense' && updates.type === 'income') {
      data.currentBalance += (updates.amount || oldTransaction.amount) * 2;
    }
  }
  
  // Update transaksi
  data.transactions[transactionIndex] = {
    ...oldTransaction,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  // Simpan data
  await saveFinanceData(data);
  
  return data.transactions[transactionIndex];
}

// Fungsi untuk menghapus transaksi
export async function deleteTransaction(id: string): Promise<boolean> {
  const data = await getFinanceData();
  const transactionIndex = data.transactions.findIndex(t => t.id === id);
  
  if (transactionIndex === -1) {
    return false;
  }
  
  const transaction = data.transactions[transactionIndex];
  
  // Update saldo
  if (transaction.type === 'income') {
    data.currentBalance -= transaction.amount;
  } else {
    data.currentBalance += transaction.amount;
  }
  
  // Hapus transaksi
  data.transactions.splice(transactionIndex, 1);
  
  // Simpan data
  await saveFinanceData(data);
  
  return true;
}

// Fungsi untuk mendapatkan laporan bulanan
export async function getMonthlyReport(year: number, month: number): Promise<{
  income: number;
  expense: number;
  balance: number;
  transactions: Transaction[];
}> {
  const data = await getFinanceData();
  
  // Filter transaksi berdasarkan bulan dan tahun
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const transactions = data.transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
  
  // Hitung total pendapatan dan pengeluaran
  let income = 0;
  let expense = 0;
  
  transactions.forEach(t => {
    if (t.type === 'income') {
      income += t.amount;
    } else {
      expense += t.amount;
    }
  });
  
  return {
    income,
    expense,
    balance: income - expense,
    transactions
  };
}

// Fungsi untuk mendapatkan statistik tahunan
export async function getYearlyReport(year: number): Promise<{
  monthlyData: Array<{
    month: number;
    income: number;
    expense: number;
    balance: number;
  }>;
  totalIncome: number;
  totalExpense: number;
  yearBalance: number;
}> {
  let totalIncome = 0;
  let totalExpense = 0;
  
  const monthlyData = await Promise.all(
    Array.from({ length: 12 }, async (_, i) => {
      const monthReport = await getMonthlyReport(year, i + 1);
      totalIncome += monthReport.income;
      totalExpense += monthReport.expense;
      
      return {
        month: i + 1,
        income: monthReport.income,
        expense: monthReport.expense,
        balance: monthReport.balance
      };
    })
  );
  
  return {
    monthlyData,
    totalIncome,
    totalExpense,
    yearBalance: totalIncome - totalExpense
  };
} 