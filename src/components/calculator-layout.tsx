"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

interface CalculatorLayoutProps {
  title: string;
  description: string;
  info?: string;
  inputs: ReactNode;
  results: ReactNode;
  isCalculating?: boolean;
}

export function CalculatorLayout({
  title,
  description,
  info,
  inputs,
  results,
  isCalculating,
}: CalculatorLayoutProps) {
  return (
    <div className="p-6 lg:p-8">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar: Inputs */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="col-span-12 lg:col-span-4 flex flex-col gap-6"
        >
          <div className="sticky top-24">
            {inputs}
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <motion.main
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="col-span-12 lg:col-span-8 flex flex-col gap-6"
        >
          {isCalculating ? (
            <div className="glass-effect rounded-xl flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-on-surface-variant">Calculating...</p>
              </div>
            </div>
          ) : (
            results
          )}
        </motion.main>
      </div>

      {/* Info Section */}
      {info && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 glass-effect rounded-xl p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Info className="h-4 w-4 text-primary" />
            </div>
            <div className="text-sm text-on-surface-variant leading-relaxed">
              {info}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
