import { NextResponse } from 'next/server';
import { VERSION_INFO } from '@/app/version';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      version: VERSION_INFO,
      updateAvailable: false, // Will be determined by client
      changelog: [
        {
          version: VERSION_INFO.version,
          date: VERSION_INFO.buildTime,
          changes: [
            'Improved offline capability dengan 30 hari prayer times',
            'Network status indicator untuk admin',
            'Enhanced error handling dan fallback system',
            'Auto-update system implementation'
          ]
        }
      ]
    });
  } catch (error) {
    console.error('Error getting version info:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get version info' 
      },
      { status: 500 }
    );
  }
} 