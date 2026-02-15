'use client';

import Sidebar from '@/components/sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-auto p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
}
