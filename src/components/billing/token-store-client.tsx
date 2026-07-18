"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Coins, AlertCircle, CheckCircle2, Loader2, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";
import { useEffect } from "react";

interface PricingItem {
  id: string;
  type: "base-plan" | "ai-token-pack";
  target?: "company" | "candidate";
  name: string;
  price: number;
  tokensCount?: number;
}

interface TokenStoreClientProps {
  packs: PricingItem[];
  profile: any;
  accountType: "company" | "candidate";
}

export function TokenStoreClient({ packs, profile, accountType }: TokenStoreClientProps) {
  const router = useRouter();

  useEffect(() => {
    const { setHeader, clearHeader } = useUIStore.getState();
    setHeader("Buy Extra AI Tokens", "", "/dashboard");
    return () => clearHeader();
  }, []);

  const [actionPending, startTransition] = useTransition();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    pack: PricingItem | null;
  }>({ open: false, pack: null });

  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handlePurchaseSelect = (pack: PricingItem) => {
    router.push(`/dashboard/checkout?itemId=${pack.id}`);
  };

  const confirmPurchase = () => {
    const { pack } = confirmDialog;
    if (!pack) return;

    setConfirmDialog({ open: false, pack: null });

    startTransition(async () => {
      try {
        const res = await fetch("/api/payments/mock-buy-tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packId: pack.id })
        });

        if (!res.ok) {
          const errBody = await res.json();
          throw new Error(errBody.error || "Purchase failed");
        }

        showToast(`Successfully purchased ${pack.tokensCount} credits! (Mock Purchase)`, "success");
        
        // Refresh router context and reload after a short delay for UX
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to execute purchase";
        showToast(msg, "error");
      }
    });
  };

  const aiTokens = profile?.aiTokens || { allocated: 0, purchased: 0, total: 0 };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
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

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Current Balance & Upgrade Link Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 pb-2 text-left">
          {/* Link to Upgrade */}
          <button
            onClick={() => router.push("/dashboard/upgrade")}
            className="flex items-center gap-1.5 text-xs font-extrabold text-primary hover:underline cursor-pointer border-0 bg-transparent p-0 group"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>Want monthly allocated tokens? Upgrade your plan</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          {/* Current Balance Card */}
          <div className="w-full sm:w-auto p-5 rounded-3xl border border-indigo-500/20 dark:border-indigo-500/30 bg-indigo-500/[0.02] flex flex-col justify-center min-w-[200px] flex-shrink-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Your Token Balance</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-foreground">{aiTokens.total ?? 0}</span>
              <span className="text-xs text-indigo-500 font-extrabold uppercase">Credits</span>
            </div>
            <div className="flex gap-4 text-[9px] text-muted-foreground font-bold mt-2 pt-2 border-t border-indigo-500/10">
              <div>
                <span>Allocated: {aiTokens.allocated}</span>
              </div>
              <div>
                <span>Purchased: {aiTokens.purchased}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Packs grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4"
        >
          {packs.map((pack) => {
            const isPower = pack.id === "tokens-1000";
            const isValue = pack.id === "tokens-500";

            return (
              <motion.div
                key={pack.id}
                variants={itemVariants}
                className={cn(
                  "rounded-3xl border bg-card p-6 shadow-lg flex flex-col justify-between gap-6 relative overflow-hidden transition-all duration-300 group hover:shadow-xl hover:-translate-y-0.5",
                  isPower 
                    ? "border-primary ring-1 ring-primary/30" 
                    : "border-neutral-200/40 dark:border-neutral-800/80"
                )}
              >
                {/* Glow effects */}
                {isPower && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/15 transition-all" />
                )}
                {isValue && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-all" />
                )}

                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">{pack.name}</h3>
                    {isPower && (
                      <span className="text-[8px] font-black uppercase text-white bg-primary px-2 py-0.5 rounded-full shadow-sm">
                        Best Value
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-baseline gap-0.5 mt-4">
                    <span className="text-3xl font-black text-foreground">₹{pack.price}</span>
                  </div>

                  <div className="h-px bg-neutral-200/50 dark:bg-neutral-800/50 my-4" />

                  <p className="text-xs text-muted-foreground font-semibold leading-relaxed flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    Includes <span className="font-extrabold text-foreground">{pack.tokensCount} AI credits</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground/80 mt-1 font-medium pl-5">
                    Non-expiring tokens. Used automatically when monthly tokens run out.
                  </p>
                </div>

                <Button
                  onClick={() => handlePurchaseSelect(pack)}
                  disabled={actionPending}
                  className={cn(
                    "w-full font-bold text-xs rounded-xl h-10 cursor-pointer shadow-sm transition-all border-0",
                    isPower
                      ? "bg-ai-gradient text-white hover:opacity-90 animate-pulse"
                      : "bg-primary text-white hover:bg-primary/90"
                  )}
                >
                  Buy Pack
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* MOCK CHECKOUT CONFIRM DIALOG */}
      {confirmDialog.open && confirmDialog.pack && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div 
            onClick={() => setConfirmDialog({ open: false, pack: null })}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm bg-card rounded-[2rem] border border-neutral-200/40 dark:border-neutral-800/80 shadow-2xl p-6 z-10 text-center flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
              <Coins className="w-6 h-6 text-indigo-500 animate-bounce" />
            </div>
            
            <div>
              <h3 className="text-base font-extrabold text-foreground">Confirm Mock Checkout</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Are you sure you want to buy <span className="font-bold text-foreground">{confirmDialog.pack.name}</span> ({confirmDialog.pack.tokensCount} tokens) for <span className="font-bold text-foreground">₹{confirmDialog.pack.price}</span>?
              </p>
              <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold p-2.5 rounded-xl mt-3 flex items-center gap-1.5 justify-center">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Mock purchase: No real money will be charged.</span>
              </div>
            </div>

            <div className="flex gap-3 w-full mt-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDialog({ open: false, pack: null })}
                className="font-bold text-xs h-9 rounded-xl flex-1 cursor-pointer border-neutral-200 dark:border-neutral-800"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmPurchase}
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
