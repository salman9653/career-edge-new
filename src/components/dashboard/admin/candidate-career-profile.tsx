"use client";

import React from "react";
import { Briefcase, Building, Clock, Globe } from "lucide-react";
import { LinkedinIcon, TwitterIcon, GitHubIcon } from "@/components/common";

interface CandidateDetails {
  name: string;
  jobTitle: string;
  currentCompany?: string;
  totalExperience?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
}

interface CandidateDetails {
  name: string;
  jobTitle: string;
  currentCompany?: string;
  totalExperience?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  career?: {
    jobTitle?: string;
    currentCompany?: string;
    workStatus?: string;
    totalExperience?: string;
    noticePeriod?: string;
    currentSalary?: string;
    expectedSalary?: string;
  };
  socials?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    portfolio?: string;
    naukri?: string;
    glassdoor?: string;
    indeed?: string;
  };
}

interface CandidateCareerProfileProps {
  candidate: CandidateDetails;
}

const DummyTag = () => (
  <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-500/10 text-[7px] font-bold text-amber-500 dark:text-amber-400 border border-amber-500/15 ml-1.5 uppercase select-none tracking-wider scale-90 origin-left">
    dummy
  </span>
);

export function CandidateCareerProfile({ candidate }: CandidateCareerProfileProps) {
  const career = candidate.career || {};
  const socials = candidate.socials || {};

  const jobTitle = career.jobTitle || candidate.jobTitle || "Software Developer";
  const currentCompany = career.currentCompany || candidate.currentCompany || "Naskay Technologies Pvt. Ltd.";
  const totalExperience = career.totalExperience || candidate.totalExperience || "3 years";
  const workStatus = career.workStatus || "experienced";
  const noticePeriod = career.noticePeriod ? `${career.noticePeriod} Days` : "30 Days";
  const currentSalary = career.currentSalary ? `${career.currentSalary} LPA` : "6.5 LPA";
  const expectedSalary = career.expectedSalary ? `${career.expectedSalary} LPA` : "12 LPA";

  const isJobTitleDummy = !(career.jobTitle || candidate.jobTitle) || jobTitle === "Job Seeker";
  const isCompanyDummy = !(career.currentCompany || candidate.currentCompany);
  const isTotalExpDummy = !(career.totalExperience || candidate.totalExperience);
  const isWorkStatusDummy = !career.workStatus;
  const isNoticePeriodDummy = !career.noticePeriod;
  const isSalaryDummy = !career.currentSalary && !career.expectedSalary;

  const github = socials.github || candidate.github || `github.com/${candidate.name.toLowerCase().replace(/\s+/g, "")}`;
  const linkedin = socials.linkedin || candidate.linkedin || `linkedin.com/in/${candidate.name.toLowerCase().replace(/\s+/g, "-")}`;
  const twitter = socials.twitter || candidate.twitter || `@${candidate.name.toLowerCase().replace(/\s+/g, "")}`;
  const portfolio = socials.portfolio || "";
  const naukri = socials.naukri || "";
  const glassdoor = socials.glassdoor || "";
  const indeed = socials.indeed || "";

  const isGithubDummy = !(socials.github || candidate.github);
  const isLinkedinDummy = !(socials.linkedin || candidate.linkedin);
  const isTwitterDummy = !(socials.twitter || candidate.twitter);

  const formatUrl = (url: string, prefix: string) =>
    url.startsWith("http://") || url.startsWith("https://") ? url : `https://${prefix}${url}`;

  return (
    <div className="space-y-6 pt-5 border-t border-neutral-200/30 dark:border-neutral-850/50">
      {/* Career Profile Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-primary" /> Career Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-4 bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
          <div>
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
              <Briefcase className="w-3.5 h-3.5" /> Target Job Title
            </span>
            <span className="text-xs font-semibold text-foreground flex items-center">
              {jobTitle} {isJobTitleDummy && <DummyTag />}
            </span>
          </div>
          <div>
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
              <Building className="w-3.5 h-3.5" /> Current Company
            </span>
            <span className="text-xs font-semibold text-foreground flex items-center">
              {currentCompany} {isCompanyDummy && <DummyTag />}
            </span>
          </div>
          <div>
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
              <Clock className="w-3.5 h-3.5" /> Total Experience
            </span>
            <span className="text-xs font-semibold text-foreground flex items-center">
              {totalExperience} {isTotalExpDummy && <DummyTag />}
            </span>
          </div>
          <div>
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
              <Briefcase className="w-3.5 h-3.5" /> Work Status
            </span>
            <span className="text-xs font-semibold text-foreground flex items-center capitalize">
              {workStatus} {isWorkStatusDummy && <DummyTag />}
            </span>
          </div>
          <div>
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
              <Clock className="w-3.5 h-3.5" /> Notice Period
            </span>
            <span className="text-xs font-semibold text-foreground flex items-center">
              {noticePeriod} {isNoticePeriodDummy && <DummyTag />}
            </span>
          </div>
          <div>
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
              <Clock className="w-3.5 h-3.5" /> Salary (Current / Expected)
            </span>
            <span className="text-xs font-semibold text-foreground flex items-center">
              {currentSalary} / {expectedSalary} {isSalaryDummy && <DummyTag />}
            </span>
          </div>
        </div>
      </div>

      {/* Online Profiles Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-primary" /> Online Profiles
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-medium text-foreground bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
          <a href={formatUrl(github, "")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
            <GitHubIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>{github}</span> {isGithubDummy && <DummyTag />}
          </a>
          <a href={formatUrl(linkedin, "www.")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
            <LinkedinIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>{linkedin}</span> {isLinkedinDummy && <DummyTag />}
          </a>
          <a href={formatUrl(twitter.startsWith("@") ? twitter.substring(1) : twitter, "x.com/")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
            <TwitterIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>{twitter}</span> {isTwitterDummy && <DummyTag />}
          </a>
          {portfolio && (
            <a href={formatUrl(portfolio, "")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
              <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>{portfolio}</span>
            </a>
          )}
          {naukri && (
            <a href={naukri.startsWith("http") ? naukri : `https://www.naukri.com/code/candidate-details/${naukri}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
              <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>Naukri: {naukri}</span>
            </a>
          )}
          {glassdoor && (
            <a href={glassdoor.startsWith("http") ? glassdoor : `https://www.glassdoor.com/profile/${glassdoor}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
              <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>Glassdoor: {glassdoor}</span>
            </a>
          )}
          {indeed && (
            <a href={indeed.startsWith("http") ? indeed : `https://www.indeed.com/r/${indeed}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
              <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>Indeed: {indeed}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
