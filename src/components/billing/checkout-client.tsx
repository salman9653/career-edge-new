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

export function CheckoutClient({ item, user, profile }: CheckoutClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponStatus, setCouponStatus] = useState<{
    type: "success" | "error" | "none";
    message: string;
  }>({ type: "none", message: "" });

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
    setHeader("Checkout", "Review your order summary and complete secure payment.", "/dashboard");
    return () => clearHeader();
  }, []);

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

  // Pricing calculations
  const price = item.price;
  const appliedDiscount = Math.round(price * discount);
  const discountedPrice = price - appliedDiscount;
  const gstAmount = Math.round(discountedPrice * 0.18);
  const grandTotal = discountedPrice + gstAmount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupon.trim()) return;

    const promo = coupon.trim().toUpperCase();
    if (promo === "SAVE10" || promo === "WELCOME10") {
      setDiscount(0.10); // 10% discount
      setCouponStatus({
        type: "success",
        message: "Promo code applied! 10% discount has been subtracted."
      });
    } else {
      setCouponStatus({
        type: "error",
        message: "Invalid promo code. Try 'SAVE10' for 10% off!"
      });
    }
  };

  const handleProceedToPayment = async () => {
    setLoading(true);
    try {
      // 1. Create order on server
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, couponCode: coupon })
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const orderData = await orderRes.json();
      const { orderId, amount, currency, keyId } = orderData;

      // Verify that Razorpay script is loaded
      if (!(window as any).Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please refresh the page.");
      }

      // 2. Open Razorpay checkout popup
      const options = {
        key: keyId,
        amount: amount, // in paise
        currency: currency,
        name: "CareerEdge",
        description: `Payment for ${item.name}`,
        image: "/logo_light.png",
        order_id: orderId,
        handler: async function (response: any) {
          setLoading(true);
          try {
            // 3. Verify payment on server
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
          color: "#4f46e5" // Primary Indigo
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            router.push(`/dashboard/checkout/error?itemId=${item.id}&error=Payment%20was%2520cancelled%2520by%2520the%2520user`);
          }
        }
      };

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
                  placeholder="Enter coupon (e.g. SAVE10)"
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-900/40 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground uppercase"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="font-bold text-xs h-10 px-5 rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer"
              >
                Apply
              </Button>
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
                  <span className="text-foreground">₹{price.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Discount (10%)</span>
                    <span>-₹{appliedDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span className="text-foreground">₹{gstAmount.toFixed(2)}</span>
                </div>

                <div className="h-px bg-neutral-200/50 dark:bg-neutral-800/50 my-4" />

                <div className="flex justify-between text-sm text-foreground font-black">
                  <span>Grand Total</span>
                  <span className="text-lg">₹{grandTotal.toFixed(2)}</span>
                </div>
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
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Proceed to Pay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>

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
