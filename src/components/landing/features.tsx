"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain } from "lucide-react";
import { CANDIDATE_FEATURES, COMPANY_FEATURES } from "@/lib/constants";
import { FeatureCard } from "./feature-card";

export default function Features() {
  const [activeTab, setActiveTab] = useState<"candidates" | "companies">("candidates");
  const currentFeatures = activeTab === "candidates" ? CANDIDATE_FEATURES : COMPANY_FEATURES;

  return (
    <section id="features" className="py-20 lg:py-32 relative overflow-hidden bg-neutral-50/50 dark:bg-neutral-950/20 border-y border-neutral-200/50 dark:border-neutral-800/30">
      {/* Background Decorator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/2 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-base font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <Brain className="w-5 h-5 text-indigo-500" /> Platform Features
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Designed for the Future of Recruitment
          </h3>
          <p className="text-muted-foreground text-base sm:text-lg">
            Discover a unified workspace designed specifically to bridge the gap between world-class talent and hiring teams.
          </p>
        </div>

        {/* Custom Tab Switcher */}
        <div className="flex justify-center mb-16">
          <div className="relative flex p-1.5 bg-neutral-200/70 dark:bg-neutral-900/60 rounded-2xl border border-neutral-300/30 dark:border-neutral-800/60 max-w-sm w-full shadow-inner">
            {/* Candidates Button */}
            <button
              onClick={() => setActiveTab("candidates")}
              className={`flex-1 relative py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 z-10 cursor-pointer ${activeTab === "candidates" ? "text-white" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {activeTab === "candidates" && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl -z-10 shadow-md"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              For Candidates
            </button>

            {/* Companies Button */}
            <button
              onClick={() => setActiveTab("companies")}
              className={`flex-1 relative py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 z-10 cursor-pointer ${activeTab === "companies" ? "text-white" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {activeTab === "companies" && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl -z-10 shadow-md"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              For Companies
            </button>
          </div>
        </div>

        {/* Feature Cards Grid with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
          >
            {currentFeatures.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                highlight={feature.highlight}
                badge={feature.badge}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
