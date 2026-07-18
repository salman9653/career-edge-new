"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  Tag, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  ArrowRight,
  CreditCard
} from "lucide-react";
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

interface CheckoutClientProps {
  item: PricingItem;
  user: any;
  profile: any;
}

const PLAN_MAPPING: Record<string, {
  monthlyId: string;
  yearlyId: string;
  monthlyPrice: number;
  yearlyPrice: number;
  savingText: string;
  savingPercent: string;
}> = {
  "candidate-pro": {
    monthlyId: "candidate-pro",
    yearlyId: "candidate-pro-yearly",
    monthlyPrice: 199,
    yearlyPrice: 1999,
    savingText: "₹389",
    savingPercent: "16%"
  },
  "candidate-pro-yearly": {
    monthlyId: "candidate-pro",
    yearlyId: "candidate-pro-yearly",
    monthlyPrice: 199,
    yearlyPrice: 1999,
    savingText: "₹389",
    savingPercent: "16%"
  },
  "candidate-pro-plus": {
    monthlyId: "candidate-pro-plus",
    yearlyId: "candidate-pro-plus-yearly",
    monthlyPrice: 499,
    yearlyPrice: 4999,
    savingText: "₹989",
    savingPercent: "16%"
  },
  "candidate-pro-plus-yearly": {
    monthlyId: "candidate-pro-plus",
    yearlyId: "candidate-pro-plus-yearly",
    monthlyPrice: 499,
    yearlyPrice: 4999,
    savingText: "₹989",
    savingPercent: "16%"
  },
  "company-pro": {
    monthlyId: "company-pro",
    yearlyId: "company-pro-yearly",
    monthlyPrice: 2900,
    yearlyPrice: 29000,
    savingText: "₹5,800",
    savingPercent: "17%"
  },
  "company-pro-yearly": {
    monthlyId: "company-pro",
    yearlyId: "company-pro-yearly",
    monthlyPrice: 2900,
    yearlyPrice: 29000,
    savingText: "₹5,800",
    savingPercent: "17%"
  },
  "company-pro-plus": {
    monthlyId: "company-pro-plus",
    yearlyId: "company-pro-plus-yearly",
    monthlyPrice: 9900,
    yearlyPrice: 99000,
    savingText: "₹19,800",
    savingPercent: "17%"
  },
  "company-pro-plus-yearly": {
    monthlyId: "company-pro-plus",
    yearlyId: "company-pro-plus-yearly",
    monthlyPrice: 9900,
    yearlyPrice: 99000,
    savingText: "₹19,800",
    savingPercent: "17%"
  }
};

