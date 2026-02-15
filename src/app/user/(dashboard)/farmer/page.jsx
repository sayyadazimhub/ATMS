// export default function Farmers() {
//   return (
//     <>
//       <Header title="Farmers" />

//       <Table
//         columns={["Name", "Phone", "Village"]}
//       />
//     </>
//   );
// }

// function Header({ title }) {
//   return (
//     <div className="flex justify-between mb-4">
//       <h1 className="text-xl font-bold">{title}</h1>

//       <button className="bg-green-600 text-white px-3 py-1 rounded">
//         Add Farmer
//       </button>
//     </div>
//   );
// }

// function Table({ columns }) {
//   return (
//     <div className="bg-white rounded shadow">
//       <table className="w-full">
//         <thead className="bg-gray-100">
//           <tr>
//             {columns.map((c) => (
//               <th key={c} className="p-2 text-left">
//                 {c}
//               </th>
//             ))}
//           </tr>
//         </thead>

//         <tbody>
//           <tr className="border-t text-center">
//             <td colSpan={columns.length} className="p-4">
//               No Farmers Found
//             </td>
//           </tr>
//         </tbody>
//       </table>
//     </div>
//   );
// }


'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = () => {
    setLoading(true);
    axios
      .get(`/api/customers?page=${pagination.page}&search=${search}`)
      .then((res) => {
        setCustomers(res.data.customers);
        setPagination(res.data.pagination);
      })
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, search]);

  const handleOpen = (customer = null) => {
    setEditing(customer);
    setForm(
      customer
        ? { name: customer.name, phone: customer.phone || '', address: customer.address || '' }
        : { name: '', phone: '', address: '' }
    );
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await axios.put(`/api/customers/${editing.id}`, form);
        toast.success('Customer updated');
      } else {
        await axios.post('/api/customers', form);
        toast.success('Customer added');
      }
      setOpen(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await axios.delete(`/api/customers/${id}`);
      toast.success('Deleted');
      fetchCustomers();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Buyers and contacts</p>
        </div>
        <Button onClick={() => handleOpen()} className="sm:shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Add customer
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>All customers</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px] text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium">Name</th>
                    <th className="p-3 text-left font-medium">Phone</th>
                    <th className="p-3 text-left font-medium hidden md:table-cell">Address</th>
                    <th className="p-3 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="p-3 font-medium">{c.name}</td>
                      <td className="p-3 text-muted-foreground">{c.phone || '—'}</td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell truncate max-w-[200px]">{c.address || '—'}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpen(c)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold">
              {editing ? 'Edit customer' : 'Add customer'}
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
