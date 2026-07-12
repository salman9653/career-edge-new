"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  User, 
  Coins, 
  Percent, 
  Edit2, 
  Check, 
  Plus, 
  Trash2, 
  X,
  Sparkles,
  ArrowRight,
  Loader2,
  CreditCard,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type PricingType = "base-plan" | "ai-token-pack";

interface PricingItem {
  _id?: string;
  id: string;
  type: PricingType;
  target?: "company" | "candidate";
  name: string;
  price: number;
  monthlyTokens?: number;
  activeJobsLimit?: number;
  activeAssessmentsLimit?: number;
  features?: string[];
  tokensCount?: number;
}

interface PaymentRow {
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  accountType: string;
  itemId: string;
  itemName: string;
  amountPaid: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  createdAt: string;
  couponCode?: string;
  status: string;
  razorpaySignature?: string;
}

interface ManagePricingClientProps {
  initialPricing: PricingItem[];
  initialPayments?: PaymentRow[];
}

type TabType = "company-plans" | "candidate-plans" | "ai-tokens" | "coupons" | "transactions";

export function ManagePricingClient({ initialPricing, initialPayments = [] }: ManagePricingClientProps) {
  const router = useRouter();
  const [pricing, setPricing] = useState<PricingItem[]>(initialPricing);
  const [activeTab, setActiveTab] = useState<TabType>("company-plans");
  const [editingItem, setEditingItem] = useState<PricingItem | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Feature list editing helper state
  const [newFeatureText, setNewFeatureText] = useState("");

  // Filter items
  const companyPlans = pricing.filter(p => p.type === "base-plan" && p.target === "company");
  const candidatePlans = pricing.filter(p => p.type === "base-plan" && p.target === "candidate");
  const tokenPacks = pricing.filter(p => p.type === "ai-token-pack");

  // Save changes handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSaveError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/pricing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingItem),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to update pricing");
        }

        const updated = await res.json();
        
        // Update local state
        setPricing(prev => prev.map(p => p.id === updated.data.id ? updated.data : p));
        setEditingItem(null);
        
        router.refresh();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to save changes";
        setSaveError(msg);
      }
    });
  };

  const handleFeatureDelete = (indexToDelete: number) => {
    if (!editingItem || !editingItem.features) return;
    setEditingItem({
      ...editingItem,
      features: editingItem.features.filter((_, idx) => idx !== indexToDelete)
    });
  };

  const handleFeatureAdd = () => {
    if (!newFeatureText.trim() || !editingItem) return;
    const currentFeatures = editingItem.features || [];
    setEditingItem({
      ...editingItem,
      features: [...currentFeatures, newFeatureText.trim()]
    });
    setNewFeatureText("");
  };

  const tabsList = [
    { id: "company-plans", label: "Company Plans", mobileLabel: "Company", icon: Building2 },
    { id: "candidate-plans", label: "Candidate Plans", mobileLabel: "Candidate", icon: User },
    { id: "ai-tokens", label: "AI Tokens", mobileLabel: "Tokens", icon: Coins },
    { id: "coupons", label: "Coupons & Offers", mobileLabel: "Coupons", icon: Percent },
    { id: "transactions", label: "Transactions", mobileLabel: "Tx Log", icon: CreditCard },
  ];

  return (
    <div className="w-full flex-1 flex flex-col overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 text-left relative">
      {/* Mobile Expanding Accordion-Pill Tabs (shown on mobile) */}
      <div className="md:hidden flex items-center justify-between bg-neutral-100/80 dark:bg-neutral-900/50 p-1 rounded-2xl border border-neutral-200/30 dark:border-neutral-800/50 mb-8 w-full gap-1">
        {tabsList.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as TabType)}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2.5 rounded-xl cursor-pointer transition-all duration-300 select-none border-0 bg-transparent flex-1 text-xs",
                isActive
                  ? "bg-white dark:bg-neutral-800 text-primary shadow-sm font-black px-3.5 flex-[1.5]"
                  : "text-muted-foreground hover:text-foreground px-1"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
              {isActive && (
                <span className="whitespace-nowrap transition-all duration-300 font-extrabold text-[10px] tracking-tight">
                  {t.mobileLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Desktop Tabs (shown on md+ screens) */}
      <div className="hidden md:flex flex-nowrap border-b border-neutral-200/50 dark:border-neutral-800/80 gap-1 mb-8 w-full">
        {tabsList.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as TabType)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 cursor-pointer transition-all duration-200 select-none",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-neutral-200 dark:hover:border-neutral-700"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TABS CONTENT */}
      <div className="flex-1 pb-20">
        <AnimatePresence mode="wait">
          {/* TAB 1: COMPANY PLANS */}
          {activeTab === "company-plans" && (
            <motion.div
              key="company-plans"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {companyPlans.map((plan) => (
                <div 
                  key={plan.id} 
                  className="rounded-3xl border border-neutral-200/30 dark:border-neutral-800/50 bg-card p-6 shadow-xl flex flex-col gap-6 relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-foreground">{plan.name}</h3>
                    <button
                      onClick={() => setEditingItem({ ...plan })}
                      className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer border-0"
                      title="Edit Plan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground">₹{plan.price}</span>
                    <span className="text-xs text-muted-foreground">/ month</span>
                  </div>

                  <div className="h-px bg-neutral-200/50 dark:bg-neutral-800/50" />

                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-bold uppercase tracking-wider">AI Tokens Allocation:</span>
                      <span className="text-foreground font-extrabold">{plan.monthlyTokens} Credits</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-bold uppercase tracking-wider">Active Jobs Limit:</span>
                      <span className="text-foreground font-extrabold">{plan.activeJobsLimit} Jobs</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-bold uppercase tracking-wider">Assessments Limit:</span>
                      <span className="text-foreground font-extrabold">
                        {plan.activeAssessmentsLimit === 9999 ? "Unlimited" : `${plan.activeAssessmentsLimit} Assessments`}
                      </span>
                    </div>
                    
                    <div className="pt-3 space-y-2">
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-wider mb-2">Included Offerings:</p>
                      {plan.features?.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* TAB 2: CANDIDATE PLANS */}
          {activeTab === "candidate-plans" && (
            <motion.div
              key="candidate-plans"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {candidatePlans.map((plan) => (
                <div 
                  key={plan.id} 
                  className="rounded-3xl border border-neutral-200/30 dark:border-neutral-800/50 bg-card p-6 shadow-xl flex flex-col gap-6 relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-foreground">{plan.name}</h3>
                    <button
                      onClick={() => setEditingItem({ ...plan })}
                      className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer border-0"
                      title="Edit Plan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground">₹{plan.price}</span>
                    <span className="text-xs text-muted-foreground">/ month</span>
                  </div>

                  <div className="h-px bg-neutral-200/50 dark:bg-neutral-800/50" />

                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-bold uppercase tracking-wider">AI Tokens Allocation:</span>
                      <span className="text-foreground font-extrabold">{plan.monthlyTokens} Credits</span>
                    </div>
                    
                    <div className="pt-3 space-y-2">
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-wider mb-2">Included Offerings:</p>
                      {plan.features?.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* TAB 3: AI TOKENS */}
          {activeTab === "ai-tokens" && (
            <motion.div
              key="ai-tokens"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 w-full"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                  <h2 className="text-base font-extrabold text-foreground">AI Token pricing packages</h2>
                  <p className="text-xs text-muted-foreground">Configure the cost and token credit limits for top-up purchases.</p>
                </div>
                <Button
                  onClick={() => setEditingItem({ id: "", type: "ai-token-pack", name: "", price: 0, tokensCount: 0 })}
                  className="font-bold text-xs bg-primary text-white rounded-xl h-10 px-5 flex items-center gap-1.5 cursor-pointer shadow-md border-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Create AI Token Pack
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tokenPacks.map((pack) => (
                <div 
                  key={pack.id} 
                  className="rounded-3xl border border-neutral-200/30 dark:border-neutral-800/50 bg-card p-6 shadow-xl flex flex-col gap-6 relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-foreground">{pack.name}</h3>
                    <button
                      onClick={() => setEditingItem({ ...pack })}
                      className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer border-0"
                      title="Edit Token Pack"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground">₹{pack.price}</span>
                    <span className="text-xs text-muted-foreground">one-time</span>
                  </div>

                  <div className="h-px bg-neutral-200/50 dark:bg-neutral-800/50" />

                  <div className="flex items-center justify-between text-xs py-2">
                    <span className="text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> Tokens Included:
                    </span>
                    <span className="text-foreground font-extrabold text-sm">{pack.tokensCount} Credits</span>
                  </div>
                </div>
              ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: COUPONS */}
          {activeTab === "coupons" && (
            <motion.div
              key="coupons"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <div className="glass border border-neutral-200/40 dark:border-neutral-800/40 rounded-3xl p-8 max-w-md mx-auto text-center flex flex-col items-center gap-4 bg-card shadow-xl mt-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Percent className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base font-extrabold text-foreground">Coupons & Offers</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The Promotional discounts, referral links, and seasonal coupon code module is currently under active development. You will be able to configure offers soon!
                </p>
                <Button disabled className="font-bold text-xs mt-2 px-6 rounded-xl">
                  Create First Offer
                </Button>
              </div>
            </motion.div>
          )}

          {/* TAB 5: TRANSACTIONS */}
          {activeTab === "transactions" && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full text-left"
            >
              <div className="bg-card rounded-3xl border border-neutral-200/40 dark:border-neutral-800/80 shadow-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800/40 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">Transaction Log</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Detailed audit ledger of all user checkouts and premium purchases.</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
                    {initialPayments.length} Total Payments
                  </span>
                </div>
                
                {initialPayments.length === 0 ? (
                  <div className="p-12 text-center text-xs text-muted-foreground font-bold">
                    No payments have been processed yet.
                  </div>
                ) : (
                  <>
                    {/* Mobile View: Stacked Cards (md:hidden) */}
                    <div className="md:hidden divide-y divide-neutral-100 dark:divide-neutral-800/60">
                      {initialPayments.map((payment) => {
                        const date = new Date(payment.createdAt);
                        const formattedDate = date.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        });
                        return (
                          <div
                            key={payment._id || payment.razorpayPaymentId}
                            onClick={() => setSelectedPayment(payment)}
                            className="p-4 flex flex-col gap-3 hover:bg-neutral-50/45 dark:hover:bg-neutral-900/20 transition-colors cursor-pointer"
                          >
                            {/* Top Row: User & Status */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                                  {payment.userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col text-left">
                                  <span className="font-extrabold text-foreground text-xs leading-none">{payment.userName}</span>
                                  <span className="text-[9px] uppercase tracking-wider font-black text-primary mt-1 leading-none">{payment.accountType}</span>
                                </div>
                              </div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
                                {payment.status || "CAPTURED"}
                              </span>
                            </div>

                            {/* Middle Row: Item and Price */}
                            <div className="flex items-baseline justify-between text-left">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-foreground">{payment.itemName}</span>
                                <span className="text-[9px] text-muted-foreground font-mono mt-0.5">{payment.itemId}</span>
                              </div>
                              <span className="text-xs font-black text-foreground">₹{payment.amountPaid}</span>
                            </div>

                            {/* Bottom Row: Date */}
                            <div className="text-[10px] text-muted-foreground font-medium text-left">
                              {formattedDate}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop View: Traditional Table (hidden md:block) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-neutral-200/50 dark:border-neutral-800/50 text-[10px] uppercase font-bold text-muted-foreground bg-neutral-50/50 dark:bg-neutral-900/30">
                            <th className="px-6 py-3.5">User</th>
                            <th className="px-6 py-3.5">Purchased Item</th>
                            <th className="px-6 py-3.5">Amount</th>
                            <th className="px-6 py-3.5">Date</th>
                            <th className="px-6 py-3.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                          {initialPayments.map((payment) => {
                            const date = new Date(payment.createdAt);
                            const formattedDate = date.toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            });
                            return (
                              <tr 
                                key={payment._id || payment.razorpayPaymentId} 
                                onClick={() => setSelectedPayment(payment)}
                                className="hover:bg-neutral-50/45 dark:hover:bg-neutral-900/20 transition-colors cursor-pointer"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                                      {payment.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col text-left">
                                      <span className="font-extrabold text-foreground text-xs leading-none">{payment.userName}</span>
                                      <span className="text-[9px] uppercase tracking-widest font-black text-primary mt-1.5 leading-none">{payment.accountType}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col text-left">
                                    <span className="font-bold text-foreground text-xs leading-none">{payment.itemName}</span>
                                    <span className="text-[10px] text-muted-foreground mt-1 font-mono leading-none">{payment.itemId}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-xs font-black text-foreground">₹{payment.amountPaid}</span>
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-muted-foreground">
                                  {formattedDate}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
                                    {payment.status || "CAPTURED"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* EDITING SLIDE-OVER PANEL / MODAL */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => !isPending && setEditingItem(null)}
              className="fixed inset-0 bg-black backdrop-blur-sm"
            />
            
            {/* Slide-over Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card rounded-3xl border border-neutral-200/40 dark:border-neutral-800/80 shadow-2xl p-6 overflow-hidden z-10 text-left flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200/50 dark:border-neutral-800/50 mb-5">
                <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-primary" /> {editingItem.id ? `Edit ${editingItem.name}` : "Create AI Token Pack"}
                </h3>
                <button 
                  disabled={isPending}
                  onClick={() => setEditingItem(null)}
                  className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center border-0 cursor-pointer text-foreground disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {saveError && (
                <div className="bg-red-500/10 text-red-500 text-xs font-semibold p-3 rounded-xl border border-red-500/20 mb-4">
                  {saveError}
                </div>
              )}

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* 1. Price field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Price (INR / Rs)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-background text-sm px-3.5 py-2 focus:ring-1 focus:ring-primary outline-none font-bold text-foreground"
                    placeholder="Enter price in Rupees"
                    disabled={isPending}
                  />
                </div>

                {editingItem.type === "base-plan" ? (
                  <>
                    {/* 2. Monthly AI tokens */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Included Monthly AI Tokens</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={editingItem.monthlyTokens}
                        onChange={(e) => setEditingItem({ ...editingItem, monthlyTokens: Number(e.target.value) })}
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-background text-sm px-3.5 py-2 focus:ring-1 focus:ring-primary outline-none font-bold text-foreground"
                        placeholder="Enter monthly tokens allocation"
                        disabled={isPending}
                      />
                    </div>

                    {editingItem.target === "company" && (
                      <div className="grid grid-cols-2 gap-4">
                        {/* 3. Active Jobs Limit */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Jobs Limit</label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={editingItem.activeJobsLimit}
                            onChange={(e) => setEditingItem({ ...editingItem, activeJobsLimit: Number(e.target.value) })}
                            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-background text-sm px-3.5 py-2 focus:ring-1 focus:ring-primary outline-none font-bold text-foreground"
                            disabled={isPending}
                          />
                        </div>

                        {/* 4. Active Assessments Limit */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Assessments Limit</label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={editingItem.activeAssessmentsLimit}
                            onChange={(e) => setEditingItem({ ...editingItem, activeAssessmentsLimit: Number(e.target.value) })}
                            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-background text-sm px-3.5 py-2 focus:ring-1 focus:ring-primary outline-none font-bold text-foreground"
                            disabled={isPending}
                          />
                        </div>
                      </div>
                    )}

                    {/* 5. Features lists */}
                    <div className="flex flex-col gap-2 pt-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Features / Offerings</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {editingItem.features?.map((feat, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-900/60 p-2 px-3 rounded-xl border border-neutral-200/40 dark:border-neutral-800/40 text-xs">
                            <span className="text-foreground font-medium flex-1">{feat}</span>
                            <button
                              type="button"
                              onClick={() => handleFeatureDelete(idx)}
                              disabled={isPending}
                              className="text-muted-foreground hover:text-red-500 p-1 cursor-pointer border-0 bg-transparent disabled:opacity-50"
                              title="Delete offering"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add new feature input */}
                      <div className="flex gap-2 mt-1.5">
                        <input
                          type="text"
                          value={newFeatureText}
                          onChange={(e) => setNewFeatureText(e.target.value)}
                          className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-background text-xs px-3.5 py-2 focus:ring-1 focus:ring-primary outline-none text-foreground"
                          placeholder="Add new included feature..."
                          disabled={isPending}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleFeatureAdd();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleFeatureAdd}
                          disabled={isPending || !newFeatureText.trim()}
                          className="p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-primary hover:text-white rounded-xl flex items-center justify-center cursor-pointer border-0 disabled:opacity-50 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Package Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Package Name</label>
                      <input
                        type="text"
                        required
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-background text-sm px-3.5 py-2 focus:ring-1 focus:ring-primary outline-none font-bold text-foreground"
                        placeholder="Enter package name (e.g., Elite Pack)"
                        disabled={isPending}
                      />
                    </div>

                    {/* Token package details */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tokens Included</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={editingItem.tokensCount}
                        onChange={(e) => setEditingItem({ ...editingItem, tokensCount: Number(e.target.value) })}
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-background text-sm px-3.5 py-2 focus:ring-1 focus:ring-primary outline-none font-bold text-foreground"
                        disabled={isPending}
                      />
                    </div>
                  </>
                )}

                {/* Buttons block */}
                <div className="flex gap-3 pt-4 border-t border-neutral-200/50 dark:border-neutral-800/50 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingItem(null)}
                    disabled={isPending}
                    className="font-bold text-xs h-10 px-5 rounded-xl cursor-pointer flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    disabled={isPending}
                    className="font-bold text-xs h-10 px-5 rounded-xl cursor-pointer flex-1 bg-ai-gradient border-0 text-white flex items-center justify-center gap-1.5 shadow-md"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TRANSACTION DETAILS SIDE PANEL */}
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPayment(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            
            {/* Slide-over Content Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative h-full w-full max-w-md bg-card border-l border-neutral-200/50 dark:border-neutral-800/80 shadow-2xl z-50 flex flex-col p-6 overflow-y-auto text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200/50 dark:border-neutral-800/60 mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Transaction Details</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
                    Order Ref: #{selectedPayment.razorpayOrderId}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground cursor-pointer border-0 bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="flex justify-between items-center p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Payment Status</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white">
                  {selectedPayment.status || "CAPTURED"}
                </span>
              </div>

              {/* User Section */}
              <div className="space-y-4 mb-6">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Customer Details</h4>
                <div className="p-4 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-900/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-base shadow-sm">
                    {selectedPayment.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-extrabold text-foreground text-sm leading-none">{selectedPayment.userName}</span>
                    <span className="text-xs text-muted-foreground mt-1.5 leading-none">{selectedPayment.userEmail}</span>
                    <span className="text-[9px] uppercase tracking-widest font-black text-primary mt-1.5 leading-none">{selectedPayment.accountType}</span>
                  </div>
                </div>
              </div>

              {/* Purchase Details */}
              <div className="space-y-4 mb-6">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Purchased Item</h4>
                <div className="p-4 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-900/30 text-xs font-bold text-muted-foreground space-y-3">
                  <div className="flex justify-between">
                    <span>Product:</span>
                    <span className="text-foreground font-extrabold">{selectedPayment.itemName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Product ID:</span>
                    <span className="text-foreground font-mono font-bold text-[10px]">{selectedPayment.itemId}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Breakdown */}
              <div className="space-y-4 mb-6">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Invoice Breakdown</h4>
                <div className="p-4 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-900/30 text-xs font-bold text-muted-foreground space-y-3">
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span className="text-foreground font-bold">₹{selectedPayment.amountPaid - Math.round((selectedPayment.amountPaid / 1.18) * 0.18)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%):</span>
                    <span className="text-foreground font-bold">₹{Math.round((selectedPayment.amountPaid / 1.18) * 0.18)}</span>
                  </div>
                  {selectedPayment.couponCode && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount (Coupon: {selectedPayment.couponCode}):</span>
                      <span>Applied</span>
                    </div>
                  )}
                  <div className="h-px bg-neutral-200/50 dark:bg-neutral-800/50 my-1" />
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-black">Grand Total:</span>
                    <span className="text-primary font-black">₹{selectedPayment.amountPaid}</span>
                  </div>
                </div>
              </div>

              {/* Razorpay transaction data */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Razorpay Gateway Info</h4>
                <div className="p-4 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-900/30 text-[10px] font-mono text-muted-foreground space-y-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground">Payment ID</span>
                    <span className="text-foreground">{selectedPayment.razorpayPaymentId}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground">Order ID</span>
                    <span className="text-foreground">{selectedPayment.razorpayOrderId}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground">Gateway Signature</span>
                    <span className="text-foreground truncate">{selectedPayment.razorpaySignature}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
