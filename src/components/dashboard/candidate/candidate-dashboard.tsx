import React from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, User, Sparkles } from "lucide-react";
import { User as UserType, CandidateProfile } from "@/types";

interface CandidateDashboardProps {
  user: UserType;
  profile: CandidateProfile | null;
  onOnboardingOpen: () => void;
}

export function CandidateDashboard({ user, profile, onOnboardingOpen }: CandidateDashboardProps) {
  return (
    <div className="w-full space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl glass border shadow-xl bg-neutral-50/30 dark:bg-neutral-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/10">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Candidate Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Welcome back, <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">{user.name}</span>!
          </h1>
          <p className="text-sm text-muted-foreground">
            {user.isOnboarded
              ? "Here is an overview of your career advancement progress."
              : "Complete your profile configuration to unlock AI matching capabilities."}
          </p>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-indigo-500/20 z-10 overflow-hidden relative">
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
              <User className="w-4.5 h-4.5 text-indigo-500" /> Personal Profile
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
              <span className="font-bold text-indigo-500 uppercase tracking-wider">{user.accountType}</span>
            </div>
            {profile?.jobTitle && (
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
                <span className="text-muted-foreground">Target Title</span>
                <span className="font-semibold text-foreground truncate max-w-[150px]">{profile.jobTitle}</span>
              </div>
            )}
            {profile?.resumeName && (
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
                <span className="text-muted-foreground">Resume File</span>
                <span className="font-semibold text-foreground truncate max-w-[150px]">{profile.resumeName}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Placeholder Card */}
        <Card className="rounded-3xl glass border shadow-md p-2 md:col-span-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Briefcase className="w-4.5 h-4.5 text-violet-500" /> Active Job Matches
            </CardTitle>
            <CardDescription className="text-xs">Your AI matched career edge jobs</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            {user.isOnboarded ? (
              <>
                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-muted-foreground text-sm">
                  🔍
                </div>
                <p className="text-xs font-semibold text-foreground">No matches found yet</p>
                <p className="text-[10px] text-muted-foreground max-w-xs">
                  We are scanning job pipelines for your target skills and title. Check back shortly.
                </p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm">
                  ⚠️
                </div>
                <p className="text-xs font-semibold text-foreground">Onboarding Required</p>
                <p className="text-[10px] text-muted-foreground max-w-xs">
                  Please complete your profile to enable AI matchmaking.
                </p>
                <Button
                  onClick={onOnboardingOpen}
                  variant="premium"
                  className="h-8 text-[10px] px-3.5 rounded-lg mt-2 font-bold shadow-md shadow-indigo-500/20"
                >
                  Setup Profile Now
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
