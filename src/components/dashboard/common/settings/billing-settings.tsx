"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Coins, 
  History, 
  Loader2, 
  CheckCircle2, 
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

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

interface TransactionItem {
  _id: string;
  amount: number;
  balanceAfter: number;
  type: string;
  description: string;
  createdAt: string;
}

export function BillingSettings() {
  const router = useRouter();
  const [plans, setPlans] = useState<PricingItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isCompany = user?.accountType === "company";
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // Profile details loaded client-side for fresh values
  const [profile, setProfile] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  // Cancel subscription states
  const [showCancelWizard, setShowCancelWizard] = useState(false);
  const [cancelStep, setCancelStep] = useState(1);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonDetail, setCancelReasonDetail] = useState("");
  const [cancelPending, setCancelPending] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleConfirmCancel = async () => {
    setCancelPending(true);
    try {
      const res = await fetch("/api/payments/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to cancel subscription");
      }

      showToast("Subscription cancelled! Access will remain active until billing period ends.", "success");
      setShowCancelWizard(false);
      // Trigger user profile reload
      setRefreshTrigger(prev => prev + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel subscription";
      showToast(msg, "error");
    } finally {
      setCancelPending(false);
    }
  };

  // 1. Fetch Pricing Tiers
  useEffect(() => {
    async function loadPricing() {
      try {
        const res = await fetch("/api/payments/pricing");
        if (res.ok) {
          const body = await res.json();
          const data: PricingItem[] = body.data || [];
          const target = isCompany ? "company" : "candidate";
          setPlans(data.filter(p => p.type === "base-plan" && p.target === target));
        }
      } catch (err) {
        console.error("Failed to load pricing configurations:", err);
      } finally {
        setLoadingPricing(false);
      }
    }
    loadPricing();
  }, [isCompany]);

  // 2. Fetch Transactions & Profile details
  useEffect(() => {
    async function loadUserData() {
      setLoadingTransactions(true);
      try {
        // Fetch profile (which has activePlan & aiTokens)
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profileBody = await profileRes.json();
          setProfile(profileBody.profile || profileBody.data);
        }

        // Fetch transactions (billingOnly=true to only show purchases and upgrades)
        const txRes = await fetch(`/api/payments/transactions?page=${currentPage}&limit=5&billingOnly=true`);
        if (txRes.ok) {
          const txBody = await txRes.json();
          setTransactions(txBody.transactions || []);
          setTotalTransactions(txBody.totalCount || 0);
        }
      } catch (err) {
        console.error("Failed to load billing information:", err);
      } finally {
        setLoadingTransactions(false);
      }
    }
    loadUserData();
  }, [currentPage, refreshTrigger]);

  if (loadingPricing) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-xs text-muted-foreground">Loading subscription information...</p>
      </div>
    );
  }

  const defaultFreePlan = isCompany ? "company-free" : "candidate-free";
  const activePlanId = profile?.activePlan || defaultFreePlan;
  const aiTokens = profile?.aiTokens || { allocated: isCompany ? 15 : 5, purchased: 0, total: isCompany ? 15 : 5 };
  
  const currentPlan = plans.find(p => p.id === activePlanId) || {
    name: isCompany ? "Free Tier" : "Free Profile",
    price: 0,
    activeJobsLimit: 2,
    activeAssessmentsLimit: 2
  };

  const maxTokens = plans.find(p => p.id === activePlanId)?.monthlyTokens ?? (isCompany ? 15 : 5);
  const totalLimit = maxTokens + (aiTokens.purchased || 0);
  const percentage = Math.min(100, Math.max(0, ((aiTokens.total ?? 0) / totalLimit) * 100));
  const isLowBalance = (aiTokens.total ?? 0) <= 5;
  const isProPlus = activePlanId.endsWith("-pro-plus");

  return (
    <div className="w-full space-y-6 pb-10 text-left">
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

      {/* 1. CURRENT SUBSCRIPTION CARD & TOKENS STATUS (Stacked full width) */}
      <div className="flex flex-col gap-6 w-full">
        {/* ACTIVE PLAN CARD */}
        <div className="rounded-3xl border border-neutral-200/40 dark:border-neutral-800/40 bg-card p-6 shadow-md relative overflow-hidden flex flex-col min-h-[160px] w-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          
          {/* Row 1: Left has active plan name, Right has upgrade button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Active Plan</span>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-foreground">{currentPlan.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/20">
                  {currentPlan.price === 0 ? "Free" : "Active"}
                </span>
              </div>
            </div>
            
            {!isProPlus && (
              <Button
                onClick={() => router.push("/dashboard/upgrade")}
                className="bg-ai-gradient border-0 text-white font-bold text-xs rounded-xl h-9 px-6 hover:opacity-90 transition-all cursor-pointer shadow-sm w-full sm:w-auto flex-shrink-0"
              >
                Upgrade Plan
              </Button>
            )}
          </div>

          {/* Row 2: Limits section (full width) */}
          <div className="border-t border-neutral-200/40 dark:border-neutral-800/40 pt-4 mt-4 w-full">
            {isCompany ? (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground font-bold">Active Jobs Limit:</span>
                  <p className="text-foreground font-black mt-0.5">{currentPlan.activeJobsLimit} Active Posts</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-bold">Assessments Limit:</span>
                  <p className="text-foreground font-black mt-0.5">
                    {currentPlan.activeAssessmentsLimit === 9999 ? "Unlimited" : `${currentPlan.activeAssessmentsLimit} Active`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs">
                <span className="text-muted-foreground font-bold">Plan Benefits:</span>
                <p className="text-foreground font-black mt-0.5">Full access to AI resume builder, career suggestions, and mock practice templates.</p>
              </div>
            )}
          </div>

          {/* Row 3: Subscription Billing Details / Expiry warning & Cancel button */}
          {profile?.subscription?.subscriptionId && (
            <div className="border-t border-neutral-200/40 dark:border-neutral-800/40 pt-4 mt-4 flex flex-row items-center justify-between w-full text-xs">
              <div className="flex flex-col text-left gap-0.5">
                {profile.subscription.status === "canceling" ? (
                  <span className="text-amber-500 font-extrabold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Access expires on {new Date(profile.subscription.currentPeriodEnd).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} (Subscription Canceled)
                  </span>
                ) : (
                  <span className="text-muted-foreground font-semibold">
                    Next renewal: <span className="text-foreground font-black">{new Date(profile.subscription.currentPeriodEnd).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  </span>
                )}
              </div>

              {profile.subscription.status === "active" && (
                <button
                  onClick={() => {
                    setCancelStep(1);
                    setCancelReason("");
                    setShowCancelWizard(true);
                  }}
                  className="text-red-500 hover:text-red-600 font-extrabold hover:underline cursor-pointer border-0 bg-transparent p-0 transition-colors"
                >
                  Cancel Plan
                </button>
              )}
            </div>
          )}
        </div>

        {/* TOKENS BALANCE CARD */}
        <div className={cn(
          "rounded-3xl border p-6 shadow-md relative overflow-hidden flex flex-col min-h-[180px] w-full transition-all duration-300",
          isLowBalance 
            ? "border-red-500/50 dark:border-red-500/50 bg-red-500/[0.02] shadow-red-500/5" 
            : "border-neutral-200/40 dark:border-neutral-800/40 bg-card"
        )}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          
          {/* Row 1: Left has title and balance. Right has buy button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Tokens Balance</span>
                {isLowBalance && (
                  <span className="px-1.5 py-0.5 rounded-full text-[7px] font-extrabold uppercase bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
                    Low
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-foreground">{aiTokens.total ?? 0}</span>
                <span className="text-xs text-muted-foreground font-bold uppercase">Total Credits</span>
              </div>
            </div>

            <Button
              onClick={() => router.push("/dashboard/token-store")}
              className={cn(
                "font-bold text-xs rounded-xl h-9 px-6 transition-all cursor-pointer shadow-sm border-0 w-full sm:w-auto flex-shrink-0",
                isLowBalance 
                  ? "bg-red-600 text-white hover:bg-red-700 animate-pulse" 
                  : "bg-primary text-white hover:bg-primary/90"
              )}
            >
              {isLowBalance ? "Buy Tokens Now" : "Buy Tokens"}
            </Button>
          </div>

          {/* Row 2: Progress bar (full width) */}
          <div className="space-y-1 mt-4 w-full">
            <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
              <span>Remaining Tokens</span>
              <span>{aiTokens.total ?? 0} / {totalLimit}</span>
            </div>
            <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-500",
                  isLowBalance ? "bg-red-500 animate-pulse" : "bg-ai-gradient"
                )} 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Row 3: Card Footer containing Monthly Allocated, Purchased Top-up & Token History link */}
          <div className="border-t border-neutral-200/40 dark:border-neutral-800/40 pt-3 mt-4 flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3 text-[10px]">
            {/* Left Side: Credit breakdown */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-muted-foreground font-bold">
              <div>
                <span>Monthly Allocated: </span>
                <span className="text-foreground font-black">{aiTokens.allocated ?? 0}</span>
              </div>
              <div className="hidden xs:block w-1 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
              <div>
                <span>Purchased Tokens: </span>
                <span className="text-foreground font-black">{aiTokens.purchased ?? 0}</span>
              </div>
            </div>

            {/* Right Side: Token History Link */}
            <button
              onClick={() => router.push("/dashboard/token-history")}
              className="flex items-center gap-1.5 font-extrabold text-muted-foreground hover:text-foreground transition-all cursor-pointer border-0 bg-transparent p-0 group self-start sm:self-auto"
            >
              <History className="w-3.5 h-3.5 text-primary group-hover:scale-105 transition-transform" />
              <span>Token History</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. BILLING HISTORY */}
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-primary" /> Billing History
        </h3>
        
        {loadingTransactions ? (
          <div className="py-6 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-primary animate-spin mr-2" />
            <span className="text-xs text-muted-foreground">Loading history...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 text-xs text-muted-foreground">
            No billing transactions found.
          </div>
        ) : (
          <div className="rounded-3xl border border-neutral-200/30 dark:border-neutral-800/50 overflow-hidden bg-card shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900/60 text-muted-foreground font-bold border-b border-neutral-200/50 dark:border-neutral-800/50">
                    <th className="p-4 uppercase tracking-wider">Date</th>
                    <th className="p-4 uppercase tracking-wider">Description</th>
                    <th className="p-4 uppercase tracking-wider">Type</th>
                    <th className="p-4 uppercase tracking-wider text-right">Credits Change</th>
                    <th className="p-4 uppercase tracking-wider text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/40 dark:divide-neutral-800/40">
                  {transactions.map((tx) => {
                    const date = new Date(tx.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    });
                    const isPositive = tx.amount > 0;
                    return (
                      <tr key={tx._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10">
                        <td className="p-4 text-muted-foreground font-medium">{date}</td>
                        <td className="p-4 text-foreground font-bold">{tx.description}</td>
                        <td className="p-4">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border",
                            tx.type === "upgrade" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                            tx.type === "purchase" && "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
                            tx.type === "refill" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                            tx.type === "consume" && "bg-neutral-500/10 text-muted-foreground border-neutral-500/20"
                          )}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={cn(
                          "p-4 font-black text-right",
                          isPositive ? "text-emerald-500" : "text-red-500"
                        )}>
                          {isPositive ? `+${tx.amount}` : tx.amount}
                        </td>
                        <td className="p-4 font-extrabold text-foreground text-right">{tx.balanceAfter}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Simple Pagination */}
            {totalTransactions > 5 && (
              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900/20 border-t border-neutral-200/50 dark:border-neutral-800/50">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  variant="outline"
                  className="font-bold text-[10px] h-8 px-3 rounded-lg border-neutral-200 dark:border-neutral-800"
                >
                  Previous
                </Button>
                <span className="text-[10px] text-muted-foreground">
                  Page {currentPage} of {Math.ceil(totalTransactions / 5)}
                </span>
                <Button
                  disabled={currentPage * 5 >= totalTransactions}
                  onClick={() => setCurrentPage(p => p + 1)}
                  variant="outline"
                  className="font-bold text-[10px] h-8 px-3 rounded-lg border-neutral-200 dark:border-neutral-800"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CANCELLATION RETENTION WIZARD DIALOG */}
      {showCancelWizard && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div 
            onClick={() => !cancelPending && setShowCancelWizard(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md bg-card rounded-[2rem] border border-neutral-200/40 dark:border-neutral-800/80 shadow-2xl p-6 z-10 text-left flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            {/* Step 1: Retention benefits loss */}
            {cancelStep === 1 && (
              <>
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Cancel Premium Subscription?</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    By canceling, you will lose access to premium privileges when your current cycle expires:
                  </p>
                  <ul className="mt-3.5 space-y-2 text-[11px] text-foreground font-bold">
                    {isCompany ? (
                      <>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>Active Jobs posting limit will decrease from 20+ to only 2 posts.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>Active Assessments screening limit will decrease to only 2.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>AI Tokens monthly refill allotment will cease.</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>Unlimited AI Mock Interview practice simulators will be blocked.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>AI Resume Rewrite checks and recruiter boost profiles will turn off.</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>AI Tokens monthly refill allotment will cease.</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
                <div className="flex gap-3 w-full mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelWizard(false)}
                    className="font-bold text-xs h-9 rounded-xl flex-1 cursor-pointer border-neutral-200 dark:border-neutral-800"
                  >
                    Keep My Plan
                  </Button>
                  <Button
                    onClick={() => setCancelStep(2)}
                    className="font-bold text-xs h-9 rounded-xl flex-1 bg-red-500 hover:bg-red-600 border-0 text-white cursor-pointer shadow-md"
                  >
                    Continue to Cancel
                  </Button>
                </div>
              </>
            )}

            {/* Step 2: Feedback Survey */}
            {cancelStep === 2 && (
              <>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Why are you canceling?</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Help us improve. Please select the primary reason:
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    {[
                      "Too expensive / High pricing",
                      "Missing required features",
                      "Difficulty using the platform",
                      "Switching to another service",
                      "Only needed it for temporary work"
                    ].map((reason) => (
                      <label key={reason} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 cursor-pointer text-xs font-semibold text-foreground">
                        <input
                          type="radio"
                          name="cancelReason"
                          value={reason}
                          checked={cancelReason === reason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className="w-4 h-4 text-primary focus:ring-primary border-neutral-300"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>

                  <textarea
                    placeholder="Tell us more (Optional)"
                    value={cancelReasonDetail}
                    onChange={(e) => setCancelReasonDetail(e.target.value)}
                    className="w-full mt-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-medium focus:ring-1 focus:ring-primary outline-none min-h-[70px] resize-none"
                  />
                </div>

                <div className="flex gap-3 w-full mt-2">
                  <Button
                    variant="outline"
                    onClick={() => setCancelStep(1)}
                    className="font-bold text-xs h-9 rounded-xl flex-1 cursor-pointer border-neutral-200 dark:border-neutral-800"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setCancelStep(3)}
                    disabled={!cancelReason}
                    className="font-bold text-xs h-9 rounded-xl flex-1 bg-primary text-white border-0 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Final confirmation */}
            {cancelStep === 3 && (
              <>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Confirm Cancellation</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Your subscription will end. You will retain premium access until <span className="font-bold text-foreground">{profile?.subscription?.currentPeriodEnd ? new Date(profile.subscription.currentPeriodEnd).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""}</span>, after which your account will automatically downgrade to the Free Tier.
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelWizard(false)}
                    className="font-bold text-xs h-9 rounded-xl flex-1 cursor-pointer border-neutral-200 dark:border-neutral-800"
                  >
                    Nevermind
                  </Button>
                  <Button
                    onClick={handleConfirmCancel}
                    disabled={cancelPending}
                    className="font-bold text-xs h-9 rounded-xl flex-1 bg-red-500 hover:bg-red-600 border-0 text-white cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    {cancelPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
