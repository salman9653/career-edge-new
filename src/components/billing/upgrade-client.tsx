"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ArrowLeft, Sparkles, Shield, Coins, AlertCircle, CheckCircle2, Loader2, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";

interface PricingItem {
  id: string;
  type: "base-plan" | "ai-token-pack";
  target?: "company" | "candidate";
  name: string;
  price: number;
  monthlyTokens?: number;
  activeJobsLimit?: number;
  activeAssessmentsLimit?: number;
  features?: string[];
  tokensCount?: number;
}

interface UpgradeClientProps {
  plans: PricingItem[];
  activePlanId: string;
  accountType: "company" | "candidate";
}

export function UpgradeClient({ plans, activePlanId, accountType }: UpgradeClientProps) {
  const router = useRouter();
  
  useEffect(() => {
    const { setHeader, clearHeader } = useUIStore.getState();
    setHeader("Upgrade your Subscription plan", "", "/dashboard");
    return () => clearHeader();
  }, []);

  const [actionPending, startTransition] = useTransition();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    plan: PricingItem | null;
  }>({ open: false, plan: null });

  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleUpgradeSelect = (plan: PricingItem) => {
    const activePlan = plans.find(p => p.id === activePlanId);
    const activePlanPrice = activePlan?.price ?? 0;

    if (plan.price > activePlanPrice) {
      router.push(`/dashboard/checkout?itemId=${plan.id}`);
      return;
    }

    setConfirmDialog({ open: true, plan });
  };

  const confirmUpgrade = () => {
    const { plan } = confirmDialog;
    if (!plan) return;

    setConfirmDialog({ open: false, plan: null });

    startTransition(async () => {
      try {
        const res = await fetch("/api/payments/mock-upgrade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId: plan.id })
        });

        if (!res.ok) {
          const errBody = await res.json();
          throw new Error(errBody.error || "Transaction failed");
        }

        showToast(`Successfully upgraded to ${plan.name}! (Mock Purchase)`, "success");
        
        // Refresh router context and reload after a short delay for UX
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to execute transaction";
        showToast(msg, "error");
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 w-full text-left">
      {/* Toast Notification */}
      {toast.show && (
        <div className={cn(
          "fixed top-4 right-4 z-[100] flex items-center gap-2.5 p-4 rounded-2xl shadow-2xl border text-xs font-semibold animate-in slide-in-from-top duration-300",
          toast.type === "success" 
            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
            : "bg-red-500/10 text-red-500 border-red-500/20"
        )}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Link to Token Store */}
        <div className="flex justify-end w-full pb-2">
          <button
            onClick={() => router.push("/dashboard/token-store")}
            className="flex items-center gap-1.5 text-xs font-extrabold text-primary hover:underline cursor-pointer border-0 bg-transparent p-0 group"
          >
            <Coins className="w-4 h-4 text-primary" />
            <span>Need extra credits? Go to Token Store</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4"
        >
          {plans.map((plan) => {
            const isActive = plan.id === activePlanId;
            const isProPlus = plan.id.endsWith("-pro-plus");
            const isPro = plan.id.endsWith("-pro");
            const isFree = plan.id.endsWith("-free");

            const userIsFree = activePlanId.endsWith("-free");
            const userIsPro = activePlanId.endsWith("-pro");
            const userIsProPlus = activePlanId.endsWith("-pro-plus");

            let buttonText = `Select Plan (₹${plan.price})`;
            if (!isActive) {
              if (userIsFree) {
                if (isPro) buttonText = "Upgrade to Pro";
                if (isProPlus) buttonText = "Upgrade to Pro+";
              } else if (userIsPro) {
                if (isFree) buttonText = "Cancel Subscription";
                if (isProPlus) buttonText = "Upgrade to Pro+";
              } else if (userIsProPlus) {
                if (isFree) buttonText = "Cancel Subscription";
                if (isPro) buttonText = "Downgrade to Pro";
              }
            }

            return (
              <motion.div 
                key={plan.id}
                variants={itemVariants}
                className={cn(
                  "rounded-[2.5rem] border p-8 shadow-xl flex flex-col justify-between gap-8 relative overflow-hidden transition-all duration-300 group hover:shadow-2xl hover:-translate-y-1",
                  isActive 
                    ? "border-primary ring-2 ring-primary/40 shadow-primary/10 bg-primary/[0.01] scale-[1.02]" 
                    : "border-neutral-200/40 dark:border-neutral-800/80 bg-card",
                  isProPlus && !isActive && "bg-gradient-to-b from-indigo-500/5 to-card dark:from-indigo-500/10 dark:to-card border-indigo-500/30 dark:border-indigo-500/40"
                )}
              >
                {/* Glow effects */}
                {isProPlus && (
                  <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/15 transition-all" />
                )}
                {isPro && !isActive && (
                  <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/10 transition-all" />
                )}

                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">{plan.name}</h3>
                      <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-widest">
                        {isFree ? "Starter Pack" : isPro ? "Recommended" : "Enterprise Elite"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-1 mt-6">
                    <span className="text-4xl font-black text-foreground">₹{plan.price}</span>
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">/ month</span>
                  </div>

                  <div className="h-px bg-neutral-200/50 dark:bg-neutral-800/50 my-6" />

                  <ul className="space-y-3.5">
                    <li className="flex items-center gap-2.5 text-xs text-foreground font-bold">
                      <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/25">
                        <Check className="w-3 h-3 text-emerald-500" />
                      </div>
                      <span>{plan.monthlyTokens} AI Tokens / month</span>
                    </li>
                    {accountType === "company" ? (
                      <>
                        <li className="flex items-center gap-2.5 text-xs text-foreground font-bold">
                          <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/25">
                            <Check className="w-3 h-3 text-emerald-500" />
                          </div>
                          <span>{plan.activeJobsLimit} Active Job Posts limit</span>
                        </li>
                        <li className="flex items-center gap-2.5 text-xs text-foreground font-bold">
                          <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/25">
                            <Check className="w-3 h-3 text-emerald-500" />
                          </div>
                          <span>{plan.activeAssessmentsLimit === 9999 ? "Unlimited" : `${plan.activeAssessmentsLimit} Assessments`}</span>
                        </li>
                        {plan.features?.slice(3).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground font-semibold">
                            <div className="w-5 h-5 rounded-lg bg-neutral-500/5 dark:bg-neutral-800/30 flex items-center justify-center flex-shrink-0 mt-0.5 border border-neutral-200/20 dark:border-neutral-800/60">
                              <Check className="w-3 h-3 text-neutral-400" />
                            </div>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </>
                    ) : (
                      <>
                        {plan.features?.slice(1).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground font-semibold">
                            <div className="w-5 h-5 rounded-lg bg-neutral-500/5 dark:bg-neutral-800/30 flex items-center justify-center flex-shrink-0 mt-0.5 border border-neutral-200/20 dark:border-neutral-800/60">
                              <Check className="w-3 h-3 text-neutral-400" />
                            </div>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </>
                    )}
                  </ul>
                </div>

                {isActive ? (
                  <div className="w-full text-center py-3 bg-neutral-100 dark:bg-neutral-800/60 text-muted-foreground font-black text-xs rounded-2xl uppercase tracking-widest select-none border border-neutral-200/30 dark:border-neutral-700/30 flex items-center justify-center gap-1.5 h-12">
                    <CheckCircle2 className="w-4 h-4 text-primary animate-pulse" />
                    <span>Active Plan</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleUpgradeSelect(plan)}
                    disabled={actionPending}
                    className={cn(
                      "w-full font-black text-xs rounded-2xl h-12 cursor-pointer shadow-md transition-all border-0",
                      isProPlus
                        ? "bg-ai-gradient text-white hover:shadow-indigo-500/10 hover:opacity-90"
                        : "bg-primary text-white hover:bg-primary/90"
                    )}
                  >
                    {buttonText}
                  </Button>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* 6. MOCK CHECKOUT CONFIRM DIALOG */}
      {confirmDialog.open && confirmDialog.plan && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div 
            onClick={() => setConfirmDialog({ open: false, plan: null })}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm bg-card rounded-[2rem] border border-neutral-200/40 dark:border-neutral-800/80 shadow-2xl p-6 z-10 text-center flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
              <Coins className="w-6 h-6 text-indigo-500 animate-bounce" />
            </div>
            
            <div>
              <h3 className="text-base font-extrabold text-foreground">Confirm Mock Checkout</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Are you sure you want to upgrade to <span className="font-bold text-foreground">{confirmDialog.plan.name}</span> for <span className="font-bold text-foreground">₹{confirmDialog.plan.price}/month</span>?
              </p>
              <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold p-2.5 rounded-xl mt-3 flex items-center gap-1.5 justify-center">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Mock purchase: No real money will be charged.</span>
              </div>
            </div>

            <div className="flex gap-3 w-full mt-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDialog({ open: false, plan: null })}
                className="font-bold text-xs h-9 rounded-xl flex-1 cursor-pointer border-neutral-200 dark:border-neutral-800"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmUpgrade}
                disabled={actionPending}
                className="font-bold text-xs h-9 rounded-xl flex-1 bg-ai-gradient border-0 text-white cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                {actionPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
