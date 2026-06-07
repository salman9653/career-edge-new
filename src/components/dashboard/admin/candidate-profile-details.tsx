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
  currentCompany?: string;
  totalExperience?: string;
  dob?: string;
  gender?: string;
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

const DummyTag = () => (
  <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-500/10 text-[7px] font-bold text-amber-500 dark:text-amber-400 border border-amber-500/15 ml-1.5 uppercase select-none tracking-wider scale-90 origin-left">
    dummy
  </span>
);

export function CandidateProfileDetails({ candidate }: { candidate: CandidateDetails }) {
  const [showMore, setShowMore] = useState(false);

  const isPhoneDummy = !candidate.phone;
  const isSubscriptionDummy = !candidate.subscription;
  const isApplicationsDummy = !candidate.applications || candidate.applications.length === 0;

  const phone = candidate.phone || "9876567890";
  const subscription = candidate.subscription || "Free";
  const memberSince = new Date(candidate.memberSince).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const applicationsCount = candidate.applications?.length || 3;

  return (
    <div className="rounded-3xl glass border shadow-xl p-6 bg-neutral-50/20 dark:bg-neutral-950/20 space-y-6 w-full text-left">
      {/* Top Header Card */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-5">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center text-primary text-2xl font-extrabold shadow-md border border-neutral-200/50 dark:border-neutral-800/50">
            {candidate.image ? (
              <Image src={candidate.image} alt={candidate.name} fill className="object-cover" />
            ) : (
              candidate.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">{candidate.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">{candidate.email}</p>
            <a href={`tel:${phone}`} className="text-xs text-muted-foreground hover:text-primary transition-colors mt-0.5 font-semibold flex items-center gap-1">
              {phone} {isPhoneDummy && <DummyTag />}
            </a>
          </div>
        </div>
        <CandidateMenuDropdown />
      </div>

      {/* Metadata Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-4 border-t border-neutral-200/30 dark:border-neutral-850/50 pt-5">
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Status</span>
          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {candidate.status || "Active"}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Subscription Plan</span>
          <span className="text-xs font-semibold text-foreground flex items-center mt-1 gap-1">
            <UserCheck className="w-3.5 h-3.5 text-primary" /> {subscription} {isSubscriptionDummy && <DummyTag />}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Applications</span>
          <span className="text-xs font-semibold text-foreground mt-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-primary" /> {applicationsCount} {isApplicationsDummy && <DummyTag />}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Member Since</span>
          <span className="text-xs font-semibold text-foreground mt-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-primary" /> {memberSince}
          </span>
        </div>
      </div>

      {/* Collapsible Details */}
      {showMore && (
        <div className="animate-in fade-in duration-300">
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
      <div className="flex justify-center border-t border-neutral-200/20 dark:border-neutral-850/30 pt-3">
        <Button 
          variant="ghost" size="sm" onClick={() => setShowMore(!showMore)}
          className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer gap-1.5 rounded-lg py-1 px-3"
        >
          {showMore ? <>Show Less <ChevronUp className="w-3.5 h-3.5" /></> : <>Show More Details <ChevronDown className="w-3.5 h-3.5" /></>}
        </Button>
      </div>
    </div>
  );
}
