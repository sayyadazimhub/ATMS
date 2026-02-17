'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Settings,
  Menu,
  X,
  UserCircle,
  Boxes,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navSections = [
  {
    title: 'Overview',
    items: [
      { href: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { href: '/user/products', label: 'Products', icon: Package },
      { href: '/user/stock', label: 'Stock', icon: Boxes },
    ],
  },
  {
    title: 'Contacts',
    items: [
      { href: '/user/farmer', label: 'Farmers', icon: Truck },
      { href: '/user/buyers', label: 'Buyers', icon: Users },
    ],
  },
  {
    title: 'Transactions',
    items: [
      { href: '/user/purchases', label: 'Purchases', icon: ShoppingCart },
      { href: '/user/sales', label: 'Sales', icon: TrendingUp },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { href: '/user/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    title: 'Account',
    items: [
      { href: '/user/profile', label: 'Profile', icon: UserCircle },
      { href: '/user/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const linkClass = (href) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
      collapsed && 'justify-center',
      pathname === href
        ? 'bg-slate-900 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    );

  return (
    <>
      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="h-10 w-10"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/user/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm">
            AT
          </div>
          <span className="font-bold text-lg text-slate-900">ATMS</span>
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
          'fixed inset-y-0 left-0 z-50 border-r border-slate-200 bg-white transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen',
          collapsed ? 'w-20' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          {!collapsed ? (
            <>
              <Link href="/user/dashboard" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white font-bold shadow-md">
                  AT
                </div>
                <div className="transition-opacity duration-300">
                  <span className="font-bold text-lg text-slate-900">ATMS</span>
                  <p className="text-xs text-slate-500">Trading System</p>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                {/* Toggle Button - Desktop Only */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(!collapsed)}
                  className="hidden lg:flex h-8 w-8 hover:bg-slate-100 rounded-lg"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="h-4 w-4 text-slate-600" />
                </Button>
                {/* Mobile Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-8 w-8"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <Link href="/user/dashboard" className="flex items-center justify-center flex-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white font-bold shadow-md">
                  AT
                </div>
              </Link>
              {/* Toggle Button - Collapsed State */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex h-8 w-8 hover:bg-slate-100 rounded-lg"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </Button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex flex-col overflow-y-auto transition-all duration-300",
          collapsed ? "gap-2 p-2 h-[calc(100vh-4rem)]" : "gap-6 p-4 h-[calc(100vh-4rem)]"
        )}>
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={linkClass(item.href)}
                    onClick={() => setOpen(false)}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
