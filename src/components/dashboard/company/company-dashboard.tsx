import React from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Building, Sparkles } from "lucide-react";
import { User as UserType, CompanyProfile } from "@/types";

interface CompanyDashboardProps {
  user: UserType;
  profile: CompanyProfile | null;
  onOnboardingOpen: () => void;
}

export function CompanyDashboard({ user, profile, onOnboardingOpen }: CompanyDashboardProps) {
  return (
    <div className="w-full space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl glass border shadow-xl bg-neutral-50/30 dark:bg-neutral-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-violet-500 dark:text-violet-400 bg-violet-500/10 border border-violet-500/10">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Employer Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Welcome back, <span className="bg-gradient-to-r from-violet-500 to-fuchsia-600 bg-clip-text text-transparent">{user.name}</span>!
          </h1>
          <p className="text-sm text-muted-foreground">
            {user.isOnboarded
              ? "Here is an overview of your recruitment and pipeline statistics."
              : "Complete your profile configuration to unlock automated sourcing capabilities."}
          </p>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-violet-500/20 z-10 overflow-hidden relative">
          {user.image ? (
            <Image src={user.image} alt={user.name} fill className="object-cover" />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="rounded-3xl glass border shadow-md p-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building className="w-4.5 h-4.5 text-violet-500" /> Company Profile
            </CardTitle>
            <CardDescription className="text-xs">Your registered account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2 text-xs">
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
              <span className="text-muted-foreground">Email</span>
              <span className="font-semibold text-foreground truncate max-w-[150px]">{user.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
              <span className="text-muted-foreground">Account Type</span>
              <span className="font-bold text-violet-500 uppercase tracking-wider">{user.accountType}</span>
            </div>
            {profile?.companyName && (
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
                <span className="text-muted-foreground">Company Name</span>
                <span className="font-semibold text-foreground truncate max-w-[150px]">{profile.companyName}</span>
              </div>
            )}
            {profile?.industry && (
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
                <span className="text-muted-foreground">Industry</span>
                <span className="font-semibold text-foreground truncate max-w-[150px]">{profile.industry}</span>
              </div>
            )}
            {profile?.location && (
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
                <span className="text-muted-foreground">Location</span>
                <span className="font-semibold text-foreground truncate max-w-[150px]">{profile.location}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Placeholder Card */}
        <Card className="rounded-3xl glass border shadow-md p-2 md:col-span-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Briefcase className="w-4.5 h-4.5 text-fuchsia-500" /> Active Job Postings
            </CardTitle>
            <CardDescription className="text-xs">Your AI matched candidate screening pipelines</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            {user.isOnboarded ? (
              <>
                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-muted-foreground text-sm">
                  🔍
                </div>
                <p className="text-xs font-semibold text-foreground">No postings found yet</p>
                <p className="text-[10px] text-muted-foreground max-w-xs">
                  Create your first job listing to trigger AI candidate matching and automated screening calls.
                </p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm">
                  ⚠️
                </div>
                <p className="text-xs font-semibold text-foreground">Onboarding Required</p>
                <p className="text-[10px] text-muted-foreground max-w-xs">
                  Please complete your company profile to enable job listing features.
                </p>
                <Button
                  onClick={onOnboardingOpen}
                  variant="premium"
                  className="h-8 text-[10px] px-3.5 rounded-lg mt-2 font-bold shadow-md shadow-violet-500/20"
                >
                  Setup Company Now
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
