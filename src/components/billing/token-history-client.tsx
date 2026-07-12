"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, History, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TransactionItem {
  _id: string;
  amount: number;
  balanceAfter: number;
  type: string;
  description: string;
  createdAt: string;
}

interface TokenHistoryClientProps {
  initialTransactions: TransactionItem[];
  initialTotal: number;
}

export function TokenHistoryClient({ initialTransactions, initialTotal }: TokenHistoryClientProps) {
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransactions);
  const [totalCount, setTotalCount] = useState(initialTotal);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentPage === 1) {
      setTransactions(initialTransactions);
      setTotalCount(initialTotal);
      return;
    }

    async function loadPage() {
      setLoading(true);
      try {
        const res = await fetch(`/api/payments/transactions?page=${currentPage}&limit=10`);
        if (res.ok) {
          const body = await res.json();
          setTransactions(body.transactions || []);
          setTotalCount(body.totalCount || 0);
        }
      } catch (err) {
        console.error("Failed to load transactions page:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, [currentPage, initialTransactions, initialTotal]);

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-neutral-200/40 dark:border-neutral-800/40 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground font-bold transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
        <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-primary" /> AI Token Transaction History
        </h1>
        <p className="text-xs text-muted-foreground font-semibold">
          Detailed ledger of all monthly refills, AI consumes, plan upgrades, and purchased top-up packs.
        </p>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <span className="text-xs text-muted-foreground">Loading transaction logs...</span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-850 text-xs text-muted-foreground">
          No transactions found.
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
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10">
                      <td className="p-4 text-muted-foreground font-medium whitespace-nowrap">{date}</td>
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
          {totalCount > 10 && (
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
                Page {currentPage} of {Math.ceil(totalCount / 10)}
              </span>
              <Button
                disabled={currentPage * 10 >= totalCount}
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
  );
}
