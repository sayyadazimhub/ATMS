'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Printer,
  Download,
  TrendingUp,
  ShoppingBag,
  PieChart,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  RefreshCcw,
  FileText,
  BarChart3,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardDescription } from '@/components/ui/card';

export default function ReportsPage() {
  const [type, setType] = useState('daily');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [type]);

  const fetchReport = () => {
    setLoading(true);
    fetch(`/api/user/reports?type=${type}`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error('Failed to load report:', err))
      .finally(() => setLoading(false));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto print:p-0">
      {/* Premium Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 -m-8 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Business Analytics</h1>
          </div>
          <p className="text-slate-400 font-medium">Data-driven insights into your procurement and liquidations</p>
        </div>
        <div className="flex items-center gap-3 relative">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="rounded-2xl h-12 px-6 font-bold border-slate-700 bg-slate-800 text-white hover:bg-slate-700 hover:border-slate-600 shadow-lg"
          >
            <Printer className="mr-2 h-5 w-5" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
        <div className="lg:col-span-1">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Analytical Window</Label>
          <div className="relative">
            <select
              className="flex h-14 w-full rounded-2xl border border-slate-200 bg-white px-6 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer shadow-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="daily">Trailing 30 Days</option>
              <option value="monthly">Current Month Cycle</option>
              <option value="yearly">Fiscal Year Overview</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-end">
          <Button
            onClick={fetchReport}
            disabled={loading}
            className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black px-8 shadow-sm shadow-blue-200"
          >
            {loading ? (
              <RefreshCcw className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <RefreshCcw className="h-5 w-5 mr-2" />
            )}
            Re-Sync Data
          </Button>
        </div>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block border-b-4 border-slate-900 pb-8 mb-10">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Market Statement</h1>
            <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-sm">Agriculture Trading Management System</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-slate-400 mb-1">AUDIT PERIOD</p>
            <p className="text-lg font-black text-slate-900 italic">
              {data ? `${new Date(data.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} — ${new Date(data.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}` : '...'}
            </p>
          </div>
        </div>
      </div>
      <CardContent>
        {loading && !data ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : data ? (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              <p>Period: {new Date(data.startDate).toLocaleDateString('en-IN')} - {new Date(data.endDate).toLocaleDateString('en-IN')}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-green-50/50 dark:bg-green-950/10 border-green-100 dark:border-green-900/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-green-600">Total Sales</p>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-green-700 dark:text-green-400">
                    ₹{Number(data.totalSales || 0).toLocaleString('en-IN')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-600">Total Purchases</p>
                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-400">
                    ₹{Number(data.totalPurchases || 0).toLocaleString('en-IN')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-violet-50/50 dark:bg-violet-950/10 border-violet-100 dark:border-violet-900/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-violet-600">Total Profit</p>
                    <PieChart className="h-4 w-4 text-violet-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-violet-700 dark:text-violet-400">
                    ₹{Number(data.totalProfit || 0).toLocaleString('en-IN')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/50 border-muted">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {(data.sales?.length || 0) + (data.purchases?.length || 0)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 space-y-8">
              {/* Detailed Sales Table */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                    Sales Details
                  </h3>
                </div>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Customer</th>
                        <th className="p-3 text-left">Items</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3 text-right">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.sales?.map(sale => (
                        <tr key={sale.id} className="border-t hover:bg-muted/20 transition-colors">
                          <td className="p-3 text-muted-foreground">
                            {new Date(sale.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="p-3 font-semibold">
                            {sale.customer?.name || 'Walk-in'}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {sale.items.map(item => (
                                <span key={item.id} className="text-[10px] bg-muted px-1.5 py-0.5 rounded ring-1 ring-inset ring-muted-foreground/10">
                                  {item.product.name} ({item.quantity})
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-right font-bold text-green-600">
                            ₹{sale.totalAmount.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-medium text-violet-600">
                            ₹{sale.totalProfit.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detailed Purchases Table */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <ArrowDownRight className="h-5 w-5 text-blue-600" />
                    Purchase Details
                  </h3>
                </div>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Provider</th>
                        <th className="p-3 text-left">Items</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3 text-right">Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.purchases?.map(p => (
                        <tr key={p.id} className="border-t hover:bg-muted/20 transition-colors">
                          <td className="p-3 text-muted-foreground">
                            {new Date(p.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="p-3 font-semibold">
                            {p.provider?.name || 'Unknown'}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {p.items.map(item => (
                                <span key={item.id} className="text-[10px] bg-muted px-1.5 py-0.5 rounded ring-1 ring-inset ring-muted-foreground/10">
                                  {item.product.name} ({item.quantity})
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-right font-bold text-blue-600">
                            ₹{p.totalAmount.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-medium text-destructive">
                            ₹{p.dueAmount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-muted-foreground">No data available</p>
        )}
      </CardContent>
    </div >
  );
}