export function CheckoutClient({ item, user, profile }: CheckoutClientProps) {
  const router = useRouter();
  const planInfo = PLAN_MAPPING[item.id];
  const isSubscription = item.type === "base-plan";
  const isYearly = isSubscription && item.id.endsWith("-yearly");
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponDiscountAmount, setCouponDiscountAmount] = useState(0);
  const [couponStatus, setCouponStatus] = useState<{
    type: "success" | "error" | "none";
    message: string;
  }>({ type: "none", message: "" });
  const [activeOffer, setActiveOffer] = useState<{
    id: string;
    name: string;
    description: string;
    benefitType: string;
    discountValue: number;
    extraMonths: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  // Set TopBar details dynamically
  useEffect(() => {
    const { setHeader, clearHeader } = useUIStore.getState();
    const backLink = isYearly 
      ? "/dashboard/upgrade?billingPeriod=yearly" 
      : "/dashboard/upgrade?billingPeriod=monthly";
    setHeader("Checkout", "Review your order summary and complete secure payment.", backLink);
    return () => clearHeader();
  }, [isYearly]);

  // Dynamically load Razorpay SDK Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Load eligible auto-applied offers on mount
  useEffect(() => {
    async function loadOffers() {
      try {
        const res = await fetch(`/api/payments/eligible-promotions?itemId=${item.id}`);
        if (res.ok) {
          const body = await res.json();
          if (body.data && body.data.length > 0) {
            setActiveOffer(body.data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load active offers:", err);
      }
    }
    loadOffers();
  }, [item.id]);

  // Pricing calculations
  const price = item.price;

  // Base subtotal (monthlyPrice * 12 for yearly subscription, or item.price otherwise)
  const subtotal = (isYearly && planInfo) ? (planInfo.monthlyPrice * 12) : price;

  // Savings from choosing yearly over monthly (e.g. 5800 for Company Pro Yearly)
  const yearlySavings = (isYearly && planInfo) ? (subtotal - price) : 0;

  // Calculate auto-applied offer discount (Step 1)
  let offerDiscountAmount = 0;
  if (activeOffer) {
    if (activeOffer.benefitType === "percentage") {
      offerDiscountAmount = Math.round(price * (activeOffer.discountValue / 100));
    } else if (activeOffer.benefitType === "fixed-discount") {
      offerDiscountAmount = Math.min(price, activeOffer.discountValue);
    }
  }

  const priceAfterOffer = price - offerDiscountAmount;

  // Grand total combines subtotal minus compounding discounts (Step 2)
  const grandTotal = priceAfterOffer - couponDiscountAmount;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupon.trim()) return;

    setCouponLoading(true);
    setCouponStatus({ type: "none", message: "" });

    try {
      const res = await fetch("/api/payments/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: coupon,
          itemId: item.id,
          priceAfterOffer
        })
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || "Failed to validate coupon");
      }

      setCouponDiscountAmount(body.discountAmount);
      setCouponStatus({
        type: "success",
        message: `Promo code "${body.couponCode}" applied successfully! saved ₹${body.discountAmount.toFixed(2)}.`
      });
    } catch (err: any) {
      setCouponDiscountAmount(0);
      setCouponStatus({
        type: "error",
        message: err.message || "Invalid coupon code"
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon("");
    setCouponDiscountAmount(0);
    setCouponStatus({ type: "none", message: "" });
  };

  const handleBypassPayment = async () => {
    setLoading(true);
    try {
      if (isSubscription) {
        // 1. Create subscription on server
        const subRes = await fetch("/api/payments/create-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId: item.id,
            couponCode: couponStatus.type === "success" ? coupon : ""
          })
        });

        if (!subRes.ok) {
          const errorData = await subRes.json();
          throw new Error(errorData.error || "Failed to initiate subscription");
        }

        const subData = await subRes.json();
        const { subscriptionId } = subData;

        // 2. Call verify endpoint directly with mock signature
        const verifyRes = await fetch("/api/payments/verify-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 9)}`,
            razorpay_subscription_id: subscriptionId,
            razorpay_signature: "mock_signature",
            itemId: item.id
          })
        });

        if (!verifyRes.ok) {
          const errBody = await verifyRes.json();
          throw new Error(errBody.error || "Mock verification failed");
        }

        const verifyData = await verifyRes.json();
        router.push(`/dashboard/checkout/success?itemId=${item.id}&paymentId=${verifyData.paymentId}&subscriptionId=${verifyData.subscriptionId}&amount=${verifyData.amountPaid || price}&email=${encodeURIComponent(user.email)}`);
      } else {
        // Create one-time order on server
        const orderRes = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            itemId: item.id,
            couponCode: couponStatus.type === "success" ? coupon : ""
          })
        });

        if (!orderRes.ok) {
          const errorData = await orderRes.json();
          throw new Error(errorData.error || "Failed to create order");
        }

        const orderData = await orderRes.json();
        const { orderId } = orderData;

        // Call verify payment endpoint directly
        const verifyRes = await fetch("/api/payments/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 9)}`,
            razorpay_order_id: orderId,
            razorpay_signature: "mock_signature",
            itemId: item.id
          })
        });

        if (!verifyRes.ok) {
          const errBody = await verifyRes.json();
          throw new Error(errBody.error || "Mock verification failed");
        }

        const verifyData = await verifyRes.json();
        router.push(`/dashboard/checkout/success?itemId=${item.id}&paymentId=${verifyData.paymentId}&amount=${verifyData.amountPaid || price}&email=${encodeURIComponent(user.email)}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed";
      router.push(`/dashboard/checkout/error?itemId=${item.id}&error=${encodeURIComponent(msg)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    setLoading(true);
    try {
      // Verify that Razorpay script is loaded
      if (!(window as any).Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please refresh the page.");
      }

      let options: any;

      if (isSubscription) {
        // Create subscription on server
        const subRes = await fetch("/api/payments/create-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            itemId: item.id,
            couponCode: couponStatus.type === "success" ? coupon : ""
          })
        });

        if (!subRes.ok) {
          const errorData = await subRes.json();
          throw new Error(errorData.error || "Failed to create subscription");
        }

        const subData = await subRes.json();
        const { subscriptionId, keyId } = subData;

        options = {
          key: keyId,
          subscription_id: subscriptionId,
          name: "CareerEdge",
          description: `Recurring Subscription for ${item.name}`,
          image: "/logo_light.png",
          handler: async function (response: any) {
            setLoading(true);
            try {
              // Verify subscription on server
              const verifyRes = await fetch("/api/payments/verify-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_subscription_id: response.razorpay_subscription_id,
                  razorpay_signature: response.razorpay_signature,
                  itemId: item.id
                })
              });

              if (!verifyRes.ok) {
                const errBody = await verifyRes.json();
                throw new Error(errBody.error || "Subscription signature verification failed");
              }

              const verifyData = await verifyRes.json();
              router.push(`/dashboard/checkout/success?itemId=${item.id}&paymentId=${verifyData.paymentId}&subscriptionId=${verifyData.subscriptionId}&amount=${verifyData.amountPaid || price}&email=${encodeURIComponent(user.email)}`);
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : "Verification failed";
              router.push(`/dashboard/checkout/error?itemId=${item.id}&error=${encodeURIComponent(msg)}`);
            } finally {
              setLoading(false);
             }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: "#4f46e5"
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
              router.push(`/dashboard/checkout/error?itemId=${item.id}&error=Payment%20was%2520cancelled%2520by%2520the%2520user`);
            }
          }
        };
      } else {
        // Create one-time order on server
        const orderRes = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            itemId: item.id,
            couponCode: couponStatus.type === "success" ? coupon : ""
          })
        });

        if (!orderRes.ok) {
          const errorData = await orderRes.json();
          throw new Error(errorData.error || "Failed to create order");
        }

        const orderData = await orderRes.json();
        const { orderId, amount, currency, keyId } = orderData;

        options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: "CareerEdge",
          description: `Payment for ${item.name}`,
          image: "/logo_light.png",
          order_id: orderId,
          handler: async function (response: any) {
            setLoading(true);
            try {
              const verifyRes = await fetch("/api/payments/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  itemId: item.id
                })
              });

              if (!verifyRes.ok) {
                const errBody = await verifyRes.json();
                throw new Error(errBody.error || "Payment signature verification failed");
              }

              const verifyData = await verifyRes.json();
              router.push(`/dashboard/checkout/success?itemId=${item.id}&paymentId=${verifyData.paymentId}&orderId=${verifyData.orderId}&amount=${verifyData.amountPaid}&email=${encodeURIComponent(user.email)}`);
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : "Verification failed";
              router.push(`/dashboard/checkout/error?itemId=${item.id}&error=${encodeURIComponent(msg)}`);
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: "#4f46e5"
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
              router.push(`/dashboard/checkout/error?itemId=${item.id}&error=Payment%20was%2520cancelled%2520by%2520the%2520user`);
            }
          }
        };
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initiate payment";
      router.push(`/dashboard/checkout/error?itemId=${item.id}&error=${encodeURIComponent(msg)}`);
      setLoading(false);
    }
  };

  const isTokenPack = item.type === "ai-token-pack";

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-left">
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

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* Left Column: Order Summary (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item details card */}
          <div className="rounded-3xl border border-neutral-200/40 dark:border-neutral-800/40 bg-card p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                {isTokenPack ? (
                  <Coins className="w-6 h-6 text-primary" />
                ) : (
                  <Sparkles className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Item Selected</span>
                <h2 className="text-lg font-black text-foreground">{item.name}</h2>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-semibold">
                  {isTokenPack 
                    ? `AI Top-up pack adding ${item.tokensCount} tokens to your purchased balances.` 
                    : `Monthly premium base plan tier. Refills monthly allocated tokens and unlocks corresponding limits.`
                  }
                </p>
              </div>
            </div>

            {/* Feature list preview */}
            <div className="border-t border-neutral-100 dark:border-neutral-800/60 pt-4 mt-5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-3">Plan Entitlements</span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-foreground">
                {isTokenPack ? (
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>+{item.tokensCount} AI Operations Credits</span>
                  </li>
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{item.monthlyTokens} AI Tokens / month</span>
                    </li>
                    {item.activeJobsLimit && (
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{item.activeJobsLimit} Active Job Posts Limit</span>
                      </li>
                    )}
                    {item.activeAssessmentsLimit && (
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{item.activeAssessmentsLimit === 9999 ? "Unlimited" : `${item.activeAssessmentsLimit} Assessments`} Limit</span>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Yearly Plan savings warnings / Monthly upgrade prompts */}
          {isSubscription && item.id.endsWith("-yearly") && planInfo && (
            <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 rounded-3xl p-5 text-xs font-semibold flex items-center justify-between shadow-sm relative overflow-hidden">
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Yearly Discount Active</span>
                <span className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed font-semibold">
                  You are saving <span className="font-bold text-emerald-600 dark:text-emerald-400">{planInfo.savingPercent}</span> compared to monthly billing.
                </span>
              </div>
              <span className="font-black text-sm bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl flex-shrink-0">Save {planInfo.savingText}</span>
            </div>
          )}

          {isSubscription && !item.id.endsWith("-yearly") && planInfo && (
            <div className="bg-emerald-500/5 text-emerald-500 border border-emerald-500/15 rounded-[1.5rem] p-5 text-xs font-semibold flex flex-col gap-4 shadow-sm relative overflow-hidden items-start">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-col text-left">
                <span className="font-black text-[11px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">🔥 Upgrade to Yearly & Save!</span>
                <span className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed font-semibold">
                  Switch your order to the yearly plan now and save <span className="font-black text-emerald-600 dark:text-emerald-400">{planInfo.savingPercent} ({planInfo.savingText} / year)</span> compared to monthly billing.
                </span>
              </div>
              <button
                onClick={() => {
                  router.replace(`/dashboard/checkout?itemId=${planInfo.yearlyId}`);
                }}
                className="w-fit px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer border-0 flex items-center justify-center gap-1.5 self-end"
              >
                <span>Switch to Yearly & Save {planInfo.savingPercent}</span>
                <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
              </button>
            </div>
          )}

          {/* Active Auto-applied Offer Banner */}
          {activeOffer && (
            <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 rounded-3xl p-5 text-xs font-semibold relative overflow-hidden flex flex-col gap-1.5 shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse flex-shrink-0" />
                <span className="font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Offer Active: {activeOffer.name}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed pl-6">
                {activeOffer.description}
              </p>
              {activeOffer.benefitType === "extra-time" && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold pl-6 animate-pulse">
                  🎉 +{activeOffer.extraMonths} Free Months will be added to your access period automatically!
                </p>
              )}
            </div>
          )}

          {/* Coupon / Promo code card */}
          <div className="rounded-3xl border border-neutral-200/40 dark:border-neutral-800/40 bg-card p-6 shadow-md">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-3">Apply Promo Code</span>
            
            <form onSubmit={handleApplyCoupon} className="flex gap-3">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Enter coupon (e.g. WELCOME10)"
                  disabled={couponStatus.type === "success" || couponLoading}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-900/40 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground uppercase disabled:opacity-75"
                />
              </div>
              {couponStatus.type === "success" ? (
                <Button
                  type="button"
                  onClick={handleRemoveCoupon}
                  variant="outline"
                  className="font-bold text-xs h-10 px-5 rounded-xl border-red-200/40 text-red-500 hover:bg-red-500/10 cursor-pointer"
                >
                  Remove
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="outline"
                  disabled={couponLoading}
                  className="font-bold text-xs h-10 px-5 rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer"
                >
                  {couponLoading ? "Applying..." : "Apply"}
                </Button>
              )}
            </form>

            {couponStatus.type !== "none" && (
              <p className={cn(
                "text-[10px] font-bold mt-3 flex items-center gap-1.5",
                couponStatus.type === "success" ? "text-emerald-500" : "text-red-500"
              )}>
                {couponStatus.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {couponStatus.message}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Checkout Summary & Secure Payment */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-neutral-200/40 dark:border-neutral-800/40 bg-card p-6 shadow-md flex flex-col justify-between min-h-[380px] relative overflow-hidden">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-4">Billing Statement</span>
              
              <div className="space-y-3.5 text-xs text-muted-foreground font-bold">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-foreground">₹{subtotal.toFixed(2)}</span>
                </div>
                
                {isYearly && yearlySavings > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Yearly Savings ({planInfo.savingPercent})</span>
                    <span>-₹{yearlySavings.toFixed(2)}</span>
                  </div>
                )}

                {activeOffer && offerDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-500 animate-fade-in">
                    <span>Offer: {activeOffer.name}</span>
                    <span>-₹{offerDiscountAmount.toFixed(2)}</span>
                  </div>
                )}

                {couponStatus.type === "success" && couponDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-500 animate-fade-in">
                    <span>Coupon: {coupon}</span>
                    <span>-₹{couponDiscountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="h-px bg-neutral-200/50 dark:bg-neutral-800/50 my-4" />

                <div className="flex justify-between text-sm text-foreground font-black">
                  <span>Grand Total</span>
                  <span className="text-lg">
                    ₹{grandTotal.toFixed(2)}
                    {isSubscription && (
                      <span className="text-[10px] text-muted-foreground font-bold uppercase ml-1">
                        / {item.id.endsWith("-yearly") ? "yr" : "mo"}
                      </span>
                    )}
                  </span>
                </div>

                {activeOffer && activeOffer.benefitType === "extra-time" && (
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold text-right mt-1 animate-pulse">
                    🎉 +{activeOffer.extraMonths} Free Months will be added to your subscription!
                  </div>
                )}
              </div>
            </div>

            {/* Trust and checkout CTA */}
            <div className="space-y-4 pt-6 border-t border-neutral-100 dark:border-neutral-800/60 mt-6">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold justify-center bg-neutral-50 dark:bg-neutral-900/60 py-2 rounded-xl border border-neutral-200/20 dark:border-neutral-850">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>PCI-DSS Compliant Secure Payment</span>
              </div>

              <Button
                onClick={handleProceedToPayment}
                disabled={loading}
                className="w-full bg-ai-gradient border-0 text-white font-extrabold text-xs rounded-2xl h-12 hover:opacity-90 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>{isSubscription ? "Subscribe & Pay" : "Proceed to Pay"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>

              {/* Developer Sandbox Test Bypass button */}
              <button
                type="button"
                onClick={handleBypassPayment}
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-primary/50 text-xs font-black text-muted-foreground hover:text-foreground bg-neutral-50/50 hover:bg-neutral-50 dark:bg-neutral-900/20 dark:hover:bg-neutral-900/50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse flex-shrink-0" />
                {loading ? "Simulating Payment..." : "Sandbox Bypass Checkout (Test Mode)"}
              </button>

              {isSubscription && (
                <p className="text-[9px] text-muted-foreground font-semibold text-center mt-2 leading-relaxed">
                  By subscribing, you authorize automatic recurring renewals of ₹{grandTotal} billed {item.id.endsWith("-yearly") ? "annually" : "monthly"}. Cancel anytime in Billing Settings.
                </p>
              )}

              {/* Supported cards logos */}
              <div className="flex justify-center items-center gap-3 pt-2 text-[9px] text-muted-foreground font-semibold">
                <span>Supported: Cards, UPI, Netbanking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
