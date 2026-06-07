"use client";

import React, { useState } from "react";
import { Building, Award, Globe, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui";
import { COMPANY_SIZES } from "@/lib/constants";
import { CompanyProfile } from "@/types";

interface OnboardingCompanyFormProps {
  initialProfile?: CompanyProfile | null;
  loading: boolean;
  onSubmit: (data: {
    companyName: string;
    industry: string;
    location: string;
    websiteUrl?: string;
    companySize?: string;
  }) => void;
  onCancel: () => void;
}

export function OnboardingCompanyForm({
  initialProfile,
  loading,
  onSubmit,
  onCancel,
}: OnboardingCompanyFormProps) {
  const [companyName, setCompanyName] = useState(() => initialProfile?.companyName || "");
  const [industry, setIndustry] = useState(() => initialProfile?.industry || "");
  const [websiteUrl, setWebsiteUrl] = useState(() => initialProfile?.websiteUrl || "");
  const [companySize, setCompanySize] = useState(() => initialProfile?.companySize || "");
  const [location, setLocation] = useState(() => initialProfile?.location || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !industry.trim() || !location.trim()) return;
    onSubmit({
      companyName,
      industry,
      location,
      websiteUrl: websiteUrl.trim() || undefined,
      companySize: companySize || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Company Name
          </label>
          <div className="relative">
            <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Acme Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Industry
          </label>
          <div className="relative">
            <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Technology, Healthcare..."
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl"
              required
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Website URL (Optional)
          </label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="url"
              placeholder="https://acme.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Company Size (Optional)
          </label>
          <Select
            value={companySize}
            onChange={setCompanySize}
            options={COMPANY_SIZES}
            placeholder="Select size"
            icon={<Users className="w-4 h-4" />}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
          Hiring Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Remote, San Francisco, CA..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl"
            required
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3.5 pt-4">
        <Button
          type="submit"
          variant="premium"
          className="flex-grow h-11 rounded-xl font-bold order-2 sm:order-1"
          isLoading={loading}
        >
          Save and Continue
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="ghost"
          className="h-11 rounded-xl font-semibold text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 order-1 sm:order-2 cursor-pointer"
          disabled={loading}
        >
          Skip for now
        </Button>
      </div>
    </form>
  );
}
