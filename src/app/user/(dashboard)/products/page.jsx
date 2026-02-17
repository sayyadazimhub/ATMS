'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Search, Package, Box, Filter, ChevronRight } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

const UNITS = ['KG', 'Quintal', 'Ton'];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', unit: 'KG', baseCostPrice: 0, baseSalePrice: 0 });
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    axios
      .get(`/api/user/products?page=${pagination.page}&search=${search}`)
      .then((res) => {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, search]);

  const handleOpen = (product = null) => {
    setEditing(product);
    setForm(product ? {
      name: product.name,
      unit: product.unit,
      baseCostPrice: product.baseCostPrice || 0,
      baseSalePrice: product.baseSalePrice || 0
    } : { name: '', unit: 'KG', baseCostPrice: 0, baseSalePrice: 0 });
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await axios.put(`/api/user/products/${editing.id}`, form);
        toast.success('Product updated');
      } else {
        await axios.post('/api/user/products', form);
        toast.success('Product added');
      }
      setOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await axios.delete(`/api/user/products/${id}`);
      toast.success('Deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -m-8 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl font-black tracking-tight">Product Management</h1>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            <Box className="h-4 w-4" />
            Registry of all tradeable crops and items
          </p>
        </div>
        <Button
          onClick={() => handleOpen()}
          className="relative bg-white text-slate-900 hover:bg-slate-100 rounded-2xl h-12 px-6 font-bold shadow-lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add New Product
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b bg-slate-50/50 pb-6">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  Product Registry
                </CardTitle>
                <CardDescription>View and manage all available SKUs</CardDescription>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by product name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 rounded-xl border-slate-200 focus:ring-blue-500 h-11"
                />
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
                      <tr className="border-b bg-slate-50/30">
                        <th className="p-4 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">Product Information</th>
                        <th className="p-4 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">Measurement Unit</th>
                        <th className="p-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px]">Base Cost</th>
                        <th className="p-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px]">Base Sale</th>
                        <th className="p-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px]">Current Inventory</th>
                        <th className="p-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px] w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold border border-blue-100">
                                {p.name[0]?.toUpperCase()}
                              </div>
                              <p className="font-bold text-slate-900 text-base">{p.name}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 border border-slate-200 uppercase">
                              {p.unit}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="font-bold text-slate-900">₹{Number(p.baseCostPrice || 0).toLocaleString('en-IN')}</span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="font-bold text-blue-600">₹{Number(p.baseSalePrice || 0).toLocaleString('en-IN')}</span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex flex-col items-end">
                              <span className={cn(
                                "font-mono font-black text-base",
                                p.currentStock <= 10 ? "text-amber-600" : "text-slate-900"
                              )}>
                                {p.currentStock.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{p.unit} in-hand</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpen(p)}
                                className="h-9 w-9 rounded-xl border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all hover:scale-105"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(p.id)}
                                className="h-9 w-9 rounded-xl border-slate-200 hover:border-red-500 hover:text-red-600 transition-all hover:scale-105"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-20 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                                <Package className="h-8 w-8 text-slate-200" />
                              </div>
                              <p className="text-slate-400 font-medium text-lg">Your product catalog is empty</p>
                              <Button onClick={() => handleOpen()} variant="outline" className="rounded-xl mt-2">
                                Add your first product
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {pagination.pages > 1 && (
                <div className="p-6 border-t flex items-center justify-between gap-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                    Page {pagination.page} of {pagination.pages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl px-4 h-9 font-bold"
                      disabled={pagination.page <= 1}
                      onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl px-4 h-9 font-bold border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border-none bg-white p-8 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:max-w-md">
            <div className="flex flex-col gap-1 mb-6">
              <Dialog.Title className="text-2xl font-black text-slate-900">
                {editing ? 'Edit Product' : 'Register Product'}
              </Dialog.Title>
              <Dialog.Description className="text-slate-500">
                Enter details to track this crop in your inventory
              </Dialog.Description>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Product Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="rounded-xl h-12 border-slate-200 focus:ring-blue-600"
                  placeholder="e.g. Basmati Rice, Wheat (Grade A)"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Measurement Unit</Label>
                <select
                  className={cn(
                    'flex h-12 w-full rounded-xl border border-slate-200 bg-background px-4 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 appearance-none'
                  )}
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">This will be used for all purchase and sale entries</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Base Cost (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.baseCostPrice}
                    onChange={(e) => setForm((f) => ({ ...f, baseCostPrice: e.target.value }))}
                    className="rounded-xl h-12 border-slate-200 focus:ring-blue-600"
                    placeholder="e.g. 30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Base Sale (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.baseSalePrice}
                    onChange={(e) => setForm((f) => ({ ...f, baseSalePrice: e.target.value }))}
                    className="rounded-xl h-12 border-slate-200 focus:ring-blue-600"
                    placeholder="e.g. 34"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-2xl h-12 font-bold shadow-lg shadow-blue-500/20"
                >
                  {submitting ? 'Saving…' : (editing ? 'Update Registry' : 'Save Product')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl h-12 px-6 border-slate-200"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div >
  );
}
