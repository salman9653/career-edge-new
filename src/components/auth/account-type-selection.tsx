"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Building, ArrowRight, Check, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { ACCOUNT_TYPES } from "@/lib/constants";
import { User as UserType } from "@/types";
import { motion } from "motion/react";

interface AccountTypeSelectionProps {
  user: UserType;
}

export function AccountTypeSelection({ user }: AccountTypeSelectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSelection = async (type: "candidate" | "company") => {
    setLoading(true);
    setError("");

    try {
      const { error: updateError } = await authClient.updateUser({
        accountType: type,
      });

      if (updateError) {
        setError(updateError.message || `Failed to set account type to ${type}.`);
      } else {
        // Initialize the profile document in the database collection immediately
        try {
          await fetch("/api/profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              type === "company" ? { companyName: user.name || "" } : {}
            ),
          });
        } catch (profileErr) {
          console.error("Failed to initialize profile document:", profileErr);
        }

        setSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 1200);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4 w-full">
      <div className="w-full max-w-3xl relative z-10 my-8">
        {/* Background decorative glows */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <Card className="rounded-3xl glass border shadow-2xl overflow-hidden p-6 sm:p-8">
          <CardHeader className="space-y-3 text-center pb-8">
            <div className="inline-flex items-center space-x-2.5 mx-auto px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-200/20 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Configure Account Profile</span>
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight">
              How would you like to use Career Edge?
            </CardTitle>
            <CardDescription className="text-sm max-w-md mx-auto">
              <span className="block mb-1">
                Welcome, <span className="font-bold text-foreground">{user.name}</span>!
              </span>
              <span className="block text-muted-foreground/80">
                Select your account type to configure your personalized dashboard experiences.
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center p-8 space-y-4"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <Check className="w-8 h-8 animate-bounce" />
                </div>
                <h4 className="font-bold text-lg text-foreground">Account Configured Successfully</h4>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Preparing your specialized dashboard workspaces...
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {ACCOUNT_TYPES.map((type) => {
                  const isCandidate = type.id === "candidate";
                  const Icon = isCandidate ? User : Building;
                  const buttonText = isCandidate ? "Find Jobs" : "Hire Talent";
                  const accentClass = isCandidate
                    ? "hover:border-indigo-500/30 group-hover:bg-indigo-500 shadow-indigo-500/5 group-hover:text-white"
                    : "hover:border-violet-500/30 group-hover:bg-violet-500 shadow-violet-500/5 group-hover:text-white";

                  return (
                    <div
                      key={type.id}
                      onClick={() => !loading && handleSelection(type.id)}
                      className={`group relative p-6 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/30 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 ${accentClass}`}
                    >
                      <div className="space-y-4">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                            isCandidate
                              ? "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white"
                              : "bg-violet-500/10 text-violet-500 dark:text-violet-400 group-hover:bg-violet-500 group-hover:text-white"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="text-lg font-bold tracking-tight text-foreground">
                            {isCandidate ? "Join as a Candidate" : "Join as an Employer"}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {isCandidate
                              ? "Optimize your resumes, match target skill sets with hyper-growth companies, and practice AI interview screening call assessments."
                              : "Source candidates at scale, run custom automated AI interview agents, and streamline ATS scheduling/hiring pipelines."}
                          </p>
                        </div>
                      </div>
                      <div className="pt-6">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelection(type.id);
                          }}
                          variant="outline"
                          className={`w-full justify-between rounded-xl transition-all duration-300 font-bold ${
                            isCandidate
                              ? "group-hover:bg-indigo-500 group-hover:text-white group-hover:border-transparent"
                              : "group-hover:bg-violet-500 group-hover:text-white group-hover:border-transparent"
                          }`}
                          disabled={loading}
                        >
                          {buttonText} <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {error && (
              <div className="p-3 text-xs bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 font-medium text-center">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
