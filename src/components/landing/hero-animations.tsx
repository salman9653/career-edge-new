"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import { Briefcase, CheckCircle, BarChart3, Clock } from "lucide-react";

export function HeroAnimations() {
  const floatingVariants: Variants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const floatingDelayVariants: Variants = {
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 4.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1,
      },
    },
  };

  return (
    <div className="lg:col-span-5 relative w-full h-[450px] flex items-center justify-center">
      {/* Center Glowing Hub */}
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 blur-2xl animate-pulse" />

      {/* Floating Card 1: Job Match Card */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-4 left-6 sm:left-12 w-[260px] glass p-4 rounded-2xl shadow-xl border border-indigo-200/10 z-10 bg-background/50"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Briefcase className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold">Senior AI Engineer</h4>
              <p className="text-[10px] text-muted-foreground">OpenAI Inc.</p>
            </div>
          </div>
          <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
            98% Match
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-1.5 rounded-full w-[98%]" />
          </div>
          <div className="flex items-center justify-between text-[9px] text-muted-foreground">
            <span>Skills Score: 95%</span>
            <span>Experience Score: 100%</span>
          </div>
        </div>
      </motion.div>

      {/* Floating Card 2: Interview Auto-Scheduled */}
      <motion.div
        variants={floatingDelayVariants}
        animate="animate"
        className="absolute bottom-6 right-6 sm:right-12 w-[240px] glass p-4 rounded-2xl shadow-xl border border-indigo-200/10 z-10 bg-background/50"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-500">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold">Interview Confirmed</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">Today at 3:00 PM</p>
          </div>
        </div>
        <div className="mt-3 flex items-center space-x-2 text-[10px] bg-neutral-100 dark:bg-neutral-900/50 px-2 py-1 rounded-lg border border-neutral-200/30">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-muted-foreground">Candidate: Alex Rivera</span>
        </div>
      </motion.div>

      {/* Floating Card 3: AI Skill Chart */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute right-4 top-24 w-[200px] glass p-4 rounded-2xl shadow-xl border border-indigo-200/10 z-0 hidden sm:block bg-background/50"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-violet-500" /> AI Insights
          </span>
          <span className="text-[9px] text-emerald-500 font-bold">+24% Match</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">React / Next.js</span>
            <span className="font-semibold">95%</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Python & PyTorch</span>
            <span className="font-semibold">88%</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">System Design</span>
            <span className="font-semibold">92%</span>
          </div>
        </div>
      </motion.div>

      {/* Large Decorative Central Dashboard Rings */}
      <div className="w-[300px] h-[300px] rounded-full border border-dashed border-indigo-500/20 absolute animate-spin [animation-duration:40s]" />
      <div className="w-[380px] h-[380px] rounded-full border border-dashed border-violet-500/10 absolute animate-spin [animation-duration:60s] [animation-direction:reverse]" />
    </div>
  );
}
