'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Filter,
  Users,
  PieChart as PieChartIcon,
  TrendingDown,
  ShoppingCart
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { cn } from '@/lib/utils';

export default function AdminReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/admin/reports?range=${timeRange}`)
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, [timeRange]);

  const handleDownloadPDF = () => {
    window.print();
  };

  const COLORS = ['#0f172a', '#334155', '#64748b', '#94a3b8'];

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-900 text-white">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">System Reports</h1>
            <p className="text-sm text-slate-500">Aggregate analytics across the entire network</p>
          </div>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button
            variant="outline"
            className="h-10 rounded-xl gap-2 border-slate-200"
            onClick={handleDownloadPDF}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="h-10 w-[160px] rounded-xl border-slate-200 bg-white">
              <Calendar className="h-4 w-4 mr-2 text-slate-500" />
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Network Revenue', value: `₹${Number(data?.metrics?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Net Profit', value: `₹${Number(data?.metrics?.totalProfit || 0).toLocaleString('en-IN')}`, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Traders', value: data?.metrics?.traderCount || 0, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Transactions', value: data?.metrics?.transactionCount || 0, icon: ShoppingCart, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((s) => (
          <Card key={s.label} className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                  <p className="text-2xl font-black text-slate-900">{s.value}</p>
                </div>
                <div className={cn("p-3 rounded-xl", s.bg)}>
                  <s.icon className={cn("h-6 w-6", s.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue vs Profit Chart */}
        <Card className="border-slate-200">
          <CardHeader className="border-b bg-slate-50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Network Revenue Flow</CardTitle>
              <CardDescription>Aggregate revenue and profit across all traders</CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.revenueData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => {
                    if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
                    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
                    if (v >= 1000) return `₹${(v / 1000).toFixed(0)}k`;
                    return `₹${v}`;
                  }} />
                  <Tooltip formatter={(v) => `₹${v?.toLocaleString('en-IN') || 0}`} />
                  <Legend />
                  <Bar dataKey="revenue" name="Total Revenue" fill="#0f172a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Combined Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trader Volume Distribution */}
        <Card className="border-slate-200">
          <CardHeader className="border-b bg-slate-50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Trader Volume Ranking</CardTitle>
              <CardDescription>Top performing traders by transaction volume</CardDescription>
            </div>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.traderPerformance || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                  <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => {
                    if (v >= 10000000) return `${(v / 10000000).toFixed(1)}Cr`;
                    if (v >= 100000) return `${(v / 100000).toFixed(1)}L`;
                    return `${v / 1000}k`;
                  }} />
                  <YAxis dataKey="name" type="category" width={100} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                  <Bar dataKey="volume" name="Trade Volume" fill="#334155" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Category Share */}
        <Card className="border-slate-200">
          <CardHeader className="border-b bg-slate-50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Commodity Share</CardTitle>
              <CardDescription>Volume distribution by crop type</CardDescription>
            </div>
            <PieChartIcon className="h-5 w-5 text-violet-600" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.categoryShare || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(data?.categoryShare || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Growth Statistics */}
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="text-lg">Key Data Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <p className="text-sm text-slate-500 font-medium">Profit Margin</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-bold text-slate-900">
                      {data?.metrics?.totalRevenue ? ((data.metrics.totalProfit / data.metrics.totalRevenue) * 100).toFixed(1) : 0}%
                    </span>
                    <span className="flex items-center text-emerald-600 text-xs font-bold">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      Efficient
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <p className="text-sm text-slate-500 font-medium">Avg Sale Value</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-bold text-slate-900">
                      ₹{data?.metrics?.transactionCount ? (data.metrics.totalRevenue / data.metrics.transactionCount).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : 0}
                    </span>
                    <span className="flex items-center text-blue-600 text-xs font-bold">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Stable
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <p className="text-sm text-slate-500 font-medium">Trader Density</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-bold text-slate-900">{data?.metrics?.traderCount || 0} Traders</span>
                    <span className="flex items-center text-violet-600 text-xs font-bold">
                      <Users className="h-3 w-3 mr-1" />
                      Active
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <p className="text-sm text-slate-500 font-medium">Total Volume</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-bold text-slate-900">{data?.metrics?.transactionCount || 0} Trans.</span>
                    <span className="flex items-center text-amber-600 text-xs font-bold">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Ready
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Print Only Styles */}
      <style jsx global>{`
        @media print {
          body { 
            background: white !important; 
            -webkit-print-color-adjust: exact;
          }
          .main-content {
            padding: 0 !important;
            margin: 0 !important;
          }
          nav, aside, .no-print {
            display: none !important;
          }
          .recharts-responsive-container {
            width: 100% !important;
            height: 400px !important;
          }
          .Card {
            border: 1px solid #e2e8f0 !important;
            break-inside: avoid;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
}
