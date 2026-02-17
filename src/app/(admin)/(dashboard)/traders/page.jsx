'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  ShieldX,
  Eye,
  Edit2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function TradersPage() {
  const router = useRouter();
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTraders = () => {
    setLoading(true);
    axios.get(`/api/admin/traders?search=${search}`)
      .then((res) => setTraders(res.data.traders))
      .catch(() => toast.error('Failed to load traders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTraders();
  }, [search]);

  const filteredTraders = traders.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await axios.put('/api/admin/traders', { id, status: newStatus });
      toast.success(`Trader ${newStatus === 'active' ? 'activated' : 'suspended'}`);
      fetchTraders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trader account? This action cannot be undone.')) return;

    try {
      await axios.delete(`/api/admin/traders?id=${id}`);
      toast.success('Trader account deleted successfully');
      fetchTraders();
    } catch (error) {
      toast.error('Failed to delete trader');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-900 text-white">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Traders Management</h1>
            <p className="text-sm text-slate-500">View and manage all registered trading accounts</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10 h-10 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="h-10 rounded-xl gap-2 border-slate-200">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" className="h-10 rounded-xl gap-2 border-slate-200">
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Traders Table */}
      <Card className="border-slate-200 overflow-hidden">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle className="text-lg">Registered Traders</CardTitle>
          <CardDescription>A list of all traders including their details and account status.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[300px]">Trader Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <div className="h-12 w-full animate-pulse bg-slate-100 rounded-lg" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredTraders.length > 0 ? (
                filteredTraders.map((trader) => (
                  <TableRow key={trader.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold shrink-0">
                          {trader.name?.charAt(0) || 'T'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-900 truncate">{trader.name}</p>
                          <div className="flex flex-col text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1 truncate"><Mail className="h-3 w-3" /> {trader.email}</span>
                            <span className="flex items-center gap-1 truncate"><Phone className="h-3 w-3" /> {trader.phone}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={trader.is_active ? 'secondary' : 'destructive'}
                        className={cn(
                          'rounded-lg px-2.5 py-0.5 font-medium',
                          trader.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                        )}
                      >
                        {trader.is_active ? 'Active' : 'Suspended'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4" />
                        {trader.joined ? new Date(trader.joined).toLocaleDateString() : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">
                          ₹{Number(trader.revenue || 0).toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                          {Number(trader.transactions || 0).toLocaleString()} orders
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                        ₹{Number(trader.profit || 0).toLocaleString('en-IN')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/traders/${trader.id}`)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            View Full Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => toggleStatus(trader.id, trader.is_active ? 'active' : 'suspended')}
                            className={cn("cursor-pointer", trader.is_active ? "text-rose-600" : "text-emerald-600")}
                          >
                            {trader.is_active ? (
                              <><ShieldX className="mr-2 h-4 w-4" /> Suspend Account</>
                            ) : (
                              <><ShieldCheck className="mr-2 h-4 w-4" /> Activate Account</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(trader.id)}
                            className="text-rose-600 font-semibold focus:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    No traders found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
