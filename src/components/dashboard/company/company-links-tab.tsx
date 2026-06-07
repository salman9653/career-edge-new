"use client";

import React from "react";
import { Globe, Briefcase, Building, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LinkedinIcon, TwitterIcon, FacebookIcon, InstagramIcon } from "@/components/common";

interface CompanyLinksTabProps {
  formData: any;
  handleNestedChange: (category: "socials" | "contact", field: string, value: string) => void;
}

export function CompanyLinksTab({ formData, handleNestedChange }: CompanyLinksTabProps) {
  return (
    <div className="space-y-6 font-semibold text-left text-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Website URL</label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={formData.socials.website}
              onChange={(e) => handleNestedChange("socials", "website", e.target.value)}
              placeholder="https://example.com"
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">LinkedIn Handle/URL</label>
          <div className="relative">
            <LinkedinIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={formData.socials.linkedin}
              onChange={(e) => handleNestedChange("socials", "linkedin", e.target.value)}
              placeholder="linkedin.com/company/username"
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Twitter / X Handle</label>
          <div className="relative">
            <TwitterIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={formData.socials.twitter}
              onChange={(e) => handleNestedChange("socials", "twitter", e.target.value)}
              placeholder="@handle"
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Facebook Page URL</label>
          <div className="relative">
            <FacebookIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={formData.socials.facebook}
              onChange={(e) => handleNestedChange("socials", "facebook", e.target.value)}
              placeholder="facebook.com/username"
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-0.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Naukri Employer ID</label>
          <div className="relative">
            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={formData.socials.naukri}
              onChange={(e) => handleNestedChange("socials", "naukri", e.target.value)}
              placeholder="Employer ID"
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
        <div className="space-y-0.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Indeed Company Page</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={formData.socials.indeed}
              onChange={(e) => handleNestedChange("socials", "indeed", e.target.value)}
              placeholder="Company name"
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
              onChange={(e) => handleNestedChange("socials", "glassdoor", e.target.value)}
              placeholder="Glassdoor link"
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
