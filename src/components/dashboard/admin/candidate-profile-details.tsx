"use client";

import React, { useState } from "react";
import { Phone, Mail, ChevronDown, ChevronUp, Calendar, FileText, Download, UserCheck, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CandidateMenuDropdown } from "./candidate-menu-dropdown";
import { CandidateCareerProfile } from "./candidate-career-profile";
import { CandidatePersonalDetails } from "./candidate-personal-details";
import { CandidateAboutSkills } from "./candidate-about-skills";
import { CandidateHistoryDetails } from "./candidate-history-details";

interface ApplicationRow {
  id?: string;
  jobTitle: string;
  employerName: string;
  appliedDate: string;
  status: string;
}

interface CandidateDetails {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  jobTitle: string;
  experience: string;
  status: string;
  memberSince: string;
  bio?: string;
  phone?: string;
  skills?: string[];
  linkedin?: string;
  github?: string;
  twitter?: string;
  subscription?: string;
  activePlan?: string;
  currentCompany?: string;
  totalExperience?: string;
  dob?: string;
  gender?: string;
  maritalStatus?: string;
  address?: string;
  applications?: ApplicationRow[];
  career?: any;
  socials?: any;
  languages?: any;
  resumeName?: string;
  resumeBase64?: string;
  employment?: any[];
  education?: any[];
  projects?: any[];
}

export function CandidateProfileDetails({ candidate }: { candidate: CandidateDetails }) {
  const [showMore, setShowMore] = useState(false);

  const subscription = candidate.activePlan || candidate.subscription || "Free";
  const planDisplayNames: Record<string, string> = {
    "candidate-pro": "Pro",
    "candidate-pro+": "Pro+",
    "company-pro": "Pro",
    "company-pro+": "Pro+",
    "Free": "Free",
  };
  const displayPlan = planDisplayNames[subscription] || subscription;

  const memberSince = new Date(candidate.memberSince).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const status = candidate.status || "Active";
  const statusColors = {
    Active: "text-emerald-500 bg-emerald-500",
    Inactive: "text-amber-500 bg-amber-500",
    Banned: "text-red-500 bg-red-500",
  };
  const currentStatusColors = statusColors[status as keyof typeof statusColors] || "text-emerald-500 bg-emerald-500";
  const statusTextColor = currentStatusColors.split(" ")[0];
  const statusBgColor = currentStatusColors.split(" ")[1];

  const hasApplications = candidate.applications && candidate.applications.length > 0;
  
  // Check if any collapsed section has content to show
  const hasAboutOrSkills = !!(candidate.bio || (candidate.skills && candidate.skills.length > 0));
  const hasCareerOrSocials = !!(candidate.career || candidate.socials || candidate.linkedin || candidate.github || candidate.twitter);
  const hasHistory = !!(candidate.resumeBase64 || (candidate.employment && candidate.employment.length > 0) || (candidate.education && candidate.education.length > 0) || (candidate.projects && candidate.projects.length > 0));
  const hasPersonal = !!(candidate.dob || candidate.gender || candidate.maritalStatus || candidate.address || (candidate.languages && candidate.languages.length > 0));
  const hasAnyDetails = hasAboutOrSkills || hasCareerOrSocials || hasHistory || hasPersonal;

  return (
    <div className="rounded-3xl glass border shadow-xl p-6 bg-neutral-50/20 dark:bg-neutral-950/20 space-y-6 w-full text-left">
      {/* Top Header Card */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-5">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center text-primary text-2xl font-extrabold shadow-md border border-neutral-200/50 dark:border-neutral-850/50">
            {candidate.image ? (
              <Image src={candidate.image} alt={candidate.name} fill className="object-cover" />
            ) : (
              candidate.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">{candidate.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">{candidate.email}</p>
            {candidate.phone && (
              <a href={`tel:${candidate.phone}`} className="text-xs text-muted-foreground hover:text-primary transition-colors mt-0.5 font-semibold flex items-center gap-1">
                {candidate.phone}
              </a>
            )}
          </div>
        </div>
        <CandidateMenuDropdown 
          candidateId={candidate.id || candidate.userId} 
          currentStatus={status} 
          currentPlan={subscription} 
        />
      </div>

      {/* Metadata Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-4 border-t border-neutral-200/30 dark:border-neutral-850/50 pt-5">
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Status</span>
          <span className={`text-xs font-bold ${statusTextColor} flex items-center gap-1 mt-1`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusBgColor} animate-pulse`} /> {status}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Subscription Plan</span>
          <span className="text-xs font-semibold text-foreground flex items-center mt-1 gap-1">
            <UserCheck className="w-3.5 h-3.5 text-primary" /> {displayPlan}
          </span>
        </div>
        {hasApplications && (
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Applications</span>
            <span className="text-xs font-semibold text-foreground mt-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-primary" /> {candidate.applications?.length}
            </span>
          </div>
        )}
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Member Since</span>
          <span className="text-xs font-semibold text-foreground mt-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-primary" /> {memberSince}
          </span>
        </div>
      </div>

      {/* Collapsible Details */}
      {showMore && hasAnyDetails && (
        <div className="animate-in fade-in duration-350">
          {/* 1. About Candidate & 2. Core Skills */}
          <CandidateAboutSkills candidate={candidate} />
          {/* 3. Career Profile & 4. Online Profiles */}
          <CandidateCareerProfile candidate={candidate} />
          {/* 5. Resume, Employment, Education & Projects */}
          <CandidateHistoryDetails candidate={candidate} />
          {/* 6. Personal Details */}
          <CandidatePersonalDetails candidate={candidate} />
        </div>
      )}

      {/* Toggle button */}
      {hasAnyDetails && (
        <div className="flex justify-center border-t border-neutral-200/20 dark:border-neutral-850/30 pt-3">
          <Button 
            variant="ghost" size="sm" onClick={() => setShowMore(!showMore)}
            className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer gap-1.5 rounded-lg py-1 px-3"
          >
            {showMore ? <>Show Less <ChevronUp className="w-3.5 h-3.5" /></> : <>Show More Details <ChevronDown className="w-3.5 h-3.5" /></>}
          </Button>
        </div>
      )}
    </div>
  );
}
