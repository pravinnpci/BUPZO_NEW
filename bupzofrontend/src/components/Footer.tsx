/**
 * BUPZO - Multi-column Footer
 * Phoenix Dashboard Layout with Skeuomorphic Touches
 */
import { cn } from '../lib/utils';
import { Facebook, X as LucideTwitter, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-charcoal dark:bg-primary-dark text-almond-silk dark:text-primary-light py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Column 1: Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-dusty-mauve">Links</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className={cn(
                  'hover:text-dusty-mauve transition-colors',
                  'dark:hover:text-almond-silk'
                )}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#"
                className={cn(
                  'hover:text-dusty-mauve transition-colors',
                  'dark:hover:text-almond-silk'
                )}
              >
                Products
              </a>
            </li>
            <li>
              <a
                href="#"
                className={cn(
                  'hover:text-dusty-mauve transition-colors',
                  'dark:hover:text-almond-silk'
                )}
              >
                Categories
              </a>
            </li>
            <li>
              <a
                href="#"
                className={cn(
                  'hover:text-dusty-mauve transition-colors',
                  'dark:hover:text-almond-silk'
                )}
              >
                About Us
              </a>
            </li>
          </ul>
        </div>

        {/* Column 2: About */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-dusty-mauve">About BUPZO</h3>
          <p className="text-sm text-dim-grey dark:text-dust-grey">
            BUPZO is an enterprise-grade multi-vendor e-commerce platform specializing in Nagore specialties like Halwa, Dry Fruits, and Gourmet Treats.
          </p>
        </div>

        {/* Column 3: Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-dusty-mauve">Contact Us</h3>
          <ul className="space-y-2">
            <li className="flex items-center">
              <Phone className="mr-2 h-4 w-4" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              <span>support@bupzo.com</span>
            </li>
          </ul>
        </div>

        {/* Column 4: Social */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-dusty-mauve">Follow Us</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className={cn(
                  'hover:text-dusty-mauve transition-colors',
                  'dark:hover:text-almond-silk'
                )}
              >
                <Facebook className="h-5 w-5 inline-block mr-1" />
                Facebook
              </a>
            </li>
            <li>
              <a
                href="#"
                className={cn(
                  'hover:text-dusty-mauve transition-colors',
                  'dark:hover:text-almond-silk'
                )}
              >
                <LucideTwitter className="h-5 w-5 inline-block mr-1" />
                Twitter (X)
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-dim-grey dark:border-dust-grey text-center text-sm text-dim-grey dark:text-dust-grey">
        <p>© {new Date().getFullYear()} BUPZO. All rights reserved.</p>
      </div>
    </footer>
  );
}