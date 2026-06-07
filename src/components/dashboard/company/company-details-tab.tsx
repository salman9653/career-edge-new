"use client";

import React from "react";
import { Building, Briefcase, MapPin, Users, Calendar, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CompanyDetailsTabProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function CompanyDetailsTab({ formData, handleChange }: CompanyDetailsTabProps) {
  return (
    <div className="space-y-6 font-semibold text-left text-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Company Name</label>
          <div className="relative">
            <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Industry</label>
          <div className="relative">
            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              required
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Company Size</label>
          <div className="relative">
            <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
              placeholder="e.g. 50-100 employees"
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Company Type</label>
          <div className="relative">
            <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              name="companyType"
              value={formData.companyType}
              onChange={handleChange}
              placeholder="e.g. Private"
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Founded Year</label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              name="founded"
              value={formData.founded}
              onChange={handleChange}
              placeholder="e.g. 2018"
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      <div className="space-y-0.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">About Description</label>
        <div className="relative">
          <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            rows={4}
            placeholder="About the company..."
            className="flex min-h-[100px] w-full rounded-xl border border-input bg-neutral-50/50 dark:bg-neutral-900/40 pl-11 pr-3 py-3 text-xs font-medium leading-relaxed resize-none focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>
    </div>
  );
}
