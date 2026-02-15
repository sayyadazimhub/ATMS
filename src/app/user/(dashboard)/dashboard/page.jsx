'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, ShoppingCart, Wallet, AlertTriangle, Calendar } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

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

    fetch(`/api/dashboard?${query.toString()}`)
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

  const stats = [
    {
      label: 'Total Sales',
      value: `₹${Number(s.totalSales || 0).toLocaleString('en-IN')}`,
      icon: TrendingUp,
      className: 'text-green-600',
    },
    {
      label: 'Total Purchases',
      value: `₹${Number(s.totalPurchases || 0).toLocaleString('en-IN')}`,
      icon: ShoppingCart,
      className: 'text-blue-600',
    },
    {
      label: 'Total Profit',
      value: `₹${Number(s.totalProfit || 0).toLocaleString('en-IN')}`,
      icon: Wallet,
      className: 'text-violet-600',
    },
    {
      label: 'Due to Providers',
      value: `₹${Number(s.totalDueToProviders || 0).toLocaleString('en-IN')}`,
      icon: Wallet,
      className: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your crop trading business</p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              {/* <SelectItem value="year">This Year</SelectItem> */}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              <item.icon className={`h-4 w-4 ${item.className}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Sales & Profit Trend</CardTitle>
            <CardDescription>Value created over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
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
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Date
                                  </span>
                                  <span className="font-bold text-muted-foreground">
                                    {new Date(label).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Sales
                                  </span>
                                  <span className="font-bold text-green-600">
                                    ₹{payload[0].value.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Profit
                                  </span>
                                  <span className="font-bold text-violet-600">
                                    ₹{payload[1].value.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="sales" stroke="#16a34a" fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                    <Area type="monotone" dataKey="profit" stroke="#7c3aed" fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No data for this period
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Income vs Expense</CardTitle>
            <CardDescription>Sales vs Purchases comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
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
                      cursor={{ fill: 'transparent' }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Date
                                  </span>
                                  <span className="font-bold text-muted-foreground">
                                    {new Date(label).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Sales
                                  </span>
                                  <span className="font-bold text-green-600">
                                    ₹{payload[0].value.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Purchases
                                  </span>
                                  <span className="font-bold text-blue-600">
                                    ₹{payload[1].value.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend />
                    <Bar dataKey="sales" fill="#16a34a" radius={[4, 4, 0, 0]} name="Sales" />
                    <Bar dataKey="purchases" fill="#2563eb" radius={[4, 4, 0, 0]} name="Purchases" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No data for this period
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {lowStock.map((p) => (
                <li
                  key={p.id}
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="ml-2 text-muted-foreground">
                    {p.currentStock} {p.unit}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.sales?.length ? (
              <ul className="space-y-2">
                {recent.sales.map((sale) => (
                  <li
                    key={sale.id}
                    className="flex justify-between rounded-lg border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{sale.customer?.name || 'Unknown'}</p>
                      <p className="text-muted-foreground">
                        {new Date(sale.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ₹{Number(sale.totalAmount).toLocaleString('en-IN')}
                      </p>
                      <p className="text-muted-foreground">
                        Profit ₹{Number(sale.totalProfit || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recent sales</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.purchases?.length ? (
              <ul className="space-y-2">
                {recent.purchases.map((p) => (
                  <li
                    key={p.id}
                    className="flex justify-between rounded-lg border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{p.provider?.name || 'Unknown'}</p>
                      <p className="text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">
                        ₹{Number(p.totalAmount).toLocaleString('en-IN')}
                      </p>
                      <p className="text-muted-foreground">
                        Due ₹{Number(p.dueAmount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recent purchases</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
