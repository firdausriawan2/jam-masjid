export type TransactionType = 'income' | 'expense';

export type IncomeCategory = 
  | 'infaq' 
  | 'sedekah' 
  | 'zakat' 
  | 'wakaf' 
  | 'lainnya';

export type ExpenseCategory = 
  | 'listrik' 
  | 'air' 
  | 'kebersihan' 
  | 'perbaikan' 
  | 'gaji_marbot' 
  | 'lainnya';

export type Transaction = {
  id: string;
  date: string; // ISO date string
  type: TransactionType;
  category: IncomeCategory | ExpenseCategory;
  amount: number;
  description: string;
  proofUrl?: string; // Optional, path to proof image
  createdAt: string;
  updatedAt: string;
};

export type FinanceData = {
  transactions: Transaction[];
  currentBalance: number;
  lastUpdated: string;
}; 