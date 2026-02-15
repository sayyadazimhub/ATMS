"use client";

import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';

export default function UserDashboardLayout({ children }) {
  // const router = useRouter();

  // const handleLogout = async () => {
  //   try {
  //     await axios.post('/api/user/auth/logout');
  //     router.push('/user/login'); // better than window.location
  //   } catch (error) {
  //     console.error("Logout failed:", error);
  //   }
  // };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header />

        {/* <header className="border-b bg-card flex justify-between">
          
          <div className="flex items-center px-4">
            <Link href="/user/dashboard" className="font-semibold">
              User Portal
            </Link>
          </div>

          <div className="flex items-center px-4">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div> 

        </header> */}

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
