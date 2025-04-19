'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AdminPageContent = dynamic(() => import('../components/AdminPageContent'), {
  ssr: false,
});

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F7F9]">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  );
}