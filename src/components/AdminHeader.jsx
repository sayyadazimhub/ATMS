'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  Users,
  BarChart3,
  Menu,
  X,
  Shield,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import axios from 'axios';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/traders', label: 'Traders', icon: Users },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch admin profile
    axios.get('/api/admin/profile')
      .then((res) => setAdmin(res.data))
      .catch(() => { });
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const isActive = (href) => pathname === href;

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive(link.href)
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Profile and Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-slate-900">{admin?.name || 'Admin'}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">System Manager</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 sm:h-11 sm:w-auto sm:px-2 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all duration-200">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 text-white font-bold text-sm shadow-sm">
                    {admin?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 ml-1 hidden sm:block rotate-90" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl shadow-xl border-slate-200 p-2">
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold text-slate-900">{admin?.name || 'Administrator'}</p>
                    <p className="text-xs text-slate-500 truncate">{admin?.email || 'admin@atms.com'}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                <DropdownMenuItem
                  onClick={() => router.push('/settings')}
                  className="rounded-lg cursor-pointer focus:bg-slate-50 transition-colors py-2.5"
                >
                  <Settings className="mr-3 h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-lg cursor-pointer focus:bg-rose-50 text-rose-600 font-semibold py-2.5"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="text-sm">Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10 rounded-lg text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-white px-4 py-6 space-y-2 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all",
                isActive(link.href)
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t border-slate-100">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-rose-600 font-bold gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 transition-all"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
