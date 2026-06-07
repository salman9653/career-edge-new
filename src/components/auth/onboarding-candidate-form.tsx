"use client";

import React, { useState } from "react";
import { Compass, BookOpen, Award, UploadCloud, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui";
import { EXPERIENCE_LEVELS } from "@/lib/constants";
import { CandidateProfile } from "@/types";

interface OnboardingCandidateFormProps {
  initialProfile?: CandidateProfile | null;
  loading: boolean;
  onSubmit: (data: {
    jobTitle: string;
    skills?: string;
    experience?: string;
    resumeName?: string | null;
    resumeBase64?: string | null;
  }) => void;
  onCancel: () => void;
}

export function OnboardingCandidateForm({
  initialProfile,
  loading,
  onSubmit,
  onCancel,
}: OnboardingCandidateFormProps) {
  const [jobTitle, setJobTitle] = useState(() => initialProfile?.jobTitle || "");
  const [skills, setSkills] = useState(() => 
    initialProfile?.skills ? initialProfile.skills.join(", ") : ""
  );
  const [experience, setExperience] = useState(() => initialProfile?.experience || "");
  const [resumeName, setResumeName] = useState<string | null>(() => initialProfile?.resumeName || null);
  const [resumeBase64, setResumeBase64] = useState<string | null>(() => initialProfile?.resumeBase64 || null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeName(file.name);

      const reader = new FileReader();
      reader.onloadend = () => {
        setResumeBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;
    onSubmit({
      jobTitle,
      skills: skills.trim() || undefined,
      experience: experience || undefined,
      resumeName: resumeName || undefined,
      resumeBase64: resumeBase64 || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Target Job Title
          </label>
          <div className="relative">
            <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Software Engineer..."
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
            Experience Level (Optional)
          </label>
          <Select
            value={experience}
            onChange={setExperience}
            options={EXPERIENCE_LEVELS}
            placeholder="Select experience"
            icon={<BookOpen className="w-4 h-4" />}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
          Skills (Optional, comma-separated)
        </label>
        <div className="relative">
          <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="React, Next.js, Python, TypeScript..."
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl"
          />
        </div>
      </div>

      {/* Resume File Upload Box */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
          Upload Resume (Optional)
        </label>
        <div className="relative group/upload border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 rounded-2xl bg-neutral-50/30 dark:bg-neutral-900/20 p-5 transition-all text-center flex flex-col items-center justify-center cursor-pointer">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
          {resumeName ? (
            <div className="flex items-center space-x-2 text-indigo-500 font-semibold text-sm">
              <FileText className="w-5 h-5 animate-bounce" />
              <span className="max-w-[250px] truncate">{resumeName}</span>
              <span className="text-[10px] text-muted-foreground pl-1">
                {initialProfile?.resumeName === resumeName ? "(Pre-loaded)" : "(Selected)"}
              </span>
            </div>
          ) : (
            <>
              <UploadCloud className="w-7 h-7 text-muted-foreground group-hover/upload:text-indigo-500 transition-colors mb-1.5" />
              <p className="text-xs font-semibold text-foreground">
                Drag & drop or <span className="text-indigo-500 hover:underline">browse files</span>
              </p>
              <p className="text-[9px] text-muted-foreground mt-0.5">Supported: PDF, DOC, DOCX up to 10MB</p>
            </>
          )}
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
