"use client";

import React from "react";
import { Sparkles, Info } from "lucide-react";

interface CandidateDetails {
  name: string;
  skills?: string[];
  bio?: string;
  jobTitle: string;
}

interface CandidateAboutSkillsProps {
  candidate: CandidateDetails;
}

export function CandidateAboutSkills({ candidate }: CandidateAboutSkillsProps) {
  const hasBio = !!candidate.bio;
  const hasSkills = candidate.skills && candidate.skills.length > 0;

  if (!hasBio && !hasSkills) return null;

  return (
    <div className="space-y-6 pt-5 border-t border-neutral-200/30 dark:border-neutral-850/50">
      {/* About Candidate Section */}
      {hasBio && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Info className="w-4 h-4 text-primary" /> About Candidate
          </h3>
          <div className="p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
            <p className="text-xs text-foreground/95 leading-relaxed font-medium">{candidate.bio}</p>
          </div>
        </div>
      )}

      {/* Core Skills Section */}
      {hasSkills && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" /> Core Skills
          </h3>
          <div className="flex flex-wrap gap-1.5 p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
            {candidate.skills!.map((skill) => (
              <span key={skill} className="px-2.5 py-1 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/10 text-[10px] font-bold text-primary">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
