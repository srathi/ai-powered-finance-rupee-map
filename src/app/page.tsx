"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calculator,
  TrendingUp,
  Shield,
  BarChart3,
  Landmark,
  Wallet,
  Building2,
  PiggyBank,
  Percent,
  ArrowRight,
  BarChart,
  Clock,
  BadgeCheck,
  LayoutGrid,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  {
    name: "Retirement Vault",
    icon: TrendingUp,
    materialIcon: "account_balance_wallet",
    description: "FIRE planning, corpus projections, and annuity estimators for early freedom.",
    calculators: [
      { title: "Deterministic", href: "/deterministic" },
      { title: "Stochastic", href: "/stochastic" },
      { title: "Test Adequacy", href: "/test-adequacy" },
      { title: "What-if", href: "/what-if" },
      { title: "Withdrawal Rates", href: "/withdrawal-rates" },
      { title: "History Back-test", href: "/history" },
    ],
    color: "primary",
    cta: "PLAN NOW",
  },
  {
    name: "Portfolio Architect",
    icon: BarChart3,
    materialIcon: "monitoring",
    description: "Equity modelling, asset allocation, and mutual fund performance deep-dives.",
    calculators: [
      { title: "SIP Calculator", href: "/sip-calculator" },
      { title: "Lumpsum", href: "/lumpsum-calculator" },
      { title: "Step-up SIP", href: "/step-up-sip" },
      { title: "SWP Calculator", href: "/swp-calculator" },
      { title: "Goal Planner", href: "/goal-planner" },
      { title: "CAGR Calculator", href: "/cagr-calculator" },
      { title: "Stock Prices", href: "/stock-price" },
    ],
    color: "secondary",
    cta: "ANALYZE",
  },
  {
    name: "Tax Optimiser",
    icon: Percent,
    materialIcon: "receipt_long",
    description: "Compare regimes, calculate capital gains, and maximize your 80C deductions.",
    calculators: [
      { title: "Income Tax", href: "/income-tax" },
      { title: "Old vs New Regime", href: "/old-vs-new-regime" },
      { title: "HRA Calculator", href: "/hra-calculator" },
      { title: "Gratuity", href: "/gratuity" },
      { title: "Section 80C", href: "/section-80c" },
    ],
    color: "tertiary",
    cta: "OPTIMISE",
  },
  {
    name: "Loan Manager",
    icon: Landmark,
    materialIcon: "payments",
    description: "EMI calculations, amortization schedules, and smart prepayment strategies.",
    calculators: [
      { title: "EMI Calculator", href: "/emi-calculator" },
      { title: "Home Loan", href: "/home-loan" },
      { title: "Car Loan", href: "/car-loan" },
      { title: "Personal Loan", href: "/personal-loan" },
      { title: "Loan Comparison", href: "/loan-comparison" },
      { title: "Prepayment", href: "/prepayment" },
    ],
    color: "primary",
    cta: "CALCULATE",
  },
  {
    name: "Savings Vault",
    icon: PiggyBank,
    materialIcon: "savings",
    description: "FD, RD, PPF, EPF, NPS, and government scheme calculators.",
    calculators: [
      { title: "FD Calculator", href: "/fd-calculator" },
      { title: "PPF Calculator", href: "/ppf-calculator" },
      { title: "EPF Calculator", href: "/epf-calculator" },
      { title: "NPS Calculator", href: "/nps-calculator" },
      { title: "Sukanya", href: "/sukanya" },
      { title: "SCSS Calculator", href: "/scss" },
    ],
    color: "secondary",
    cta: "EXPLORE",
  },
  {
    name: "Insurance Shield",
    icon: Shield,
    materialIcon: "health_and_safety",
    description: "Life insurance need analysis, term plan comparison, and health cover calculators.",
    calculators: [
      { title: "Life Insurance Need", href: "/life-insurance-need" },
      { title: "Term Insurance", href: "/term-insurance" },
      { title: "Child Education", href: "/child-education" },
      { title: "Health Insurance", href: "/health-insurance" },
    ],
    color: "tertiary",
    cta: "PROTECT",
  },
  {
    name: "Markets & AI Forecast",
    icon: LineChart,
    materialIcon: "candlestick_chart",
    description: "Probabilistic NSE/BSE price forecasts powered by Kronos — an open-source financial foundation model pre-trained on 12B+ candles across 45 exchanges.",
    calculators: [
      { title: "AI Stock Forecast", href: "/stock-forecast" },
      { title: "Watchlist Scanner", href: "/watchlist-forecast" },
    ],
    color: "primary",
    cta: "FORECAST",
  },
];

