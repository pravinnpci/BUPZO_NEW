import { useTheme } from '@/context/ThemeProvider';
import { Moon, Sun } from 'lucide-react';

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary-500">Welcome to BUPZO</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-neutral-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="h-6 w-6 text-yellow-400" />
            ) : (
              <Moon className="h-6 w-6 text-neutral-800" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="card card-hover">
            <h2 className="text-xl font-semibold mb-2">Explore Products</h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Discover amazing products from local sellers with AI-powered recommendations.
            </p>
          </div>
          <div className="card card-hover">
            <h2 className="text-xl font-semibold mb-2">Become a Seller</h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Start selling your products and reach a wider audience with our multi-vendor marketplace.
            </p>
          </div>
          <div className="card card-hover">
            <h2 className="text-xl font-semibold mb-2">AI-Powered Features</h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Experience the future of e-commerce with AI-driven product recommendations and personalized shopping.
            </p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-4">Featured Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Halwa', 'Dry Fruits', 'Toys', 'Electronics', 'Ceramics', 'Home Appliances'].map((category) => (
              <div key={category} className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
                <div className="h-24 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                <h3 className="font-medium">{category}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}