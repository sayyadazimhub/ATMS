'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Users,
  TrendingUp,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Activity,
  UserPlus,
  BarChart3,
  Settings
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/admin/dashboard')
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  const s = data?.summary || {};
  const stats = [
    {
      label: 'Network Traders',
      value: s.totalTraders,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Active Traders',
      value: s.activeTraders,
      icon: ShieldCheck,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
    },
    {
      label: 'Network Sales',
      value: (s.totalTransactions || 0).toLocaleString(),
      icon: Activity,
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600',
      borderColor: 'border-violet-200',
    },
    {
      label: 'Network Revenue',
      value: (v => {
        if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
        if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
        return `₹${v.toLocaleString('en-IN')}`;
      })(s.totalVolume || 0),
      icon: TrendingUp,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-slate-900 text-white">
          <Activity className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Live network statistics based on user activity</p>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* volume Chart */}
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="text-lg">Network Revenue Growth</CardTitle>
            <CardDescription>Aggregate sales volume across all traders</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => {
                    if (v >= 100000) return `${(v / 100000).toFixed(1)}L`;
                    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
                    return v;
                  }} />
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                  <Area type="monotone" dataKey="volume" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Registered Traders */}
        <Card className="border-slate-200">
          <CardHeader className="border-b bg-slate-50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100">
                <UserPlus className="h-4 w-4 text-blue-600" />
              </div>
              <CardTitle className="text-lg">New Traders</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {data.recentTraders.map((trader) => (
                <div key={trader.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-900 text-white font-bold">
                      {trader.name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{trader.name}</p>
                      <p className="text-xs text-slate-500">{trader.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      {trader.joined ? new Date(trader.joined).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 h-10 rounded-xl" asChild>
              <a href="/traders">Manage All Traders</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="border-slate-200">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-16 flex flex-col gap-1 items-start justify-center px-4 rounded-xl border-2 hover:border-slate-900 hover:bg-slate-50">
                <UserPlus className="h-4 w-4" />
                <span className="text-xs">Invite Trader</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 items-start justify-center px-4 rounded-xl border-2 hover:border-slate-900 hover:bg-slate-50">
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs">Export Report</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 items-start justify-center px-4 rounded-xl border-2 hover:border-slate-900 hover:bg-slate-50">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs">System Logs</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 items-start justify-center px-4 rounded-xl border-2 hover:border-slate-900 hover:bg-slate-50">
                <Settings className="h-4 w-4" />
                <span className="text-xs">Backup Data</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="border-emerald-200">
          <CardHeader className="border-b bg-emerald-50">
            <CardTitle className="text-lg text-emerald-900 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Database</span>
                <span className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                  <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">API Server</span>
                <span className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                  <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Storage Services</span>
                <span className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                  <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  Connected
                </span>
              </div>
              <div className="pt-2 border-t text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Last backup 2 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