const features = [
  {
    icon: BarChart,
    title: "Monte Carlo Simulations",
    description: "Run 10,000+ market scenarios to understand the probability of your portfolio lasting through retirement.",
    color: "primary",
  },
  {
    icon: Clock,
    title: "Historical Backtesting",
    description: "Validate your strategy against 40 years of Sensex and Nifty data, adjusted for historical inflation rates.",
    color: "secondary",
  },
  {
    icon: BadgeCheck,
    title: "Evidence-Based Planning",
    description: "No gut feelings. Just math. Our logic is fully transparent and based on established financial research.",
    color: "info",
  },
  {
    icon: LineChart,
    title: "AI Price Forecasting",
    description: "Go beyond historical charts — our Kronos-powered engine samples thousands of Monte Carlo paths to project NSE/BSE prices with a confidence band and upside probability.",
    color: "primary",
  },
];

const stats = [
  { value: "58", label: "Financial Calculators", color: "text-primary" },
  { value: "550+", label: "Months of Data", color: "text-secondary" },
  { value: "10K", label: "Monte Carlo Sims", color: "text-tertiary" },
  { value: "95%+", label: "Confidence Level", color: "text-on-surface" },
];

export default function HomePage() {
  const [comingSoon, setComingSoon] = useState(false);
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col justify-center px-6 overflow-hidden">
        {/* Logo Background Left */}
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-40 pointer-events-none"
          style={{ backgroundImage: "url(/logo.png)", backgroundPosition: "left center", backgroundSize: "37.5% auto" }}
        />
        {/* Logo Background Right */}
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-40 pointer-events-none"
          style={{ backgroundImage: "url(/logo.png)", backgroundPosition: "right center", backgroundSize: "37.5% auto" }}
        />
        {/* Decorative Glows */}
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/50 border border-outline-variant/20 mb-8 backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
            <span className="label-caps text-secondary tracking-widest">
              Evidence-Based Financial Planning
            </span>
          </motion.div>

          {/* Hero Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[0.95]"
          >
            <span className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
              Financial clarity for
            </span>
            <br />
            <span className="gradient-text">every rupee.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Precision-engineered financial tools for the modern Indian investor.
            Navigate retirement, taxes, and investments with institutional-grade data.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/deterministic">
              <button className="group relative px-8 py-4 btn-primary-gradient rounded-xl font-semibold overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Start Planning
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </Link>
            <Link href="/stochastic">
              <button className="px-8 py-4 rounded-xl border border-outline-variant/30 font-semibold text-on-surface hover:bg-surface-hover transition-colors backdrop-blur-sm">
                View Methodology
              </button>
            </Link>
          </motion.div>

          {/* Live Market Link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8"
          >
            <Link
              href="/stock-price"
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-sm font-medium text-emerald-500">Live Market</span>
              <span className="text-xs text-emerald-500/60 group-hover:text-emerald-500/80 transition-colors">
                NSE &amp; BSE Prices →
              </span>
            </Link>
          </motion.div>

          {/* Learn Finance Link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-4"
          >
            <Link
              href="/learn"
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/30 transition-all group"
            >
              <span className="text-lg">📚</span>
              <span className="text-sm font-medium text-primary">Learn Finance</span>
              <span className="text-xs text-primary/60 group-hover:text-primary/80 transition-colors">
                →
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Floating Abstract Geometry */}
        <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-72 h-72 glass-effect rounded-3xl rotate-12 -z-10 hidden lg:block opacity-50" />
        <div className="absolute left-[5%] bottom-20 w-48 h-48 glass-effect rounded-full -z-10 hidden lg:block opacity-30" />
      </section>

      {/* Stats Bar */}
      <section className="px-6 py-12 border-y border-outline-variant/10 bg-surface-container-lowest/50">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col gap-1"
            >
              <span className={`font-data text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </span>
              <span className="label-caps text-on-surface-variant tracking-widest">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section id="categories" className="px-6 py-24 max-w-[1440px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">
              A complete ecosystem for your financial journey.
            </h2>
            <p className="text-on-surface-variant">
              Every tool is built on verified historical data and peer-reviewed financial models.
            </p>
          </div>
          <a href="#categories" className="font-data text-sm text-primary flex items-center gap-2 hover:text-primary/80 transition-colors">
            Explore All Modules
            <LayoutGrid className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link href={cat.calculators[0].href}>
                <div className={`glass-effect p-8 rounded-2xl group hover:border-${cat.color}/40 transition-all cursor-pointer relative overflow-hidden h-full`}>
                  {/* Background Icon */}
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <cat.icon className="w-32 h-32" />
                  </div>

                  {/* Header */}
                  <div className="flex justify-between items-start mb-12">
                    <div className={`w-12 h-12 rounded-lg bg-${cat.color}/10 flex items-center justify-center text-${cat.color}`}>
                      <cat.icon className="h-6 w-6" />
                    </div>
                    <span className={`font-data text-xs text-${cat.color} bg-${cat.color}/5 px-3 py-1 rounded-full`}>
                      {cat.calculators.length} Tools
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold mb-2 text-on-surface">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-6">
                    {cat.description}
                  </p>

                  {/* CTA */}
                  <div className={`flex items-center text-${cat.color} label-caps tracking-widest group-hover:gap-4 transition-all`}>
                    {cat.cta}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-6 py-32 bg-surface-container-low overflow-hidden">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-12">
              Built for the data-driven investor.
            </h2>
            <div className="space-y-12">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex gap-6"
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-${feature.color}/20 flex items-center justify-center text-${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-on-surface mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-on-surface-variant">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Fake UI Mockup */}
          <div className="relative">
            <div className="aspect-square glass-effect rounded-[40px] p-8 border-primary/10 relative z-10 overflow-hidden">
              <div className="w-full h-full bg-surface-container-lowest/50 rounded-2xl border border-outline-variant/10 p-6">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-danger/50" />
                    <div className="w-3 h-3 rounded-full bg-warning/50" />
                    <div className="w-3 h-3 rounded-full bg-success/50" />
                  </div>
                  <div className="font-data text-xs text-on-surface-variant">
                    Market Simulation v4.2
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-3/4 bg-primary/20 rounded" />
                  <div className="h-32 w-full bg-gradient-to-t from-primary/10 to-transparent border-b border-primary/30 relative">
                    <svg className="absolute bottom-0 w-full h-24" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path className="text-primary" d="M0,80 Q20,20 40,50 T80,10 T100,60" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-16 bg-surface-container rounded border border-outline-variant/10" />
                    <div className="h-16 bg-surface-container rounded border border-outline-variant/10" />
                    <div className="h-16 bg-surface-container rounded border border-outline-variant/10" />
                  </div>
                </div>
              </div>
            </div>
            {/* Abstract Glow */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/30 rounded-full blur-[100px] -z-0" />
          </div>
        </div>
      </section>

      {/* ArthaAI Section */}
      <section className="px-6 py-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 via-emerald-500/5 to-transparent border border-cyan-500/10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">
                      <span className="text-on-surface">Ask </span>
                      <span className="text-cyan-400">Artha</span>
                      <span className="text-emerald-400">AI</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Wealth wisdom, powered by AI
                    </p>
                  </div>
                </div>
                <p className="text-on-surface-variant mb-6 max-w-lg">
                  Have a money question? Get instant, practical answers about
                  budgeting, investing, taxes, insurance, and more — powered by
                  AI with a focus on financial literacy.
                </p>
                <Link href="/chat">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:opacity-90">
                    Start a Conversation
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="hidden md:block w-64 shrink-0">
                <div className="space-y-3">
                  {[
                    "How do I start investing?",
                    "What's a good emergency fund?",
                    "How to save tax?",
                  ].map((q, i) => (
                    <div
                      key={i}
                      className="px-4 py-2.5 rounded-xl bg-surface-container-high/50 border border-border/30 text-sm text-muted-foreground"
                    >
                      💬 &quot;{q}&quot;
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Review Section */}
      <section className="px-6 py-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-primary/5 to-transparent border border-emerald-500/10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-primary/20 flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">
                      <span className="text-on-surface">AI </span>
                      <span className="text-emerald-400">Portfolio</span>
                      <span className="text-primary"> Review</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Get personalized investment analysis
                    </p>
                  </div>
                </div>
                <p className="text-on-surface-variant mb-6 max-w-lg">
                  Enter your investments and get AI-powered analysis of your
                  portfolio allocation, diversification, and risk — with specific
                  recommendations to optimize for growth.
                </p>
                <Link href="/portfolio-review">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-emerald-500 to-primary text-white hover:opacity-90">
                    Analyze My Portfolio
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-4">
                  For a personalized portfolio plan, reach out to{" "}
                  <a href="mailto:sandesh@rupeemap.in" className="text-primary hover:underline">
                    sandesh@rupeemap.in
                  </a>
                  .
                </p>
              </div>
              <div className="hidden md:block w-64 shrink-0">
                <div className="space-y-3">
                  {[
                    "Is my portfolio well-diversified?",
                    "Am I taking too much risk?",
                    "How to optimize for tax savings?",
                  ].map((q, i) => (
                    <div
                      key={i}
                      className="px-4 py-2.5 rounded-xl bg-surface-container-high/50 border border-border/30 text-sm text-muted-foreground"
                    >
                      📈 &quot;{q}&quot;
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Markets / Kronos Section */}
      <section className="px-6 py-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border border-primary/10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <span className="text-2xl">🔮</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">
                      <span className="text-primary">AI</span>{" "}
                      <span className="text-on-surface">Stock</span>{" "}
                      <span className="text-secondary">Forecast</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Powered by Kronos — a financial foundation model
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30">
                      🧪 In Beta · Coming Soon
                    </span>
                  </div>
                </div>
                <p className="text-on-surface-variant mb-4 max-w-lg">
                  <span className="font-semibold text-on-surface">Kronos</span> is
                  an open-source foundation model for financial K-lines,
                  pre-trained on 12B+ candles from 45 global exchanges (AAAI 2026).
                  RupeeMap fine-tunes its Indian-market layer to forecast NSE/BSE
                  prices.
                </p>
                <p className="text-on-surface-variant mb-6 max-w-lg">
                  Ask for a single-stock forecast with a 90% confidence band and
                  upside probability, or scan a whole watchlist to rank it by
                  projected return. Forecasts are probabilistic and
                  research-grade — not investment advice.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    className="gap-2 btn-primary-gradient"
                    onClick={() => setComingSoon(true)}
                  >
                    Forecast a Stock
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setComingSoon(true)}
                  >
                    Scan Watchlist
                  </Button>
                </div>
              </div>
              <div className="hidden md:block w-72 shrink-0">
                <div className="space-y-3">
                  {[
                    "Where is TCS headed next quarter?",
                    "Forecast Reliance with 90% band",
                    "Rank my watchlist by upside",
                  ].map((q, i) => (
                    <div
                      key={i}
                      className="px-4 py-2.5 rounded-xl bg-surface-container-high/50 border border-border/30 text-sm text-muted-foreground"
                    >
                      🔮 &quot;{q}&quot;
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-[1440px] mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-on-surface">
              Ready to Plan Your Retirement?
            </h2>
            <p className="text-on-surface-variant mb-6 max-w-xl mx-auto">
              Start with the Deterministic calculator to get a baseline, then use
              the Stochastic calculator for a more accurate picture.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/deterministic">
                <Button size="lg" className="gap-2 btn-primary-gradient">
                  Deterministic Calculator
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/stochastic">
                <Button size="lg" variant="outline" className="gap-2">
                  Stochastic Calculator
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {comingSoon && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setComingSoon(false)}
        >
          <div
            className="glass-effect rounded-2xl border border-warning/30 p-8 max-w-sm text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-3">🧪</div>
            <h3 className="text-xl font-bold text-on-surface mb-2">
              Coming Soon — In Beta
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">
              AI Stock Forecast and Watchlist Scanner are in beta. We&apos;re
              finalizing the Kronos-powered experience and will roll it out soon.
            </p>
            <Button onClick={() => setComingSoon(false)}>Got it</Button>
          </div>
        </div>
      )}
    </div>
  );
}
