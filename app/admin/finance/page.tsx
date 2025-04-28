'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const FinancePageContent = dynamic(() => import('../../components/finance/FinancePageContent'), {
  ssr: false,
});

export default function FinancePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F7F9]">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    }>
      <FinancePageContent />
    </Suspense>
  );
} 