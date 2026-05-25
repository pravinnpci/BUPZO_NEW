"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Menu, Bell, User } from "lucide-react";
import { useState } from "react";

const AdminHeader = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Users", path: "/admin/users" },
    { name: "Sellers", path: "/admin/sellers" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Products", path: "/admin/products" },
    { name: "Settings", path: "/admin/settings" },
  ];

  return (
    <header className="bg-neutral-900 text-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">BUPZO Admin</span>
            </Link>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`text-neutral-300 hover:text-white px-3 py-2 text-sm font-medium ${
                    pathname === item.path ? "border-b-2 border-primary-500" : ""
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-neutral-800">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-neutral-800">
              <User className="h-5 w-5" />
            </button>
            <button
              className="md:hidden p-2 rounded-full hover:bg-neutral-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-neutral-900 border-t border-neutral-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium text-neutral-300 hover:text-white ${
                  pathname === item.path ? "bg-neutral-800" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;