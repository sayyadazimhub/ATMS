'use client';

import { Toaster } from 'react-hot-toast';
import AdminHeader from '@/components/AdminHeader';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Toaster position="top-right" />
      <AdminHeader />
      <main className="flex-1 p-6 w-full max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}