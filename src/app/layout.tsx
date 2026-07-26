import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RupeeMap — Financial Calculators for India",
    template: "%s | RupeeMap",
  },
  description:
    "Precision-engineered financial tools for the modern Indian investor. Navigate retirement, taxes, and investments with institutional-grade data.",
  keywords: [
    "retirement calculator",
    "financial calculator India",
    "investment calculator",
    "tax calculator",
    "loan calculator",
    "Monte Carlo simulation",
    "financial planning",
    "corpus calculator",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "RupeeMap",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-surface text-on-surface">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-0 lg:ml-72">
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
