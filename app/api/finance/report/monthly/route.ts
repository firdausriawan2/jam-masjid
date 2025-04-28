import { NextRequest, NextResponse } from 'next/server';
import { getMonthlyReport } from '@/lib/finance';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');
    
    if (!yearParam || !monthParam) {
      return NextResponse.json(
        { error: 'Tahun dan bulan harus disediakan' },
        { status: 400 }
      );
    }
    
    const year = parseInt(yearParam);
    const month = parseInt(monthParam);
    
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Tahun dan bulan harus berupa angka valid' },
        { status: 400 }
      );
    }
    
    const report = await getMonthlyReport(year, month);
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error in GET /api/finance/report/monthly:', error);
    return NextResponse.json(
      { error: 'Gagal mendapatkan laporan bulanan' },
      { status: 500 }
    );
  }
} 