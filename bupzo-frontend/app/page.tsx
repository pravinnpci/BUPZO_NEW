'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import AuthModal from '@/components/AuthModal';
import { fetchProducts } from '@/lib/api';
import FlashSaleCard from '@/components/FlashSaleCard';
import Notification from '@/components/Notification';
import SpinWin from '@/components/SpinWin';
import Wishlist from '@/components/Wishlist';
import { useWebSocket } from '@/lib/websocket';

export default function Home() {
  const [userRole, setUserRole] = useState<'customer' | 'seller' | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Simulate role detection (e.g., from auth state)
    const randomRole = Math.random() > 0.5 ? 'customer' : 'seller';
    setUserRole(randomRole);

    // Fetch products from API
    const loadProducts = async () => {
      const products = await fetchProducts();
      setProducts(products);
    };
    loadProducts();
  }, []);

  const { messages } = useWebSocket(1); // Using a dummy userId for demo purposes

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-dust-grey">
        <Notification messages={messages} />
        {/* Dark/Light Mode Toggle & Login Button */}
        <div className="fixed top-4 right-4 z-50 flex space-x-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full bg-charcoal text-white"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => setShowAuthModal(true)}
            className="p-2 rounded-full bg-charcoal text-white"
          >
            👤
          </button>
        </div>

        {/* Left Sidebar Navigation */}
        <div className="fixed left-0 top-0 h-full w-64 bg-charcoal text-white p-4">
          <nav>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-almond-silk hover:text-dusty-mauve">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="text-almond-silk hover:text-dusty-mauve">
                  Products
                </a>
              </li>
              <li>
                <a href="/cart" className="text-almond-silk hover:text-dusty-mauve">
                  Cart
                </a>
              </li>
              <li>
                <a href="#" className="text-almond-silk hover:text-dusty-mauve">
                  Orders
                </a>
              </li>
              {userRole === 'seller' && (
                <li>
                  <a href="#" className="text-almond-silk hover:text-dusty-mauve">
                    Inventory
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="ml-64 p-8">
          {/* Hero Section with Image Slider */}
          <div className="relative h-96 bg-dusty-mauve rounded-lg overflow-hidden mb-8">
            <Image
              src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="Hero Banner"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-heading">
              Welcome to BUPZO
            </div>
          </div>

          {/* Unified App Logic - Conditional Rendering */}
          <div className="bg-white dark:bg-charcoal rounded-lg p-6 shadow-lg">
            <h1 className="text-3xl font-heading text-charcoal dark:text-almond-silk mb-4">
              {userRole === 'customer' ? 'Customer Dashboard' : 'Seller Dashboard'}
            </h1>
            <p className="text-dim-grey dark:text-dust-grey mb-4">
              {userRole === 'customer'
                ? 'Explore products and manage your orders.'
                : 'Manage your products and track sales.'}
            </p>

            {/* Placeholder for Customer/Seller Content */}
            {userRole === 'customer' ? (
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-4 md:col-span-1">
                  <Wishlist />
                </div>
                <div className="col-span-4 md:col-span-1">
                  <SpinWin />
                </div>
                <div className="bg-almond-silk p-4 rounded-lg">
                  <h3 className="font-heading text-charcoal mb-4">New Arrivals</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <ProductCard
                      id={1}
                      name="Halwa Box"
                      price={299.99}
                      imageUrl="https://via.placeholder.com/300x200?text=Halwa+Box"
                      description="Assorted flavors of traditional Indian halwa"
                    />
                    <ProductCard
                      id={2}
                      name="Dry Fruits Mix"
                      price={199.99}
                      imageUrl="https://via.placeholder.com/300x200?text=Dry+Fruits"
                      description="Mixed dry fruits for health benefits"
                      isCombo={true}
                    />
                  </div>
                </div>
                <div className="bg-almond-silk p-4 rounded-lg">
                  <h3 className="font-heading text-charcoal mb-4">Wishlist</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <ProductCard
                      id={3}
                      name="Ceramic Mug"
                      price={499.99}
                      imageUrl="https://via.placeholder.com/300x200?text=Ceramic+Mug"
                      description="Handcrafted ceramic mug"
                    />
                    <ProductCard
                      id={4}
                      name="Home Appliance"
                      price={1299.99}
                      imageUrl="https://via.placeholder.com/300x200?text=Appliance"
                      description="Modern kitchen appliance"
                    />
                  </div>
                </div>
                <div className="bg-almond-silk p-4 rounded-lg">
                  <h3 className="font-heading text-charcoal mb-4">Flash Sales</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {products
                      .filter(product => product.flashSale)
                      .slice(0, 4)
                      .map(product => (
                        <FlashSaleCard
                          key={product.id}
                          id={product.id}
                          name={product.name}
                          price={product.price}
                          discountPercent={product.flashSaleDiscount || 0}
                          imageUrl={product.imageUrl}
                          endTime={product.flashSaleEndTime || new Date(Date.now() + 86400000).toISOString()}
                        />
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-almond-silk p-4 rounded-lg">
                  <h3 className="font-heading text-charcoal mb-4">Product Management</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <ProductCard
                      id={7}
                      name="Product 1"
                      price={149.99}
                      imageUrl="https://via.placeholder.com/300x200?text=Product+1"
                      description="Sample product for seller"
                    />
                    <ProductCard
                      id={8}
                      name="Product 2"
                      price={249.99}
                      imageUrl="https://via.placeholder.com/300x200?text=Product+2"
                      description="Another sample product"
                    />
                  </div>
                </div>
                <div className="bg-almond-silk p-4 rounded-lg">
                  <h3 className="font-heading text-charcoal mb-4">Sales Analytics</h3>
                  <p className="text-dim-grey dark:text-dust-grey">Track your sales performance here.</p>
                </div>
                <div className="bg-almond-silk p-4 rounded-lg">
                  <h3 className="font-heading text-charcoal mb-4">Orders</h3>
                  <p className="text-dim-grey dark:text-dust-grey">View and manage your orders here.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Responsive Hamburger Menu */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button className="p-2 rounded-full bg-charcoal text-white">
            ☰
          </button>
        </div>
      </div>
    </ThemeProvider>
  );
}