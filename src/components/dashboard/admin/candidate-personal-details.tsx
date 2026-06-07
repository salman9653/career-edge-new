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

const DummyTag = () => (
  <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-500/10 text-[7px] font-bold text-amber-500 dark:text-amber-400 border border-amber-500/15 ml-1.5 uppercase select-none tracking-wider scale-90 origin-left">
    dummy
  </span>
);

export function CandidatePersonalDetails({ candidate }: CandidatePersonalDetailsProps) {
  const isDobDummy = !candidate.dob;
  const isGenderDummy = !candidate.gender;
  const isMaritalDummy = !candidate.maritalStatus;
  const isAddressDummy = !candidate.address;
  const isLanguagesDummy = !candidate.languages || candidate.languages.length === 0;

  const dob = candidate.dob || "07 Sep 2004";
  const gender = candidate.gender || "Male";
  const maritalStatus = candidate.maritalStatus || "Single";

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
  if (!addressStr) {
    addressStr = "New Delhi, Delhi, India";
  }

  const languages = candidate.languages || [
    { language: "English", read: true, write: true, speak: true },
    { language: "Hindi", read: true, write: true, speak: true },
  ];

  return (
    <div className="space-y-6 pt-5 border-t border-neutral-200/30 dark:border-neutral-850/50">
      {/* Personal Details Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <User className="w-4 h-4 text-primary" /> Personal Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-4 bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
          <div>
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
              <Calendar className="w-3.5 h-3.5" /> Date of Birth
            </span>
            <span className="text-xs font-semibold text-foreground flex items-center">
              {dob} {isDobDummy && <DummyTag />}
            </span>
          </div>
          <div>
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
              <User className="w-3.5 h-3.5" /> Gender
            </span>
            <span className="text-xs font-semibold text-foreground flex items-center capitalize">
              {gender} {isGenderDummy && <DummyTag />}
            </span>
          </div>
          <div>
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
              <User className="w-3.5 h-3.5" /> Marital Status
            </span>
            <span className="text-xs font-semibold text-foreground flex items-center capitalize">
              {maritalStatus} {isMaritalDummy && <DummyTag />}
            </span>
          </div>
          <div className="col-span-1 md:col-span-3 border-t border-neutral-200/10 dark:border-neutral-850/20 pt-4">
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
              <MapPin className="w-3.5 h-3.5" /> Permanent Address
            </span>
            <span className="text-xs font-semibold text-foreground flex items-center">
              {addressStr} {isAddressDummy && <DummyTag />}
            </span>
          </div>
          
          <div className="col-span-1 md:col-span-3 border-t border-neutral-200/10 dark:border-neutral-850/20 pt-4">
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
              Language Proficiency {isLanguagesDummy && <DummyTag />}
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
        </div>
      </div>
    </div>
  );
}
