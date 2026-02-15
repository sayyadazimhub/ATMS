import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";

export const metadata = {
  title: "CTMS Admin",
};

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex bg-gray-100">
        <AdminSidebar />

        <div className="flex-1">
          <AdminHeader />
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}