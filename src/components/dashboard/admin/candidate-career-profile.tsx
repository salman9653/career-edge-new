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

export function CandidateCareerProfile({ candidate }: CandidateCareerProfileProps) {
  const career = candidate.career || {};
  const socials = candidate.socials || {};

  const jobTitle = career.jobTitle || candidate.jobTitle || "";
  const currentCompany = career.currentCompany || candidate.currentCompany || "";
  const totalExperience = career.totalExperience || candidate.totalExperience || "";
  const workStatus = career.workStatus || "";
  const noticePeriod = career.noticePeriod ? `${career.noticePeriod} Days` : "";
  const currentSalary = career.currentSalary ? `${career.currentSalary} LPA` : "";
  const expectedSalary = career.expectedSalary ? `${career.expectedSalary} LPA` : "";

  const github = socials.github || candidate.github || "";
  const linkedin = socials.linkedin || candidate.linkedin || "";
  const twitter = socials.twitter || candidate.twitter || "";
  const portfolio = socials.portfolio || "";
  const naukri = socials.naukri || "";
  const glassdoor = socials.glassdoor || "";
  const indeed = socials.indeed || "";

  const formatUrl = (url: string, prefix: string) =>
    url.startsWith("http://") || url.startsWith("https://") ? url : `https://${prefix}${url}`;

  const hasCareerInfo = !!(jobTitle || currentCompany || totalExperience || workStatus || noticePeriod || currentSalary || expectedSalary);
  const hasSocialsInfo = !!(github || linkedin || twitter || portfolio || naukri || glassdoor || indeed);

  if (!hasCareerInfo && !hasSocialsInfo) return null;

  return (
    <div className="space-y-6 pt-5 border-t border-neutral-200/30 dark:border-neutral-850/50">
      {/* Career Profile Section */}
      {hasCareerInfo && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-primary" /> Career Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-4 bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
            {jobTitle && (
              <div>
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                  <Briefcase className="w-3.5 h-3.5" /> Target Job Title
                </span>
                <span className="text-xs font-semibold text-foreground flex items-center">
                  {jobTitle}
                </span>
              </div>
            )}
            {currentCompany && (
              <div>
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                  <Building className="w-3.5 h-3.5" /> Current Company
                </span>
                <span className="text-xs font-semibold text-foreground flex items-center">
                  {currentCompany}
                </span>
              </div>
            )}
            {totalExperience && (
              <div>
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                  <Clock className="w-3.5 h-3.5" /> Total Experience
                </span>
                <span className="text-xs font-semibold text-foreground flex items-center">
                  {totalExperience}
                </span>
              </div>
            )}
            {workStatus && (
              <div>
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                  <Briefcase className="w-3.5 h-3.5" /> Work Status
                </span>
                <span className="text-xs font-semibold text-foreground flex items-center capitalize">
                  {workStatus}
                </span>
              </div>
            )}
            {noticePeriod && (
              <div>
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                  <Clock className="w-3.5 h-3.5" /> Notice Period
                </span>
                <span className="text-xs font-semibold text-foreground flex items-center">
                  {noticePeriod}
                </span>
              </div>
            )}
            {(currentSalary || expectedSalary) && (
              <div>
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                  <Clock className="w-3.5 h-3.5" /> Salary (Current / Expected)
                </span>
                <span className="text-xs font-semibold text-foreground flex items-center">
                  {currentSalary || "N/A"} / {expectedSalary || "N/A"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Online Profiles Section */}
      {hasSocialsInfo && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-primary" /> Online Profiles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-medium text-foreground bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
            {github && (
              <a href={formatUrl(github, "")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                <GitHubIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{github}</span>
              </a>
            )}
            {linkedin && (
              <a href={formatUrl(linkedin, "www.")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                <LinkedinIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{linkedin}</span>
              </a>
            )}
            {twitter && (
              <a href={formatUrl(twitter.startsWith("@") ? twitter.substring(1) : twitter, "x.com/")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                <TwitterIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{twitter}</span>
              </a>
            )}
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
      )}
    </div>
  );
}
