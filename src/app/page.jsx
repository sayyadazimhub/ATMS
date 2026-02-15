'use client';

import Link from 'next/link';
import { Package, TrendingUp, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-bold text-primary">ATMS</span>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/user/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Login in
              </Button>
            </Link>
            <Link href="/login">
              <Button>Admin Login</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 sm:py-20">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Crop Trading Management System
          </h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
            Manage inventory, sales, purchases, and reports in one place. Built for admins and users, responsive on every device.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/user/register">
              <Button size="lg" className="w-full sm:w-auto">
                Create account
              </Button>
            </Link>
            <Link href="/user/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign in
              </Button>
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-24 grid max-w-5xl gap-6 sm:grid-cols-3">
          {[
            {
              icon: Package,
              title: 'Products & inventory',
              desc: 'Track stock levels and units (KG, Quintal, Ton) with automatic updates.',
            },
            {
              icon: TrendingUp,
              title: 'Sales & purchases',
              desc: 'Record transactions with profit calculation and due tracking.',
            },
            {
              icon: BarChart3,
              title: 'Reports',
              desc: 'Daily, monthly, and yearly profit/loss and analytics.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <item.icon className="h-10 w-10 text-primary" />
              <h2 className="mt-3 text-lg font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </section>

        <footer className="mt-24 border-t py-8 text-center text-sm text-muted-foreground">
          ATMS — copyright 2026
        </footer>
      </main>
    </div>
  );
}
