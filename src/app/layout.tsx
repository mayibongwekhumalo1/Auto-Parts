import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PerformanceMonitor from "../components/PerformanceMonitor";
import PWARegister from "../components/PWARegister";
import ScrollToTop from "../components/ScrollToTop";
import ErrorBoundary from "../components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mik Auto Parts",
  description: "Car parts in Victoria Falls ecom store",
  manifest: "/manifest.json",
  themeColor: "#dc2626",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mik Auto Parts",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Mik Auto Parts",
    title: "Mik Auto Parts",
    description: "Car parts in Victoria Falls ecom store",
  },
  twitter: {
    card: "summary",
    title: "Mik Auto Parts",
    description: "Car parts in Victoria Falls ecom store",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <ErrorBoundary>
          <PWARegister />
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <PerformanceMonitor />
          <ScrollToTop />
        </ErrorBoundary>
      </body>
    </html>
  );
}
