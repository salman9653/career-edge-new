"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  CompanyDetailsTab,
  CompanyBenefitsTab,
  CompanyLinksTab,
  CompanyContactTab
} from "./index";

interface CompanyProfileFormProps {
  initialProfile: any;
}

const TAB_LABELS = {
  details: "Company Details",
  benefits: "Benefits & Perks",
  links: "Links & Socials",
  contact: "Contact Info"
};

type TabKey = keyof typeof TAB_LABELS;

export function EditCompanyProfileForm({ initialProfile }: CompanyProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("details");
  const [showSuccess, setShowSuccess] = useState(false);

  const initialSavedData = {
    companyName: initialProfile.companyName || "",
    industry: initialProfile.industry || "",
    location: initialProfile.location || "",
    companySize: initialProfile.companySize || "",
    companyType: initialProfile.companyType || "",
    founded: initialProfile.founded || "",
    about: initialProfile.about || "",
    benefits: initialProfile.benefits || [],
    socials: {
      website: initialProfile.socials?.website || initialProfile.websiteUrl || "",
      linkedin: initialProfile.socials?.linkedin || initialProfile.linkedin || "",
      twitter: initialProfile.socials?.twitter || initialProfile.twitter || "",
      facebook: initialProfile.socials?.facebook || initialProfile.facebook || "",
      instagram: initialProfile.socials?.instagram || initialProfile.instagram || "",
      naukri: initialProfile.socials?.naukri || "",
      glassdoor: initialProfile.socials?.glassdoor || "",
      indeed: initialProfile.socials?.indeed || "",
    },
    contact: {
      email: initialProfile.contact?.email || initialProfile.email || "",
      phone: initialProfile.contact?.phone || initialProfile.phone || "",
    }
  };

  const [formData, setFormData] = useState<typeof initialSavedData>(JSON.parse(JSON.stringify(initialSavedData)));
  const [savedData, setSavedData] = useState<typeof initialSavedData>(initialSavedData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (category: "socials" | "contact", field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const toggleBenefit = (benefit: string) => {
    const current = formData.benefits;
    const next = current.includes(benefit)
      ? current.filter((b: string) => b !== benefit)
      : [...current, benefit];
    setFormData(prev => ({ ...prev, benefits: next }));
  };

  const isSectionDirty = (tab: TabKey): boolean => {
    switch (tab) {
      case "details":
        return (
          formData.companyName !== savedData.companyName ||
          formData.industry !== savedData.industry ||
          formData.location !== savedData.location ||
          formData.companySize !== savedData.companySize ||
          formData.companyType !== savedData.companyType ||
          formData.founded !== savedData.founded ||
          formData.about !== savedData.about
        );
      case "benefits":
        return JSON.stringify(formData.benefits) !== JSON.stringify(savedData.benefits);
      case "links":
        return (
          formData.socials.website !== savedData.socials.website ||
          formData.socials.linkedin !== savedData.socials.linkedin ||
          formData.socials.twitter !== savedData.socials.twitter ||
          formData.socials.facebook !== savedData.socials.facebook ||
          formData.socials.instagram !== savedData.socials.instagram ||
          formData.socials.naukri !== savedData.socials.naukri ||
          formData.socials.glassdoor !== savedData.socials.glassdoor ||
          formData.socials.indeed !== savedData.socials.indeed
        );
      case "contact":
        return (
          formData.contact.email !== savedData.contact.email ||
          formData.contact.phone !== savedData.contact.phone
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
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update company profile.");
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
      case "details":
        return <CompanyDetailsTab formData={formData} handleChange={handleChange} />;
      case "benefits":
        return <CompanyBenefitsTab formData={formData} toggleBenefit={toggleBenefit} />;
      case "links":
        return <CompanyLinksTab formData={formData} handleNestedChange={handleNestedChange} />;
      case "contact":
        return <CompanyContactTab formData={formData} handleNestedChange={handleNestedChange} />;
      default:
        return null;
    }
  };

  return (
    <Card className="rounded-3xl glass border shadow-xl p-6 bg-neutral-50/20 dark:bg-neutral-950/20 w-full text-left">
      <CardHeader className="p-0 pb-4 border-b border-neutral-200/30 dark:border-neutral-850/50 mb-6">
        <CardTitle className="text-base font-extrabold flex items-center gap-2">
          <Building className="w-5 h-5 text-indigo-500" /> Company Profile Form
        </CardTitle>
        <CardDescription className="text-xs">Update company info, job boards, perks, and contact methods.</CardDescription>
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
            <div className="col-span-9 lg:col-span-10 min-h-[260px] flex flex-col justify-between pl-2 md:pl-4">
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
