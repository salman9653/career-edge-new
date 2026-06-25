"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Phone, Mail, Users, Pencil, ChevronDown, ChevronUp } from "lucide-react";
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
  activePlan?: string;
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

export function CompanyProfileDetails({ 
  company, 
  isOwnProfile = false,
  showCollapse = false
}: { 
  company: CompanyDetails; 
  isOwnProfile?: boolean; 
  showCollapse?: boolean;
}) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const status = company.status || "Active";
  const socials = company.socials || {};
  const contact = company.contact || {};

  const subscription = company.activePlan || company.subscription || "Free";
  const companySize = company.companySize || "Not specified";
  const memberSince = company.memberSince 
    ? new Date(company.memberSince).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "Not specified";
  const companyType = company.companyType || "Not specified";
  const founded = company.founded || "Not specified";
  const authEmail = company.email || "";
  
  const aboutText = company.about || "";
  const contactEmail = contact.email || "";
  const phone = contact.phone || company.phone || "";
  const website = socials.website || company.websiteUrl || "";
  const linkedin = socials.linkedin || company.linkedin || "";
  const twitter = socials.twitter || company.twitter || "";
  const facebook = socials.facebook || company.facebook || "";
  const instagram = socials.instagram || company.instagram || "";
  
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
  if (twitter) {
    if (twitter.startsWith("http://") || twitter.startsWith("https://")) {
      twitterUrl = twitter;
    } else if (twitter.startsWith("@")) {
      twitterUrl = `https://x.com/${twitter.substring(1)}`;
    } else if (twitter.includes("twitter.com") || twitter.includes("x.com")) {
      twitterUrl = `https://${twitter}`;
    } else {
      twitterUrl = `https://x.com/${twitter}`;
    }
  }

  const facebookUrl = facebook.startsWith("http://") || facebook.startsWith("https://")
    ? facebook
    : `https://${facebook}`;

  const instagramUrl = instagram.startsWith("http://") || instagram.startsWith("https://")
    ? instagram
    : `https://${instagram}`;

  const hasContactOrSocials = !!(phone || contactEmail || website || linkedin || twitter || facebook || instagram || naukri || indeed || glassdoor);
  const hasBenefits = company.benefits && company.benefits.length > 0;

  const statusColors = {
    Active: "text-emerald-500 bg-emerald-500",
    Inactive: "text-amber-500 bg-amber-500",
    Banned: "text-red-500 bg-red-500",
  };
  const currentStatusColors = statusColors[status as keyof typeof statusColors] || "text-emerald-500 bg-emerald-500";
  const statusTextColor = currentStatusColors.split(" ")[0];
  const statusBgColor = currentStatusColors.split(" ")[1];

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
            <p className="text-xs text-muted-foreground mt-0.5">{authEmail}</p>
          </div>
        </div>
        {isOwnProfile ? (
          <Button
            onClick={() => router.push("/dashboard/profile/edit")}
            variant="outline"
            size="sm"
            className="text-xs font-bold gap-1.5 h-9 rounded-xl cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Profile
          </Button>
        ) : (
          <CompanyMenuDropdown 
            companyId={company.id || company.userId} 
            currentStatus={status} 
            currentPlan={subscription} 
          />
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-4 border-t border-neutral-200/30 dark:border-neutral-850/50 pt-5">
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Status</span>
          <span className={`text-xs font-bold ${statusTextColor} flex items-center gap-1 mt-1`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusBgColor} animate-pulse`} /> {status}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Subscription Plan</span>
          <span className="text-xs font-semibold text-foreground flex items-center mt-1">
            <Users className="w-3.5 h-3.5 text-primary mr-1" /> {subscription}
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
        {(!showCollapse || isExpanded) && (
          <>
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Company Type</span>
              <span className="text-xs font-semibold text-foreground mt-1 flex items-center">
                {companyType}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Founded</span>
              <span className="text-xs font-semibold text-foreground mt-1 flex items-center">
                {founded}
              </span>
            </div>
          </>
        )}
      </div>

      {(!showCollapse || isExpanded) && (aboutText || hasBenefits || hasContactOrSocials) && (
        <div className="border-t border-neutral-200/30 dark:border-neutral-850/50 pt-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-255">
          {aboutText && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                About Company
              </h4>
              <p className="text-xs text-foreground/95 leading-relaxed font-medium">{aboutText}</p>
            </div>
          )}

          {hasBenefits && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Benefits & Perks
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {company.benefits?.map((b) => (
                  <span key={b} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {hasContactOrSocials && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact & Socials</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-foreground">
                {phone && (
                  <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{phone}</span>
                  </a>
                )}
                {contactEmail && (
                  <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{contactEmail}</span>
                  </a>
                )}
                {website && (
                  <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                    <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{website}</span>
                  </a>
                )}
                {linkedin && (
                  <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                    <LinkedinIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{linkedin}</span>
                  </a>
                )}
                {twitter && (
                  <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                    <TwitterIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{twitter}</span>
                  </a>
                )}
                {facebook && (
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                    <FacebookIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{facebook}</span>
                  </a>
                )}
                {instagram && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary hover:underline transition-colors duration-150 cursor-pointer">
                    <InstagramIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{instagram}</span>
                  </a>
                )}
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
          )}
        </div>
      )}

      {showCollapse && (
        <div className="flex justify-center border-t border-neutral-200/20 dark:border-neutral-850/30 pt-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer gap-1.5 rounded-lg py-1 px-3"
          >
            {isExpanded ? (
              <>Show Less <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>Show More Details <ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
