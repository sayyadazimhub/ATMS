'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Download, X, Plus, Trash2, Edit2, Printer } from 'lucide-react';

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
    fetch(`/api/sales?page=${pagination.page}`)
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
        fetch('/api/customers?limit=100'),
        fetch('/api/products?limit=100'),
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
      const res = await fetch(`/api/sales/${saleId}`);
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
      const res = await fetch(`/api/sales/${editFormData.id}`, {
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
        <title>Sale Invoice - ${selectedSale.id.slice(-8)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { margin: 0 0 10px 0; color: #333; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .box { width: 48%; border: 1px solid #eee; padding: 15px; border-radius: 8px; background: #f9f9f9; }
          .box h3 { margin: 0 0 10px 0; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .text-right { text-align: right; }
          .totals { margin-left: auto; width: 300px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .totals p { display: flex; justify-content: space-between; margin: 8px 0; }
          .total-row { font-weight: bold; font-size: 1.1em; border-top: 1px solid #ddd; padding-top: 8px; margin-top: 8px; }
          .footer { margin-top: 50px; text-align: center; font-size: 0.9em; color: #666; }
          @media print {
            body { padding: 20px; }
            .box { background: none; border: 1px solid #000; }
            th { background-color: #eee !important; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SALE INVOICE</h1>
          <p>Invoice #: ${selectedSale.id.slice(-8).toUpperCase()} &nbsp;|&nbsp; Date: ${new Date(selectedSale.createdAt).toLocaleDateString('en-IN')}</p>
        </div>

        <div class="meta">
          <div class="box">
            <h3>Bill To</h3>
            <p><strong>Name:</strong> ${selectedSale.customer?.name || 'Unknown'}</p>
            ${selectedSale.customer?.phone ? `<p><strong>Phone:</strong> ${selectedSale.customer.phone}</p>` : ''}
            ${selectedSale.customer?.address ? `<p><strong>Address:</strong> ${selectedSale.customer.address}</p>` : ''}
          </div>
          <div class="box">
            <h3>From</h3>
            <p><strong>Company:</strong> Sayyad Traders</p>
            <p><strong>Status:</strong> ${(selectedSale.dueAmount || 0) > 0 ? 'Payment Due' : 'Paid'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%">#</th>
              <th style="width: 40%">Product</th>
              <th style="width: 15%" class="text-right">Quantity</th>
              <th style="width: 20%" class="text-right">Unit Price</th>
              <th style="width: 20%" class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${selectedSale.items?.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>
                  ${item.product?.name || 'Unknown'}
                  ${item.product?.unit ? `<br><small style="color: #666">(${item.product.unit})</small>` : ''}
                </td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">₹${item.salePrice.toLocaleString('en-IN')}</td>
                <td class="text-right">₹${(item.salePrice * item.quantity).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <p><span>Total Amount:</span> <span>₹${selectedSale.totalAmount.toLocaleString('en-IN')}</span></p>
          <p><span>Paid Amount:</span> <span>₹${(selectedSale.paidAmount || 0).toLocaleString('en-IN')}</span></p>
          <p class="total-row"><span>Due Amount:</span> <span>₹${(selectedSale.dueAmount || 0).toLocaleString('en-IN')}</span></p>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
        </div>

        <script>
          window.onload = function() { window.print(); }
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

    // Auto-fill price if product selected
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].costPrice = product.costPrice || 0;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const getStockError = (item) => {
    if (!item.productId || !item.quantity) return null;
    const product = products.find(p => p.id === item.productId);
    if (!product) return null;

    // Check if quantity exceeds stock
    if (parseFloat(item.quantity) > product.currentStock) {
      return `Exceeds stock! (Available: ${product.currentStock} ${product.unit})`;
    }
    return null;
  };

  // Check if form is valid
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert('Please fix validation errors');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/sales', {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">Sales history and profit tracking</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left font-medium">Customer</th>
                      <th className="p-3 text-right font-medium">Amount</th>
                      <th className="p-3 text-right font-medium">Paid</th>
                      <th className="p-3 text-right font-medium">Due</th>
                      <th className="p-3 text-right font-medium">Profit</th>
                      <th className="p-3 text-left font-medium">Date</th>
                      <th className="p-3 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-muted-foreground">
                          No sales found
                        </td>
                      </tr>
                    ) : (
                      sales.map((s) => (
                        <tr key={s.id} className="border-b last:border-0">
                          <td className="p-3 font-medium">{s.customer?.name || 'Unknown'}</td>
                          <td className="p-3 text-right text-green-600">
                            ₹{Number(s.totalAmount).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 text-right">₹{Number(s.paidAmount || 0).toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right">₹{Number(s.dueAmount || 0).toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right text-blue-600">₹{Number(s.totalProfit || 0).toLocaleString('en-IN')}</td>
                          <td className="p-3 text-muted-foreground">
                            {new Date(s.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="p-3">
                            <div className="flex justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewBill(s.id)}
                                title="View Bill"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditClick(s)}
                                title="Edit Payment"
                              >
                                <Edit2 className="h-4 w-4" />
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
                <div className="mt-4 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-2 text-sm text-muted-foreground">
                    {pagination.page} / {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Sale Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-background p-6 shadow-xl">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-6 text-2xl font-bold">New Sale</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <select
                  id="customer"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Items *</Label>
                  <Button type="button" size="sm" onClick={addItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                {formData.items.map((item, index) => {
                  const stockError = getStockError(item);

                  return (
                    <div key={index} className="grid gap-4 rounded-lg border p-4 sm:grid-cols-4">
                      <div className="sm:col-span-2">
                        <Label>Product</Label>
                        <select
                          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={item.productId}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                          required
                        >
                          <option value="">Select Product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} (Stock: {product.currentStock} {product.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className={`mt-1 ${stockError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          required
                        />
                        {stockError && (
                          <p className="mt-1 text-xs text-red-500 font-medium">
                            {stockError}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label>Sale Price (₹)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="mt-1"
                            value={item.salePrice}
                            onChange={(e) => updateItem(index, 'salePrice', e.target.value)}
                            required
                          />
                        </div>
                        {formData.items.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="mt-6"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {item.quantity && item.salePrice && (
                        <div className="sm:col-span-4 text-right text-sm text-muted-foreground">
                          Item Total: ₹{(parseFloat(item.quantity) * parseFloat(item.salePrice)).toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="paidAmount">Paid Amount (₹)</Label>
                  <Input
                    id="paidAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <span>₹{paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Due Amount:</span>
                  <span className={`font-bold ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{dueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting || !isFormValid()} className="flex-1">
                  {submitting ? 'Creating...' : 'Create Sale'}
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
          </div>
        </div>
      )}

      {/* Edit Sale Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="mb-6 text-xl font-bold">Edit Sale Payment</h2>

            <form onSubmit={handleUpdateSale} className="space-y-6">
              <div className="space-y-2">
                <Label>Total Amount</Label>
                <div className="rounded-md border bg-muted p-3">
                  ₹{editFormData.totalAmount.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPaidAmount">Paid Amount (₹)</Label>
                <Input
                  id="editPaidAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.paidAmount}
                  onChange={(e) => setEditFormData({ ...editFormData, paidAmount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex justify-between font-medium">
                  <span>New Due Amount:</span>
                  <span className={(editFormData.totalAmount - editFormData.paidAmount) > 0 ? 'text-red-600' : 'text-green-600'}>
                    ₹{(editFormData.totalAmount - parseFloat(editFormData.paidAmount || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Updating...' : 'Update Payment'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Bill Modal */}
      {showViewModal && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-background p-6 shadow-xl">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Sale Invoice</h2>
                <p className="text-sm text-muted-foreground">
                  Invoice No: {selectedSale.id.slice(-8).toUpperCase()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Date: {new Date(selectedSale.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">Customer Details</h3>
                <p><strong>Name:</strong> {selectedSale.customer?.name || 'Unknown'}</p>
                {selectedSale.customer?.phone && (
                  <p><strong>Phone:</strong> {selectedSale.customer.phone}</p>
                )}
                {selectedSale.customer?.address && (
                  <p><strong>Address:</strong> {selectedSale.customer.address}</p>
                )}
              </div>

              <div className="rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left">#</th>
                      <th className="p-3 text-left">Product</th>
                      <th className="p-3 text-right">Quantity</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items?.map((item, index) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3">{item.product?.name || 'Unknown'}</td>
                        <td className="p-3 text-right">
                          {item.quantity} {item.product?.unit || ''}
                        </td>
                        <td className="p-3 text-right">₹{item.salePrice.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right">
                          ₹{(item.salePrice * item.quantity).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold">₹{selectedSale.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                {/* Only show paid/due if the sale has these fields, which new ones will */}
                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <span>₹{(selectedSale.paidAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Due Amount:</span>
                  <span className={`font-bold ${(selectedSale.dueAmount || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{(selectedSale.dueAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handlePrintBill} className="flex-1">
                  <Printer className="mr-2 h-4 w-4" />
                  Print Bill
                </Button>
                <Button variant="outline" onClick={() => setShowViewModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
