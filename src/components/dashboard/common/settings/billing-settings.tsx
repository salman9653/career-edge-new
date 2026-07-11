"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  Sparkles, 
  Coins, 
  Check, 
  Calendar, 
  History, 
  ArrowUpRight, 
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
  const [plans, setPlans] = useState<PricingItem[]>([]);
  const [tokenPacks, setTokenPacks] = useState<PricingItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isCompany = user?.accountType === "company";
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [actionPending, startTransition] = useTransition();

  // Company profile state loaded client-side for fresh values
  const [profile, setProfile] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Checkout Confirm state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "upgrade" | "purchase";
    item: PricingItem | null;
  }>({ open: false, type: "upgrade", item: null });

  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
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
          setTokenPacks(data.filter(p => p.type === "ai-token-pack"));
        }
      } catch (err) {
        console.error("Failed to load pricing configurations:", err);
      } finally {
        setLoadingPricing(false);
      }
    }
    loadPricing();
  }, []);

  // 2. Fetch Transactions & Profile details
  useEffect(() => {
    async function loadUserData() {
      setLoadingTransactions(true);
      try {
        // Fetch fresh company profile (which has activePlan & aiTokens)
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profileBody = await profileRes.json();
          setProfile(profileBody.profile || profileBody.data);
        }

        // Fetch transactions
        const txRes = await fetch(`/api/payments/transactions?page=${currentPage}&limit=5`);
        if (txRes.ok) {
          const txBody = await txRes.json();
          setTransactions(txBody.transactions || []);
          setTotalTransactions(txBody.totalCount || 0);
        }
      } catch (err) {
        console.error("Failed to load company billing information:", err);
      } finally {
        setLoadingTransactions(false);
      }
    }
    loadUserData();
  }, [currentPage, refreshTrigger]);

  // Handle mock upgrade
  const handleUpgrade = (item: PricingItem) => {
    setConfirmDialog({ open: true, type: "upgrade", item });
  };

  // Handle mock buy tokens
  const handleBuyTokens = (item: PricingItem) => {
    setConfirmDialog({ open: true, type: "purchase", item });
  };

  // Confirm mock checkout action
  const confirmCheckout = () => {
    const { type, item } = confirmDialog;
    if (!item) return;

    setConfirmDialog(prev => ({ ...prev, open: false }));

    startTransition(async () => {
      try {
        const endpoint = type === "upgrade" 
          ? "/api/payments/mock-upgrade" 
          : "/api/payments/mock-buy-tokens";
          
        const payload = type === "upgrade"
          ? { planId: item.id }
          : { packId: item.id };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errBody = await res.json();
          throw new Error(errBody.error || "Transaction failed");
        }

        showToast(
          type === "upgrade" 
            ? `Successfully upgraded to ${item.name}! (Mock Purchase)` 
            : `Successfully purchased ${item.tokensCount} credits! (Mock Purchase)`,
          "success"
        );
        
        // Trigger page re-fetch
        setRefreshTrigger(prev => prev + 1);
        
        // Refresh session
        window.location.reload();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to execute transaction";
        showToast(msg, "error");
      }
    });
  };

  if (loadingPricing) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-xs text-muted-foreground">Loading subscription information...</p>
      </div>
    );
  }

  const activePlanId = profile?.activePlan || "company-free";
  const aiTokens = profile?.aiTokens || { allocated: 15, purchased: 0, total: 15 };
  
  const currentPlan = plans.find(p => p.id === activePlanId) || {
    name: "Free Tier",
    price: 0,
    activeJobsLimit: 2,
    activeAssessmentsLimit: 2
  };

  return (
    <div className="w-full space-y-8 pb-10 text-left">
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

      {/* 1. CURRENT SUBSCRIPTION CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-neutral-200/40 dark:border-neutral-800/40 bg-card p-6 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[180px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Active Plan</span>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-foreground">{currentPlan.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/20">
                {currentPlan.price === 0 ? "Free" : "Active"}
              </span>
            </div>
            
            {isCompany ? (
              <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Active Jobs Limit:</span>
                  <p className="text-foreground font-black mt-0.5">{currentPlan.activeJobsLimit} Active Posts</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Assessments Limit:</span>
                  <p className="text-foreground font-black mt-0.5">
                    {currentPlan.activeAssessmentsLimit === 9999 ? "Unlimited" : `${currentPlan.activeAssessmentsLimit} Active`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-xs">
                <span className="text-muted-foreground">Plan Benefits:</span>
                <p className="text-foreground font-black mt-0.5">Full access to AI resume builder, career suggestions, and practice templates.</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. TOKENS STATUS */}
        <div className="rounded-3xl border border-neutral-200/40 dark:border-neutral-800/40 bg-card p-6 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[180px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">AI Tokens Balance</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-foreground">{aiTokens.total ?? 15}</span>
              <span className="text-xs text-muted-foreground font-bold uppercase">Total Credits</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Monthly Allocated:</span>
                <p className="text-foreground font-black mt-0.5">{aiTokens.allocated ?? 15} Credits</p>
              </div>
              <div>
                <span className="text-muted-foreground">Purchased Top-up:</span>
                <p className="text-foreground font-black mt-0.5">{aiTokens.purchased ?? 0} Credits (Non-expiring)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SUBSCRIPTIONS GRID */}
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" /> Upgrade Subscription Plan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.filter(p => p.id !== "company-free").map((plan) => {
            const isActive = plan.id === activePlanId;
            return (
              <div 
                key={plan.id}
                className={cn(
                  "rounded-3xl border p-6 bg-card shadow-lg flex flex-col justify-between gap-6 relative overflow-hidden transition-all duration-300",
                  isActive ? "border-primary ring-1 ring-primary" : "border-neutral-200/30 dark:border-neutral-800/50"
                )}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-base font-extrabold text-foreground">{plan.name}</h4>
                    {isActive && (
                      <span className="text-[9px] font-black uppercase text-white bg-primary px-2.5 py-0.5 rounded-full">
                        Current Plan
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-baseline gap-0.5 mt-2">
                    <span className="text-2xl font-black text-foreground">₹{plan.price}</span>
                    <span className="text-[10px] text-muted-foreground">/ month</span>
                  </div>

                  <div className="h-px bg-neutral-200/50 dark:bg-neutral-800/50 my-4" />

                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-xs text-foreground font-bold">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{plan.monthlyTokens} AI Tokens / month</span>
                    </li>
                    {isCompany ? (
                      <>
                        <li className="flex items-center gap-2 text-xs text-foreground font-bold">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{plan.activeJobsLimit} Active Jobs limit</span>
                        </li>
                        <li className="flex items-center gap-2 text-xs text-foreground font-bold">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>
                            {plan.activeAssessmentsLimit === 9999 ? "Unlimited Assessments" : `${plan.activeAssessmentsLimit} Assessments limit`}
                          </span>
                        </li>
                        {plan.features?.slice(3).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground font-semibold">
                            <Check className="w-3.5 h-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </>
                    ) : (
                      <>
                        {plan.features?.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground font-semibold">
                            <Check className="w-3.5 h-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </>
                    )}
                  </ul>
                </div>

                <Button
                  onClick={() => handleUpgrade(plan)}
                  disabled={isActive || actionPending}
                  className={cn(
                    "w-full font-bold text-xs rounded-xl h-10 cursor-pointer shadow-md",
                    isActive 
                      ? "bg-neutral-100 dark:bg-neutral-800 text-muted-foreground border-transparent"
                      : "bg-ai-gradient border-0 text-white hover:opacity-90"
                  )}
                >
                  {isActive ? "Current Plan" : `Upgrade for ₹${plan.price}`}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. BUY TOKENS ADD-ON */}
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-primary" /> Buy Extra AI Tokens
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokenPacks.map((pack) => (
            <div 
              key={pack.id}
              className="rounded-3xl border border-neutral-200/30 dark:border-neutral-800/50 bg-card p-6 shadow-md flex flex-col justify-between gap-5 relative overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div>
                <h4 className="text-sm font-black text-foreground uppercase tracking-wider">{pack.name}</h4>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-black text-foreground">₹{pack.price}</span>
                  <span className="text-[10px] text-muted-foreground">one-time</span>
                </div>
                <div className="h-px bg-neutral-200/50 dark:bg-neutral-800/50 my-3" />
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Includes {pack.tokensCount} AI Tokens
                </p>
              </div>

              <Button
                onClick={() => handleBuyTokens(pack)}
                disabled={actionPending}
                className="w-full font-bold text-xs rounded-xl h-9 cursor-pointer bg-primary text-white hover:bg-primary/90 border-0 transition-all shadow-sm"
              >
                Buy Pack
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. TRANSACTION HISTORY */}
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <History className="w-4 h-4 text-primary" /> Credit Transactions History
        </h3>
        
        {loadingTransactions ? (
          <div className="py-6 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-primary animate-spin mr-2" />
            <span className="text-xs text-muted-foreground">Loading history...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 text-xs text-muted-foreground">
            No transactions found yet.
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
                  className="font-bold text-[10px] h-8 px-3 rounded-lg"
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
                  className="font-bold text-[10px] h-8 px-3 rounded-lg"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. MOCK CHECKOUT CONFIRM DIALOG */}
      {confirmDialog.open && confirmDialog.item && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div 
            onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm bg-card rounded-3xl border border-neutral-200/40 dark:border-neutral-800/80 shadow-2xl p-6 z-10 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            
            <div>
              <h3 className="text-base font-extrabold text-foreground">Confirm Mock Checkout</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {confirmDialog.type === "upgrade" 
                  ? `Are you sure you want to upgrade to ${confirmDialog.item.name} for ₹${confirmDialog.item.price}?`
                  : `Are you sure you want to buy ${confirmDialog.item.name} (${confirmDialog.item.tokensCount} tokens) for ₹${confirmDialog.item.price}?`
                }
              </p>
              <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold p-2.5 rounded-xl mt-3">
                ⚠️ This is a mock checkout. No real money will be charged.
              </div>
            </div>

            <div className="flex gap-3 w-full mt-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
                className="font-bold text-xs h-9 rounded-xl flex-1 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmCheckout}
                disabled={actionPending}
                className="font-bold text-xs h-9 rounded-xl flex-1 bg-ai-gradient border-0 text-white cursor-pointer shadow-md"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
