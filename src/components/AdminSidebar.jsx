import Link from "next/link";

export default function AdminSidebar() {
  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Traders", path: "/traders" },
    { name: "Reports", path: "/reports" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <aside className="w-60 bg-blue-800 text-white min-h-screen p-4">
      <h1 className="text-xl font-bold mb-6">
        Admin Panel
      </h1>

      {menu.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className="block py-2 px-3 rounded hover:bg-blue-700"
        >
          {item.name}
        </Link>
      ))}
    </aside>
  );
}
