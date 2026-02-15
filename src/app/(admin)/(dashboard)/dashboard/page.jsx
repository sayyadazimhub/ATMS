// 'use client';

// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { TrendingUp, ShoppingCart, Wallet, AlertTriangle } from 'lucide-react';

// export default function DashboardPage() {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     axios
//       .get('/api/dashboard')
//       .then((res) => setData(res.data))
//       .catch(() => toast.error('Failed to load dashboard'))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex min-h-[40vh] items-center justify-center">
//         <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
//       </div>
//     );
//   }

//   const s = data?.summary || {};
//   const lowStock = data?.lowStockProducts || [];
//   const recent = data?.recentTransactions || {};

//   const stats = [
//     {
//       label: 'Total sales',
//       value: `₹${Number(s.totalSales || 0).toLocaleString()}`,
//       icon: TrendingUp,
//       className: 'text-green-600',
//     },
//     {
//       label: 'Total purchases',
//       value: `₹${Number(s.totalPurchases || 0).toLocaleString()}`,
//       icon: ShoppingCart,
//       className: 'text-blue-600',
//     },
//     {
//       label: 'Total profit',
//       value: `₹${Number(s.totalProfit || 0).toLocaleString()}`,
//       icon: Wallet,
//       className: 'text-violet-600',
//     },
//     {
//       label: 'Due to providers',
//       value: `₹${Number(s.totalDueToProviders || 0).toLocaleString()}`,
//       icon: Wallet,
//       className: 'text-amber-600',
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
//         <p className="text-muted-foreground">Overview of your crop trading business</p>
//       </div>

//       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         {stats.map((item) => (
//           <Card key={item.label}>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">
//                 {item.label}
//               </CardTitle>
//               <item.icon className={`h-4 w-4 ${item.className}`} />
//             </CardHeader>
//             <CardContent>
//               <p className="text-2xl font-bold">{item.value}</p>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {lowStock.length > 0 && (
//         <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
//           <CardHeader className="pb-2">
//             <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
//               <AlertTriangle className="h-5 w-5" />
//               Low stock
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
//               {lowStock.map((p) => (
//                 <li
//                   key={p.id}
//                   className="rounded-md border bg-background px-3 py-2 text-sm"
//                 >
//                   <span className="font-medium">{p.name}</span>
//                   <span className="ml-2 text-muted-foreground">
//                     {p.currentStock} {p.unit}
//                   </span>
//                 </li>
//               ))}
//             </ul>
//           </CardContent>
//         </Card>
//       )}

//       <div className="grid gap-6 lg:grid-cols-2">
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent sales</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {recent.sales?.length ? (
//               <ul className="space-y-2">
//                 {recent.sales.map((sale) => (
//                   <li
//                     key={sale.id}
//                     className="flex justify-between rounded-lg border p-3 text-sm"
//                   >
//                     <div>
//                       <p className="font-medium">{sale.customer?.name}</p>
//                       <p className="text-muted-foreground">
//                         {new Date(sale.createdAt).toLocaleDateString()}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-semibold text-green-600">
//                         ₹{Number(sale.totalAmount).toLocaleString()}
//                       </p>
//                       <p className="text-muted-foreground">
//                         Profit ₹{Number(sale.totalProfit || 0).toLocaleString()}
//                       </p>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className="text-sm text-muted-foreground">No recent sales</p>
//             )}
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent purchases</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {recent.purchases?.length ? (
//               <ul className="space-y-2">
//                 {recent.purchases.map((p) => (
//                   <li
//                     key={p.id}
//                     className="flex justify-between rounded-lg border p-3 text-sm"
//                   >
//                     <div>
//                       <p className="font-medium">{p.provider?.name}</p>
//                       <p className="text-muted-foreground">
//                         {new Date(p.createdAt).toLocaleDateString()}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-semibold text-blue-600">
//                         ₹{Number(p.totalAmount).toLocaleString()}
//                       </p>
//                       <p className="text-muted-foreground">
//                         Due ₹{Number(p.dueAmount || 0).toLocaleString()}
//                       </p>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className="text-sm text-muted-foreground">No recent purchases</p>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

export default function AdminDashboard() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <Card title="Total Traders" value="0" />
        <Card title="Total Sales" value="₹0" />
        <Card title="System Users" value="0" />
        <Card title="Reports" value="0" />

      </div>
    </>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  );
}
