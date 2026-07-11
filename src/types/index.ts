export type AccountType = "candidate" | "company" | "admin" | "unselected";
export type OnboardingStep = "account-type" | "profile" | "preferences" | "complete";
export type DashboardModule = "overview" | "jobs" | "applications" | "analytics" | "settings";
export type NotificationType = "info" | "warning" | "success" | "error";
export type ModalState = "none" | "signup" | "signin" | "onboarding";
export type PopoverState = "none" | "notifications" | "profile" | "settings";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  accountType?: AccountType;
  isOnboarded?: boolean;
  onboardingSkipped?: boolean;
  createdAt: Date;
  updatedAt: Date;
  preferences?: {
    themeMode: "dark" | "light" | "system";
    themeColor: string;
    themeColorHex: string;
    themeGradientFrom: string;
    themeGradientTo: string;
    font: string;
  };
}

export interface CandidateProfile {
  _id?: string;
  userId: string;
  jobTitle?: string;
  skills?: string[];
  experience?: string;
  resumeName?: string;
  resumeBase64?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyProfile {
  _id?: string;
  userId: string;
  companyName?: string;
  industry?: string;
  location?: string;
  websiteUrl?: string;
  companySize?: string;
  companyType?: string;
  founded?: string;
  about?: string;
  benefits?: string[];
  socials?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    naukri?: string;
    glassdoor?: string;
    indeed?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  
  // Monetization & AI Tokens
  activePlan?: "company-free" | "company-pro" | "company-pro-plus";
  planExpiresAt?: Date;
  aiTokens?: {
    allocated: number;
    purchased: number;
    total: number;
    lastRefilledAt: Date;
  };
}

export interface CompanyProfileFormData {
  companyName: string;
  industry: string;
  location: string;
  companySize: string;
  companyType: string;
  founded: string;
  about: string;
  benefits: string[];
  socials: {
    website: string;
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
    naukri: string;
    glassdoor: string;
    indeed: string;
  };
  contact: {
    email: string;
    phone: string;
  };
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}
