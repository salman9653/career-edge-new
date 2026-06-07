"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { User, CandidateProfile, CompanyProfile } from "@/types";
import { motion } from "motion/react";
import { OnboardingCandidateForm } from "./onboarding-candidate-form";
import { OnboardingCompanyForm } from "./onboarding-company-form";

interface OnboardingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  profile?: CandidateProfile | CompanyProfile | null;
}

export function OnboardingDialog({ isOpen, onClose, user, profile }: OnboardingDialogProps) {
  const router = useRouter();
  const isCompany = user?.accountType === "company";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmitProfile = async (
    formData:
      | {
          jobTitle: string;
          skills?: string;
          experience?: string;
          resumeName?: string | null;
          resumeBase64?: string | null;
        }
      | {
          companyName: string;
          industry: string;
          location: string;
          websiteUrl?: string;
          companySize?: string;
        }
  ) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.error || "Failed to update profile details.");
      }

      const { error: updateError } = await authClient.updateUser({
        isOnboarded: true,
        onboardingSkipped: false,
      });

      if (updateError) {
        setError(updateError.message || "Failed to update profile details.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 1500);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setError("");
    try {
      const { error: updateError } = await authClient.updateUser({
        onboardingSkipped: true,
      });

      if (updateError) {
        setError(updateError.message || "Failed to skip onboarding.");
      } else {
        onClose();
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleSkip} className="max-w-2xl">
      <div className="text-center space-y-2.5 mb-6">
        <div className="relative w-12 h-12 mx-auto group flex items-center justify-center">
          <Image
            src="/logo_light.png"
            alt="CareerEdge Logo"
            width={48}
            height={48}
            className="w-full h-full object-contain dark:hidden"
          />
          <Image
            src="/logo_dark.png"
            alt="CareerEdge Logo"
            width={48}
            height={48}
            className="w-full h-full object-contain hidden dark:block"
          />
        </div>
        <h3 className="text-2xl font-extrabold tracking-tight">Complete Your Profile Setup</h3>
        <p className="text-muted-foreground text-xs max-w-md mx-auto">
          {isCompany
            ? "Configure your company recruiting profile to start posting listings and filtering candidates."
            : "Optimize your candidate match ratings. Details are used directly by our AI matchmakers."}
        </p>
      </div>

      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center text-center p-8 space-y-4"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 animate-bounce" />
          </div>
          <h4 className="font-bold text-lg text-foreground">Profile Configuration Saved!</h4>
          <p className="text-xs text-muted-foreground max-w-xs">
            Your career profile has been compiled. Updating your dashboard layouts...
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 font-medium">
              {error}
            </div>
          )}

          {isCompany ? (
            <OnboardingCompanyForm
              key={profile?._id || "company-new"}
              initialProfile={profile as CompanyProfile}
              loading={loading}
              onSubmit={handleSubmitProfile}
              onCancel={handleSkip}
            />
          ) : (
            <OnboardingCandidateForm
              key={profile?._id || "candidate-new"}
              initialProfile={profile as CandidateProfile}
              loading={loading}
              onSubmit={handleSubmitProfile}
              onCancel={handleSkip}
            />
          )}
        </div>
      )}
    </Dialog>
  );
}
