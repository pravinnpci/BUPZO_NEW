/**
 * BUPZO - Header Component
 * Phoenix Dashboard Layout with Dark/Light Mode Toggle
 */
import { cn } from '../lib/utils';
import { Sun, Moon, Search, Bell, User } from 'lucide-react';
import { useTheme } from 'next-themes';

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-charcoal dark:bg-primary-dark text-almond-silk dark:text-primary-light p-4 border-b border-dim-grey dark:border-dust-grey">
      <div className="flex items-center justify-between">
        {/* Search & Notifications */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 bg-dusty-mauve text-xs text-charcoal dark:text-primary-light rounded-full h-5 w-5 flex items-center justify-center">
              0
            </span>
          </div>
          <div className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 bg-dusty-mauve text-xs text-charcoal dark:text-primary-light rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={cn(
              'p-2 rounded-lg hover:bg-dim-grey transition-colors',
              'dark:hover:bg-dust-grey'
            )}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span className="text-sm">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}