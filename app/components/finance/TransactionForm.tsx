'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Transaction, TransactionType, IncomeCategory, ExpenseCategory } from '@/app/types/finance';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Kategori harus diisi'),
  amount: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  description: z.string().min(1, 'Deskripsi harus diisi'),
  date: z.string().min(1, 'Tanggal harus diisi'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
  initialData?: Partial<Transaction>;
  isEditing?: boolean;
  onCancel: () => void;
}

export default function TransactionForm({ onSubmit, initialData = {}, isEditing = false, onCancel }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: (initialData.type as TransactionType) || 'income',
      category: initialData.category || '',
      amount: initialData.amount || 0,
      description: initialData.description || '',
      date: initialData.date || new Date().toISOString().split('T')[0],
    },
  });
  
  const transactionType = watch('type');
  
  const processForm = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await onSubmit({
        ...data,
        category: data.category as (IncomeCategory | ExpenseCategory),
        proofUrl: initialData.proofUrl,
      });
      
      if (result.success) {
        setSuccess(isEditing ? 'Transaksi berhasil diperbarui!' : 'Transaksi berhasil ditambahkan!');
        if (!isEditing) {
          reset();
        }
      } else {
        setError(result.error || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{isEditing ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}</h2>
        
        {error && (
          <div className="mb-4 p-2 sm:p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-2 sm:p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit(processForm)} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={watch('date')}
                onChange={(e) => {
                  register('date').onChange(e);
                }}
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.date && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Jenis
              </label>
              <select
                id="type"
                name="type"
                required
                value={watch('type')}
                onChange={(e) => {
                  register('type').onChange(e);
                }}
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <input
              type="text"
              id="description"
              name="description"
              required
              value={watch('description')}
              onChange={(e) => {
                register('description').onChange(e);
              }}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Deskripsi transaksi"
            />
            {errors.description && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah (Rp)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                required
                value={watch('amount')}
                onChange={(e) => {
                  register('amount').onChange(e);
                }}
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
              {errors.amount && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              {transactionType === 'income' ? (
                <select
                  id="category"
                  name="category"
                  required
                  value={watch('category')}
                  onChange={(e) => {
                    register('category').onChange(e);
                  }}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Kategori --</option>
                  <option value="infaq">Infaq</option>
                  <option value="sedekah">Sedekah</option>
                  <option value="zakat">Zakat</option>
                  <option value="wakaf">Wakaf</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              ) : (
                <select
                  id="category"
                  name="category"
                  required
                  value={watch('category')}
                  onChange={(e) => {
                    register('category').onChange(e);
                  }}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Kategori --</option>
                  <option value="listrik">Listrik</option>
                  <option value="air">Air</option>
                  <option value="kebersihan">Kebersihan</option>
                  <option value="perbaikan">Perbaikan</option>
                  <option value="gaji_marbot">Gaji Marbot</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              )}
              {errors.category && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-6">
            {isEditing ? (
              <button
                type="button"
                onClick={() => reset()}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Batal
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className={`bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-xs sm:text-sm">Menyimpan...</span>
                </span>
              ) : (
                isEditing ? 'Perbarui Transaksi' : 'Tambah Transaksi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 