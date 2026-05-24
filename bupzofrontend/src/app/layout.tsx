import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeProvider";
import "./globals.css";
import { cn } from "@/lib/utils"; // Import cn from utils

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", variable: "--font-plus-jakarta" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(`${inter.variable} ${plusJakarta.variable} font-inter`)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
