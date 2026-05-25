/**
 * BUPZO - Left Sidebar Navigation
 * Phoenix Dashboard Layout with Responsive Design
 */
import { cn } from '../lib/utils';
import { Home, Package, Users, ShoppingCart, Settings, LogOut } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 bg-charcoal dark:bg-primary-dark text-almond-silk dark:text-primary-light p-4 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dusty-mauve">BUPZO</h1>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <a
              href="#"
              className={cn(
                'flex items-center p-2 rounded-lg hover:bg-dim-grey transition-colors',
                'dark:hover:bg-dust-grey'
              )}
            >
              <Home className="mr-3 h-5 w-5" />
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className={cn(
                'flex items-center p-2 rounded-lg hover:bg-dim-grey transition-colors',
                'dark:hover:bg-dust-grey'
              )}
            >
              <Package className="mr-3 h-5 w-5" />
              <span>Products</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className={cn(
                'flex items-center p-2 rounded-lg hover:bg-dim-grey transition-colors',
                'dark:hover:bg-dust-grey'
              )}
            >
              <Users className="mr-3 h-5 w-5" />
              <span>Customers</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className={cn(
                'flex items-center p-2 rounded-lg hover:bg-dim-grey transition-colors',
                'dark:hover:bg-dust-grey'
              )}
            >
              <ShoppingCart className="mr-3 h-5 w-5" />
              <span>Orders</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className={cn(
                'flex items-center p-2 rounded-lg hover:bg-dim-grey transition-colors',
                'dark:hover:bg-dust-grey'
              )}
            >
              <Settings className="mr-3 h-5 w-5" />
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </nav>

      <div className="mt-8 pt-4 border-t border-dim-grey dark:border-dust-grey">
        <a
          href="#"
          className={cn(
            'flex items-center p-2 rounded-lg hover:bg-dim-grey transition-colors',
            'dark:hover:bg-dust-grey'
          )}
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span>Logout</span>
        </a>
      </div>
    </aside>
  );
}