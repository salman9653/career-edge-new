"use client";

import React from "react";
import { motion } from "motion/react";
import { STAGGER_CONTAINER_VARIANTS } from "@/lib/constants";

interface StaggerChildrenProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function StaggerChildren({ children, className, delay = 0 }: StaggerChildrenProps) {
  return (
    <motion.div
      variants={STAGGER_CONTAINER_VARIANTS}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
