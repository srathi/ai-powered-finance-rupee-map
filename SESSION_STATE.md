# RupeeMap — Session State

## Project Overview
- **Name**: RupeeMap (formerly RetireWise)
- **Stack**: Next.js 16, React 19, TypeScript, TailwindCSS 4, shadcn/ui (base-nova), Framer Motion, Recharts, Zustand, Groq SDK
- **Location**: `/Users/sandesh/Desktop/myProjects/AIFinanceRupeeMap`
- **Repository**: `git@github.com:srathi/ai-powered-finance-rupee-map.git`
- **Live**: `https://ai-powered-finance-rupee-map.vercel.app`

## What's Done

### Core Functionality
- **73 total routes** (58 calculators + 15 additional pages)
- Financial engine: `math.ts`, `loan.ts`, `tax.ts`, `savings.ts`, `gst.ts`, `insurance.ts`
- Retirement engine: `retirement.ts`, `stochastic.ts`, `inflation.ts`, `compound.ts`
- Historical data: 564 monthly records (1979–2025) in `src/data/historical-returns.ts`
- SWR formula coefficients: a=3.7719, b=0.0506, c=-0.000416, d=-0.0452, e=0.000509, f=0.000134

### Tax Calculations (Fixed)
- New Regime FY 2024-25: 0-3L=0%, 3-7L=5%, 7-10L=10%, 10-12L=15%, 12-15L=20%, 15L+=30%
- Standard deduction ₹75,000, Section 87A rebate for ≤₹7L, surcharge, 4% cess
- Old Regime: 0-3L=0%, 3-6L=5%, 6-9L=10%, 9-12L=15%, 12-15L=20%, 15L+=30%
- Different surcharge rules for old vs new regime

### Rebranding (Complete)
- RetireWise → RupeeMap across package.json, layout.tsx, navbar, footer, landing page
- Logo: `public/logo.png` (from RMapLogo.png)
- Sidebar text: "Rupee" in white, "Map" in blue

### Stitch Design System (Implemented)
- Dark-first design with glassmorphism
- Colors: Deep navy `#0d1320` bg, Cyan `#89ceff` primary, Emerald `#4edea3` secondary, Amber `#ffb95f` tertiary
- Fixed sidebar navigation (w-72) with expandable categories
- Glass-effect cards, gradient buttons, glowing sliders
- JetBrains Mono for data, Geist for narrative
- Landing page: hero with gradient text, stats bar, category grid, features section
- Calculator layout: 12-column grid (4-col inputs, 8-col results)

### Bug Fixes
- Binary search inversion in deterministic calculator (fixed)
- Pie label types in 6 files (fixed)
- Missing Label import in returns-calculator (fixed)
- `yInvestment` typo in insurance.ts (fixed)
- `tenureMonths` missing in loan.ts (fixed)
- Route mismatches for investment calculators (7 directories renamed)
- Input fields not editable — removed glass-effect wrapper from CalculatorLayout
- Copyright year updated to 2026

### Pages Created
- `/privacy-policy` — Privacy Policy page
- `/terms-of-service` — Terms of Service page
- `/cookie-policy` — Cookie Policy page
- All three linked in footer

### What-if Calculator (Rewritten)
- Runs 10,000 Monte Carlo simulations
- Shows percentile bands (P10, P25, P50, P75, P90) in area chart
- Break-even withdrawal rate calculation fixed
- Removed "Median Final Corpus (P50)" card

### Landing Page Background
- Logo as subtle background watermark at 40% opacity
- Positioned to both left and right sides

### ArthaAI Chatbot (Complete)
- **API Route**: `/api/chat` — Groq SDK streaming endpoint
- **UI**: `/chat` — Full-page chat interface with localStorage history
- **Model**: Llama 3.3 70B via Groq
- **Features**: Markdown rendering, rate limiting (15 req/min), chat history
- **RAG**: 51 chunks from research PDF (`src/data/research-chunks.json`)
- **System Prompt**: Indian financial context (₹, PPF, NPS, ELSS, Nifty 50, SEBI)
- **Components**: `chat-message.tsx`, `chat/page.tsx`

### Stock Price Lookup (Complete)
- **API Routes**: `/api/stock-price` (Yahoo Finance proxy), `/api/stock-search` (search proxy)
- **UI**: `/stock-price` — Autocomplete search with dropdown
- **Features**: 30s price cache, 10s search cache, NSE/BSE support
- **Components**: `stock-card.tsx`, `stock-price/page.tsx`

