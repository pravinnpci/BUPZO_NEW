import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { ThemeProvider } from '@/context/ThemeProvider';
import Sidebar from '@/components/Sidebar';
import AdminHeader from '@/components/AdminHeader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BUPZO Admin Dashboard',
  description: 'Admin dashboard for BUPZO platform',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <AdminHeader />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 ml-64 p-6 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}