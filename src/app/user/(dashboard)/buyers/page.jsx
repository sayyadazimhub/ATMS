'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Search, ShoppingBag, MapPin, Phone, Eye, Filter } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export default function BuyersPage() {
  const [buyers, setBuyers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [submitting, setSubmitting] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchBuyers = () => {
    setLoading(true);
    axios
      .get(`/api/user/customers?page=${pagination.page}&search=${search}`)
      .then((res) => {
        setBuyers(res.data.customers || []);
        setPagination(res.data.pagination || { page: 1, pages: 1 });
      })
      .catch(() => toast.error('Failed to load buyers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBuyers();
  }, [pagination.page, search]);

  const handleOpen = (buyer = null) => {
    setEditing(buyer);
    setForm(
      buyer
        ? { name: buyer.name, phone: buyer.phone || '', address: buyer.address || '' }
        : { name: '', phone: '', address: '' }
    );
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await axios.put(`/api/user/customers/${editing.id}`, form);
        toast.success('Buyer updated');
      } else {
        await axios.post('/api/user/customers', form);
        toast.success('Buyer added');
      }
      setOpen(false);
      fetchBuyers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this buyer?')) return;
    try {
      await axios.delete(`/api/user/customers/${id}`);
      toast.success('Deleted');
      fetchBuyers();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleView = async (buyer) => {
    setViewing(buyer);
    setLoadingDetails(true);
    try {
      const res = await axios.get(`/api/user/customers/${buyer.id}`);
      setViewData(res.data);
    } catch (err) {
      toast.error('Failed to load details');
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -m-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl font-black tracking-tight">Buyer Registry</h1>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Manage all customers and market buyers
          </p>
        </div>
        <Button
          onClick={() => handleOpen()}
          className="relative bg-white text-slate-900 hover:bg-slate-100 rounded-2xl h-12 px-6 font-bold shadow-lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add New Buyer
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b bg-slate-50/50 pb-6">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-emerald-600" />
                  Buyer List
                </CardTitle>
                <CardDescription>View and manage your network of buyers</CardDescription>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 rounded-xl border-slate-200 focus:ring-emerald-500 h-11"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-sm text-slate-600">
                    <thead>
                      <tr className="border-b bg-slate-50/30">
                        <th className="p-4 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">Buyer Information</th>
                        <th className="p-4 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">Contact Details</th>
                        <th className="p-4 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">Shipping Address</th>
                        <th className="p-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px] w-48">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {buyers.map((b) => (
                        <tr key={b.id} className="hover:bg-emerald-50/30 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold border border-emerald-100">
                                {b.name[0]?.toUpperCase()}
                              </div>
                              <p className="font-bold text-slate-900 text-base">{b.name}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {b.phone || '—'}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-slate-500">
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[200px]">{b.address || '—'}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleView(b)}
                                className="h-9 w-9 rounded-xl border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-all hover:scale-105"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpen(b)}
                                className="h-9 w-9 rounded-xl border-slate-200 hover:border-amber-500 hover:text-amber-600 transition-all hover:scale-105"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(b.id)}
                                className="h-9 w-9 rounded-xl border-slate-200 hover:border-red-500 hover:text-red-600 transition-all hover:scale-105"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {buyers.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-20 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                                <ShoppingBag className="h-8 w-8 text-slate-200" />
                              </div>
                              <p className="text-slate-400 font-medium text-lg">No buyers found in registry</p>
                              <Button onClick={() => handleOpen()} variant="outline" className="rounded-xl mt-2">
                                Add your first buyer
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

      {/* View Details Dialog */}
      <Dialog.Root open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm shadow-xl" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border-none bg-white p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <Dialog.Title className="text-2xl font-black text-slate-900 mb-2">
              Buyer profile: {viewing?.name}
            </Dialog.Title>
            <Dialog.Description className="text-slate-500 mb-6">
              Complete transaction history and contact information
            </Dialog.Description>

            {loadingDetails ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              </div>
            ) : viewData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</Label>
                    <p className="font-bold text-slate-900">{viewData.phone || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default Address</Label>
                    <p className="font-bold text-slate-900">{viewData.address || '—'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Sales History</h3>
                  {viewData.sales?.length > 0 ? (
                    <div className="rounded-2xl border border-slate-100 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="p-3 text-left font-bold text-slate-500 text-[10px] uppercase tracking-wider">Date</th>
                            <th className="p-3 text-left font-bold text-slate-500 text-[10px] uppercase tracking-wider">Products</th>
                            <th className="p-3 text-right font-bold text-slate-500 text-[10px] uppercase tracking-wider">Total Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {viewData.sales.map(sale => (
                            <tr key={sale.id}>
                              <td className="p-3 text-slate-500 font-medium whitespace-nowrap">
                                {new Date(sale.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-3">
                                {sale.items.map(item => (
                                  <div key={item.id} className="text-slate-900 font-bold">
                                    {item.product.name} <span className="text-slate-400 font-medium text-xs">x {item.quantity} {item.product.unit}</span>
                                  </div>
                                ))}
                              </td>
                              <td className="p-3 text-right font-black text-slate-900">
                                ₹{sale.totalAmount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100 italic">
                      No sales records found for this buyer
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="outline" onClick={() => setViewing(null)} className="rounded-xl px-8 border-slate-200">
                    Close Profile
                  </Button>
                </div>
              </div>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Add/Edit Dialog */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border-none bg-white p-8 shadow-2xl">
            <div className="flex flex-col gap-1 mb-6">
              <Dialog.Title className="text-2xl font-black text-slate-900">
                {editing ? 'Update Buyer' : 'Add Buyer'}
              </Dialog.Title>
              <Dialog.Description className="text-slate-500">
                Enter buyer details for invoicing and logistics
              </Dialog.Description>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Buyer Name / Company</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="rounded-xl h-12 border-slate-200 focus:ring-emerald-600"
                  placeholder="e.g. Acme Trading Co."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Mobile Number</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="rounded-xl h-12 border-slate-200 focus:ring-emerald-600"
                  placeholder="+91 00000 00000"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Official Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="rounded-xl h-12 border-slate-200 focus:ring-emerald-600"
                  placeholder="Full business address"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1 rounded-2xl h-12 font-bold shadow-lg shadow-emerald-500/20 bg-slate-900 hover:bg-slate-800">
                  {submitting ? 'Saving…' : (editing ? 'Update Registry' : 'Save Buyer')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-2xl h-12 px-6 border-slate-200">
                  Cancel
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
