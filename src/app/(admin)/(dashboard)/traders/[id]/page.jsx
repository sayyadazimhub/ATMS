'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft, Users, Package, TrendingUp,
    ShoppingCart, Truck, Calendar, Mail,
    Phone, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TraderProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTraderDetail();
    }, [id]);

    const fetchTraderDetail = async () => {
        try {
            const res = await axios.get(`/api/admin/traders/${id}`);
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch trader detail:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-bold text-slate-900">Trader not found</h2>
                <Button onClick={() => router.back()} variant="ghost" className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    const { profile, business, recentSales } = data;

    const stats = [
        { label: 'Revenue', value: `₹${Number(business.totalRevenue).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Gross Profit', value: `₹${Number(business.totalProfit).toLocaleString()}`, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Customers', value: business.totalCustomers, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
        { label: 'Products', value: business.totalProducts, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button onClick={() => router.back()} variant="outline" size="icon" className="rounded-xl h-12 w-12">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
                        <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                            Trade Specialist • Joined {new Date(profile.joined).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2",
                    profile.is_active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                )}>
                    {profile.is_active ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                    {profile.is_active ? 'Account Secure' : 'Account Suspended'}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => (
                    <Card key={s.label} className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                                    <p className="text-2xl font-black text-slate-900">{s.value}</p>
                                </div>
                                <div className={cn("p-3 rounded-xl", s.bg)}>
                                    <s.icon className={cn("h-6 w-6", s.color)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Contact & Info */}
                <Card className="border-slate-200">
                    <CardHeader className="border-b bg-slate-50">
                        <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 italic font-medium">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{profile.email}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 italic font-medium">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{profile.phone || 'No phone recorded'}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 italic font-medium">
                            <Truck className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{business.totalProviders} Active Providers</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Sales History */}
                <Card className="lg:col-span-2 border-slate-200">
                    <CardHeader className="border-b bg-slate-50">
                        <CardTitle className="text-lg">Recent Trading History</CardTitle>
                        <CardDescription>Most recent transactions initiated by this trader</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentSales.length > 0 ? (
                            <div className="divide-y">
                                {recentSales.map((sale) => (
                                    <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold">
                                                {sale.customer.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{sale.customer}</p>
                                                <p className="text-xs text-slate-500">{new Date(sale.date).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-900">₹{sale.amount.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                                Profit: ₹{sale.profit.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center text-slate-400">No transactions recorded yet</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
