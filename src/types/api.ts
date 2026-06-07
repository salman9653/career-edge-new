import { CandidateProfile, CompanyProfile, User } from "./index";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface ProfileResponse {
  profile: CandidateProfile | CompanyProfile | null;
}

export interface ProfileUpdateRequest {
  // Candidate fields
  jobTitle?: string;
  skills?: string[];
  experience?: string;
  resumeName?: string;
  resumeBase64?: string;
  // Company fields
  companyName?: string;
  industry?: string;
  location?: string;
  websiteUrl?: string;
  companySize?: string;
}

export interface SessionData {
  user: User;
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
