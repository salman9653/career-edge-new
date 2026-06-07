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
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}
