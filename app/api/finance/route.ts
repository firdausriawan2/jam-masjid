import { NextRequest, NextResponse } from 'next/server';
import { getFinanceData, addTransaction, deleteTransaction, updateTransaction } from '@/lib/finance';
import { revalidatePath } from 'next/cache';

// GET - mendapatkan semua data keuangan
export async function GET() {
  try {
    const data = await getFinanceData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/finance:', error);
    return NextResponse.json(
      { error: 'Gagal mendapatkan data keuangan' },
      { status: 500 }
    );
  }
}

// POST - menambahkan transaksi baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, category, amount, description, date, proofUrl } = body;
    
    // Validasi input
    if (!type || !category || !amount || !description || !date) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }
    
    // Konversi amount ke angka
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: 'Jumlah harus berupa angka positif' },
        { status: 400 }
      );
    }
    
    const newTransaction = await addTransaction(
      type,
      category,
      numAmount,
      description,
      date,
      proofUrl
    );
    
    revalidatePath('/admin/finance');
    
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/finance:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan transaksi' },
      { status: 500 }
    );
  }
}

// PUT - mengupdate transaksi
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    // Validasi input
    if (!id) {
      return NextResponse.json(
        { error: 'ID transaksi harus disediakan' },
        { status: 400 }
      );
    }
    
    // Konversi amount ke angka jika ada
    if (updates.amount) {
      const numAmount = Number(updates.amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return NextResponse.json(
          { error: 'Jumlah harus berupa angka positif' },
          { status: 400 }
        );
      }
      updates.amount = numAmount;
    }
    
    const updatedTransaction = await updateTransaction(id, updates);
    
    if (!updatedTransaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }
    
    revalidatePath('/admin/finance');
    
    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Error in PUT /api/finance:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate transaksi' },
      { status: 500 }
    );
  }
}

// DELETE - menghapus transaksi
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID transaksi harus disediakan' },
        { status: 400 }
      );
    }
    
    const success = await deleteTransaction(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }
    
    revalidatePath('/admin/finance');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/finance:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus transaksi' },
      { status: 500 }
    );
  }
} 