"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { Menu, Sun, Moon, Calculator, Search, TrendingUp, Landmark, Wallet, BarChart3, Shield, Building2, PiggyBank, Percent } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CalcItem = { name: string; href: string; description: string };
type Category = { name: string; icon: React.ReactNode; items: CalcItem[] };

const categories: Category[] = [
  {
    name: "Retirement",
    icon: <TrendingUp className="h-4 w-4" />,
    items: [
      { name: "Deterministic", href: "/deterministic", description: "Corpus needed for retirement" },
      { name: "Stochastic (Monte Carlo)", href: "/stochastic", description: "Probabilistic retirement outcomes" },
      { name: "Test Adequacy", href: "/test-adequacy", description: "Is your retirement plan enough?" },
      { name: "What-if", href: "/what-if", description: "Explore scenario changes" },
      { name: "History Back-test", href: "/history", description: "Historical returns simulation" },
      { name: "Withdrawal Rates (SWR)", href: "/withdrawal-rates", description: "Safe withdrawal rate formula" },
    ],
  },
  {
    name: "Investment",
    icon: <BarChart3 className="h-4 w-4" />,
    items: [
      { name: "SIP Calculator", href: "/sip-calculator", description: "Future value of SIP" },
      { name: "Lumpsum Calculator", href: "/lumpsum-calculator", description: "One-time investment growth" },
      { name: "Step-up SIP", href: "/step-up-sip", description: "Increasing SIP over time" },
      { name: "SWP Calculator", href: "/swp-calculator", description: "Systematic withdrawal plan" },
      { name: "STP Calculator", href: "/stp-calculator", description: "Systematic transfer plan" },
      { name: "Goal Planner", href: "/goal-planner", description: "Plan for financial goals" },
      { name: "CAGR Calculator", href: "/cagr-calculator", description: "Compound annual growth rate" },
      { name: "XIRR Calculator", href: "/xirr-calculator", description: "Internal rate of return" },
      { name: "Returns Calculator", href: "/returns-calculator", description: "Lumpsum vs SIP comparison" },
    ],
  },
  {
    name: "Loan",
    icon: <Landmark className="h-4 w-4" />,
    items: [
      { name: "EMI Calculator", href: "/emi-calculator", description: "Loan EMI calculator" },
      { name: "Home Loan", href: "/home-loan", description: "Home loan EMI & interest" },
      { name: "Car Loan", href: "/car-loan", description: "Car loan EMI calculator" },
      { name: "Personal Loan", href: "/personal-loan", description: "Personal loan EMI" },
      { name: "Education Loan", href: "/education-loan", description: "Education loan EMI" },
      { name: "Loan Eligibility", href: "/loan-eligibility", description: "How much can you borrow?" },
      { name: "Loan Affordability", href: "/loan-affordability", description: "Can you afford this loan?" },
      { name: "Loan Balance", href: "/loan-balance", description: "Outstanding balance check" },
      { name: "Loan Comparison", href: "/loan-comparison", description: "Compare loan offers" },
      { name: "Prepayment", href: "/prepayment", description: "Impact of prepayment" },
    ],
  },
  {
    name: "Tax",
    icon: <Percent className="h-4 w-4" />,
    items: [
      { name: "Income Tax", href: "/income-tax", description: "Calculate income tax" },
      { name: "Old vs New Regime", href: "/old-vs-new-regime", description: "Which regime is better?" },
      { name: "HRA Calculator", href: "/hra-calculator", description: "HRA exemption" },
      { name: "Gratuity", href: "/gratuity", description: "Gratuity calculator" },
      { name: "Leave Encashment", href: "/leave-encashment", description: "Leave encashment tax" },
      { name: "Section 80C", href: "/section-80c", description: "80C deductions planner" },
    ],
  },
  {
    name: "Savings",
    icon: <PiggyBank className="h-4 w-4" />,
    items: [
      { name: "FD Calculator", href: "/fd-calculator", description: "Fixed deposit returns" },
      { name: "RD Calculator", href: "/rd-calculator", description: "Recurring deposit" },
      { name: "PPF Calculator", href: "/ppf-calculator", description: "Public provident fund" },
      { name: "EPF Calculator", href: "/epf-calculator", description: "Employee provident fund" },
      { name: "NPS Calculator", href: "/nps-calculator", description: "National pension system" },
      { name: "Sukanya", href: "/sukanya", description: "Sukanya Samriddhi Yojana" },
      { name: "NSC Calculator", href: "/nsc", description: "National savings certificate" },
      { name: "SCSS Calculator", href: "/scss", description: "Senior citizen savings scheme" },
    ],
  },
  {
    name: "Insurance",
    icon: <Shield className="h-4 w-4" />,
    items: [
      { name: "Life Insurance Need", href: "/life-insurance-need", description: "How much cover do you need?" },
      { name: "Term Insurance", href: "/term-insurance", description: "Term plan comparison" },
      { name: "Child Education", href: "/child-education", description: "Child education fund" },
      { name: "Health Insurance", href: "/health-insurance", description: "Health cover calculator" },
    ],
  },
  {
    name: "Business",
    icon: <Building2 className="h-4 w-4" />,
    items: [
      { name: "GST Calculator", href: "/gsr-calculator", description: "GST inclusive/exclusive" },
      { name: "Discount Calculator", href: "/discount-calculator", description: "Calculate discounts" },
      { name: "Break-even", href: "/break-even", description: "Break-even point" },
      { name: "Profit Margin", href: "/profit-margin", description: "Profit margin calculator" },
    ],
  },
  {
    name: "General Finance",
    icon: <Wallet className="h-4 w-4" />,
    items: [
      { name: "Inflation Calculator", href: "/inflation-calculator", description: "Future cost with inflation" },
      { name: "Purchasing Power", href: "/purchasing-power", description: "What your money is worth" },
      { name: "Rule of 72", href: "/rule-of-72", description: "Doubling time estimate" },
      { name: "Compound Interest", href: "/compound-interest-calculator", description: "CI with different frequencies" },
      { name: "Simple Interest", href: "/simple-interest", description: "Simple interest calculator" },
      { name: "Future Value", href: "/future-value", description: "Value of current money" },
      { name: "Present Value", href: "/present-value", description: "Discount future amount" },
    ],
  },
];

