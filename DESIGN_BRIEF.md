# RupeeMap — Design Revamp Brief

## Project Overview

**RupeeMap** is a comprehensive financial calculator web app for Indian users. It covers retirement planning, investment, loan, tax, savings, insurance, business, and general finance — 58 calculators total. The app is built with Next.js 16, React 19, TailwindCSS, and shadcn/ui (base-nova style).

**Goal:** Transform the current functional-but-plain UI into a **futuristic, premium, data-dense financial dashboard** that feels like a Bloomberg Terminal meets a modern fintech app.

---

## Current State

- Clean but generic shadcn/ui cards and forms
- Basic layout: navbar, calculator page, footer
- Charts via Recharts (line, area, pie)
- Light/dark theme support
- Mobile responsive

**Pain Points:**
- Looks like every other shadcn template
- No visual hierarchy or "wow" factor
- Calculator pages are just forms + cards stacked vertically
- No data visualization flair — charts feel flat
- No branding personality

---

## Design Direction

### Aesthetic: "Fintech Glassmorphism meets Bloomberg Terminal"

Think:
- **Dark-first** design with rich gradients and subtle glass effects
- **Data-dense** but organized — every pixel earns its place
- **Accent glows** — neon-like highlights on key metrics (cyan, emerald, amber)
- **Monospace numbers** for financial data — conveys precision
- **Smooth micro-interactions** — hover states, number counters, chart animations

### Reference Apps (for vibe, not copying)
- **Robinhood** — clean, dark, confident typography
- **Coinbase** — gradient accents, glass cards
- **Bloomberg Terminal** — data density, monospace numbers
- **Linear** — minimal, sharp, premium feel
- **Vercel Dashboard** — clean grid, subtle borders

---

## Color Palette

### Primary (Dark Mode)
```
Background:     hsl(222, 47%, 7%)      — Deep navy black
Surface:        hsl(222, 47%, 11%)     — Slightly lighter cards
Surface Hover:  hsl(222, 47%, 14%)     — Interactive hover
Border:         hsl(222, 47%, 18%)     — Subtle dividers
Border Active:  hsl(222, 47%, 25%)     — Focus states
```

### Accent Colors
```
Primary:        hsl(199, 89%, 48%)     — Electric cyan (#0EA5E9)
Primary Glow:   hsl(199, 89%, 48%, 0.15) — Glow effect
Success:        hsl(160, 84%, 39%)     — Emerald green
Danger:         hsl(0, 84%, 60%)       — Vibrant red
Warning:        hsl(38, 92%, 50%)      — Amber gold
Info:           hsl(250, 89%, 67%)     — Purple accent
```

### Chart Colors (High Contrast)
```
Chart 1:  hsl(199, 89%, 48%)  — Cyan (primary data)
Chart 2:  hsl(160, 84%, 39%)  — Emerald (positive)
Chart 3:  hsl(38, 92%, 50%)   — Amber (warning/highlight)
Chart 4:  hsl(250, 89%, 67%)  — Purple (secondary)
Chart 5:  hsl(0, 84%, 60%)    — Red (negative/danger)
```

### Light Mode
```
Background:     hsl(0, 0%, 98%)
Surface:        hsl(0, 0%, 100%)
Border:         hsl(220, 13%, 91%)
Accent colors remain the same but with adjusted saturation
```

---

## Typography

### Font Stack
```
Headings:    Inter (or Geist) — bold, tight tracking
Body:        Inter (or Geist) — regular weight
Numbers:     Geist Mono / JetBrains Mono — monospace for financial data
```

### Type Scale
```
Hero Title:      text-5xl / text-6xl  — 700 weight, tight tracking
Page Title:      text-3xl             — 700 weight
Section Title:   text-xl / text-lg    — 600 weight
Card Title:      text-base            — 600 weight
Body:            text-sm              — 400 weight, text-muted-foreground
Small/Labels:    text-xs              — 500 weight, uppercase tracking-wide
Numbers (large): text-3xl / text-4xl  — 700 weight, font-mono
Numbers (small): text-sm              — font-mono, tabular-nums
```

