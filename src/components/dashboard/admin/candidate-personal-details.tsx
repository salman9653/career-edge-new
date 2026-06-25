"use client";

import React from "react";
import { Calendar, User, MapPin } from "lucide-react";

interface AddressObj {
  addressLine?: string;
  city?: string;
  state?: string;
  country?: string;
  pin?: string;
}

interface LanguageItem {
  language: string;
  read: boolean;
  write: boolean;
  speak: boolean;
}

interface CandidateDetails {
  name: string;
  dob?: string;
  gender?: string;
  maritalStatus?: string;
  address?: string | AddressObj;
  languages?: LanguageItem[];
}

interface CandidatePersonalDetailsProps {
  candidate: CandidateDetails;
}

export function CandidatePersonalDetails({ candidate }: CandidatePersonalDetailsProps) {
  const dob = candidate.dob || "";
  const gender = candidate.gender || "";
  const maritalStatus = candidate.maritalStatus || "";

  let addressStr = "";
  if (candidate.address) {
    if (typeof candidate.address === "string") {
      addressStr = candidate.address;
    } else {
      const parts = [
        candidate.address.addressLine,
        candidate.address.city,
        candidate.address.state,
        candidate.address.country,
        candidate.address.pin,
      ].filter(Boolean);
      addressStr = parts.join(", ");
    }
  }

  const languages = candidate.languages && candidate.languages.length > 0 ? candidate.languages : null;

  const hasPersonalGrid = !!(dob || gender || maritalStatus);
  const hasAddress = !!addressStr;
  const hasLanguages = !!languages;

  if (!hasPersonalGrid && !hasAddress && !hasLanguages) return null;

  return (
    <div className="space-y-6 pt-5 border-t border-neutral-200/30 dark:border-neutral-850/50">
      {/* Personal Details Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <User className="w-4 h-4 text-primary" /> Personal Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-4 bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
          {dob && (
            <div>
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                <Calendar className="w-3.5 h-3.5" /> Date of Birth
              </span>
              <span className="text-xs font-semibold text-foreground flex items-center">
                {dob}
              </span>
            </div>
          )}
          {gender && (
            <div>
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                <User className="w-3.5 h-3.5" /> Gender
              </span>
              <span className="text-xs font-semibold text-foreground flex items-center capitalize">
                {gender}
              </span>
            </div>
          )}
          {maritalStatus && (
            <div>
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                <User className="w-3.5 h-3.5" /> Marital Status
              </span>
              <span className="text-xs font-semibold text-foreground flex items-center capitalize">
                {maritalStatus}
              </span>
            </div>
          )}
          
          {hasAddress && (
            <div className="col-span-1 md:col-span-3 border-t border-neutral-200/10 dark:border-neutral-850/20 pt-4">
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                <MapPin className="w-3.5 h-3.5" /> Permanent Address
              </span>
              <span className="text-xs font-semibold text-foreground flex items-center">
                {addressStr}
              </span>
            </div>
          )}
          
          {hasLanguages && (
            <div className="col-span-1 md:col-span-3 border-t border-neutral-200/10 dark:border-neutral-850/20 pt-4">
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
                Language Proficiency
              </span>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang, index) => {
                  const skills = [];
                  if (lang.read) skills.push("Read");
                  if (lang.write) skills.push("Write");
                  if (lang.speak) skills.push("Speak");
                  const skillsStr = skills.length > 0 ? ` (${skills.join(", ")})` : "";
                  return (
                    <span key={index} className="px-2.5 py-1 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/10 text-[10px] font-bold text-primary">
                      {lang.language}{skillsStr}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
