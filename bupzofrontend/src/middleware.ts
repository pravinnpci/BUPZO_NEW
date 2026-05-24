import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value;

  // Public routes
  const publicRoutes = ['/login', '/signup', '/'];

  // Admin routes
  const adminRoutes = [
    '/admin/dashboard',
    '/admin/customers',
    '/admin/customers/[id]',
    '/admin/orders',
    '/admin/orders/[id]',
    '/admin/refunds',
    '/admin/settings',
    '/admin/users'
  ];

  // Seller routes
  const sellerRoutes = [
    '/seller/dashboard',
    '/seller/products',
    '/seller/orders',
    '/seller/orders/[id]',
    '/seller/settings'
  ];

  // Customer routes
  const customerRoutes = [
    '/customer/dashboard',
    '/customer/orders',
    '/customer/wishlist',
    '/customer/settings'
  ];

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => {
    if (route.endsWith('[')) {
      return path.startsWith(route.replace('[', '').replace(']', ''));
    }
    return path === route;
  });

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // For this demo, we'll allow access to all routes if token exists
  // In a real app, you would decode the token to get the user role
  // and verify they have access to the specific route type

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};