'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Eye,
    X,
    Plus,
    Trash2,
    Pencil,
    Printer,
    BadgeDollarSign,
    IndianRupee,
    Clock,
    AlertCircle,
    TrendingUp,
    Filter,
    CheckCircle2,
    Wallet
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export default function SalesPage() {
    const [sales, setSales] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [selectedSale, setSelectedSale] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Form state
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        customerId: '',
        paidAmount: 0,
        items: [{ productId: '', quantity: '', salePrice: '', costPrice: 0 }],
    });
    const [editFormData, setEditFormData] = useState({
        id: '',
        paidAmount: 0,
        totalAmount: 0,
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchSales();
    }, [pagination.page]);

    useEffect(() => {
        if (showCreateModal) {
            fetchCustomersAndProducts();
        }
    }, [showCreateModal]);

    const fetchSales = () => {
        setLoading(true);
        fetch(`/api/user/sales?page=${pagination.page}`)
            .then((res) => res.json())
            .then((data) => {
                setSales(data.sales || []);
                setPagination(data.pagination || { page: 1, pages: 1 });
            })
            .catch((err) => console.error('Failed to load sales:', err))
            .finally(() => setLoading(false));
    };

    const fetchCustomersAndProducts = async () => {
        try {
            const [customersRes, productsRes] = await Promise.all([
                fetch('/api/user/customers?limit=100'),
                fetch('/api/user/products?limit=100'),
            ]);
            const customersData = await customersRes.json();
            const productsData = await productsRes.json();
            setCustomers(customersData.customers || []);
            setProducts(productsData.products || []);
        } catch (err) {
            console.error('Failed to load customers/products:', err);
        }
    };

    const handleViewBill = async (saleId) => {
        try {
            const res = await fetch(`/api/user/sales/${saleId}`);
            const data = await res.json();
            setSelectedSale(data);
            setShowViewModal(true);
        } catch (err) {
            console.error('Failed to load sale details:', err);
            alert('Failed to load sale details');
        }
    };

    const handleEditClick = (sale) => {
        setEditFormData({
            id: sale.id,
            paidAmount: sale.paidAmount || 0,
            totalAmount: sale.totalAmount,
        });
        setShowEditModal(true);
    };

    const handleUpdateSale = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`/api/user/sales/${editFormData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paidAmount: parseFloat(editFormData.paidAmount),
                }),
            });

            if (res.ok) {
                alert('Sale updated successfully');
                setShowEditModal(false);
                fetchSales();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update sale');
            }
        } catch (err) {
            console.error('Failed to update sale:', err);
            alert('Failed to update sale');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePrintBill = () => {
        if (!selectedSale) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to print the bill');
            return;
        }

        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sale Invoice - ${selectedSale.id.slice(-8).toUpperCase()}</title>
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
            <h1>Sale Invoice</h1>
            <p>Agriculture Trading Management System</p>
          </div>
          <div class="meta-info">
            <div class="meta-label">Invoice Reference</div>
            <div class="meta-value">#${selectedSale.id.slice(-8).toUpperCase()}</div>
            <div class="meta-label" style="margin-top: 8px;">Transaction Date</div>
            <div class="meta-value">${new Date(selectedSale.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        <div class="grid">
          <div class="info-box">
            <div class="section-title">Client Information</div>
            <p><strong>Name:</strong> ${selectedSale.customer?.name || 'Walk-in'}</p>
            ${selectedSale.customer?.phone ? `<p><strong>Phone:</strong> ${selectedSale.customer.phone}</p>` : ''}
            ${selectedSale.customer?.address ? `<p><strong>Address:</strong> ${selectedSale.customer.address}</p>` : ''}
          </div>
          <div class="info-box">
            <div class="section-title">Business Entity</div>
            <p><strong>Merchant:</strong> Sayyad Traders</p>
            <p><strong>Payment Status:</strong> ${(selectedSale.dueAmount || 0) > 0 ? 'Balance Pending' : 'Fully Settled'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 45%">Commodity / Product</th>
              <th style="width: 15%" class="text-right">Quantity</th>
              <th style="width: 20%" class="text-right">Unit Price</th>
              <th style="width: 20%" class="text-right">Net Amount</th>
            </tr>
          </thead>
          <tbody>
            ${selectedSale.items?.map(item => `
              <tr>
                <td>
                  <div class="font-bold text-slate-900">${item.product?.name || 'Unknown Item'}</div>
                  <div style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Unit: ${item.product?.unit || 'N/A'}</div>
                </td>
                <td class="text-right font-bold">${item.quantity}</td>
                <td class="text-right text-slate-500">₹${item.salePrice.toLocaleString('en-IN')}</td>
                <td class="text-right font-bold text-slate-900">₹${(item.salePrice * item.quantity).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals-container">
          <div class="totals-box">
            <div class="total-item">
              <span>Gross Total</span>
              <span style="color: white">₹${selectedSale.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div class="total-item">
              <span>Amount Received</span>
              <span style="color: #10b981">₹${(selectedSale.paidAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="total-main">
              <span style="font-size: 12px; color: #94a3b8; display: flex; align-items: center;">BALANCE DUE</span>
              <span>₹${(selectedSale.dueAmount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Computer Generated Statement • Sayyad Traders • No Signature Required</p>
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
            items: [...formData.items, { productId: '', quantity: '', salePrice: '', costPrice: 0 }],
        });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        // Auto-fill cost price when product is selected
        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) {
                newItems[index].costPrice = product.baseCostPrice || 0;
                newItems[index].salePrice = product.baseSalePrice || 0;
            }
        }

        setFormData({ ...formData, items: newItems });
    };

    const getStockError = (item) => {
        if (!item.productId || !item.quantity) return null;
        const product = products.find(p => p.id === item.productId);
        if (!product) return null;

        if (parseFloat(item.quantity) > product.currentStock) {
            return `Exceeds stock! (Available: ${product.currentStock} ${product.unit})`;
        }
        return null;
    };

    const isFormValid = () => {
        if (!formData.customerId) return false;
        if (formData.items.length === 0) return false;

        return formData.items.every(item => {
            if (!item.productId || !item.quantity || !item.salePrice) return false;
            return !getStockError(item);
        });
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.salePrice) || 0;
            return sum + qty * price;
        }, 0);
    };

    const calculateProfit = () => {
        return formData.items.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const salePrice = parseFloat(item.salePrice) || 0;
            const costPrice = parseFloat(item.costPrice) || 0;
            return sum + qty * (salePrice - costPrice);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            alert('Please fix validation errors');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/user/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: formData.customerId,
                    paidAmount: parseFloat(formData.paidAmount) || 0,
                    items: formData.items,
                }),
            });

            if (res.ok) {
                alert('Sale created successfully!');
                setShowCreateModal(false);
                setFormData({
                    customerId: '',
                    paidAmount: 0,
                    items: [{ productId: '', quantity: '', salePrice: '', costPrice: 0 }],
                });
                fetchSales();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create sale');
            }
        } catch (err) {
            console.error('Failed to create sale:', err);
            alert('Failed to create sale');
        } finally {
            setSubmitting(false);
        }
    };

    const totalAmount = calculateTotal();
    const paidAmount = parseFloat(formData.paidAmount) || 0;
    const dueAmount = totalAmount - paidAmount;
    const estimatedProfit = calculateProfit();

    const totalReceivables = sales.reduce((sum, s) => sum + (s.dueAmount || 0), 0);
    const totalSalesToday = sales
        .filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString())
        .length;
    const totalProfitToday = sales
        .filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString())
        .reduce((sum, s) => sum + (s.totalProfit || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -m-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="relative">
                    <h1 className="text-3xl font-black tracking-tight">Sales Terminal</h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2 font-medium">
                        <BadgeDollarSign className="h-4 w-4" />
                        Manage customer liquidations and revenue tracking
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="relative bg-white text-slate-900 hover:bg-slate-100 rounded-2xl h-12 px-6 font-bold shadow-lg"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Create New Sale
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Receivables</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-emerald-600">₹{totalReceivables.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
                            <TrendingUp className="h-3 w-3" /> Outstanding payments from buyers
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Today's Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-blue-600">₹{totalProfitToday.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-slate-400 font-bold mt-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Net gain from today's trades
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm overflow-hidden relative group hidden lg:block">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900">{totalSalesToday} Invoices</div>
                        <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Successful sales today
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b bg-slate-50/50 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <Filter className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle>Invoice Ledger</CardTitle>
                            <CardDescription>Comprehensive log of customer liquidations</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-sm text-slate-600">
                                    <thead>
                                        <tr className="border-b bg-slate-50/30">
                                            <th className="p-4 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">Client Information</th>
                                            <th className="p-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px]">Invoice Total</th>
                                            <th className="p-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px]">Paid Amount</th>
                                            <th className="p-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px]">Payment Status</th>
                                            <th className="p-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px]">Net Profit</th>
                                            <th className="p-4 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px]">Date</th>
                                            <th className="p-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px] w-48">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {sales.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="p-20 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                                                            <BadgeDollarSign className="h-8 w-8 text-slate-200" />
                                                        </div>
                                                        <p className="text-slate-400 font-medium text-lg">No sales records found</p>
                                                        <Button onClick={() => setShowCreateModal(true)} variant="outline" className="rounded-xl mt-2">
                                                            Create your first sale
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            sales.map((s) => (
                                                <tr key={s.id} className="hover:bg-emerald-50/30 transition-colors group">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 uppercase">
                                                                {s.customer?.name[0] || '?'}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 text-base">{s.customer?.name || 'Unknown'}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">INV: {s.id.slice(-8).toUpperCase()}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <p className="font-black text-slate-900">₹{Number(s.totalAmount).toLocaleString('en-IN')}</p>
                                                    </td>
                                                    <td className="p-4 text-right font-medium text-emerald-600 font-black">
                                                        ₹{Number(s.paidAmount || 0).toLocaleString('en-IN')}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {(s.dueAmount || 0) <= 0 ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                                                                <CheckCircle2 className="h-3 w-3" /> Settled
                                                            </span>
                                                        ) : (s.paidAmount || 0) > 0 ? (
                                                            <div className="flex flex-col items-end leading-none">
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-100 mb-1">
                                                                    <Clock className="h-3 w-3" /> Partial
                                                                </span>
                                                                <span className="text-[10px] text-rose-500 font-black tracking-tighter uppercase">Due: ₹{Number(s.dueAmount).toLocaleString('en-IN')}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-end leading-none">
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-100 mb-1">
                                                                    <AlertCircle className="h-3 w-3" /> Overdue
                                                                </span>
                                                                <span className="text-[10px] text-rose-500 font-black tracking-tighter uppercase">₹{Number(s.dueAmount || 0).toLocaleString('en-IN')}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-black text-blue-700 border border-blue-100 shadow-sm">
                                                            +₹{Number(s.totalProfit || 0).toLocaleString('en-IN')}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 font-medium text-slate-500">
                                                        {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                onClick={() => handleViewBill(s.id)}
                                                                className="h-9 w-9 rounded-xl border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-all hover:scale-105"
                                                                title="View Bill"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                onClick={() => handleEditClick(s)}
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
                                            className="rounded-xl px-4 h-9 font-bold border-slate-900 bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
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

            {/* Create Sale Modal */}
            <Dialog.Root open={showCreateModal} onOpenChange={setShowCreateModal}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">

                        {/* Header */}
                        <div className="bg-slate-900 p-6 text-white flex justify-between items-center rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-emerald-500">
                                    <BadgeDollarSign className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">New Sale</h2>
                                    <p className="text-sm text-slate-400">Create customer invoice</p>
                                </div>
                            </div>
                            <Dialog.Close asChild>
                                <button className="p-2 rounded-lg hover:bg-white/10">
                                    <X className="h-5 w-5" />
                                </button>
                            </Dialog.Close>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 p-6">
                            <div className="space-y-2">
                                <Label htmlFor="customer" className="text-sm font-medium">Select Customer *</Label>
                                <select
                                    id="customer"
                                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.customerId}
                                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                    required
                                >
                                    <option value="">Choose a Buyer/Customer</option>
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </option>
                                    ))}
                                </select>
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
                                    {formData.items.map((item, index) => {
                                        const stockError = getStockError(item);
                                        const product = products.find(p => p.id === item.productId);

                                        return (
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
                                                                {product.name} ({product.unit}) - Stock: {product.currentStock}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {product && (
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            Available: {product.currentStock} {product.unit}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <Label className="text-xs font-medium mb-1 block">Quantity</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        className={cn(
                                                            "h-10 rounded-lg",
                                                            stockError && "border-rose-500 focus:ring-rose-500"
                                                        )}
                                                        value={item.quantity}
                                                        placeholder="0.00"
                                                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                        required
                                                    />
                                                    {stockError && (
                                                        <p className="text-xs text-rose-500 mt-1">{stockError}</p>
                                                    )}
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <Label className="text-xs font-medium mb-1 block">Sale Price (₹)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        className="h-10 rounded-lg"
                                                        value={item.salePrice}
                                                        placeholder="₹ 0.00"
                                                        onChange={(e) => updateItem(index, 'salePrice', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <Label className="text-xs font-medium mb-1 block">Cost (₹)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        className="h-10 rounded-lg bg-orange-50 font-bold text-orange-700 border-orange-100"
                                                        value={item.costPrice}
                                                        onChange={(e) => updateItem(index, 'costPrice', e.target.value)}
                                                        placeholder="Cost"
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
                                                {item.quantity && item.salePrice && (
                                                    <div className="sm:col-span-12 flex justify-between items-center">
                                                        <div className="bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Subtotal:</span>
                                                            <span className="text-sm font-black text-slate-900">₹{(parseFloat(item.quantity || 0) * parseFloat(item.salePrice || 0)).toLocaleString('en-IN')}</span>
                                                        </div>
                                                        {item.costPrice > 0 && (
                                                            <div className="bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 shadow-sm">
                                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mr-2">Profit:</span>
                                                                <span className="text-sm font-black text-blue-700">₹{(parseFloat(item.quantity) * (parseFloat(item.salePrice) - parseFloat(item.costPrice))).toLocaleString('en-IN')}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
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
                                        <span className="text-[10px] font-black uppercase tracking-widest">Gross Sale</span>
                                        <span className="font-bold">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400 pb-4 border-b border-white/10">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Collected</span>
                                        <span className="font-bold">₹{paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                        <span className="text-sm font-black uppercase tracking-widest">Balance Due</span>
                                        <span className={cn(
                                            "text-2xl font-black",
                                            dueAmount > 0 ? 'text-rose-400' : 'text-emerald-400'
                                        )}>
                                            ₹{dueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-black uppercase tracking-widest text-blue-400">Est. Profit</span>
                                        <span className="text-xl font-black text-blue-400">
                                            +₹{estimatedProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                                <Button
                                    type="submit"
                                    disabled={submitting || !isFormValid()}
                                    className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg flex-1 shadow-xl shadow-slate-200 transition-all border-none disabled:opacity-50"
                                >
                                    {submitting ? 'Recording Transaction...' : 'Confirm & Log Sale'}
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
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Edit Payment Modal */}
            <Dialog.Root open={showEditModal} onOpenChange={setShowEditModal}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" />
                    {/* <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[2.5rem] border-none bg-white p-10 shadow-2xl">
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="p-5 rounded-3xl bg-amber-50 text-amber-600 mb-6 shadow-inner border border-amber-100/50">
                                <Wallet className="h-8 w-8" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payment Update</h2>
                            <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Adjust Collection Status</p>
                        </div>

                        <form onSubmit={handleUpdateSale} className="space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Total Invoice Amount</Label>
                                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 text-center shadow-inner">
                                    <p className="text-xs text-slate-500 font-bold mb-1">Consolidated Sum</p>
                                    <span className="text-3xl font-black text-slate-900">
                                        ₹{editFormData.totalAmount.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="editPaidAmount" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Updated Collection (₹)</Label>
                                <div className="relative">
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

                            <div className="p-6 rounded-3xl bg-slate-900 text-white flex justify-between items-center shadow-lg">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5 text-rose-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Outstanding Balance</span>
                                </div>
                                <span className={cn(
                                    "text-xl font-black",
                                    (editFormData.totalAmount - parseFloat(editFormData.paidAmount || 0)) > 0 ? 'text-rose-400' : 'text-emerald-400'
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
                                    {submitting ? 'Updating...' : 'Authorize Adjustment'}
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
                                <Wallet className="h-6 w-6" />
                            </div>

                            <h2 className="text-xl font-bold">
                                Payment Update
                            </h2>

                            <p className="text-sm mt-1">
                                Adjust Collection Status
                            </p>

                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleUpdateSale}
                            className="space-y-6 p-8"
                        >

                            {/* Total */}
                            <div className="space-y-2">

                                <Label className="text-sm font-medium text-black">
                                    Total Amount
                                </Label>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">

                                    <p className="text-xs text-black mb-1">
                                        Invoice Total
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
                                    min="0"
                                    step="0.01"
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
                                        editFormData.totalAmount -
                                            parseFloat(editFormData.paidAmount || 0) >
                                            0
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
            <Dialog.Root open={showViewModal} onOpenChange={setShowViewModal}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl overflow-hidden">
                        {selectedSale && (
                            <>
                                {/* Header */}
                                <div className="bg-slate-900 p-6 text-white flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold">Sale Invoice</h2>
                                        <p className="text-sm text-slate-400">Ref: {selectedSale.id.slice(-8).toUpperCase()}</p>
                                    </div>
                                    <Dialog.Close className="p-2 rounded-lg hover:bg-white/10">
                                        <X className="h-5 w-5" />
                                    </Dialog.Close>
                                </div>

                                {/* Body */}
                                <div className="p-6 space-y-6">
                                    {/* Meta */}
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Customer */}
                                        <div className="space-y-1">
                                            <Label className="text-sm font-medium text-slate-600">Customer</Label>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-semibold border">
                                                    {selectedSale.customer?.name?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{selectedSale.customer?.name}</p>
                                                    <p className="text-xs text-slate-500">{selectedSale.customer?.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Date */}
                                        <div className="text-right space-y-1">
                                            <Label className="text-sm font-medium text-slate-600">Date</Label>
                                            <p className="font-semibold text-slate-900">{new Date(selectedSale.createdAt).toLocaleDateString()}</p>
                                            <span className={cn(
                                                "inline-block rounded-md px-2 py-1 text-xs font-medium",
                                                (selectedSale.dueAmount || 0) <= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                                            )}>
                                                {(selectedSale.dueAmount || 0) <= 0 ? "Settled" : "Pending"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 border-b">
                                                <tr>
                                                    <th className="p-3 text-left font-medium text-slate-600">Product</th>
                                                    <th className="p-3 text-right font-medium text-slate-600">Qty</th>
                                                    <th className="p-3 text-right font-medium text-slate-600">Price</th>
                                                    <th className="p-3 text-right font-medium text-slate-600">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {selectedSale.items?.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="p-3">
                                                            <p className="font-medium text-slate-900">{item.product?.name}</p>
                                                            <p className="text-xs text-slate-500">{item.product?.unit}</p>
                                                        </td>
                                                        <td className="p-3 text-right text-slate-600">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="p-3 text-right text-slate-600">
                                                            ₹{item.salePrice.toLocaleString()}
                                                        </td>
                                                        <td className="p-3 text-right font-semibold text-slate-900">
                                                            ₹{(item.salePrice * item.quantity).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Summary */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-end gap-6">
                                            <span className="text-slate-500">Total</span>
                                            <span className="font-semibold w-24 text-right">₹{selectedSale.totalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-end gap-6">
                                            <span className="text-slate-500">Paid</span>
                                            <span className="font-semibold text-emerald-600 w-24 text-right">₹{(selectedSale.paidAmount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-end gap-6 pt-2 border-t">
                                            <span className="font-medium">Balance</span>
                                            <span className={cn(
                                                "font-semibold text-lg w-24 text-right",
                                                (selectedSale.dueAmount || 0) > 0 ? "text-rose-500" : "text-emerald-600"
                                            )}>₹{(selectedSale.dueAmount || 0).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4 border-t">
                                        <Button onClick={handlePrintBill} className="flex-1 h-12 rounded-xl font-semibold">
                                            <Printer className="mr-2 h-4 w-4" />
                                            Print
                                        </Button>
                                        <Dialog.Close asChild>
                                            <Button variant="outline" className="h-12 rounded-xl border-slate-200">
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
        </div >
    );
}