### Financial Literacy Section (Complete)
- **Kids Section**: 15 lessons across 3 courses with quizzes
  - Money Basics (5 lessons)
  - Smart Money Habits (5 lessons)
  - Real World Money (5 lessons)
- **General Section**: 7 in-depth articles
  - Budgeting 101, Emergency Fund, Power of SIP, Understanding Taxes, Insurance Guide, Managing Debt, Real Estate Basics
- **Progress**: localStorage persistence, badge system
- **Components**: `quiz-card.tsx`, `lesson-layout.tsx`
- **Data**: `learn-data.ts`, `general-learn-data.ts`

### Case Studies Page (Complete)
- **Route**: `/case-studies`
- **6 Case Studies**: Ravi (SIP), Priya (Tax), The Kumars (Home Loan), Arjun (FIRE), Meera (Tax Regime), The Sharmas (Education Goal)
- **Features**: Category filtering, expand/collapse cards, metrics tables, quotes
- **Data**: `case-studies-data.ts`

### Roadmap Page (Complete)
- **Route**: `/roadmap`
- **4 Columns**: Your Ideas, Coming Soon, In Progress, Recently Shipped
- **16 Features**: Across categories (Calculators, Tax, Loan, Investment, AI, etc.)
- **Features**: Category filtering, GitHub Issues integration
- **Data**: `roadmap-data.ts`

### Sidebar Updates
- ArthaAI link at top with cyan gradient and "AI" badge
- Learn section with separators ("— Kids —", "— General —")
- Case Studies and Roadmap links at bottom
- Mobile hamburger menu with overlay

### Footer Updates
- "Rupee" in white, "Map" in blue
- Working links to Case Studies and Roadmap
- "Powered by ArthaAI" badge
- Research paper link

## What's Pending / Known Issues

### Historical Data (Fixed)
- Debt returns were unrealistically high (avg 15.4% CAGR)
- Fixed to realistic Indian FD rates (avg 8.4% CAGR)
- 1980s: 10-12%, 2000s: 8-9%, 2010s: 7-8%, 2020s: 5-7%
- Stochastic and Test Adequacy calculators now produce more accurate results

### Mobile App (On Hold)
- Capacitor integration planned for Android/iOS
- Currently paused — revisit later

## Key Files
- `src/app/globals.css` — Stitch design system CSS variables
- `src/app/layout.tsx` — Root layout with sidebar
- `src/components/sidebar.tsx` — Fixed sidebar navigation
- `src/components/navbar.tsx` — Top navbar (used on some pages)
- `src/components/footer.tsx` — Footer with links
- `src/components/calculator-layout.tsx` — 12-column calculator layout
- `src/components/summary-cards.tsx` — Glass metric cards
- `src/components/input-controls.tsx` — InputField and SliderField
- `src/components/results-table.tsx` — Glass results table
- `src/components/chat-message.tsx` — Chat bubble with markdown
- `src/components/quiz-card.tsx` — Quiz component
- `src/components/lesson-layout.tsx` — Lesson page wrapper
- `src/components/stock-card.tsx` — Stock data display
- `src/lib/financial/tax.ts` — Tax calculations
- `src/lib/calculations/retirement.ts` — Deterministic calculator
- `src/lib/calculations/stochastic.ts` — Monte Carlo, SWR, test adequacy
- `src/lib/learn-data.ts` — Kids course content
- `src/lib/general-learn-data.ts` — General articles
- `src/lib/case-studies-data.ts` — Case study content
- `src/lib/roadmap-data.ts` — Roadmap features
- `src/data/historical-returns.ts` — 564 monthly records (1979-2025)
- `src/data/research-chunks.json` — 51 RAG chunks from PDF
- `src/app/api/chat/route.ts` — ArthaAI streaming endpoint
- `src/app/api/stock-price/route.ts` — Yahoo Finance price proxy
- `src/app/api/stock-search/route.ts` — Yahoo Finance search proxy
- `src/app/page.tsx` — Landing page
- `src/app/what-if/page.tsx` — What-if calculator (10k sims)
- `src/app/chat/page.tsx` — ArthaAI chat interface
- `src/app/case-studies/page.tsx` — Case studies listing
- `src/app/roadmap/page.tsx` — Roadmap page
- `DESIGN_BRIEF.md` — Design brief for Google Stitch
- `USER_GUIDE.md` — User guide with all features documented
- `stitch_design_document_manager/` — Stitch design outputs

## Build Status
- `npm run build` passes clean (73 static pages)
- No TypeScript errors
- No broken links (all routes verified via HTTP testing)
- All 73 pages returning 200 OK
- All 3 API endpoints working
- Both static assets (logo.png, research PDF) accessible
