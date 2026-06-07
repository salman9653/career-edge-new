"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Calendar, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useUIStore } from "@/store/useUIStore";
import { User } from "@/types";

interface AdminDetails {
  id: string;
  name: string;
  email: string;
  image: string | null;
  memberSince: string;
  phone?: string;
  bio?: string;
  stats: {
    candidates: number;
    companies: number;
    jobs: number;
  };
}

interface AdminProfileClientProps {
  adminDetails: AdminDetails;
  user: User;
}

const DummyTag = () => (
  <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-500/10 text-[7px] font-bold text-amber-500 dark:text-amber-400 border border-amber-500/15 ml-1.5 uppercase select-none tracking-wider scale-90 origin-left">
    dummy
  </span>
);

export function AdminProfileClient({ adminDetails, user }: AdminProfileClientProps) {
  const router = useRouter();

  useEffect(() => {
    const { setHeader, clearHeader } = useUIStore.getState();
    setHeader("Admin Profile", "Overview of your administrator account status and platform metrics.");
    return () => clearHeader();
  }, []);

  const isPhoneDummy = !adminDetails.phone;
  const phone = adminDetails.phone || "+1 (555) 010-0000";
  
  const memberSince = new Date(adminDetails.memberSince).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="w-full space-y-6 text-left pb-10">
      {/* Top Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl glass border border-neutral-200/40 dark:border-neutral-850/50 bg-neutral-50/20 dark:bg-[#07070b]/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer gap-1.5 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
        <Button
          onClick={() => router.push("/dashboard/profile/edit")}
          variant="premium"
          size="sm"
          className="text-xs font-bold gap-1.5 rounded-xl cursor-pointer shadow-md shadow-indigo-500/10"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit Profile
        </Button>
      </div>

      {/* Main Admin Account Card */}
      <Card className="rounded-3xl glass border shadow-xl p-6 bg-neutral-50/20 dark:bg-neutral-950/20 space-y-6 w-full">
        <div className="flex items-center gap-5">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center text-primary text-2xl font-extrabold shadow-md border border-neutral-200/50 dark:border-neutral-800/50">
            {adminDetails.image ? (
              <img src={adminDetails.image} alt={adminDetails.name} className="w-full h-full object-cover" />
            ) : (
              adminDetails.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">{adminDetails.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> {adminDetails.email}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
              Phone: {phone} {isPhoneDummy && <DummyTag />}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-5 gap-x-4 border-t border-neutral-200/30 dark:border-neutral-850/50 pt-5">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Role</span>
            <span className="text-xs font-bold text-indigo-500 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-4 h-4 text-indigo-500" /> System Administrator
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Account Status</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Member Since</span>
            <span className="text-xs font-semibold text-foreground mt-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" /> {memberSince}
            </span>
          </div>
        </div>

      </Card>
    </div>
  );
}
