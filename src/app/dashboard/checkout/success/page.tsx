import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, MessageSquare, ArrowRight } from "lucide-react";
import { getSession, getPricingTiers } from "@/lib/dal";
import { Button } from "@/components/ui";
import { SUPPORT_CONTACT } from "@/lib/constants";

interface SuccessPageProps {
  searchParams: Promise<{
    itemId?: string;
    paymentId?: string;
    orderId?: string;
    amount?: string;
    email?: string;
  }>;
}

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/signin");
  }

  const { itemId, paymentId, orderId, amount, email } = await searchParams;

  if (!itemId || !paymentId) {
    redirect("/dashboard");
  }

  const pricing = await getPricingTiers();
  const pricingItem = pricing.find((item: any) => item.id === itemId);
  const itemName = pricingItem ? pricingItem.name : "Premium Package";
  const isTokenPack = pricingItem?.type === "ai-token-pack";
  const tokensCount = pricingItem?.tokensCount ?? 0;
  const features = pricingItem?.features ?? [];

  return (
    <div className="w-full max-w-xl mx-auto py-12 px-4 sm:px-6 text-left">
      <div className="rounded-[2.5rem] border border-neutral-200/40 dark:border-neutral-800/80 bg-card shadow-2xl p-8 sm:p-10 relative overflow-hidden flex flex-col items-center">
        {/* Background Blur */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 animate-ping opacity-25" />
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>

        {/* Header Title */}
        <h1 className="text-2xl font-black text-foreground tracking-tight text-center">
          Payment successful!
        </h1>
        <p className="text-xs text-muted-foreground mt-2 text-center font-bold">
          We have received your payment and verified the checkout details.
        </p>

        {/* Benefits Activated Section */}
        <div className="w-full border-t border-neutral-100 dark:border-neutral-800/60 pt-6 mt-6">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-3">
            Benefits Activated:
          </h3>
          <div className="p-4 rounded-2xl border border-emerald-500/10 dark:border-emerald-500/5 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01] text-xs font-bold text-foreground space-y-2">
            {isTokenPack ? (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>+{tokensCount} AI Tokens are added to your account</span>
              </div>
            ) : (
              <div className="space-y-2">
                {features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span className="leading-tight">{feature}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Next Steps Section */}
        <div className="w-full border-t border-neutral-100 dark:border-neutral-800/60 pt-6 mt-6">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-4">
            What happens next:
          </h3>
          <ul className="space-y-4 text-xs font-bold text-foreground">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-primary flex items-center justify-center text-[10px] flex-shrink-0">
                1
              </span>
              <p className="leading-relaxed">
                Your premium limits and AI operation credits have been updated instantly in your account.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-primary flex items-center justify-center text-[10px] flex-shrink-0">
                2
              </span>
              <p className="leading-relaxed">
                You can review your complete transaction ledger in the{" "}
                <Link href="/dashboard/token-history" className="text-primary hover:underline">
                  Token History
                </Link>{" "}
                page.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-primary flex items-center justify-center text-[10px] flex-shrink-0">
                3
              </span>
              <p className="leading-relaxed">
                A copy of this payment confirmation receipt has been sent to your registered email address.
              </p>
            </li>
          </ul>
        </div>

        {/* Receipt Box */}
        <div className="w-full p-5 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-900/40 text-xs font-bold text-muted-foreground mt-6 space-y-3">
          <div className="flex justify-between items-center">
            <span>Order Reference:</span>
            <span className="text-foreground font-black tracking-tight">#{orderId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Product/Plan:</span>
            <span className="text-foreground font-black">{itemName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Amount paid:</span>
            <span className="text-primary font-black text-sm">₹{amount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Receipt sent to:</span>
            <span className="text-foreground font-black">{email}</span>
          </div>
        </div>

        {/* WhatsApp Questions Link */}
        <div className="w-full mt-6 py-3 px-4 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.01] flex items-center justify-center gap-2 text-xs font-bold text-primary">
          <MessageSquare className="w-4 h-4" />
          <span>Questions? WhatsApp us: </span>
          <a 
            href={SUPPORT_CONTACT.whatsappLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:underline font-extrabold text-foreground"
          >
            {SUPPORT_CONTACT.whatsappDisplay}
          </a>
        </div>

        {/* Back button */}
        <div className="w-full mt-8">
          <a href="/dashboard" className="w-full">
            <Button className="w-full bg-neutral-900 dark:bg-neutral-800 text-white font-extrabold text-xs h-12 rounded-2xl hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5 border-0">
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
