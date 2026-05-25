"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, User, Settings, Store, DollarSign, Menu, LogOut } from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Products", path: "/products", icon: <ShoppingCart className="h-5 w-5" /> },
    { name: "Dashboard", path: "/dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "Orders", path: "/orders", icon: <ShoppingCart className="h-5 w-5" /> },
    { name: "Wallet", path: "/wallet", icon: <DollarSign className="h-5 w-5" /> },
    { name: "Profile", path: "/profile", icon: <User className="h-5 w-5" /> },
    { name: "Settings", path: "/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const sellerNavItems = [
    { name: "Seller Dashboard", path: "/seller/dashboard", icon: <Store className="h-5 w-5" /> },
    { name: "Products", path: "/seller/products", icon: <ShoppingCart className="h-5 w-5" /> },
    { name: "Orders", path: "/seller/orders", icon: <ShoppingCart className="h-5 w-5" /> },
    { name: "Payouts", path: "/seller/payouts", icon: <DollarSign className="h-5 w-5" /> },
    { name: "Shop Settings", path: "/seller/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const adminNavItems = [
    { name: "Admin Dashboard", path: "/admin/dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "Users", path: "/admin/users", icon: <User className="h-5 w-5" /> },
    { name: "Sellers", path: "/admin/sellers", icon: <Store className="h-5 w-5" /> },
    { name: "Orders", path: "/admin/orders", icon: <ShoppingCart className="h-5 w-5" /> },
    { name: "Products", path: "/admin/products", icon: <ShoppingCart className="h-5 w-5" /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const getNavItems = () => {
    if (pathname?.startsWith("/seller")) {
      return sellerNavItems;
    } else if (pathname?.startsWith("/admin")) {
      return adminNavItems;
    } else {
      return navItems;
    }
  };

  return (
    <div className={`fixed left-0 top-0 bottom-0 z-50 flex flex-col ${isCollapsed ? "w-16" : "w-64"} bg-neutral-900 text-white transition-all duration-300`}>
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        <div className="flex items-center">
          {!isCollapsed && (
            <h1 className="text-xl font-bold">BUPZO</h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto p-2 rounded-full hover:bg-neutral-800 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {getNavItems().map((item) => (
            <li key={item.name}>
              <Link
                href={item.path}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  pathname === item.path
                    ? "bg-primary-500 text-white"
                    : "hover:bg-neutral-800 text-neutral-300"
                }`}
              >
                <div className="mr-3">{item.icon}</div>
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-neutral-800">
        <button className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors">
          <LogOut className="h-5 w-5 mr-3" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;