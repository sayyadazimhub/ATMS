'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  AlertTriangle,
  Package,
  ArrowRight,
  Filter,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function StockMonitorPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterLowStock, setFilterLowStock] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    axios
      .get(`/api/user/products?page=${pagination.page}&search=${search}&limit=50`)
      .then((res) => {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      })
      .catch(() => toast.error('Failed to load inventory'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, search]);

  // Derived stats
  const lowStockCount = products.filter(p => p.currentStock <= 10).length;

  const filteredProducts = filterLowStock
    ? products.filter(p => p.currentStock <= 10)
    : products;

  const getStatusBadge = (stock) => {
    if (stock <= 0) return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700 border border-red-100">
        <XCircle className="h-3 w-3" /> Out of Stock
      </span>
    );
    if (stock <= 10) return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-100">
        <AlertTriangle className="h-3 w-3" /> Low Stock
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-100">
        <CheckCircle2 className="h-3 w-3" /> In Stock
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Inventory Monitor</h1>
          <p className="text-slate-500 flex items-center gap-2 mt-1">
            <Package className="h-4 w-4" />
            Live stock tracking and inventory monitoring
          </p>
        </div>
        <Link href="/user/products">
          <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50">
            <Package className="mr-2 h-4 w-4" />
            Manage Products
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

        <Card className={cn(
          "border-none shadow-sm text-white overflow-hidden relative group transition-colors",
          lowStockCount > 0 ? "bg-amber-500" : "bg-emerald-500"
        )}>
          <div className="absolute top-0 right-0 -m-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold opacity-80 uppercase tracking-widest">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{lowStockCount} Items</div>
            <p className="text-xs opacity-70 mt-1">
              {lowStockCount > 0 ? "Action required immediately" : "All levels are optimal"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-100 text-slate-900 hidden lg:block">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total SKU Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{products.length} Products</div>
            <Link href="/user/products" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 mt-1">
              View all products <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <Filter className="h-5 w-5" />
            </div>
            <CardTitle>Inventory List</CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={filterLowStock ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterLowStock(!filterLowStock)}
              className="rounded-xl"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Low Stock Only
            </Button>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Find a product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl border-slate-200 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm text-slate-600">
                <thead>
                  <tr className="border-b bg-slate-50/50">
                    <th className="p-4 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">Product Name</th>
                    <th className="p-4 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">Availability Status</th>
                    <th className="p-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px]">Current Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-400">Unit: {p.unit}</p>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(p.currentStock)}
                      </td>
                      <td className="p-4 text-right font-mono font-bold">
                        {p.currentStock.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">{p.unit}</span>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Package className="h-12 w-12 text-slate-200" />
                          <p className="text-slate-400 font-medium">No items matching your search/filter</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {pagination.pages > 1 && (
            <div className="p-4 border-t flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl px-4"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              >
                Previous
              </Button>
              <div className="flex items-center px-4 text-xs font-bold text-slate-500">
                {pagination.page} / {pagination.pages}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl px-4"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
