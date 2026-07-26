import Link from "next/link";
import { Calculator } from "lucide-react";

export function Footer() {
  return (
    <footer className="px-6 py-24 border-t border-outline-variant/10 bg-surface-container-lowest">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-3 mb-6">
            <img src="/logo.png" alt="RupeeMap" className="h-10 w-auto object-contain" />
            <span className="text-xl font-bold">
              <span className="text-white">Rupee</span>
              <span className="text-primary">Map</span>
            </span>
          </Link>
          <p className="text-on-surface-variant max-w-sm mb-8">
            Empowering Indian households with the same analytical rigor used by
            professional wealth managers. Built for clarity, transparency, and action.
          </p>
          <div className="flex gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full glass-effect flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="mailto:support@rupeemap.com"
              className="w-10 h-10 rounded-full glass-effect flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Resources */}
        <div>
          <h5 className="label-caps text-on-surface tracking-widest uppercase mb-6">
            Resources
          </h5>
          <ul className="space-y-4 text-on-surface-variant">
            <li>
              <a
                href="/research/ssrn-5381648-dynamic.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Financial Research
              </a>
            </li>
            <li>
              <Link href="/income-tax" className="hover:text-primary transition-colors">
                Taxation Guides
              </Link>
            </li>
            <li>
              <span className="hover:text-primary transition-colors cursor-default">
                Market Data Sources
              </span>
            </li>
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Open-Source Logic
              </a>
            </li>
          </ul>
        </div>

        {/* Product */}
        <div>
          <h5 className="label-caps text-on-surface tracking-widest uppercase mb-6">
            Product
          </h5>
          <ul className="space-y-4 text-on-surface-variant">
            <li>
              <Link href="/deterministic" className="hover:text-primary transition-colors">
                Calculators
              </Link>
            </li>
            <li>
              <Link href="/stochastic" className="hover:text-primary transition-colors">
                Methodology
              </Link>
            </li>
            <li>
              <span className="hover:text-primary transition-colors cursor-default">
                Case Studies
              </span>
            </li>
            <li>
              <span className="hover:text-primary transition-colors cursor-default">
                Roadmap
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1440px] mx-auto mt-24 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="font-data text-xs text-outline">
            © 2026 RupeeMap Financial Labs. All rights reserved.
          </span>
          <span className="text-outline/30">·</span>
          <Link
            href="/chat"
            className="flex items-center gap-1.5 text-xs text-outline hover:text-cyan-400 transition-colors"
          >
            <span>🤖</span>
            <span>Powered by ArthaAI</span>
          </Link>
        </div>
        <div className="flex gap-8 label-caps text-xs text-outline uppercase tracking-widest">
          <Link href="/privacy-policy" className="hover:text-on-surface transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:text-on-surface transition-colors">
            Terms of Service
          </Link>
          <Link href="/cookie-policy" className="hover:text-on-surface transition-colors">
            Cookie Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
