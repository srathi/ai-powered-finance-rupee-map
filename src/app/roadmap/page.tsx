"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Lightbulb,
  Rocket,
  Wrench,
  CheckCircle2,
  Clock,
  Tag,
} from "lucide-react";
import {
  roadmapFeatures,
  roadmapCategories,
  columns,
  type RoadmapColumn,
} from "@/lib/roadmap-data";

const columnIcons: Record<RoadmapColumn, React.ReactNode> = {
  ideas: <Lightbulb className="h-5 w-5" />,
  "coming-soon": <Rocket className="h-5 w-5" />,
  "in-progress": <Wrench className="h-5 w-5" />,
  shipped: <CheckCircle2 className="h-5 w-5" />,
};

const columnColors: Record<RoadmapColumn, string> = {
  ideas: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "coming-soon": "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  "in-progress": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  shipped: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

const cardBorderColors: Record<RoadmapColumn, string> = {
  ideas: "border-amber-500/10 hover:border-amber-500/30",
  "coming-soon": "border-cyan-500/10 hover:border-cyan-500/30",
  "in-progress": "border-blue-500/10 hover:border-blue-500/30",
  shipped: "border-emerald-500/10 hover:border-emerald-500/30",
};

const categoryColors: Record<string, string> = {
  Calculators: "bg-primary/10 text-primary",
  Tax: "bg-amber-500/10 text-amber-400",
  Loan: "bg-blue-500/10 text-blue-400",
  Investment: "bg-emerald-500/10 text-emerald-400",
  Retirement: "bg-cyan-500/10 text-cyan-400",
  Goals: "bg-purple-500/10 text-purple-400",
  AI: "bg-pink-500/10 text-pink-400",
  Learn: "bg-orange-500/10 text-orange-400",
  Design: "bg-violet-500/10 text-violet-400",
  General: "bg-slate-500/10 text-slate-400",
};

export default function RoadmapPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? roadmapFeatures
      : roadmapFeatures.filter((f) => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative px-6 pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-[1200px] mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-on-surface">Building the Future of</span>{" "}
              <span className="text-primary">Financial Planning</span>
            </h1>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-4">
              See what we&apos;re working on. Suggest what we should build next.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last updated: July 2026
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="px-6 pb-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-wrap items-center gap-2 justify-center">
            {roadmapCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-on-surface-variant hover:bg-surface-hover border border-transparent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Columns */}
      <section className="px-6 pb-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((col) => {
              const features = filtered.filter((f) => f.column === col.id);
              return (
                <motion.div
                  key={col.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col"
                >
                  {/* Column Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-2 rounded-lg border ${columnColors[col.id]}`}
                    >
                      {columnIcons[col.id]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-on-surface">
                        {col.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {col.description}
                      </p>
                    </div>
                  </div>

                  {/* Feature Cards */}
                  <div className="flex flex-col gap-3 flex-1">
                    {features.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-outline-variant/20 text-center text-sm text-muted-foreground">
                        No items in this category
                      </div>
                    ) : (
                      features.map((feature) => (
                        <motion.div
                          key={feature.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-4 rounded-xl glass-effect border transition-colors ${cardBorderColors[col.id]}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium text-sm text-on-surface leading-snug">
                              {feature.title}
                            </h4>
                          </div>
                          <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                            {feature.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                categoryColors[feature.category] ||
                                "bg-slate-500/10 text-slate-400"
                              }`}
                            >
                              <Tag className="h-2.5 w-2.5" />
                              {feature.category}
                            </span>
                            {col.id === "shipped" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Live
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-[800px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-effect rounded-2xl p-8 border border-outline-variant/20"
          >
            <h2 className="text-2xl font-bold text-on-surface mb-3">
              Have an Idea?
            </h2>
            <p className="text-on-surface-variant mb-6">
              We love hearing from our users. Tell us what features would make
              RupeeMap more useful for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://github.com/srathi/ai-powered-finance-rupee-map/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl btn-primary-gradient font-semibold text-sm"
              >
                Suggest a Feature
              </a>
              <a
                href="https://github.com/srathi/ai-powered-finance-rupee-map"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl border border-outline-variant/30 font-semibold text-sm text-on-surface hover:bg-surface-hover transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </motion.div>

          <p className="mt-6 text-xs text-muted-foreground">
            Dates are estimates &mdash; we ship when it&apos;s ready, not before.
          </p>
        </div>
      </section>
    </div>
  );
}