---

## Component Patterns

### 1. Glass Card
```css
background: rgba(255, 255, 255, 0.03);
border: 1px solid rgba(255, 255, 255, 0.06);
backdrop-filter: blur(12px);
border-radius: 16px;
```
- Subtle gradient on hover: `background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`
- Optional glow border on hover: `box-shadow: 0 0 20px rgba(14, 165, 233, 0.1)`

### 2. Metric Card (for results)
- Large monospace number with gradient text or accent color
- Small label above (uppercase, muted)
- Optional sparkline or mini-chart below
- Subtle glow effect behind the number

### 3. Input Fields
- Dark background: `hsl(222, 47%, 11%)`
- Border: `1px solid hsl(222, 47%, 18%)`
- Focus ring: `2px solid hsl(199, 89%, 48%)` with glow
- Prefix/suffix inside the field (₹, %, yr)
- Slider: custom track with gradient fill and glowing thumb

### 4. Charts
- Grid lines: very subtle (opacity 0.1)
- Area fills: gradient from color to transparent
- Tooltips: glass card style with monospace numbers
- Animated transitions on data load
- Reference lines: dashed, muted color

### 5. Navigation
- Sticky, glassmorphic navbar
- Category pills with icons
- Search with ⌘K shortcut feel
- Active state: subtle glow underline

### 6. Buttons
- Primary: gradient fill `linear-gradient(135deg, hsl(199, 89%, 48%), hsl(250, 89%, 67%))`
- Ghost: transparent with border on hover
- Icon buttons: circular, subtle background

---

## Page Layouts

### Landing Page
```
┌─────────────────────────────────────────────┐
│  [Logo]  Retirement  Investment  Loan  Tax  │  ← Glass navbar
├─────────────────────────────────────────────┤
│                                             │
│    Financial clarity                        │  ← Hero: large gradient text
│    for every rupee.                         │
│                                             │
│    [Start Planning →]                       │  ← Gradient CTA button
│                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │  ← Stats bar: monospace numbers
│  │550+ │ │10K  │ │ 58  │ │95%+ │          │
│  └─────┘ └─────┘ └─────┘ └─────┘          │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │  ← Category cards: glass style
│  │Retirement│ │Investment│ │   Loan   │   │
│  │  6 calcs │ │  9 calcs │ │ 10 calcs │   │
│  └──────────┘ └──────────┘ └──────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │  ← Features section
│  │ Monte Carlo │ Historical │ Evidence │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [CTA: Ready to plan?]                     │  ← Gradient border card
│                                             │
├─────────────────────────────────────────────┤
│  Footer: credits, links, research paper    │
└─────────────────────────────────────────────┘
```

### Calculator Page (Deterministic Example)
```
┌─────────────────────────────────────────────┐
│  [Logo]  Categories...        [Search] [☀]  │
├─────────────────────────────────────────────┤
│                                             │
│  Retirement Calculator                      │  ← Page title
│  Calculate the corpus needed...             │  ← Subtitle (muted)
│                                             │
│  ┌──────────────┐  ┌──────────────────────┐│
│  │ INPUTS       │  │ RESULTS              ││
│  │              │  │                      ││
│  │ Age      [30]│  │  ₹2,28,00,000        ││  ← Large monospace
│  │ Retire   [60]│  │  REQUIRED CORPUS     ││  ← Uppercase label
│  │ Exp/L    [12]│  │                      ││
│  │ Equity   [50%│  │  19.0x               ││  ← Cover ratio
│  │ Equity R [12%│  │  EXPENDITURE COVER   ││
│  │ Debt R   [7%]│  │                      ││
│  │ Infl.    [5%]│  │  4.1%                ││  ← SWR
│  │ Tax      [12%│  │  SAFE WITHDRAWAL RATE││
│  │              │  │                      ││
│  │ [Calculate]  │  │  ┌──────────────────┐││
│  │              │  │  │ CHART            │││
│  │              │  │  │ (area chart)     │││
│  │              │  │  └──────────────────┘││
│  │              │  │                      ││
│  │              │  │  ┌──────────────────┐││
│  │              │  │  │ TABLE            │││
│  │              │  │  └──────────────────┘││
│  └──────────────┘  └──────────────────────┘│
│                                             │
├─────────────────────────────────────────────┤
│  Footer                                    │
└─────────────────────────────────────────────┘
```

