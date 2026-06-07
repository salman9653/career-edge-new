"use client";

import React from "react";
import { Briefcase, Building, Clock, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface CandidateCareerTabProps {
  formData: any;
  updateField: (key: string, value: any) => void;
}

const WORK_STATUS_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "fresher", label: "Fresher" },
  { value: "experienced", label: "Experienced" }
];

const NOTICE_PERIOD_OPTIONS = [
  { value: "0", label: "Immediate" },
  { value: "15", label: "15 Days" },
  { value: "30", label: "1 Month" },
  { value: "45", label: "45 Days" },
  { value: "60", label: "2 Months" },
  { value: "90", label: "3 Months" }
];

export function CandidateCareerTab({ formData, updateField }: CandidateCareerTabProps) {
  const handleCareerChange = (field: string, value: string) => {
    updateField("career", {
      ...formData.career,
      [field]: value
    });
  };

  return (
    <div className="space-y-6 text-left font-semibold text-xs text-foreground">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Row 1 */}
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Current Job Title
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={formData.career.jobTitle}
              onChange={(e) => handleCareerChange("jobTitle", e.target.value)}
              placeholder="e.g. Software Developer"
              required
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>

        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Current Company
          </label>
          <div className="relative">
            <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={formData.career.currentCompany}
              onChange={(e) => handleCareerChange("currentCompany", e.target.value)}
              placeholder="e.g. Acme Corp"
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Work Status
          </label>
          <Select
            value={formData.career.workStatus}
            onChange={(val) => handleCareerChange("workStatus", val)}
            options={WORK_STATUS_OPTIONS}
            placeholder="Select Option"
            icon={<Briefcase className="w-4 h-4" />}
            className="h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold px-3.5"
          />
        </div>

        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Total Years of Experience
          </label>
          <div className="relative">
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              value={formData.career.totalExperience}
              onChange={(e) => handleCareerChange("totalExperience", e.target.value)}
              placeholder="e.g. 3"
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Notice Period
          </label>
          <Select
            value={formData.career.noticePeriod}
            onChange={(val) => handleCareerChange("noticePeriod", val)}
            options={NOTICE_PERIOD_OPTIONS}
            placeholder="Select Option"
            icon={<Clock className="w-4 h-4" />}
            className="h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold px-3.5"
          />
        </div>

        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Current Salary (LPA)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={formData.career.currentSalary}
              onChange={(e) => handleCareerChange("currentSalary", e.target.value)}
              placeholder="e.g. 3.60"
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
