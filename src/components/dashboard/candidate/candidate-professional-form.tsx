"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Upload, Trash2 } from "lucide-react";

interface CandidateProfessionalFormProps {
  formData: any;
  updateField: (key: string, value: any) => void;
}

export function CandidateProfessionalForm({ formData, updateField }: CandidateProfessionalFormProps) {
  const [newSkill, setNewSkill] = useState("");

  const handleCareerChange = (field: string, value: string) => {
    updateField("career", {
      ...formData.career,
      [field]: value
    });
  };

  const handleSocialChange = (field: string, value: string) => {
    updateField("socials", {
      ...formData.socials,
      [field]: value
    });
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateField("resumeName", file.name);
      updateField("resumeBase64", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const current = formData.skills || [];
    if (current.includes(newSkill.trim())) return;
    updateField("skills", [...current, newSkill.trim()]);
    setNewSkill("");
  };

  return (
    <div className="space-y-6 text-left font-semibold text-xs text-foreground">
      {/* Career Profile */}
      <div className="space-y-4">
        <label className="text-[10px] uppercase text-muted-foreground block">Career Attributes</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-muted-foreground">Target Job Title</label>
            <Input value={formData.career.jobTitle} onChange={(e) => handleCareerChange("jobTitle", e.target.value)} required className="h-9 text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-muted-foreground">Current Company</label>
            <Input value={formData.career.currentCompany} onChange={(e) => handleCareerChange("currentCompany", e.target.value)} className="h-9 text-xs" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-muted-foreground">Work Status</label>
            <select
              value={formData.career.workStatus}
              onChange={(e) => handleCareerChange("workStatus", e.target.value)}
              className="w-full h-9 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 bg-background px-3 text-xs font-semibold"
            >
              <option value="">Select Option</option>
              <option value="student">Student</option>
              <option value="fresher">Fresher</option>
              <option value="experienced">Experienced</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-muted-foreground">Total Experience (Years)</label>
            <Input value={formData.career.totalExperience} onChange={(e) => handleCareerChange("totalExperience", e.target.value)} placeholder="e.g. 3" className="h-9 text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-muted-foreground">Notice Period (Days)</label>
            <Input value={formData.career.noticePeriod} onChange={(e) => handleCareerChange("noticePeriod", e.target.value)} placeholder="e.g. 30" className="h-9 text-xs" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-muted-foreground">Current Salary (LPA)</label>
            <Input value={formData.career.currentSalary} onChange={(e) => handleCareerChange("currentSalary", e.target.value)} placeholder="e.g. 6.5" className="h-9 text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-muted-foreground">Expected Salary (LPA)</label>
            <Input value={formData.career.expectedSalary} onChange={(e) => handleCareerChange("expectedSalary", e.target.value)} placeholder="e.g. 12" className="h-9 text-xs" />
          </div>
        </div>
      </div>

      {/* Resume File */}
      <div className="space-y-4 pt-4 border-t border-neutral-200/30 dark:border-neutral-855/30">
        <label className="text-[10px] uppercase text-muted-foreground block">Resume Upload</label>
        <div className="flex items-center gap-4 bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
          {formData.resumeName ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold truncate max-w-[280px]">{formData.resumeName}</span>
              <Button type="button" onClick={() => { updateField("resumeName", ""); updateField("resumeBase64", ""); }} variant="ghost" className="h-8 w-8 text-rose-500 rounded-lg"><Trash2 className="w-4 h-4" /></Button>
            </div>
          ) : (
            <label className="flex items-center gap-2 cursor-pointer border border-dashed border-neutral-250 dark:border-neutral-750 px-4 py-3 rounded-xl hover:bg-neutral-100/20 w-full justify-center">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Click to upload PDF or DOCX</span>
              <input type="file" onChange={handleResumeUpload} accept=".pdf,.doc,.docx" className="hidden" />
            </label>
          )}
        </div>
      </div>

      {/* Key Skills */}
      <div className="space-y-4 pt-4 border-t border-neutral-200/30 dark:border-neutral-855/30">
        <label className="text-[10px] uppercase text-muted-foreground block">Key Skills</label>
        <div className="space-y-3 bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
          <div className="flex gap-2">
            <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="e.g. Next.js" className="h-9 text-xs" />
            <Button type="button" onClick={addSkill} variant="secondary" className="h-9 px-3 rounded-lg"><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(formData.skills || []).map((s: string) => (
              <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/10 text-[10px] font-bold text-primary">
                <span>{s}</span>
                <button type="button" onClick={() => updateField("skills", formData.skills.filter((sk: string) => sk !== s))} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Online Profiles */}
      <div className="space-y-4 pt-4 border-t border-neutral-200/30 dark:border-neutral-855/30">
        <label className="text-[10px] uppercase text-muted-foreground block">Online Links</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-muted-foreground">GitHub Profile</label>
            <Input value={formData.socials.github} onChange={(e) => handleSocialChange("github", e.target.value)} placeholder="github.com/username" className="h-9 text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-muted-foreground">LinkedIn URL</label>
            <Input value={formData.socials.linkedin} onChange={(e) => handleSocialChange("linkedin", e.target.value)} placeholder="linkedin.com/in/username" className="h-9 text-xs" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-muted-foreground">Twitter / X Handle</label>
            <Input value={formData.socials.twitter} onChange={(e) => handleSocialChange("twitter", e.target.value)} placeholder="@username" className="h-9 text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-muted-foreground">Portfolio URL</label>
            <Input value={formData.socials.portfolio} onChange={(e) => handleSocialChange("portfolio", e.target.value)} placeholder="https://mywebsite.com" className="h-9 text-xs" />
          </div>
        </div>
      </div>
    </div>
  );
}
