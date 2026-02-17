'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Eye,
  Download,
  X,
  Plus,
  Trash2,
  Pencil,
  Printer,
  ShoppingCart,
  IndianRupee,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  Filter,
  Search,
  CheckCircle2
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form state
  const [providers, setProviders] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    providerId: '',
    paidAmount: 0,
    items: [{ productId: '', quantity: '', unitPrice: '' }],
  });
  const [editFormData, setEditFormData] = useState({
    id: '',
    paidAmount: 0,
    totalAmount: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, [pagination.page]);

  useEffect(() => {
    if (showCreateModal) {
      fetchProvidersAndProducts();
    }
  }, [showCreateModal]);

  const fetchPurchases = () => {
    setLoading(true);
    fetch(`/api/user/purchases?page=${pagination.page}`)
      .then((res) => res.json())
      .then((data) => {
        setPurchases(data.purchases || []);
        setPagination(data.pagination || { page: 1, pages: 1 });
      })
      .catch((err) => console.error('Failed to load purchases:', err))
      .finally(() => setLoading(false));
  };

  const fetchProvidersAndProducts = async () => {
    try {
      const [providersRes, productsRes] = await Promise.all([
        fetch('/api/user/providers?limit=100'),
        fetch('/api/user/products?limit=100'),
      ]);
      const providersData = await providersRes.json();
      const productsData = await productsRes.json();
      setProviders(providersData.providers || []);
      setProducts(productsData.products || []);
    } catch (err) {
      console.error('Failed to load providers/products:', err);
    }
  };

  const handleViewBill = async (purchaseId) => {
    try {
      const res = await fetch(`/api/user/purchases/${purchaseId}`);
      const data = await res.json();
      setSelectedPurchase(data);
      setShowViewModal(true);
    } catch (err) {
      console.error('Failed to load purchase details:', err);
      alert('Failed to load purchase details');
    }
  };

  const handleEditClick = (purchase) => {
    setEditFormData({
      id: purchase.id,
      paidAmount: purchase.paidAmount,
      totalAmount: purchase.totalAmount,
    });
    setShowEditModal(true);
  };

  const handleUpdatePurchase = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/user/purchases/${editFormData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paidAmount: parseFloat(editFormData.paidAmount),
        }),
      });

      if (res.ok) {
        alert('Purchase updated successfully');
        setShowEditModal(false);
        fetchPurchases();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update purchase');
      }
    } catch (err) {
      console.error('Failed to update purchase:', err);
      alert('Failed to update purchase');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintBill = () => {
    if (!selectedPurchase) return;

    // Create print window with styled content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the bill');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase Invoice - ${selectedPurchase.id.slice(-8).toUpperCase()}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
        <style>
          @media print {
            @page { margin: 20mm; }
            body { -webkit-print-color-adjust: exact; }
          }
          body { 
            font-family: 'Inter', sans-serif; 
            color: #0f172a;
            line-height: 1.5;
            padding: 0;
            margin: 0;
          }
          .report-header { 
            border-bottom: 4px solid #0f172a; 
            padding-bottom: 24px; 
            margin-bottom: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .brand h1 { 
            font-size: 42px; 
            font-weight: 900; 
            margin: 0; 
            letter-spacing: -2px; 
            text-transform: uppercase;
          }
          .brand p { 
            margin: 4px 0 0 0; 
            font-weight: 700; 
            color: #64748b; 
            text-transform: uppercase; 
            letter-spacing: 1px;
            font-size: 12px;
          }
          .meta-info { text-align: right; }
          .meta-label { 
            font-size: 10px; 
            font-weight: 900; 
            color: #94a3b8; 
            text-transform: uppercase; 
            letter-spacing: 1px;
            margin-bottom: 2px;
          }
          .meta-value { font-size: 18px; font-weight: 900; font-style: italic; }

          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
          .section-title { 
            font-size: 10px; 
            font-weight: 900; 
            color: #94a3b8; 
            text-transform: uppercase; 
            letter-spacing: 2px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .info-box p { margin: 4px 0; font-size: 14px; }
          .info-box p strong { color: #475569; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th { 
            text-align: left; 
            font-size: 10px; 
            font-weight: 900; 
            text-transform: uppercase; 
            letter-spacing: 1px;
            padding: 12px;
            background: #f8fafc;
            border-bottom: 2px solid #0f172a;
          }
          td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .text-right { text-align: right; }
          .font-bold { font-weight: 700; }
          
          .totals-container { display: flex; justify-content: flex-end; }
          .totals-box { 
            width: 300px; 
            background: #0f172a; 
            color: white; 
            padding: 24px; 
            border-radius: 16px;
          }
          .total-item { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px;
            font-size: 12px;
            color: #94a3b8;
            font-weight: 700;
            text-transform: uppercase;
          }
          .total-main { 
            display: flex; 
            justify-content: space-between; 
            margin-top: 16px; 
            padding-top: 16px;
            border-top: 1px solid #334155;
            font-size: 24px;
            font-weight: 900;
            color: white;
          }
          .footer { 
            margin-top: 60px; 
            text-align: center; 
            font-size: 10px; 
            color: #94a3b8;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div class="brand">
            <h1>Procurement Statement</h1>
            <p>Agriculture Trading Management System</p>
          </div>
          <div class="meta-info">
            <div class="meta-label">Filing ID</div>
            <div class="meta-value">#${selectedPurchase.id.slice(-8).toUpperCase()}</div>
            <div class="meta-label" style="margin-top: 8px;">Recording Date</div>
            <div class="meta-value">${new Date(selectedPurchase.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        <div class="grid">
          <div class="info-box">
            <div class="section-title">Provider Details</div>
            <p><strong>Provider:</strong> ${selectedPurchase.provider?.name || 'Unknown'}</p>
            ${selectedPurchase.provider?.phone ? `<p><strong>Phone:</strong> ${selectedPurchase.provider.phone}</p>` : ''}
            ${selectedPurchase.provider?.address ? `<p><strong>Address:</strong> ${selectedPurchase.provider.address}</p>` : ''}
          </div>
          <div class="info-box">
            <div class="section-title">Recipient Entity</div>
            <p><strong>Acquired By:</strong> Sayyad Traders</p>
            <p><strong>Accounting Status:</strong> ${selectedPurchase.dueAmount > 0 ? 'Payment Required' : 'Liability Settled'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 45%">Inventory Item</th>
              <th style="width: 15%" class="text-right">Quantity</th>
              <th style="width: 20%" class="text-right">Acquisition Rate</th>
              <th style="width: 20%" class="text-right">Total Outlay</th>
            </tr>
          </thead>
          <tbody>
            ${selectedPurchase.items?.map(item => `
              <tr>
                <td>
                  <div class="font-bold text-slate-900">${item.product?.name || 'Unknown Item'}</div>
                  <div style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Unit: ${item.product?.unit || 'N/A'}</div>
                </td>
                <td class="text-right font-bold">${item.quantity}</td>
                <td class="text-right text-slate-500">₹${item.unitPrice.toLocaleString('en-IN')}</td>
                <td class="text-right font-bold text-slate-900">₹${item.totalPrice.toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals-container">
          <div class="totals-box">
            <div class="total-item">
              <span>Gross Outlay</span>
              <span style="color: white">₹${selectedPurchase.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div class="total-item">
              <span>Paid to Provider</span>
              <span style="color: #10b981">₹${selectedPurchase.paidAmount.toLocaleString('en-IN')}</span>
            </div>
            <div class="total-main">
              <span style="font-size: 12px; color: #94a3b8; display: flex; align-items: center;">BALANCE PAYABLE</span>
              <span>₹${selectedPurchase.dueAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>This is a computer-verified procurement record • Sayyad Traders • generated automatically</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: '', unitPrice: '' }],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + qty * price;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.providerId) {
      alert('Please select a provider');
      return;
    }

    const validItems = formData.items.filter(
      (item) => item.productId && item.quantity && item.unitPrice
    );

    if (validItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: formData.providerId,
          paidAmount: parseFloat(formData.paidAmount) || 0,
          items: validItems,
        }),
      });

      if (res.ok) {
        alert('Purchase created successfully!');
        setShowCreateModal(false);
        setFormData({
          providerId: '',
          paidAmount: 0,
          items: [{ productId: '', quantity: '', unitPrice: '' }],
        });
        fetchPurchases();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create purchase');
      }
    } catch (err) {
      console.error('Failed to create purchase:', err);
      alert('Failed to create purchase');
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = calculateTotal();
  const paidAmount = parseFloat(formData.paidAmount) || 0;
  const dueAmount = totalAmount - paidAmount;

  const totalDue = purchases.reduce((sum, p) => sum + (p.dueAmount || 0), 0);
  const totalPurchasesToday = purchases
    .filter(p => new Date(p.createdAt).toDateString() === new Date().toDateString())
    .length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -m-8 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl font-black tracking-tight">Purchase Registry</h1>
          <p className="text-slate-400 mt-2 flex items-center gap-2 font-medium">
            <ShoppingCart className="h-4 w-4" />
            Track inventory acquisitions and provider payments
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="relative bg-white text-slate-900 hover:bg-slate-100 rounded-2xl h-12 px-6 font-bold shadow-lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Log New Purchase
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Pending Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-500">₹{totalDue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="h-3 w-3" /> Payable to farmers and providers
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm overflow-hidden relative group transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Today's Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{totalPurchasesToday} Records</div>
            <p className="text-xs text-blue-600 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Activity for today
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm overflow-hidden relative group hidden lg:block">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Latest Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-slate-900 truncate">
              {purchases[0]?.provider?.name || '---'}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 italic">
              <Clock className="h-3 w-3" />
              Last entry recorded
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b bg-slate-50/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Records of all procurement activities</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm text-slate-600">
                  <thead>
                    <tr className="border-b bg-slate-50/30">
                      <th className="p-4 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">Provider Information</th>
                      <th className="p-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px]">Total Amount</th>
                      <th className="p-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px]">Paid Amount</th>
                      <th className="p-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px]">Payment Status</th>
                      <th className="p-4 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">Entry Date</th>
                      <th className="p-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px] w-48">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {purchases.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <ShoppingCart className="h-12 w-12 text-slate-200" />
                            <p className="text-slate-400 font-medium">No purchase records found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      purchases.map((p) => (
                        <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 font-bold border border-slate-100 uppercase">
                                {p.provider?.name[0] || '?'}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-base">{p.provider?.name || 'Unknown'}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {p.id.slice(-8).toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <p className="font-black text-slate-900">₹{Number(p.totalAmount).toLocaleString('en-IN')}</p>
                          </td>
                          <td className="p-4 text-right font-medium text-emerald-600 font-black">
                            ₹{Number(p.paidAmount).toLocaleString('en-IN')}
                          </td>
                          <td className="p-4 text-right">
                            {p.dueAmount <= 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                                <CheckCircle2 className="h-3 w-3" /> Fully Paid
                              </span>
                            ) : p.paidAmount > 0 ? (
                              <div className="flex flex-col items-end leading-none">
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-100 mb-1">
                                  <Clock className="h-3 w-3" /> Partial
                                </span>
                                <span className="text-[10px] text-rose-500 font-black tracking-tighter uppercase">Due: ₹{Number(p.dueAmount).toLocaleString('en-IN')}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end leading-none">
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-100 mb-1">
                                  <AlertCircle className="h-3 w-3" /> Unpaid
                                </span>
                                <span className="text-[10px] text-rose-500 font-black tracking-tighter uppercase">₹{Number(p.dueAmount).toLocaleString('en-IN')}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-4 font-medium text-slate-500">
                            {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleViewBill(p.id)}
                                className="h-9 w-9 rounded-xl border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all hover:scale-105"
                                title="View Bill"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleEditClick(p)}
                                className="h-9 w-9 rounded-xl border-slate-200 hover:border-amber-500 hover:text-amber-600 transition-all hover:scale-105"
                                title="Edit Payment"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {pagination.pages > 1 && (
                <div className="p-6 border-t flex items-center justify-between gap-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                    Page {pagination.page} of {pagination.pages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl px-4 h-9 font-bold transition-all hover:bg-slate-50"
                      disabled={pagination.page <= 1}
                      onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl px-4 h-9 font-bold bg-slate-900 text-white border-slate-900 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Purchase Modal */}
      <Dialog.Root open={showCreateModal} onOpenChange={setShowCreateModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" />
          {/* <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border-none bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">New Purchase</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="provider" className="text-sm font-medium">Select Provider *</Label>
                  <select
                    id="provider"
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.providerId}
                    onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                    required
                  >
                    <option value="">Choose a Farmer/Provider</option>
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b">
                  <Label className="text-sm font-medium">Products & Items *</Label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addItem}
                    className="rounded-lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-12">
                      <div className="sm:col-span-5">
                        <Label className="text-xs font-medium mb-1 block">Product Name</Label>
                        <select
                          className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          value={item.productId}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                          required
                        >
                          <option value="">Select Item</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <Label className="text-xs font-medium mb-1 block">Quantity</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="h-10 rounded-lg"
                          value={item.quantity}
                          placeholder="0.00"
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          required
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <Label className="text-xs font-medium mb-1 block">Unit Price (₹)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="h-10 rounded-lg"
                          value={item.unitPrice}
                          placeholder="₹ 0.00"
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                          required
                        />
                      </div>
                      <div className="sm:col-span-1 flex items-end justify-center">
                        {formData.items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                      {item.quantity && item.unitPrice && (
                        <div className="sm:col-span-12 flex justify-end">
                          <div className="bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 underline decoration-blue-500/30">Subtotal:</span>
                            <span className="text-sm font-black text-slate-900">₹{(parseFloat(item.quantity) * parseFloat(item.unitPrice)).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
                <div className="space-y-3">
                  <Label htmlFor="paidAmount" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Initial Payment (₹)</Label>
                  <Input
                    id="paidAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    className="h-14 rounded-2xl border-slate-200 text-xl font-black text-emerald-600 px-6 bg-emerald-50/30 placeholder:text-emerald-300 shadow-inner"
                    placeholder="₹ 0.00"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                  />
                </div>

                <div className="rounded-[2rem] bg-slate-900 p-8 text-white space-y-4 shadow-xl">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] font-black uppercase tracking-widest italic decoration-emerald-500 underline underline-offset-4">Gross Purchase</span>
                    <span className="font-bold">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 pb-4 border-b border-white/10 italic">
                    <span className="text-[10px] font-black uppercase tracking-widest decoration-blue-500 underline underline-offset-4">Settled Amount</span>
                    <span className="font-bold">₹{paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black uppercase tracking-widest italic">Balance Payable</span>
                    <span className={cn(
                      "text-2xl font-black italic tracking-tighter",
                      dueAmount > 0 ? 'text-rose-400' : 'text-emerald-400'
                    )}>
                      ₹{dueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg flex-1 shadow-xl shadow-slate-200 transition-all border-none"
                >
                  {submitting ? 'Recording Transaction...' : 'Confirm & Log Purchase'}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-2xl px-8 font-black text-slate-400 border-slate-200 hover:bg-slate-50 uppercase tracking-widest text-[10px]"
                  onClick={() => setShowCreateModal(false)}
                >
                  Discard Entry
                </Button>
              </div>
            </form>
          </Dialog.Content> */}
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">New Purchase</h2>
                  <p className="text-sm text-slate-400">Record inventory acquisition</p>
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="p-2 rounded-lg hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">

              {/* Provider */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Select Provider *
                </Label>

                <select
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:ring-2 focus:ring-emerald-500"
                  value={formData.providerId}
                  onChange={(e) =>
                    setFormData({ ...formData, providerId: e.target.value })
                  }
                  required
                >
                  <option value="">Choose Provider</option>

                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Products */}
              <div className="space-y-4">

                <div className="flex justify-between items-center border-b pb-3">
                  <Label className="text-sm font-medium">
                    Products *
                  </Label>

                  <Button
                    type="button"
                    size="sm"
                    onClick={addItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {/* Items */}
                <div className="space-y-3">

                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid sm:grid-cols-12 gap-4 p-4 bg-slate-50 border rounded-lg"
                    >

                      {/* Product */}
                      <div className="sm:col-span-5 space-y-1">
                        <Label className="text-xs">
                          Product
                        </Label>

                        <select
                          className="h-10 w-full rounded-lg border px-3 text-sm"
                          value={item.productId}
                          onChange={(e) =>
                            updateItem(index, "productId", e.target.value)
                          }
                          required
                        >
                          <option value="">Select Product</option>

                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-3 space-y-1">
                        <Label className="text-xs">
                          Quantity
                        </Label>

                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          placeholder="0.00"
                          onChange={(e) =>
                            updateItem(index, "quantity", e.target.value)
                          }
                          required
                        />
                      </div>

                      {/* Price */}
                      <div className="sm:col-span-3 space-y-1">
                        <Label className="text-xs">
                          Unit Price (₹)
                        </Label>

                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          placeholder="₹0.00"
                          onChange={(e) =>
                            updateItem(index, "unitPrice", e.target.value)
                          }
                          required
                        />
                      </div>

                      {/* Delete */}
                      <div className="sm:col-span-1 flex items-end justify-center">

                        {formData.items.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="text-rose-500"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        )}

                      </div>

                      {/* Subtotal */}
                      {item.quantity && item.unitPrice && (
                        <div className="sm:col-span-12 text-right">

                          <span className="text-xs text-slate-400 mr-2">
                            Subtotal:
                          </span>

                          <span className="font-bold">
                            ₹
                            {(item.quantity * item.unitPrice).toLocaleString("en-IN")}
                          </span>

                        </div>
                      )}

                    </div>
                  ))}

                </div>
              </div>

              {/* Payment */}
              <div className="grid lg:grid-cols-2 gap-6 items-end">

                {/* Paid */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-slate-500">
                    Initial Payment (₹)
                  </Label>

                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="h-14 text-xl font-bold text-emerald-600"
                    placeholder="₹0.00"
                    value={formData.paidAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, paidAmount: e.target.value })
                    }
                  />
                </div>

                {/* Summary */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-3">

                  <div className="flex justify-between text-slate-400">
                    <span>Gross</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-slate-400 border-b pb-2">
                    <span>Paid</span>
                    <span>₹{paidAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-lg font-bold">
                    <span>Balance</span>

                    <span
                      className={
                        dueAmount > 0
                          ? "text-rose-400"
                          : "text-emerald-400"
                      }
                    >
                      ₹{dueAmount.toFixed(2)}
                    </span>

                  </div>

                </div>

              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-14 flex-1 text-lg font-bold"
                >
                  {submitting
                    ? "Recording..."
                    : "Confirm Purchase"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>

              </div>
            </form>
          </Dialog.Content>

        </Dialog.Portal>
      </Dialog.Root>

      {/* Edit Purchase Modal */}
      <Dialog.Root open={showEditModal} onOpenChange={setShowEditModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" />
          {/* <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[2.5rem] border-none bg-white p-10 shadow-2xl">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="p-5 rounded-3xl bg-amber-50 text-amber-600 mb-6 shadow-inner border border-amber-100/50">
                <Pencil className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Financial Registry</h2>
              <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Adjust Payment Status</p>
            </div>

            <form onSubmit={handleUpdatePurchase} className="space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic underline decoration-blue-500/20">Total Bill Valuation</Label>
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 text-center shadow-inner group transition-all">
                  <p className="text-xs text-slate-500 font-bold mb-1 italic opacity-60">Consolidated Sum</p>
                  <span className="text-3xl font-black text-slate-900 italic decoration-blue-500 underline underline-offset-[-2px] decoration-8 group-hover:decoration-rose-500 transition-all">
                    ₹{editFormData.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="editPaidAmount" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 tracking-[0.2em] italic">Updated Settlement (₹)</Label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-xl">₹</div>
                  <Input
                    id="editPaidAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="h-16 rounded-3xl border-slate-200 text-2xl font-black text-emerald-600 pl-12 bg-white transition-all focus:border-emerald-500 shadow-sm"
                    value={editFormData.paidAmount}
                    onChange={(e) => setEditFormData({ ...editFormData, paidAmount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 text-white flex justify-between items-center shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <IndianRupee className="h-12 w-12" />
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] italic">Remaining Liability</span>
                </div>
                <span className={cn(
                  "text-xl font-black tracking-tighter italic",
                  (editFormData.totalAmount - editFormData.paidAmount) > 0 ? 'text-rose-400' : 'text-emerald-400'
                )}>
                  ₹{(editFormData.totalAmount - parseFloat(editFormData.paidAmount || 0)).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-xl border-none"
                >
                  {submitting ? 'Updating Statement...' : 'Authorize Adjustment'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 rounded-2xl font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]"
                  onClick={() => setShowEditModal(false)}
                >
                  Discard Changes
                </Button>
              </div>
            </form>
          </Dialog.Content> */}
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md
  -translate-x-1/2 -translate-y-1/2
  rounded-2xl bg-white shadow-xl"
          >

            {/* Header */}
            <div className="flex flex-col items-center bg-slate-900 text-white p-4 rounded-t-2xl text-center mb-8">

              <div className="p-3 rounded-2xl bg-orange-500 text-white mb-2">
                <Pencil className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-bold text-white">
                Financial Registry
              </h2>

              <p className="text-sm text-white mt-1">
                Adjust Payment Status
              </p>

            </div>

            <form onSubmit={handleUpdatePurchase} className="space-y-6 p-8">

              {/* Total */}
              <div className="space-y-2">

                <Label className="text-sm font-medium text-black">
                  Total Amount
                </Label>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">

                  <p className="text-xs text-black mb-1">
                    Bill Total
                  </p>

                  <span className="text-2xl font-semibold text-black">
                    ₹{editFormData.totalAmount.toLocaleString("en-IN")}
                  </span>

                </div>

              </div>

              {/* Paid */}
              <div className="space-y-2">

                <Label
                  htmlFor="editPaidAmount"
                  className="text-sm font-medium text-slate-600"
                >
                  Paid Amount (₹)
                </Label>

                <Input
                  id="editPaidAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="h-11 rounded-xl border-slate-200 px-4 focus:ring-2 focus:ring-emerald-500"
                  value={editFormData.paidAmount}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      paidAmount: e.target.value,
                    })
                  }
                  required
                />

              </div>

              {/* Balance */}
              <div
                className="rounded-xl bg-slate-50 border border-slate-200
      p-4 flex justify-between items-center"
              >

                <span className="text-sm font-medium text-slate-600">
                  Balance Due
                </span>

                <span
                  className={cn(
                    "font-semibold",
                    editFormData.totalAmount - editFormData.paidAmount > 0
                      ? "text-rose-500"
                      : "text-emerald-600"
                  )}
                >
                  ₹{(
                    editFormData.totalAmount -
                    parseFloat(editFormData.paidAmount || 0)
                  ).toLocaleString("en-IN")}
                </span>

              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4">

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-12 rounded-xl font-semibold"
                >
                  {submitting ? "Updating..." : "Save Changes"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="h-11 rounded-xl border-slate-200"
                >
                  Cancel
                </Button>

              </div>

            </form>

          </Dialog.Content>

        </Dialog.Portal>
      </Dialog.Root>

      {/* View Bill Modal */}
      <Dialog.Root open={showViewModal && selectedPurchase} onOpenChange={setShowViewModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" />
          {/* <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border-none bg-white shadow-2xl overflow-hidden">
            {selectedPurchase && (
              <>
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShoppingCart className="h-24 w-24" />
                  </div>
                  <div className="flex justify-between items-start relative">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight mb-1">Purchase Invoice</h2>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Reference: {selectedPurchase.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <Dialog.Close className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
                      <X className="h-5 w-5" />
                    </Dialog.Close>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic underline decoration-blue-500/30">Provider / Farmer</Label>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 font-black text-lg border border-slate-200">
                          {selectedPurchase.provider?.name?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg leading-none">{selectedPurchase.provider?.name}</p>
                          <p className="text-xs text-slate-500 font-medium mt-1">{selectedPurchase.provider?.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-2 block">Statement Date</Label>
                      <p className="font-black text-slate-900 text-lg">{new Date(selectedPurchase.createdAt).toLocaleDateString()}</p>
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black uppercase mt-2",
                        selectedPurchase.dueAmount <= 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                      )}>
                        {selectedPurchase.dueAmount <= 0 ? "Settled" : "With Outstandings"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="p-4 text-left font-black text-slate-500 uppercase tracking-widest text-[10px]">Product SKU</th>
                          <th className="p-4 text-right font-black text-slate-500 uppercase tracking-widest text-[10px]">Qty</th>
                          <th className="p-4 text-right font-black text-slate-500 uppercase tracking-widest text-[10px]">Price</th>
                          <th className="p-4 text-right font-black text-slate-500 uppercase tracking-widest text-[10px]">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedPurchase.items?.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              <p className="font-black text-slate-900">{item.product?.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{item.product?.unit}</p>
                            </td>
                            <td className="p-4 text-right font-bold text-slate-600">
                              {item.quantity} {item.product?.unit}
                            </td>
                            <td className="p-4 text-right font-bold text-slate-600">
                              ₹{item.unitPrice.toLocaleString()}
                            </td>
                            <td className="p-4 text-right font-black text-slate-900">
                              ₹{item.totalPrice.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex gap-8 text-sm">
                      <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mt-1">Gross Valuation:</span>
                      <span className="font-black text-slate-900 w-24 text-right">₹{selectedPurchase.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-8 text-sm">
                      <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mt-1 underline decoration-blue-500/20">Authorized Paid:</span>
                      <span className="font-black text-emerald-600 w-24 text-right">₹{selectedPurchase.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-8 pt-4 border-t border-slate-100 w-full justify-end">
                      <span className="font-black text-slate-900 uppercase tracking-widest text-sm mt-1">Net Balance:</span>
                      <span className={cn(
                        "text-2xl font-black italic",
                        selectedPurchase.dueAmount > 0 ? "text-rose-500" : "text-emerald-500"
                      )}>₹{selectedPurchase.dueAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <Button onClick={handlePrintBill} className="flex-1 rounded-2xl h-14 bg-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-xl shadow-slate-200">
                      <Printer className="mr-2 h-5 w-5" />
                      Print Statement
                    </Button>
                    <Dialog.Close asChild>
                      <Button variant="outline" className="rounded-2xl h-14 px-8 font-black text-slate-400 border-slate-200 hover:bg-slate-50 uppercase tracking-widest text-[10px]">
                        Close
                      </Button>
                    </Dialog.Close>
                  </div>
                </div>
              </>
            )}
          </Dialog.Content> */}
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl
  -translate-x-1/2 -translate-y-1/2
  rounded-2xl bg-white shadow-xl overflow-hidden"
          >
            {selectedPurchase && (
              <>
                {/* Header */}
                <div className="bg-slate-900 p-6 text-white flex justify-between items-start">

                  <div>
                    <h2 className="text-xl font-bold">
                      Purchase Invoice
                    </h2>

                    <p className="text-sm text-slate-400">
                      Ref: {selectedPurchase.id.slice(-8).toUpperCase()}
                    </p>
                  </div>

                  <Dialog.Close className="p-2 rounded-lg hover:bg-white/10">
                    <X className="h-5 w-5" />
                  </Dialog.Close>

                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-6">

                    {/* Provider */}
                    <div className="space-y-1">

                      <Label className="text-sm font-medium text-slate-600">
                        Provider
                      </Label>

                      <div className="flex items-center gap-3">

                        <div className="h-10 w-10 rounded-xl bg-slate-100
              flex items-center justify-center font-semibold border">

                          {selectedPurchase.provider?.name?.[0] || "?"}

                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {selectedPurchase.provider?.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {selectedPurchase.provider?.phone}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* Date */}
                    <div className="text-right space-y-1">

                      <Label className="text-sm font-medium text-slate-600">
                        Date
                      </Label>

                      <p className="font-semibold text-slate-900">
                        {new Date(
                          selectedPurchase.createdAt
                        ).toLocaleDateString()}
                      </p>

                      <span
                        className={cn(
                          "inline-block rounded-md px-2 py-1 text-xs font-medium",
                          selectedPurchase.dueAmount <= 0
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        )}
                      >
                        {selectedPurchase.dueAmount <= 0
                          ? "Settled"
                          : "Pending"}
                      </span>

                    </div>

                  </div>

                  {/* Items Table */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">

                    <table className="w-full text-sm">

                      <thead className="bg-slate-50 border-b">

                        <tr>
                          <th className="p-3 text-left font-medium text-slate-600">
                            Product
                          </th>

                          <th className="p-3 text-right font-medium text-slate-600">
                            Qty
                          </th>

                          <th className="p-3 text-right font-medium text-slate-600">
                            Price
                          </th>

                          <th className="p-3 text-right font-medium text-slate-600">
                            Total
                          </th>
                        </tr>

                      </thead>

                      <tbody className="divide-y">

                        {selectedPurchase.items?.map((item) => (

                          <tr key={item.id}>

                            <td className="p-3">
                              <p className="font-medium text-slate-900">
                                {item.product?.name}
                              </p>

                              <p className="text-xs text-slate-500">
                                {item.product?.unit}
                              </p>
                            </td>

                            <td className="p-3 text-right text-slate-600">
                              {item.quantity}
                            </td>

                            <td className="p-3 text-right text-slate-600">
                              ₹{item.unitPrice.toLocaleString()}
                            </td>

                            <td className="p-3 text-right font-semibold text-slate-900">
                              ₹{item.totalPrice.toLocaleString()}
                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                  {/* Summary */}
                  <div className="space-y-2 text-sm">

                    <div className="flex justify-end gap-6">

                      <span className="text-slate-500">
                        Total
                      </span>

                      <span className="font-semibold w-24 text-right">
                        ₹{selectedPurchase.totalAmount.toLocaleString()}
                      </span>

                    </div>

                    <div className="flex justify-end gap-6">

                      <span className="text-slate-500">
                        Paid
                      </span>

                      <span className="font-semibold text-emerald-600 w-24 text-right">
                        ₹{selectedPurchase.paidAmount.toLocaleString()}
                      </span>

                    </div>

                    <div className="flex justify-end gap-6 pt-2 border-t">

                      <span className="font-medium">
                        Balance
                      </span>

                      <span
                        className={cn(
                          "font-semibold text-lg w-24 text-right",
                          selectedPurchase.dueAmount > 0
                            ? "text-rose-500"
                            : "text-emerald-600"
                        )}
                      >
                        ₹{selectedPurchase.dueAmount.toLocaleString()}
                      </span>

                    </div>

                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">

                    <Button
                      onClick={handlePrintBill}
                      className="flex-1 h-12 rounded-xl font-semibold"
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>

                    <Dialog.Close asChild>
                      <Button
                        variant="outline"
                        className="h-12 rounded-xl border-slate-200"
                      >
                        Close
                      </Button>
                    </Dialog.Close>

                  </div>

                </div>
              </>
            )}
          </Dialog.Content>

        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
