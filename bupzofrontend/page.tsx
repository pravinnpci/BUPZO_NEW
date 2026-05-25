'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sun, Moon, ShoppingCart, User, Search, Menu } from 'lucide-react';

// Placeholder for BUPZO Logo (replace with actual SVG/Image)
const BupzoLogo = () => (
  <div className="font-heading text-2xl font-bold text-charcoal dark:text-almond-silk">
    BUPZO
  </div>
);

// Dummy data for demonstration
const categories = [
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Halwa', imageUrl: 'https://picsum.photos/id/10/200/200' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', name: 'Dry Fruits', imageUrl: 'https://picsum.photos/id/11/200/200' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', name: 'Toys', imageUrl: 'https://picsum.photos/id/12/200/200' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', name: 'Electronics', imageUrl: 'https://picsum.photos/id/13/200/200' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', name: 'Ceramics', imageUrl: 'https://picsum.photos/id/14/200/200' },
];

const featuredProducts = [
  { id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', name: 'Nagore Special Ghee Halwa', price: 450, imageUrl: 'https://picsum.photos/id/101/300/300' },
  { id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', name: 'Educational Building Blocks', price: 750, imageUrl: 'https://picsum.photos/id/103/300/300' },
  { id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', name: 'Wireless Bluetooth Earbuds', price: 1299, imageUrl: 'https://picsum.photos/id/104/300/300' },
];

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setDarkMode(true);
    }
  };

  return (
    <div className="min-h-screen bg-almond-silk text-charcoal dark:bg-charcoal dark:text-almond-silk font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-almond-silk/80 dark:bg-charcoal/80 backdrop-blur-sm shadow-sm">
        <nav className="container mx-auto p-4 flex items-center justify-between">
          <BupzoLogo />
          <div className="flex items-center space-x-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-dim-grey/20 dark:hover:bg-dust-grey/20 transition-colors">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link href="/search" className="p-2 rounded-full hover:bg-dim-grey/20 dark:hover:bg-dust-grey/20 transition-colors">
              <Search size={20} />
            </Link>
            <Link href="/cart" className="p-2 rounded-full hover:bg-dim-grey/20 dark:hover:bg-dust-grey/20 transition-colors">
              <ShoppingCart size={20} />
            </Link>
            <Link href="/profile" className="p-2 rounded-full hover:bg-dim-grey/20 dark:hover:bg-dust-grey/20 transition-colors">
              <User size={20} />
            </Link>
            <button className="lg:hidden p-2 rounded-full hover:bg-dim-grey/20 dark:hover:bg-dust-grey/20 transition-colors">
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-64 md:h-96 bg-dim-grey rounded-lg overflow-hidden mb-8 shadow-lg"
        >
          <Image src="https://picsum.photos/id/200/1200/400" alt="Hero Banner" layout="fill" objectFit="cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h1 className="text-4xl md:text-6xl font-heading text-almond-silk text-center drop-shadow-lg">
              Welcome to BUPZO
            </h1>
          </div>
        </motion.section>

        {/* Categories Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-heading text-charcoal dark:text-almond-silk mb-4">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link href={`/category/${category.id}`} key={category.id} className="block">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white dark:bg-dim-grey rounded-lg shadow-md overflow-hidden text-center p-4"
                >
                  <Image src={category.imageUrl} alt={category.name} width={100} height={100} className="mx-auto mb-2 rounded-full" />
                  <p className="font-sans text-lg font-medium">{category.name}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Featured Products Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-3xl font-heading text-charcoal dark:text-almond-silk mb-4">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id} className="block">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="bg-white dark:bg-dim-grey rounded-lg shadow-md overflow-hidden"
                >
                  <Image src={product.imageUrl} alt={product.name} width={400} height={300} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-heading text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="font-sans text-lg font-bold text-dusty-mauve">₹{product.price.toFixed(2)}</p>
                    <button className="mt-4 w-full bg-dusty-mauve text-white dark:bg-almond-silk dark:text-charcoal py-2 rounded-md hover:opacity-90 transition-opacity">
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-charcoal dark:bg-dim-grey text-almond-silk p-8 mt-8">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-heading text-xl mb-4">BUPZO</h3>
            <p className="text-sm">The Next-Gen AI-Powered Multi-Vendor E-commerce Platform.</p>
          </div>
          <div>
            <h3 className="font-heading text-xl mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-xl mb-4">Connect</h3>
            <p className="text-sm">Email: hello@bupzo.com</p>
            <p className="text-sm">WhatsApp: +91 9245464648</p>
          </div>
        </div>
        <div className="text-center text-sm mt-8">
          &copy; {new Date().getFullYear()} BUPZO. All rights reserved.
        </div>
      </footer>
    </div>
  );
}