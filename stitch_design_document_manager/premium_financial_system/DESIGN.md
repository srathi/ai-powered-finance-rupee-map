---
name: Premium Financial System
colors:
  surface: hsl(222, 47%, 11%)
  surface-dim: '#0d1320'
  surface-bright: '#333948'
  surface-container-lowest: '#080e1b'
  surface-container-low: '#161b29'
  surface-container: '#1a1f2d'
  surface-container-high: '#242a38'
  surface-container-highest: '#2f3543'
  on-surface: '#dde2f5'
  on-surface-variant: '#bec8d2'
  inverse-surface: '#dde2f5'
  inverse-on-surface: '#2a303f'
  outline: '#88929b'
  outline-variant: '#3e4850'
  surface-tint: '#89ceff'
  primary: '#89ceff'
  on-primary: '#00344d'
  primary-container: '#0ea5e9'
  on-primary-container: '#003751'
  inverse-primary: '#006591'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#d88a00'
  on-tertiary-container: '#4a2c00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c9e6ff'
  primary-fixed-dim: '#89ceff'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#004c6e'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0d1320'
  on-background: '#dde2f5'
  surface-variant: '#2f3543'
  surface-hover: hsl(222, 47%, 14%)
  border: hsl(222, 47%, 18%)
  border-active: hsl(222, 47%, 25%)
  success: hsl(160, 84%, 39%)
  danger: hsl(0, 84%, 60%)
  warning: hsl(38, 92%, 50%)
  info: hsl(250, 89%, 67%)
  cyan-glow: hsla(199, 89%, 48%, 0.15)
typography:
  hero-lg:
    fontFamily: Geist
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-display:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-section:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.1'
  data-md:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.2'
  data-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.2'
  hero-lg-mobile:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.1'
  data-lg-mobile:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2.5rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style

The design system is engineered for high-precision financial tooling, blending the data-dense utility of a professional trading terminal with the sophisticated aesthetics of modern consumer fintech. It targets a financially literate audience that demands clarity, speed, and a sense of institutional-grade reliability.

The visual direction is a hybrid of **Minimalism** and **Glassmorphism**, specifically optimized for a dark-first environment. It utilizes deep, layered backgrounds to provide a sense of infinite depth, while glass-like surfaces and neon accent glows guide the eye toward critical financial insights. The mood is clinical yet premium—prioritizing legibility and structural integrity while maintaining a "future of finance" allure through subtle micro-interactions and high-contrast accents.

## Colors

This design system utilizes a "Deep Navy Black" foundation to maximize the vibrancy of its neon functional colors. The palette is strictly hierarchical:

- **Primary & UI Core:** Electric Cyan is the primary action color, used for high-importance interactions and primary data threads.
- **Semantic Logic:** Success (Emerald), Danger (Red), and Warning (Amber) follow industry standards but are boosted in saturation to pierce through the dark background.
- **Glass Infrastructure:** Surfaces are not solid; they are semi-transparent layers that build depth. Borders use a specific low-luminance HSL range to remain visible without creating visual noise.
- **Light Mode:** While dark-first, the light mode transition maps the deep navy to an ultra-clean white (`#FCFCFD`), maintaining the same accent saturations for brand consistency.

## Typography

The typographic strategy differentiates between "Narrative" and "Data."

1.  **Narrative (Geist Sans):** Used for all UI labels, headings, and instructional text. It features tight tracking in large sizes to evoke a modern, tech-forward feel.
2.  **Data (JetBrains Mono):** Reserved strictly for financial figures, currency symbols, and percentages. The monospaced nature ensures that columns of numbers align perfectly in tables and results cards, conveying mathematical precision.
3.  **Hierarchy:** Large display sizes use aggressive negative letter spacing. Labels should always be treated with wide tracking and uppercase styling to provide a structural "frame" for the content.

## Layout & Spacing

The design system employs a **Fixed Grid** model for desktop to maintain the "Terminal" density, transitioning to a fluid stack for mobile.

- **Grid:** A 12-column grid is used for the main content area. In calculator views, a 4-column "Input" sidebar is paired with an 8-column "Results" area.
- **Rhythm:** An 8px base unit drives all padding and margins. 
- **Density:** High information density is encouraged. Elements should be grouped tightly within cards (`stack-sm`) while the cards themselves are separated by more generous gaps (`stack-lg`) to prevent visual overwhelm.
- **Mobile Behavior:** At the 640px breakpoint, sidebars collapse into a single-column flow. Financial summary metrics transition into a horizontal-scrolling row to preserve screen real estate.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Glassmorphism** rather than traditional drop shadows.

- **Background:** The base layer is the deep navy black (`hsl(222, 47%, 7%)`).
- **Surface (Glass):** UI cards use a `0.03` opacity white fill with a `12px` backdrop blur. This allows background colors and glows to subtly bleed through, creating a sense of physical material.
- **Borders:** Every glass element is defined by a 1px solid border at `0.06` opacity. This "hairline" border is essential for defining the edges of elements against dark backgrounds.
- **Interactive Depth:** On hover, elements do not move "up" via shadows; instead, they increase in opacity and gain a subtle inner glow or an outer "bloom" effect in the Primary Cyan.

## Shapes

The shape language is refined and geometric. A `0.5rem` (8px) radius is the standard for most components (inputs, buttons, cards), providing a balance between approachable modern design and the "sharp" precision of a financial tool. 

Larger containers like the main results area may use `1rem` (16px) to clearly enclose multiple sub-components. Form controls like checkboxes and radio buttons remain slightly sharper to emphasize their functional, "toggling" nature.

## Components

### Glass Cards
The signature component. Must include `backdrop-filter: blur(12px)` and a subtle `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`. On hover, the border color shifts to `border-active`.

### Metric Cards
Designed to showcase the "Required Corpus" or "Monthly Savings." 
- **Top:** Label in `label-caps` (muted color).
- **Middle:** Large `data-lg` number in white or Electric Cyan.
- **Bottom:** A "Sparkline"—a simplified Recharts line without axes—showing the 10-year trend.

### Financial Inputs
Inputs must feature a fixed-width prefix/suffix container for currency icons (₹) or units (%). The background should be a shade darker than the card surface to create a "well" effect. The focus state uses a 2px Primary Cyan border with a subtle outer glow.

### Sliders
Custom range sliders use a Primary Cyan track. The "thumb" should be a 20px circle with a `0 0 10px` glow effect of the same color, making it look like a physical light source being moved.

### Charts & Data Viz
Use `hsl(var(--chart-1))` through 5 for color assignments. Area charts must use a vertical gradient fill from the stroke color to `transparent`. Grid lines must be kept at `0.1` opacity, ensuring the data remains the hero. Tooltips should be styled as mini-glass cards.

### Buttons
- **Primary:** A vibrant gradient from Primary Cyan to Info Purple.
- **Ghost:** No background, 1px border. On hover, fills with a very low opacity Cyan.
- **Loading:** Use a circular spinner that matches the Primary Cyan glow.