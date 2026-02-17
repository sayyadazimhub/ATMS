'use client';

import Link from 'next/link';
import { Package, TrendingUp, BarChart3, Users, Truck, ShoppingCart, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const features = [
    {
      icon: Package,
      title: 'Inventory Management',
      desc: 'Track stock levels with automatic updates and low-stock alerts',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: TrendingUp,
      title: 'Sales & Purchases',
      desc: 'Record transactions with profit calculation and payment tracking',
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      desc: 'Comprehensive insights with daily, monthly, and yearly analytics',
      color: 'bg-violet-100 text-violet-600',
    },
    {
      icon: Users,
      title: 'Customer Management',
      desc: 'Manage buyers with transaction history and due tracking',
      color: 'bg-amber-100 text-amber-600',
    },
    {
      icon: Truck,
      title: 'Supplier Management',
      desc: 'Track farmers and suppliers with purchase records',
      color: 'bg-rose-100 text-rose-600',
    },
    {
      icon: ShoppingCart,
      title: 'Transaction History',
      desc: 'Complete audit trail of all sales and purchase activities',
      color: 'bg-indigo-100 text-indigo-600',
    },
  ];

  const benefits = [
    'Real-time inventory tracking',
    'Automated profit calculations',
    'Payment & due management',
    'Comprehensive reporting',
    'Multi-user support',
    'Mobile responsive design',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white font-bold shadow-md">
              AT
            </div>
            <span className="text-xl font-bold text-slate-900">ATMS</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/user/login">
              <Button variant="ghost" className="h-10 rounded-lg">
                Sign In
              </Button>
            </Link>
            <Link href="/user/register">
              <Button className="h-10 rounded-lg">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 mb-6">
              <CheckCircle2 className="h-4 w-4" />
              Agricultural Trading Made Simple
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
              Streamline Your
              <span className="block text-blue-600 mt-2">Trading Business</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 sm:text-xl max-w-2xl mx-auto">
              Complete management system for agricultural trading. Track inventory, manage sales & purchases, and generate insightful reports - all in one powerful platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/user/register">
                <Button size="lg" className="h-12 px-8 rounded-xl text-base w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/user/login">
                <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl text-base w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful features designed specifically for agricultural trading businesses
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {features.map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg hover:border-slate-300"
              >
                <div className={`inline-flex p-3 rounded-xl ${item.color}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                  Built for Modern Trading
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  ATMS provides all the tools you need to run your agricultural trading business efficiently and profitably.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <Link href="/user/register">
                    <Button size="lg" className="h-12 px-8 rounded-xl">
                      Get Started Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <span className="font-medium text-slate-900">Stock Value</span>
                      <span className="text-lg font-bold text-blue-600">₹2,45,000</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="font-medium text-slate-900">Gross Profit</span>
                      <span className="text-lg font-bold text-emerald-600">₹45,230</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-violet-50 border border-violet-200">
                      <span className="font-medium text-slate-900">Receivables</span>
                      <span className="text-lg font-bold text-violet-600">₹12,500</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Transform Your Business?
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              Join hundreds of traders who are already using ATMS to streamline their operations
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/user/register">
                <Button size="lg" className="h-12 px-8 rounded-xl bg-white text-slate-900 hover:bg-slate-100 w-full sm:w-auto">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/user/login">
                <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl hover:text-white border-white text-black hover:bg-white/10 w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          <div className="flex items-center justify-center gap-4 mt-10">
            <p className="text-sm text-center text-slate-600">
              © 2026 ATMS. All rights reserved.
            </p>
          </div>
          </div>
        </div>
      </section>
    </div>
  );
}
