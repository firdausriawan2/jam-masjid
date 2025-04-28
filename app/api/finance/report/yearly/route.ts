import { NextRequest, NextResponse } from 'next/server';
import { getYearlyReport } from '@/lib/finance';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    
    if (!yearParam) {
      return NextResponse.json(
        { error: 'Tahun harus disediakan' },
        { status: 400 }
      );
    }
    
    const year = parseInt(yearParam);
    
    if (isNaN(year)) {
      return NextResponse.json(
        { error: 'Tahun harus berupa angka valid' },
        { status: 400 }
      );
    }
    
    const report = await getYearlyReport(year);
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error in GET /api/finance/report/yearly:', error);
    return NextResponse.json(
      { error: 'Gagal mendapatkan laporan tahunan' },
      { status: 500 }
    );
  }
} 