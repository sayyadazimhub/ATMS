'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { User, Bell, Activity } from 'lucide-react';

export default function Header() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axios.get('/api/user/profile')
      .then(res => setProfile(res.data))
      .catch(err => console.error("Header profile fetch error:", err));
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold tracking-tight text-slate-800">Trader Panel</h2>
      </div>

      <div className="flex items-center gap-4 sm:gap-8">
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          <Activity className="h-3.5 w-3.5 animate-pulse" />
          System Online
        </div>

        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
          </button>

          <Link
            href="/user/profile"
            className="flex items-center gap-3 pl-4 border-l border-slate-200"
            title="Profile"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-none">
                Welcome, {profile?.name || 'Trader'}
              </p>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">
                Authorized Access
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
              <User className="h-5 w-5" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
