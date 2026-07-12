import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { XCircle, MessageSquare, RotateCcw } from "lucide-react";
import { getSession } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { SUPPORT_CONTACT } from "@/lib/constants";

interface ErrorPageProps {
  searchParams: Promise<{
    itemId?: string;
    error?: string;
  }>;
}

export default async function PaymentErrorPage({ searchParams }: ErrorPageProps) {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/signin");
  }

  const { itemId, error } = await searchParams;

  if (!itemId) {
    redirect("/dashboard");
  }

  const errorMessage = error || "Payment was not completed";

  return (
    <div className="w-full max-w-xl mx-auto py-12 px-4 sm:px-6 text-left">
      <div className="rounded-[2.5rem] border border-neutral-200/40 dark:border-neutral-800/80 bg-card shadow-2xl p-8 sm:p-10 relative overflow-hidden flex flex-col items-center">
        {/* Background Blur */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Error Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 relative animate-bounce">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>

        {/* Header Title */}
        <h1 className="text-2xl font-black text-foreground tracking-tight text-center">
          {errorMessage.includes("cancel") ? "Payment was cancelled" : "Payment was not completed"}
        </h1>

        {/* Not Charged Badge */}
        <div className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
          Don&apos;t worry — you have not been charged.
        </div>

        {/* Explanatory Description */}
        <p className="text-xs text-muted-foreground mt-6 text-center leading-relaxed font-bold">
          This sometimes happens due to a network issue, card decline, or bank timeout.
          Please try again — it usually works on the second attempt.
        </p>

        {/* Try Again CTA */}
        <div className="w-full mt-8">
          <Link href={`/dashboard/checkout?itemId=${itemId}`} passHref legacyBehavior>
            <Button className="w-full bg-primary text-white font-extrabold text-xs h-12 rounded-2xl hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5 border-0">
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </Button>
          </Link>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-200/50 dark:bg-neutral-800/50 w-full my-6" />

        {/* Support Section */}
        <div className="w-full text-center">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-4">
            If the problem continues, contact support:
          </p>
          <a
            href={SUPPORT_CONTACT.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 flex items-center justify-center gap-2 text-xs font-bold text-foreground transition-all group"
          >
            <MessageSquare className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span>WhatsApp: </span>
            <span className="font-extrabold text-primary">{SUPPORT_CONTACT.whatsappDisplay}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
