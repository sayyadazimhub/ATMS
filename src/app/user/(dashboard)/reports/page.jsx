'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ReportsPage() {
  const [type, setType] = useState('daily');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [type]);

  const fetchReport = () => {
    setLoading(true);
    fetch(`/api/reports?type=${type}`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error('Failed to load report:', err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Profit, sales, and purchases by period</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Label>Period</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-40"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="daily">Last 30 days</option>
              <option value="monthly">This month</option>
              <option value="yearly">This year</option>
            </select>
          </div>
          <Button onClick={fetchReport} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </Button>
        </CardHeader>
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
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{Number(data.totalSales || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total Purchases</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{Number(data.totalPurchases || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total Profit</p>
                  <p className="text-2xl font-bold text-violet-600">
                    ₹{Number(data.totalProfit || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className="text-2xl font-bold">
                    ₹{Number(data.netProfit || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 font-semibold">Sales Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    Total Transactions: {data.sales?.length || 0}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 font-semibold">Purchases Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    Total Transactions: {data.purchases?.length || 0}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="py-8 text-center text-muted-foreground">No data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
