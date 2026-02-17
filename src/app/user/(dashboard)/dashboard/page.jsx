'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, ShoppingCart, Wallet, AlertTriangle, Calendar, Package, ArrowUpRight, ArrowDownRight, Users, Truck, BarChart3 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30'); // Default to last 30 days

  useEffect(() => {
    fetchDashboardData(period);
  }, [period]);

  const fetchDashboardData = (selectedPeriod) => {
    setLoading(true);

    // Calculate dates
    const end = new Date();
    const start = new Date();

    if (selectedPeriod === 'today') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (selectedPeriod === '7') {
      start.setDate(end.getDate() - 7);
    } else if (selectedPeriod === '30') {
      start.setDate(end.getDate() - 30);
    } else if (selectedPeriod === 'month') {
      start.setDate(1); // 1st of current month
    } else if (selectedPeriod === 'year') {
      start.setMonth(0, 1); // Jan 1st
    }

    const query = new URLSearchParams({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });

    fetch(`/api/user/dashboard?${query.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setData(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard data');
      })
      .finally(() => setLoading(false));
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const s = data?.summary || {};
  const lowStock = data?.lowStockProducts || [];
  const recent = data?.recentTransactions || {};
  const chartData = data?.chartData || [];
  const topProducts = data?.topProducts || [];
  const topCustomers = data?.topCustomers || [];
  const topProviders = data?.topProviders || [];

  const stats = [
    {
      label: 'Gross Profit',
      value: `₹${Number(s.totalProfit || 0).toLocaleString('en-IN')}`,
      icon: TrendingUp,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
    },
    {
      label: 'Receivables',
      value: `₹${Number(s.totalDueFromCustomers || 0).toLocaleString('en-IN')}`,
      icon: ArrowUpRight,
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600',
      borderColor: 'border-violet-200',
    },
    {
      label: 'Payables',
      value: `₹${Number(s.totalDueToProviders || 0).toLocaleString('en-IN')}`,
      icon: ArrowDownRight,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-900 text-white">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">Business overview and insights</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px] h-10 rounded-lg">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label} className={`border-2 ${item.borderColor}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600">{item.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${item.bgColor}`}>
                  <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="text-lg">Sales & Profit Trend</CardTitle>
            <CardDescription>Performance over selected period</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                    <XAxis
                      dataKey="date"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-white p-3 shadow-lg">
                              <p className="text-xs text-slate-500 mb-2">{new Date(label).toLocaleDateString()}</p>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                  <span className="text-xs text-slate-600">Sales:</span>
                                  <span className="text-sm font-semibold text-emerald-600">₹{payload[0].value.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-violet-500" />
                                  <span className="text-xs text-slate-600">Profit:</span>
                                  <span className="text-sm font-semibold text-violet-600">₹{payload[1].value.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                    <Area type="monotone" dataKey="profit" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">No data for this period</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="border-slate-200">
          <CardHeader className="border-b bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Top Products</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {topProducts.length > 0 ? (
              <ul className="space-y-3">
                {topProducts.map((p, idx) => (
                  <li key={p.productId} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">{idx + 1}</div>
                      <div>
                        <p className="font-medium text-sm text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.totalQuantity} {p.unit} sold</p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm text-emerald-600">₹{p.totalProfit?.toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-12 text-sm text-slate-400">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Customers */}
        <Card className="border-slate-200">
          <CardHeader className="border-b bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">Top Customers</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {topCustomers.length > 0 ? (
              <ul className="space-y-3">
                {topCustomers.map((c, idx) => (
                  <li key={c.customerId} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-semibold">{idx + 1}</div>
                      <p className="font-medium text-sm text-slate-900">{c.name}</p>
                    </div>
                    <p className="font-semibold text-sm text-slate-900">₹{c.totalAmount?.toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-12 text-sm text-slate-400">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Providers */}
        <Card className="border-slate-200">
          <CardHeader className="border-b bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100">
                <Truck className="h-4 w-4 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Top Providers</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {topProviders.length > 0 ? (
              <ul className="space-y-3">
                {topProviders.map((p, idx) => (
                  <li key={p.providerId} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold">{idx + 1}</div>
                      <p className="font-medium text-sm text-slate-900">{p.name}</p>
                    </div>
                    <p className="font-semibold text-sm text-slate-900">₹{p.totalAmount?.toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-12 text-sm text-slate-400">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Sales */}
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50">
            <CardTitle className="text-lg">Recent Sales</CardTitle>
            <Button variant="ghost" size="sm" className="h-8" asChild>
              <a href="/user/sales">View all →</a>
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {recent.sales?.length ? (
              <div className="space-y-3">
                {recent.sales.map((sale) => (
                  <div key={sale.id} className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                          <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900">{sale.customer?.name || 'Walk-in Customer'}</p>
                          <p className="text-xs text-slate-500">{new Date(sale.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="font-bold text-emerald-600">₹{Number(sale.totalAmount).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-3 border-t">
                      {sale.items.map((item) => (
                        <span key={item.id} className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {item.product.name}: {item.quantity} {item.product.unit}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-12 text-sm text-slate-400">No recent sales</p>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="border-amber-200">
          <CardHeader className="border-b bg-amber-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <CardTitle className="text-lg">Low Stock</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {lowStock.length > 0 ? (
              <div className="space-y-3">
                {lowStock.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50/50">
                    <span className="font-medium text-sm text-slate-900">{p.name}</span>
                    <span className="text-xs font-semibold text-amber-600">{p.currentStock} {p.unit}</span>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2 h-9 rounded-lg" asChild>
                  <a href="/user/stock">Manage Stock</a>
                </Button>
              </div>
            ) : (
              <p className="text-center py-8 text-sm text-slate-400">All stocks sufficient</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Purchases */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50">
          <CardTitle className="text-lg">Recent Purchases</CardTitle>
          <Button variant="ghost" size="sm" className="h-8" asChild>
            <a href="/user/purchases">View all →</a>
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {recent.purchases?.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {recent.purchases.map((p) => (
                <div key={p.id} className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <ArrowDownRight className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{p.provider?.name || 'Unknown Provider'}</p>
                        <p className="text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 text-sm">₹{Number(p.totalAmount).toLocaleString()}</p>
                      {p.dueAmount > 0 && (
                        <p className="text-xs text-rose-600">Due: ₹{Number(p.dueAmount).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-3 border-t">
                    {p.items.map((item) => (
                      <span key={item.id} className="text-xs bg-slate-100 px-2 py-1 rounded">
                        {item.product.name}: {item.quantity} {item.product.unit}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-12 text-sm text-slate-400">No recent purchases</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