const allCalculators = categories.flatMap((cat) =>
  cat.items.map((item) => ({ ...item, category: cat.name }))
);

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCalculators = useMemo(() => {
    if (!search) return [];
    return allCalculators.filter(
      (calc) =>
        calc.name.toLowerCase().includes(search.toLowerCase()) ||
        calc.description.toLowerCase().includes(search.toLowerCase()) ||
        calc.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <img src="/logo.png" alt="RupeeMap" className="h-10 w-auto object-contain" />
          <span className="hidden sm:inline">RupeeMap</span>
        </Link>

        {/* Desktop nav with dropdowns */}
        <nav className="hidden lg:flex items-center gap-1">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="relative"
              onMouseEnter={() => setActiveCategory(cat.name)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <button className={cn(
                "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground",
                activeCategory === cat.name ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}>
                {cat.icon}
                <span>{cat.name}</span>
              </button>
              {activeCategory === cat.name && (
                <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-border/40 bg-background/95 backdrop-blur-md shadow-lg p-2">
                  {cat.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex flex-col gap-0.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                        pathname === item.href ? "bg-accent" : ""
                      )}
                      onClick={() => setActiveCategory(null)}
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="rounded-full lg:hidden" />}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 max-h-[80vh] overflow-y-auto">
              <div className="mt-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search calculators..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <nav className="flex flex-col gap-1">
                <Link
                  href="/"
                  className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  Home
                </Link>
                {search ? (
                  filteredCalculators.map((calc) => (
                    <Link
                      key={calc.href}
                      href={calc.href}
                      className="flex flex-col gap-0.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                      onClick={() => { setOpen(false); setSearch(""); }}
                    >
                      <span className="font-medium">{calc.name}</span>
                      <span className="text-xs text-muted-foreground">{calc.description}</span>
                    </Link>
                  ))
                ) : (
                  categories.map((cat) => (
                    <div key={cat.name}>
                      <button
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground w-full text-left"
                        onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                      >
                        {cat.icon}
                        {cat.name}
                      </button>
                      {(activeCategory === cat.name || search) && (
                        <div className="ml-4">
                          {cat.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "flex flex-col gap-0.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                                pathname === item.href ? "bg-accent" : "text-muted-foreground"
                              )}
                              onClick={() => setOpen(false)}
                            >
                              <span className="font-medium">{item.name}</span>
                              <span className="text-xs text-muted-foreground">{item.description}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
