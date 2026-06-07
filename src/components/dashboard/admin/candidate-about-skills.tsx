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

const DummyTag = () => (
  <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-500/10 text-[7px] font-bold text-amber-500 dark:text-amber-400 border border-amber-500/15 ml-1.5 uppercase select-none tracking-wider scale-90 origin-left">
    dummy
  </span>
);

export function CandidateAboutSkills({ candidate }: CandidateAboutSkillsProps) {
  const isSkillsDummy = !candidate.skills;
  const isBioDummy = !candidate.bio;

  const skills = candidate.skills || ["React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js", "MongoDB"];
  const bio = candidate.bio || `${candidate.name} is a highly motivated professional specializing in ${candidate.jobTitle}. With strong foundational knowledge and a passion for technology, they strive to deliver top-notch solutions and continuously learn.`;

  return (
    <div className="space-y-6 pt-5 border-t border-neutral-200/30 dark:border-neutral-850/50">
      {/* About Candidate Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Info className="w-4 h-4 text-primary" /> About Candidate {isBioDummy && <DummyTag />}
        </h3>
        <div className="p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
          <p className="text-xs text-foreground/95 leading-relaxed font-medium">{bio}</p>
        </div>
      </div>

      {/* Core Skills Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" /> Core Skills {isSkillsDummy && <DummyTag />}
        </h3>
        <div className="flex flex-wrap gap-1.5 p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
          {skills.map((skill) => (
            <span key={skill} className="px-2.5 py-1 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/10 text-[10px] font-bold text-primary">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
