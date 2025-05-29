'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Transaction, TransactionType, IncomeCategory, ExpenseCategory } from '@/app/types/finance';
import { 
  CurrencyDollarIcon, 
  CalendarDaysIcon, 
  TagIcon, 
  DocumentTextIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

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
          // Auto clear success message after 3 seconds
          setTimeout(() => setSuccess(null), 3000);
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

  const incomeCategories = [
    { value: 'infaq', label: 'Infaq', description: 'Sumbangan sukarela' },
    { value: 'sedekah', label: 'Sedekah', description: 'Sedekah dari jamaah' },
    { value: 'zakat', label: 'Zakat', description: 'Zakat fitrah/mal' },
    { value: 'wakaf', label: 'Wakaf', description: 'Wakaf tunai/barang' },
    { value: 'lainnya', label: 'Lainnya', description: 'Pemasukan lain-lain' },
  ];

  const expenseCategories = [
    { value: 'listrik', label: 'Listrik', description: 'Tagihan listrik' },
    { value: 'air', label: 'Air', description: 'Tagihan air' },
    { value: 'kebersihan', label: 'Kebersihan', description: 'Peralatan kebersihan' },
    { value: 'perbaikan', label: 'Perbaikan', description: 'Perbaikan fasilitas' },
    { value: 'gaji_marbot', label: 'Gaji Marbot', description: 'Gaji petugas' },
    { value: 'lainnya', label: 'Lainnya', description: 'Pengeluaran lain-lain' },
  ];
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
              </h2>
              <p className="text-sm text-gray-500">
                {isEditing ? 'Perbarui informasi transaksi' : 'Masukkan detail transaksi keuangan masjid'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Alert Messages */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XMarkIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Terjadi Kesalahan</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Berhasil!</h3>
                <p className="mt-1 text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(processForm)} className="space-y-6">
          {/* Transaction Type Toggle */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-3">Jenis Transaksi</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`relative flex cursor-pointer rounded-lg border p-4 transition-all duration-200 ${
                transactionType === 'income' 
                  ? 'border-green-500 bg-green-50 ring-2 ring-green-500' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  value="income"
                  {...register('type')}
                  className="sr-only"
                />
                <div className="flex w-full items-center justify-center">
                  <div className="text-center">
                    <div className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center mb-2 ${
                      transactionType === 'income' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <svg className={`h-4 w-4 ${transactionType === 'income' ? 'text-green-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className={`text-sm font-medium ${transactionType === 'income' ? 'text-green-900' : 'text-gray-900'}`}>
                      Pemasukan
                    </div>
                    <div className={`text-xs ${transactionType === 'income' ? 'text-green-600' : 'text-gray-500'}`}>
                      Dana masuk
                    </div>
                  </div>
                </div>
              </label>

              <label className={`relative flex cursor-pointer rounded-lg border p-4 transition-all duration-200 ${
                transactionType === 'expense' 
                  ? 'border-red-500 bg-red-50 ring-2 ring-red-500' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  value="expense"
                  {...register('type')}
                  className="sr-only"
                />
                <div className="flex w-full items-center justify-center">
                  <div className="text-center">
                    <div className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center mb-2 ${
                      transactionType === 'expense' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <svg className={`h-4 w-4 ${transactionType === 'expense' ? 'text-red-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </div>
                    <div className={`text-sm font-medium ${transactionType === 'expense' ? 'text-red-900' : 'text-gray-900'}`}>
                      Pengeluaran
                    </div>
                    <div className={`text-xs ${transactionType === 'expense' ? 'text-red-600' : 'text-gray-500'}`}>
                      Dana keluar
                    </div>
                  </div>
                </div>
              </label>
            </div>
            {errors.type && (
              <p className="mt-2 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Date and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <CalendarDaysIcon className="w-4 h-4 mr-2 text-gray-500" />
                Tanggal
              </label>
              <input
                type="date"
                id="date"
                {...register('date')}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm p-3"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="amount" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <CurrencyDollarIcon className="w-4 h-4 mr-2 text-gray-500" />
                Jumlah (Rp)
              </label>
              <input
                type="number"
                id="amount"
                {...register('amount')}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm p-3"
                placeholder="0"
                min="0"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <TagIcon className="w-4 h-4 mr-2 text-gray-500" />
              Kategori
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(transactionType === 'income' ? incomeCategories : expenseCategories).map((category) => (
                <label
                  key={category.value}
                  className={`relative flex cursor-pointer rounded-lg border p-3 transition-all duration-200 ${
                    watch('category') === category.value
                      ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={category.value}
                    {...register('category')}
                    className="sr-only"
                  />
                  <div className="flex flex-col flex-1">
                    <div className={`text-sm font-medium ${
                      watch('category') === category.value ? 'text-green-900' : 'text-gray-900'
                    }`}>
                      {category.label}
                    </div>
                    <div className={`text-xs ${
                      watch('category') === category.value ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {category.description}
                    </div>
                  </div>
                  {watch('category') === category.value && (
                    <div className="flex-shrink-0">
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </label>
              ))}
            </div>
            {errors.category && (
              <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-500" />
              Deskripsi
            </label>
            <textarea
              id="description"
              rows={3}
              {...register('description')}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm p-3"
              placeholder="Masukkan deskripsi detail transaksi..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="order-2 sm:order-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="order-1 sm:order-2 flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Memperbarui...' : 'Menyimpan...'}
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4 mr-2" />
                  {isEditing ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 