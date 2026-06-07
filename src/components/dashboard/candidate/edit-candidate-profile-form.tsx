"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  CandidateDetailsTab,
  CandidateCareerTab,
  CandidateResumeTab,
  CandidateSkillsTab,
  CandidateEmploymentTab,
  CandidateEducationTab,
  CandidateProjectsTab,
  CandidateSocialsTab,
  CandidatePersonalTab
} from "./index";

interface CandidateFormProps {
  initialProfile: any;
  name: string;
}

const TAB_LABELS = {
  profile: "Profile Details",
  career: "Career Profile",
  resume: "Resume",
  skills: "Key Skills",
  employment: "Employment",
  education: "Education",
  projects: "Projects",
  socials: "Online Profiles",
  personal: "Personal Details"
};

type TabKey = keyof typeof TAB_LABELS;

export function EditCandidateProfileForm({ initialProfile, name }: CandidateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [showSuccess, setShowSuccess] = useState(false);

  const initialSavedData = {
    name: name || initialProfile.name || "",
    image: initialProfile.image || "",
    phone: initialProfile.phone || "",
    location: initialProfile.location || "",
    bio: initialProfile.bio || "",
    dob: initialProfile.dob || "",
    gender: initialProfile.gender || "",
    maritalStatus: initialProfile.maritalStatus || "",
    address: {
      addressLine: initialProfile.address?.addressLine || "",
      city: initialProfile.address?.city || "",
      state: initialProfile.address?.state || "",
      country: initialProfile.address?.country || "",
      pin: initialProfile.address?.pin || "",
    },
    languages: initialProfile.languages || [],
    jobTitle: initialProfile.jobTitle || "",
    skills: initialProfile.skills || [],
    resumeName: initialProfile.resumeName || "",
    resumeBase64: initialProfile.resumeBase64 || "",
    career: {
      jobTitle: initialProfile.career?.jobTitle || initialProfile.jobTitle || "",
      currentCompany: initialProfile.career?.currentCompany || "",
      workStatus: initialProfile.career?.workStatus || "",
      totalExperience: initialProfile.career?.totalExperience || "",
      noticePeriod: initialProfile.career?.noticePeriod || "",
      currentSalary: initialProfile.career?.currentSalary || "",
      expectedSalary: initialProfile.career?.expectedSalary || "",
    },
    employment: initialProfile.employment || [],
    education: initialProfile.education || [],
    projects: initialProfile.projects || [],
    socials: {
      github: initialProfile.socials?.github || initialProfile.github || "",
      twitter: initialProfile.socials?.twitter || initialProfile.twitter || "",
      linkedin: initialProfile.socials?.linkedin || initialProfile.linkedin || "",
      naukri: initialProfile.socials?.naukri || "",
      glassdoor: initialProfile.socials?.glassdoor || "",
      indeed: initialProfile.socials?.indeed || "",
      portfolio: initialProfile.socials?.portfolio || "",
    }
  };

  const [formData, setFormData] = useState<typeof initialSavedData>(JSON.parse(JSON.stringify(initialSavedData)));
  const [savedData, setSavedData] = useState<typeof initialSavedData>(initialSavedData);

  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const isSectionDirty = (tab: TabKey): boolean => {
    switch (tab) {
      case "profile":
        return (
          formData.name !== savedData.name ||
          formData.image !== savedData.image ||
          formData.phone !== savedData.phone ||
          formData.location !== savedData.location ||
          formData.bio !== savedData.bio
        );
      case "career":
        return (
          formData.career.jobTitle !== savedData.career.jobTitle ||
          formData.career.currentCompany !== savedData.career.currentCompany ||
          formData.career.workStatus !== savedData.career.workStatus ||
          formData.career.totalExperience !== savedData.career.totalExperience ||
          formData.career.noticePeriod !== savedData.career.noticePeriod ||
          formData.career.currentSalary !== savedData.career.currentSalary
        );
      case "resume":
        return (
          formData.resumeName !== savedData.resumeName ||
          formData.resumeBase64 !== savedData.resumeBase64
        );
      case "skills":
        return JSON.stringify(formData.skills) !== JSON.stringify(savedData.skills);
      case "employment":
        return JSON.stringify(formData.employment) !== JSON.stringify(savedData.employment);
      case "education":
        return JSON.stringify(formData.education) !== JSON.stringify(savedData.education);
      case "projects":
        return JSON.stringify(formData.projects) !== JSON.stringify(savedData.projects);
      case "socials":
        return (
          formData.socials.github !== savedData.socials.github ||
          formData.socials.twitter !== savedData.socials.twitter ||
          formData.socials.linkedin !== savedData.socials.linkedin ||
          formData.socials.naukri !== savedData.socials.naukri ||
          formData.socials.glassdoor !== savedData.socials.glassdoor ||
          formData.socials.indeed !== savedData.socials.indeed ||
          formData.socials.portfolio !== savedData.socials.portfolio
        );
      case "personal":
        return (
          formData.dob !== savedData.dob ||
          formData.gender !== savedData.gender ||
          formData.maritalStatus !== savedData.maritalStatus ||
          JSON.stringify(formData.address) !== JSON.stringify(savedData.address) ||
          JSON.stringify(formData.languages) !== JSON.stringify(savedData.languages)
        );
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowSuccess(false);

    try {
      const body = {
        ...formData,
        jobTitle: formData.career.jobTitle || formData.jobTitle
      };

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile.");
      }

      setSavedData(JSON.parse(JSON.stringify(formData)));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile": return <CandidateDetailsTab formData={formData} updateField={updateField} />;
      case "career": return <CandidateCareerTab formData={formData} updateField={updateField} />;
      case "resume": return <CandidateResumeTab formData={formData} updateField={updateField} />;
      case "skills": return <CandidateSkillsTab formData={formData} updateField={updateField} />;
      case "employment": return <CandidateEmploymentTab formData={formData} updateField={updateField} />;
      case "education": return <CandidateEducationTab formData={formData} updateField={updateField} />;
      case "projects": return <CandidateProjectsTab formData={formData} updateField={updateField} />;
      case "socials": return <CandidateSocialsTab formData={formData} updateField={updateField} />;
      case "personal": return <CandidatePersonalTab formData={formData} updateField={updateField} />;
      default: return null;
    }
  };

  return (
    <Card className="rounded-3xl glass border shadow-xl p-6 bg-neutral-50/20 dark:bg-neutral-950/20 w-full text-left">
      <CardHeader className="p-0 pb-4 border-b border-neutral-200/30 dark:border-neutral-850/50 mb-6">
        <CardTitle className="text-base font-extrabold flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-500" /> Candidate Profile Form
        </CardTitle>
        <CardDescription className="text-xs">Update your career goals, resumes, history, skills, and personal information.</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-xs bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl font-bold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-12 gap-4 md:gap-6">
            {/* Left Column - Vertical Navigation Tabs */}
            <div className="col-span-3 lg:col-span-2 flex flex-col gap-1.5 pr-3">
              {Object.entries(TAB_LABELS).map(([tabKey, label]) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => {
                    setActiveTab(tabKey as TabKey);
                    setShowSuccess(false);
                  }}
                  className={`w-full text-left relative pl-4 pr-2.5 py-3 sm:py-3.5 rounded-xl transition-colors duration-200 cursor-pointer text-xs sm:text-[13px] lg:text-sm font-semibold tracking-tight ${
                    activeTab === tabKey
                      ? "text-primary font-bold"
                      : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
                  }`}
                >
                  {activeTab === tabKey && (
                    <motion.div
                      layoutId="activeTabBackground"
                      className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.32, duration: 0.55 }}
                    />
                  )}
                  {activeTab === tabKey && (
                    <motion.div
                      layoutId="activeTabMarker"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[20px] sm:h-[24px] bg-primary rounded-r-full"
                      transition={{ type: "spring", bounce: 0.32, duration: 0.55 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              ))}
            </div>

            {/* Right Column - Respective Fields Content */}
            <div className="col-span-9 lg:col-span-10 min-h-[380px] flex flex-col justify-between pl-2 md:pl-4">
              <div>
                {renderTabContent()}
              </div>

              {/* Section-specific Save Changes Button */}
              <div className="flex items-center justify-end gap-3 border-t border-neutral-200/20 dark:border-neutral-800/30 pt-4 mt-6">
                {showSuccess && (
                  <span className="text-[11px] text-emerald-500 font-bold animate-pulse">
                    Saved successfully!
                  </span>
                )}
                <Button
                  type="submit"
                  disabled={loading || !isSectionDirty(activeTab)}
                  className="h-8.5 px-4 text-[11px] font-bold gap-1.5 rounded-xl cursor-pointer"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
