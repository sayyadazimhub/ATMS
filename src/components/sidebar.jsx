'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const nav = [
  { href: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/user/products', label: 'Products', icon: Package },
  { href: '/user/stock', label: 'Stock', icon: Package },
  { href: '/user/farmer', label: 'Farmers', icon: Truck },
  { href: '/user/buyers', label: 'Buyers', icon: Users },
  { href: '/user/purchases', label: 'Purchases', icon: ShoppingCart },
  { href: '/user/sales', label: 'Sales', icon: TrendingUp },
  { href: '/user/reports', label: 'Reports', icon: BarChart3 },
  { href: '/user/settings', label: 'Settings', icon: Settings },
  { href: '/user/profile', label: 'Profile', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // const handleLogout = async () => {
  //   await axios.post('/api/auth/logout');
  //   window.location.href = '/login';
  // };
  const handleLogout = async () => {
    await axios.post('/api/user/auth/logout');
    window.location.href = '/user/login';
  };

  const linkClass = (href) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
      pathname === href
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    );

  return (
    <>
      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/dashboard" className="font-semibold">
          CTMS
        </Link>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar: drawer on mobile, fixed on desktop */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transition-transform duration-200 ease-out lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4 lg:justify-start">
          <Link href="/user/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="text-lg">CTMS</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={linkClass(item.href)}
              onClick={() => setOpen(false)}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Log out
          </button>
        </nav>
      </aside>
    </>
  );
}
