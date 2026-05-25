"use client";

/**
 * BUPZO - Landing Page
 */
import { cn } from "../utils/index";
import { useCartStore } from "../store/cartStore";
import Image from 'next/image';
import { Skeleton } from '../components/ui/skeleton';
import { useState, useEffect, CSSProperties } from 'react';

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

const heroSlides = [
  {
    id: 1,
    title: 'Discover Nagore Specialties',
    description: 'Authentic Halwa, Dry Fruits, and Gourmet Treats',
    image: 'https://images.unsplash.com/photo-1604328108342-234b40f09003?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
  {
    id: 2,
    title: 'Premium Quality Products',
    description: 'Handpicked by Local Artisans',
    image: 'https://images.unsplash.com/photo-1598214886806-c2896e899622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
  {
    id: 3,
    title: 'Fast & Reliable Shipping',
    description: 'Across India in 2-3 Business Days',
    image: 'https://images.unsplash.com/photo-1581092580960-959e007056c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
];

const stats = [
  { id: 1, label: 'Vendors', value: 100, target: 150 },
  { id: 2, label: 'Products', value: 500, target: 1000 },
  { id: 3, label: 'Orders', value: 2000, target: 5000 },
  { id: 4, label: 'Customers', value: 5000, target: 10000 },
];

const AnimatedCounter = ({ value, target }: { value: number; target: number }) => {
  const [count, setCount] = useState<number>(value);

  useEffect(() => {
    if (count < target) {
      const interval = setInterval(() => {
        setCount((prevCount: number) => {
          const newCount = prevCount + 1;
          return newCount >= target ? target : newCount;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [count, target]);

  return (
    <div className="text-center">
      <div className="text-4xl font-bold mb-2">
        <span className="counter" style={{ '--target': target } as CSSProperties}>
          {count}
        </span>
      </div>
      <p className="text-sm text-dim-grey dark:text-dust-grey">{value}%</p>
    </div>
  );
};

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide: number) => (prevSlide + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-lg mb-12">
      <div className="flex transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {heroSlides.map((slide) => (
          <div key={slide.id} className="w-full h-full flex items-center justify-center">
            <div className="text-center p-8">
              <h2 className="text-3xl font-bold mb-4 text-dusty-mauve">{slide.title}</h2>
              <p className="text-lg mb-6 text-dim-grey dark:text-dust-grey">{slide.description}</p>
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CategoryCard = ({ category }: { category: Category }) => {
  return (
    <div className="bg-white dark:bg-charcoal rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-dim-grey dark:bg-dust-grey flex items-center justify-center">
        <Image
          src={`https://images.unsplash.com/photo-1598214886806-c2896e899622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80`}
          alt={category.name}
          fill
          className="h-full w-auto object-contain p-4"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
        <p className="text-dim-grey dark:text-dust-grey text-sm mb-2">{category.description}</p>
        <button
          onClick={() => console.log("Fetching products for category:", category.id)}
          className={cn('w-full bg-dusty-mauve text-white py-2 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-opacity mt-4')}
        >
          View Products
        </button>
      </div>
    </div>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCartStore();

  return (
    <div className="bg-white dark:bg-surface rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative h-64 w-full">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => addToCart(product)}
          className="absolute bottom-4 right-4 bg-accent hover:bg-dusty-mauve text-white p-2 rounded-full shadow-lg transition-all duration-200"
        >
          Add to Cart
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg truncate">{product.name}</h3>
        <div className="flex items-center mt-2">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`text-yellow-400 ${i < Math.floor(4) ? '' : 'text-gray-300'}`}>
              ★
            </span>
          ))}
          <span className="ml-1 text-sm text-dim-grey dark:text-dust-grey">4.5</span>
        </div>
        <div className="mt-2">
          <span className="text-lg font-semibold">${product.price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { addToCart } = useCartStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetch('http://backend-api:8003/api/products/categories'),
          fetch('http://backend-api:8003/api/products'),
        ]);

        if (categoriesRes.ok) {
          const cats = await categoriesRes.json();
          setCategories(cats.map((c: any) => ({
            id: c.id,
            name: c.name,
            description: c.description || 'Shop now',
          })));
        }

        if (productsRes.ok) {
          const prods = await productsRes.json();
          setProducts(prods.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: parseFloat(p.price),
            category: p.category_id,
            image: p.image_url,
          })));
        }
      } catch (error) {
        console.error('Failed to fetch from backend:', error);

        setCategories([
          { id: '1', name: 'Dry Fruits', description: 'Organic and fresh' },
          { id: '2', name: 'Halwa', description: 'Traditional Indian sweets' },
          { id: '3', name: 'Spices', description: 'Premium quality spices' },
        ]);

        setProducts([
          { id: '1', name: 'Mixed Dry Fruits', price: 299, category: 'Dry Fruits', image: 'https://images.unsplash.com/photo-1598214886806-c2896e899622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
          { id: '2', name: 'Gajar ka Halwa', price: 199, category: 'Halwa', image: 'https://images.unsplash.com/photo-1604328108342-234b40f09003?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
          { id: '3', name: 'Turmeric Powder', price: 149, category: 'Spices', image: 'https://images.unsplash.com/photo-1581092580960-959e007056c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dusty-mauve mx-auto mb-4"></div>
          <p className="text-dim-grey dark:text-dust-grey">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <HeroCarousel />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white dark:bg-charcoal rounded-lg p-6 text-center">
            <AnimatedCounter value={stat.value} target={stat.target} />
            <p className="text-dim-grey dark:text-dust-grey mt-2">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-dusty-mauve">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-dusty-mauve">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}