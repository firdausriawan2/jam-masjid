'use client';

import { useState, useEffect } from 'react';

interface MonthlyData {
  month: number;
  income: number;
  expense: number;
  balance: number;
}

interface YearlyReportData {
  monthlyData: MonthlyData[];
  totalIncome: number;
  totalExpense: number;
  yearBalance: number;
}

export default function YearlyReport() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<YearlyReportData | null>(null);
  
  // Ambil data laporan tahunan dari API
  const fetchYearlyReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/finance/report/yearly?year=${year}`);
      
      if (!response.ok) {
        throw new Error('Gagal mengambil laporan tahunan');
      }
      
      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error('Error fetching yearly report:', err);
      setError('Terjadi kesalahan saat mengambil data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };
  
  // Ambil laporan saat komponen dimount dan saat tahun berubah
  useEffect(() => {
    fetchYearlyReport();
  }, [year]);
  
  // Generate tahun untuk dropdown (5 tahun terakhir)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  
  // Nama bulan untuk tampilan
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  // Warna untuk grafik
  const colors = {
    income: 'rgba(34, 197, 94, 0.7)',
    expense: 'rgba(239, 68, 68, 0.7)',
    balance: 'rgba(59, 130, 246, 0.7)',
  };
  
  // Cari nilai maksimum untuk skala grafik
  const getMaxValue = () => {
    if (!report) return 0;
    
    const values = report.monthlyData.flatMap(m => [m.income, m.expense, Math.abs(m.balance)]);
    return Math.max(...values, 0);
  };
  
  const maxValue = getMaxValue();
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Laporan Tahunan</h2>
        
        <div className="mb-6">
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
            Tahun
          </label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="block w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button
              onClick={fetchYearlyReport}
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
                <p className="text-2xl font-bold text-green-600">Rp {report.totalIncome.toLocaleString('id-ID')}</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Pengeluaran</h3>
                <p className="text-2xl font-bold text-red-600">Rp {report.totalExpense.toLocaleString('id-ID')}</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Saldo Tahunan</h3>
                <p className={`text-2xl font-bold ${report.yearBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Rp {report.yearBalance.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Grafik Keuangan Tahunan {year}</h3>
              
              <div className="relative overflow-x-auto">
                <div className="min-w-[768px]">
                  <div className="flex items-center border-b pb-2 mb-2">
                    <div className="w-24 font-medium">Bulan</div>
                    <div className="flex-1 px-2">
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Pemasukan</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm">Pengeluaran</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">Saldo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {report.monthlyData.map((data) => (
                    <div key={data.month} className="flex items-center py-2 border-b">
                      <div className="w-24 text-sm font-medium">
                        {monthNames[data.month - 1]}
                      </div>
                      <div className="flex-1 px-2">
                        <div className="relative h-10">
                          {/* Pemasukan */}
                          <div
                            className="absolute top-0 left-0 h-3 bg-green-500 rounded"
                            style={{ width: `${(data.income / maxValue) * 100}%` }}
                          ></div>
                          
                          {/* Pengeluaran */}
                          <div
                            className="absolute top-3.5 left-0 h-3 bg-red-500 rounded"
                            style={{ width: `${(data.expense / maxValue) * 100}%` }}
                          ></div>
                          
                          {/* Saldo */}
                          <div
                            className="absolute top-7 left-0 h-3 bg-blue-500 rounded"
                            style={{
                              width: `${(Math.abs(data.balance) / maxValue) * 100}%`,
                              backgroundColor: data.balance >= 0 ? colors.balance : 'rgba(239, 68, 68, 0.5)',
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-52 text-right space-y-0.5">
                        <div className="text-sm text-green-600">Rp {data.income.toLocaleString('id-ID')}</div>
                        <div className="text-sm text-red-600">Rp {data.expense.toLocaleString('id-ID')}</div>
                        <div className={`text-sm ${data.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          Rp {data.balance.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Tabel Data Bulanan</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bulan
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pemasukan
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pengeluaran
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Saldo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.monthlyData.map((data) => (
                      <tr key={data.month}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {monthNames[data.month - 1]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          Rp {data.income.toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          Rp {data.expense.toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={data.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                            Rp {data.balance.toLocaleString('id-ID')}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        Total
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                        Rp {report.totalIncome.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                        Rp {report.totalExpense.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                        <span className={report.yearBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                          Rp {report.yearBalance.toLocaleString('id-ID')}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Pilih tahun untuk melihat laporan.</p>
        )}
      </div>
    </div>
  );
} 