### Stochastic / What-if (Charts Focus)
```
┌─────────────────────────────────────────────┐
│  [Inputs panel — collapsible on mobile]     │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ SUMMARY CARDS (horizontal scroll)   │   │
│  │ [Corpus] [Failure] [Success] [P50]  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ AREA CHART with percentile bands    │   │
│  │ P90 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │   │
│  │ P75 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │
│  │ P50 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│  │ P25 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │
│  │ P10 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ EXPLANATION / METHODOLOGY           │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Animations & Interactions

### Micro-interactions
- **Number counters:** Animate from 0 to final value on result load
- **Card hover:** Subtle scale (1.02) + glow border
- **Chart draw:** Animate area/line drawing on first render
- **Button hover:** Gradient shift + subtle shadow
- **Tab transitions:** Smooth slide/fade between tabs

### Loading States
- Skeleton loaders with shimmer effect
- Chart placeholder with pulsing grid
- Button spinner with gradient ring

### Page Transitions
- Fade in + slight upward slide (10px)
- Stagger children by 50ms

---

## Responsive Breakpoints

```
Mobile:   < 640px   — Single column, stacked layout
Tablet:   640-1024px — 2-column grid, collapsible sidebar
Desktop:  > 1024px   — Full layout, sidebar + main content
Wide:     > 1440px   — Max-width container, centered
```

### Mobile Specifics
- Inputs and results stack vertically
- Charts full-width, reduced height
- Summary cards: horizontal scroll
- Navigation: hamburger menu with slide-in panel
- Touch-friendly: larger tap targets (44px minimum)

---

## Key Screens to Design

1. **Landing Page** — Hero + categories + features + CTA
2. **Deterministic Calculator** — Form + results + chart + table
3. **Stochastic Calculator** — Form + percentile bands chart + stats
4. **What-if Analysis** — Form + area chart with bands + explanation
5. **Income Tax Calculator** — Form + slab breakdown + comparison
6. **EMI Calculator** — Form + amortization chart + schedule
7. **Mobile Navigation** — Hamburger menu with search
8. **Dark/Light Mode Toggle** — Both themes

---

## Technical Notes

- Framework: Next.js 16 (App Router)
- UI Library: shadcn/ui (base-nova style with `@base-ui/react`)
- Charts: Recharts (LineChart, AreaChart, PieChart)
- Animations: Framer Motion
- Styling: TailwindCSS 4
- Icons: Lucide React
- No `asChild` prop — use `render={<Component />}` for base-ui primitives
- Chart colors use HSL CSS variables: `hsl(var(--chart-1))`

---

## Deliverables

Please provide:
1. **Full-page mockups** for key screens (dark mode primary, light mode secondary)
2. **Component library** — all reusable components styled consistently
3. **Color/token system** — CSS variables for easy theme switching
4. **Responsive layouts** — mobile, tablet, desktop variants
5. **Interaction specs** — hover states, animations, transitions
6. **Asset exports** — icons, logos, gradients if any custom assets

---

## Brand Personality

- **Trustworthy** — This handles people's life savings
- **Precise** — Every number matters
- **Modern** — Not your father's bank website
- **Approachable** — Complex math, simple interface
- **Indian** — ₹ symbols, Indian number formatting (lakhs/crores), Made in India pride

---

*Built by Sandesh Rathi | 🇮🇳 Made in India with love*
