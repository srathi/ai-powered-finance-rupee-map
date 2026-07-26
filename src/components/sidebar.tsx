"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Calculator,
  TrendingUp,
  Landmark,
  Percent,
  PiggyBank,
  Shield,
  Building2,
  Wallet,
  GraduationCap,
  Bot,
  ChevronDown,
  ChevronRight,
  X,
  Menu,
  BookOpen,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CalcItem = { name: string; href: string };
type Category = {
  name: string;
  icon: React.ReactNode;
  materialIcon: string;
  items: CalcItem[];
};

const categories: Category[] = [
  {
    name: "Learn",
    icon: <GraduationCap className="h-5 w-5" />,
    materialIcon: "school",
    items: [
      { name: "Overview", href: "/learn" },
      { name: "— Kids —", href: "/learn" },
      { name: "Money Basics", href: "/learn/money-basics" },
      { name: "Smart Money Habits", href: "/learn/smart-money-habits" },
      { name: "Real World Money", href: "/learn/money-in-real-world" },
      { name: "— General —", href: "/learn" },
      { name: "Budgeting 101", href: "/learn/general/budgeting-101" },
      { name: "Emergency Fund", href: "/learn/general/emergency-fund" },
      { name: "Power of SIP", href: "/learn/general/power-of-sip" },
      { name: "Understanding Tax", href: "/learn/general/understanding-taxes" },
      { name: "Insurance Guide", href: "/learn/general/insurance-guide" },
      { name: "Managing Debt", href: "/learn/general/managing-debt" },
      { name: "Real Estate Basics", href: "/learn/general/real-estate-basics" },
    ],
  },
  {
    name: "Retirement",
    icon: <TrendingUp className="h-5 w-5" />,
    materialIcon: "account_balance_wallet",
    items: [
      { name: "Deterministic", href: "/deterministic" },
      { name: "Stochastic", href: "/stochastic" },
      { name: "Test Adequacy", href: "/test-adequacy" },
      { name: "What-if", href: "/what-if" },
      { name: "Withdrawal Rates", href: "/withdrawal-rates" },
      { name: "History Back-test", href: "/history" },
    ],
  },
  {
    name: "Investment",
    icon: <Landmark className="h-5 w-5" />,
    materialIcon: "monitoring",
    items: [
      { name: "SIP Calculator", href: "/sip-calculator" },
      { name: "Lumpsum", href: "/lumpsum-calculator" },
      { name: "Step-up SIP", href: "/step-up-sip" },
      { name: "SWP Calculator", href: "/swp-calculator" },
      { name: "STP Calculator", href: "/stp-calculator" },
      { name: "Goal Planner", href: "/goal-planner" },
      { name: "CAGR Calculator", href: "/cagr-calculator" },
      { name: "XIRR Calculator", href: "/xirr-calculator" },
      { name: "Returns Calculator", href: "/returns-calculator" },
      { name: "Stock Prices", href: "/stock-price" },
    ],
  },
  {
    name: "Loan",
    icon: <Landmark className="h-5 w-5" />,
    materialIcon: "payments",
    items: [
      { name: "EMI Calculator", href: "/emi-calculator" },
      { name: "Home Loan", href: "/home-loan" },
      { name: "Car Loan", href: "/car-loan" },
      { name: "Personal Loan", href: "/personal-loan" },
      { name: "Education Loan", href: "/education-loan" },
      { name: "Loan Eligibility", href: "/loan-eligibility" },
      { name: "Loan Affordability", href: "/loan-affordability" },
      { name: "Loan Balance", href: "/loan-balance" },
      { name: "Loan Comparison", href: "/loan-comparison" },
      { name: "Prepayment", href: "/prepayment" },
    ],
  },
  {
    name: "Tax",
    icon: <Percent className="h-5 w-5" />,
    materialIcon: "receipt_long",
    items: [
      { name: "Income Tax", href: "/income-tax" },
      { name: "Old vs New Regime", href: "/old-vs-new-regime" },
      { name: "HRA Calculator", href: "/hra-calculator" },
      { name: "Gratuity", href: "/gratuity" },
      { name: "Leave Encashment", href: "/leave-encashment" },
      { name: "Section 80C", href: "/section-80c" },
    ],
  },
  {
    name: "Savings",
    icon: <PiggyBank className="h-5 w-5" />,
    materialIcon: "savings",
    items: [
      { name: "FD Calculator", href: "/fd-calculator" },
      { name: "RD Calculator", href: "/rd-calculator" },
      { name: "PPF Calculator", href: "/ppf-calculator" },
      { name: "EPF Calculator", href: "/epf-calculator" },
      { name: "NPS Calculator", href: "/nps-calculator" },
      { name: "Sukanya", href: "/sukanya" },
      { name: "NSC Calculator", href: "/nsc" },
      { name: "SCSS Calculator", href: "/scss" },
    ],
  },
  {
    name: "Insurance",
    icon: <Shield className="h-5 w-5" />,
    materialIcon: "health_and_safety",
    items: [
      { name: "Life Insurance Need", href: "/life-insurance-need" },
      { name: "Term Insurance", href: "/term-insurance" },
      { name: "Child Education", href: "/child-education" },
      { name: "Health Insurance", href: "/health-insurance" },
    ],
  },
  {
    name: "Business",
    icon: <Building2 className="h-5 w-5" />,
    materialIcon: "business_center",
    items: [
      { name: "GST Calculator", href: "/gsr-calculator" },
      { name: "Discount Calculator", href: "/discount-calculator" },
      { name: "Break-even", href: "/break-even" },
      { name: "Profit Margin", href: "/profit-margin" },
    ],
  },
  {
    name: "General",
    icon: <Wallet className="h-5 w-5" />,
    materialIcon: "calculate",
    items: [
      { name: "Inflation Calculator", href: "/inflation-calculator" },
      { name: "Purchasing Power", href: "/purchasing-power" },
      { name: "Rule of 72", href: "/rule-of-72" },
      { name: "Compound Interest", href: "/compound-interest-calculator" },
      { name: "Simple Interest", href: "/simple-interest" },
      { name: "Future Value", href: "/future-value" },
      { name: "Present Value", href: "/present-value" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href;
  const isCategoryActive = (cat: Category) =>
    cat.items.some((item) => pathname === item.href);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-10 w-auto object-contain" />
          <span className="text-xl font-bold tracking-tight">
            <span className="text-on-surface">Rupee</span>
            <span className="text-primary">Map</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-surface-hover text-on-surface-variant"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 mt-4 flex flex-col gap-1 overflow-y-auto">
        {/* ArthaAI CTA */}
        <Link
          href="/chat"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center px-4 py-3 rounded-xl transition-all mb-2",
            pathname === "/chat"
              ? "bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 text-cyan-400"
              : "text-on-surface-variant hover:bg-surface-hover hover:text-on-surface border border-transparent"
          )}
        >
          <span className="mr-4">
            <Bot className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <span className="text-sm font-medium">ArthaAI</span>
            <p className="text-[10px] text-muted-foreground">
              Ask anything about money
            </p>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-medium">
            AI
          </span>
        </Link>

        <div className="h-px bg-border/30 mb-2" />

        {categories.map((cat) => {
          const active = isCategoryActive(cat);
          const expanded = expandedCategory === cat.name || active;

          return (
            <div key={cat.name}>
              <button
                onClick={() =>
                  setExpandedCategory(expanded && !active ? null : cat.name)
                }
                className={cn(
                  "flex items-center w-full px-4 py-3 rounded-xl transition-all group",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-hover hover:text-on-surface"
                )}
              >
                <span className="mr-4">{cat.icon}</span>
                <span className="flex-1 text-left text-sm font-medium">
                  {cat.name}
                </span>
                {expanded ? (
                  <ChevronDown className="h-4 w-4 opacity-50" />
                ) : (
                  <ChevronRight className="h-4 w-4 opacity-50" />
                )}
              </button>

              {expanded && (
                <div className="ml-4 mt-1 mb-2 pl-4 border-l border-outline-variant/20">
                  {cat.items.map((item) => {
                    const isSeparator = item.name.startsWith("—");
                    if (isSeparator) {
                      return (
                        <div
                          key={item.name}
                          className="px-3 pt-3 pb-1 text-[10px] text-muted-foreground uppercase tracking-widest font-medium"
                        >
                          {item.name}
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center px-3 py-2 rounded-lg text-sm transition-all",
                          isActive(item.href)
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-on-surface-variant hover:bg-surface-hover hover:text-on-surface"
                        )}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="h-px bg-border/30 my-2" />

        {/* Case Studies & Roadmap */}
        <Link
          href="/case-studies"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center px-4 py-2.5 rounded-xl transition-all",
            pathname === "/case-studies"
              ? "bg-primary/10 text-primary"
              : "text-on-surface-variant hover:bg-surface-hover hover:text-on-surface"
          )}
        >
          <BookOpen className="h-4 w-4 mr-3" />
          <span className="text-sm">Case Studies</span>
        </Link>
        <Link
          href="/roadmap"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center px-4 py-2.5 rounded-xl transition-all",
            pathname === "/roadmap"
              ? "bg-primary/10 text-primary"
              : "text-on-surface-variant hover:bg-surface-hover hover:text-on-surface"
          )}
        >
          <Map className="h-4 w-4 mr-3" />
          <span className="text-sm">Roadmap</span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-outline-variant/20">
        <p className="text-xs text-outline">
          Built by Sandesh Rathi
        </p>
        <p className="text-xs text-outline mt-1">
          Handcrafted at Home
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg glass-effect text-on-surface"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex-col border-r border-outline-variant/20">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-surface-container-lowest flex flex-col border-r border-outline-variant/20">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
