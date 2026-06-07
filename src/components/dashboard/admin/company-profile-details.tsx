"use client";

import React, { useState } from "react";
import { Globe, Phone, Mail, ChevronDown, ChevronUp, Users } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CompanyMenuDropdown } from "./company-menu-dropdown";
import { LinkedinIcon, TwitterIcon, FacebookIcon, InstagramIcon } from "@/components/common";

interface CompanyDetails {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  location: string;
  websiteUrl?: string;
  companySize?: string;
  companyType?: string;
  subscription?: string;
  status?: string;
  memberSince?: string;
  email?: string;
  image?: string | null;
  founded?: string;
  about?: string;
  phone?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  benefits?: string[];
  socials?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    naukri?: string;
    indeed?: string;
    glassdoor?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
  };
}

const DummyTag = () => (
  <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-500/10 text-[7px] font-bold text-amber-500 dark:text-amber-400 border border-amber-500/15 ml-1.5 uppercase select-none tracking-wider scale-90 origin-left">
    dummy
  </span>
);

export function CompanyProfileDetails({ company }: { company: CompanyDetails }) {
  const [showMore, setShowMore] = useState(false);
  const status = company.status || "Active";
  
  const socials = company.socials || {};
  const contact = company.contact || {};

  const isSubscriptionDummy = !company.subscription;
  const isCompanyTypeDummy = !company.companyType;
  const isFoundedDummy = !company.founded;
  const isAboutDummy = !company.about;
  const isPhoneDummy = !contact.phone && !company.phone;
  const isWebsiteDummy = !socials.website && !company.websiteUrl;
  const isLinkedinDummy = !socials.linkedin && !company.linkedin;
  const isTwitterDummy = !socials.twitter && !company.twitter;
  const isFacebookDummy = !socials.facebook && !company.facebook;
  const isInstagramDummy = !socials.instagram && !company.instagram;
  const isBenefitsDummy = !company.benefits || company.benefits.length === 0;

  const subscription = company.subscription || "Free";
  const companySize = company.companySize || "Startup (1-100 employees)";
  const memberSince = company.memberSince 
    ? new Date(company.memberSince).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "21 Sep 2025";
  const companyType = company.companyType || "Private";
  const founded = company.founded || "2025";
  const email = contact.email || company.email || "testcompany@mail.com";
  
  const aboutText = company.about || "Career Edge is a global recruitment matching and talent assessment software. We empower enterprise clients to automate candidate sourcing, grading and interviewing utilizing advanced semantic AI matching systems, drastically reducing recruitment overhead and enhancing hiring throughput.";
  const phone = contact.phone || company.phone || "+1234567890";
  const website = socials.website || company.websiteUrl || "https://www.test-company.com";
  const linkedin = socials.linkedin || company.linkedin || "linkedin.com/company/test-company";
  const twitter = socials.twitter || company.twitter || "@TestCompany";
  const facebook = socials.facebook || company.facebook || "facebook.com/test-company";
  const instagram = socials.instagram || company.instagram || "instagram.com/testcompany";
  
  const naukri = socials.naukri || "";
  const glassdoor = socials.glassdoor || "";
  const indeed = socials.indeed || "";

  const websiteUrl = website.startsWith("http://") || website.startsWith("https://") 
    ? website 
    : `https://${website}`;

  const linkedinUrl = linkedin.startsWith("http://") || linkedin.startsWith("https://")
    ? linkedin
    : `https://${linkedin}`;

  let twitterUrl = "";
  if (twitter.startsWith("http://") || twitter.startsWith("https://")) {
    twitterUrl = twitter;
  } else if (twitter.startsWith("@")) {
    twitterUrl = `https://x.com/${twitter.substring(1)}`;
  } else if (twitter.includes("twitter.com") || twitter.includes("x.com")) {
    twitterUrl = `https://${twitter}`;
  } else {
    twitterUrl = `https://x.com/${twitter}`;
  }

  const facebookUrl = facebook.startsWith("http://") || facebook.startsWith("https://")
    ? facebook
    : `https://${facebook}`;

  const instagramUrl = instagram.startsWith("http://") || instagram.startsWith("https://")
    ? instagram
    : `https://${instagram}`;

  return (
    <div className="rounded-3xl glass border shadow-xl p-6 bg-neutral-50/20 dark:bg-neutral-950/20 space-y-6 w-full text-left">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-5">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center text-primary text-2xl font-extrabold shadow-md border border-neutral-200/50 dark:border-neutral-800/50">
            {company.image ? (
              <Image src={company.image} alt={company.companyName} fill className="object-cover" />
            ) : (
              company.companyName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">{company.companyName}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{email}</p>
          </div>
        </div>
        <CompanyMenuDropdown />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-4 border-t border-neutral-200/30 dark:border-neutral-850/50 pt-5">
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Status</span>
          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {status}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Subscription Plan</span>
          <span className="text-xs font-semibold text-foreground flex items-center mt-1">
            <Users className="w-3.5 h-3.5 text-primary mr-1" /> {subscription} {isSubscriptionDummy && <DummyTag />}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Company Size</span>
          <span className="text-xs font-semibold text-foreground mt-1 block">{companySize}</span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Member Since</span>
          <span className="text-xs font-semibold text-foreground mt-1 block">{memberSince}</span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Company Type</span>
          <span className="text-xs font-semibold text-foreground mt-1 flex items-center">
            {companyType} {isCompanyTypeDummy && <DummyTag />}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Founded</span>
          <span className="text-xs font-semibold text-foreground mt-1 flex items-center">
            {founded} {isFoundedDummy && <DummyTag />}
          </span>
        </div>
      </div>

      {showMore && (
        <div className="border-t border-neutral-200/30 dark:border-neutral-850/50 pt-5 space-y-5 animate-in fade-in duration-300">
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center">
              About Company {isAboutDummy && <DummyTag />}
            </h4>
            <p className="text-xs text-foreground/95 leading-relaxed font-medium">{aboutText}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Benefits & Perks {isBenefitsDummy && <DummyTag />}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {!isBenefitsDummy ? (
                company.benefits?.map((b) => (
                  <span key={b} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500">
                    {b}
                  </span>
                ))
              ) : (
                ["Health Insurance", "WFH / Remote Work", "Flexible Hours"].map((b) => (
                  <span key={b} className="px-2.5 py-1 rounded-lg bg-neutral-550/10 border border-neutral-500/20 text-[10px] font-bold text-neutral-500">
                    {b}
                  </span>
                ))
              )}
            </div>
          </div>
          
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact & Socials</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-foreground">
              <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{phone}</span> {isPhoneDummy && <DummyTag />}
              </a>
              <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{email}</span>
              </a>
              {website && (
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                  <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{website}</span> {isWebsiteDummy && <DummyTag />}
                </a>
              )}
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                <LinkedinIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{linkedin}</span> {isLinkedinDummy && <DummyTag />}
              </a>
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                <TwitterIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{twitter}</span> {isTwitterDummy && <DummyTag />}
              </a>
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                <FacebookIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{facebook}</span> {isFacebookDummy && <DummyTag />}
              </a>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                <InstagramIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{instagram}</span> {isInstagramDummy && <DummyTag />}
              </a>
              {naukri && (
                <a href={naukri.startsWith("http") ? naukri : `https://www.naukri.com/recruiters/${naukri}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                  <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>Naukri: {naukri}</span>
                </a>
              )}
              {indeed && (
                <a href={indeed.startsWith("http") ? indeed : `https://www.indeed.com/cmp/${indeed}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                  <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>Indeed: {indeed}</span>
                </a>
              )}
              {glassdoor && (
                <a href={glassdoor.startsWith("http") ? glassdoor : `https://www.glassdoor.com/Overview/${glassdoor}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                  <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>Glassdoor: {glassdoor}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

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
