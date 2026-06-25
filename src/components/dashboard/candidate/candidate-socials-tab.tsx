"use client";

import React from "react";
import { Globe, Link2, Briefcase, Building, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LinkedinIcon, TwitterIcon, GitHubIcon } from "@/components/common";

interface CandidateSocialsTabProps {
  formData: any;
  updateField: (key: string, value: any) => void;
}

export function CandidateSocialsTab({ formData, updateField }: CandidateSocialsTabProps) {
  const handleSocialChange = (field: string, value: string) => {
    updateField("socials", {
      ...formData.socials,
      [field]: value
    });
  };

  return (
    <div className="space-y-6 text-left font-semibold text-xs text-foreground">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h3 className="text-sm font-extrabold text-foreground">Online Profiles</h3>
        <p className="text-xs text-muted-foreground font-medium">
          Online Links & Portals
        </p>
      </div>

      <div className="space-y-4 pt-2">
        {/* Row 1: Portfolio, GitHub */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Portfolio Website</label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={formData.socials.portfolio}
                onChange={(e) => handleSocialChange("portfolio", e.target.value)}
                placeholder="https://mywebsite.com"
                className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">GitHub Profile</label>
            <div className="relative">
              <GitHubIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={formData.socials.github}
                onChange={(e) => handleSocialChange("github", e.target.value)}
                placeholder="github.com/username"
                className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Twitter, LinkedIn */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Twitter / X Handle</label>
            <div className="relative">
              <TwitterIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={formData.socials.twitter}
                onChange={(e) => handleSocialChange("twitter", e.target.value)}
                placeholder="@username"
                className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">LinkedIn URL</label>
            <div className="relative">
              <LinkedinIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={formData.socials.linkedin}
                onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                placeholder="linkedin.com/in/username"
                className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Naukri, Indeed, Glassdoor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Naukri Candidate ID</label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={formData.socials.naukri}
                onChange={(e) => handleSocialChange("naukri", e.target.value)}
                placeholder="Naukri ID or Link"
                className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Indeed Profile</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={formData.socials.indeed}
                onChange={(e) => handleSocialChange("indeed", e.target.value)}
                placeholder="Indeed ID or Link"
                className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Glassdoor URL</label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={formData.socials.glassdoor}
                onChange={(e) => handleSocialChange("glassdoor", e.target.value)}
                placeholder="Glassdoor Profile link"
                className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
