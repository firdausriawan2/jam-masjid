import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { MosqueConfig } from '@/app/types/config';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public/data/mosque-config.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const config = JSON.parse(fileContent);
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error reading config:', error);
    return NextResponse.json(
      { error: 'Failed to read config' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const config: MosqueConfig = await request.json();
    const filePath = path.join(process.cwd(), 'public/data/mosque-config.json');
    
    await fs.writeFile(filePath, JSON.stringify(config, null, 2));
    
    return NextResponse.json({ message: 'Config updated successfully' });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
} 