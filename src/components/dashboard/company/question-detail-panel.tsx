"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Trash2, Calendar, Tag, Shield, Clock, HelpCircle, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui";

interface QuestionDetail {
  id: string;
  question: string;
  type: string;
  categories: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  status: string;
  createdByName: string;
  createdAt: string;
  mcqOptions?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

interface QuestionDetailPanelProps {
  question: QuestionDetail;
}

export function QuestionDetailPanel({ question }: QuestionDetailPanelProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleStatusChange = async (nextStatus: "Active" | "Inactive") => {
    setShowStatusDropdown(false);
    if ((question.status || "Active") === nextStatus) return;

    setIsTogglingStatus(true);
    const payload = {
      question: question.question,
      type: question.type,
      difficulty: question.difficulty,
      categories: question.categories,
      status: nextStatus,
      mcqOptions: question.mcqOptions || [],
    };

    try {
      const res = await fetch(`/api/questions/${question.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        startTransition(() => {
          router.refresh();
        });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating the status.");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/questions/${question.id}/edit`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/questions/${question.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        startTransition(() => {
          router.push("/dashboard/questions");
          router.refresh();
        });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete question");
        setIsDeleting(false);
        setConfirmDelete(false);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting the question.");
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const diffColor =
    question.difficulty === "Easy"
      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
      : question.difficulty === "Medium"
      ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
      : "text-red-500 bg-red-500/10 border-red-500/20";

  return (
    <div className="flex flex-col gap-6 text-left pb-12">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between border-b border-neutral-200/50 dark:border-neutral-800/80 pb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Question Details</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Review the details and options.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-muted-foreground hover:text-foreground cursor-pointer transition-colors border border-neutral-200/40 dark:border-neutral-800/40"
            title="Edit Question"
          >
            <Edit3 className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 cursor-pointer transition-colors border border-neutral-200/40 dark:border-neutral-800/40"
            title="Delete Question"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => router.push("/dashboard/questions")}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-muted-foreground hover:text-foreground cursor-pointer transition-colors border border-neutral-200/40 dark:border-neutral-800/40"
            title="Close details"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Meta Grid info */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        {/* Question Type */}
        <div className="flex items-center gap-3.5 bg-neutral-50/50 dark:bg-neutral-900/30 p-3.5 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Question Type
            </span>
            <span className="text-sm font-bold text-foreground">{question.type}</span>
          </div>
        </div>

        {/* Status */}
        <div ref={statusMenuRef} className="flex items-center gap-3.5 bg-neutral-50/50 dark:bg-neutral-900/30 p-3.5 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20 relative">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Status
            </span>
            <div>
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border gap-1.5 transition-all duration-300",
                isTogglingStatus
                  ? "bg-neutral-100 dark:bg-neutral-800 text-muted-foreground border-neutral-200 dark:border-neutral-700 animate-pulse"
                  : (question.status || "Active") === "Inactive"
                  ? "bg-red-500/10 text-red-500 border-red-500/10"
                  : "bg-emerald-500/10 text-emerald-500 border-emerald-500/10"
              )}>
                {isTogglingStatus && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                )}
                {isTogglingStatus ? "Updating..." : (question.status || "Active")}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            disabled={isTogglingStatus}
            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground cursor-pointer transition-colors border border-transparent disabled:opacity-50 flex-shrink-0"
            title="Edit Status"
          >
            {isTogglingStatus ? (
              <div className="w-3.5 h-3.5 border-2 border-neutral-300 border-t-primary rounded-full animate-spin" />
            ) : (
              <Edit3 className="w-3.5 h-3.5" />
            )}
          </button>

          {showStatusDropdown && (
            <div className="absolute top-14 right-3 z-50 w-32 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/95 dark:bg-[#07070b]/95 backdrop-blur-md shadow-2xl p-1 animate-in fade-in duration-150">
              {(["Active", "Inactive"] as const).map((statusVal) => {
                const isActive = (question.status || "Active") === statusVal;
                return (
                  <button
                    key={statusVal}
                    type="button"
                    onClick={() => handleStatusChange(statusVal)}
                    className={cn(
                      "w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer mb-0.5 last:mb-0",
                      isActive
                        ? "bg-primary/10 text-primary dark:text-white"
                        : "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    )}
                  >
                    <span>{statusVal}</span>
                    {isActive && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Difficulty */}
        <div className="flex items-center gap-3.5 bg-neutral-50/50 dark:bg-neutral-900/30 p-3.5 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Difficulty
            </span>
            <div>
              <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border", diffColor)}>
                {question.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Created At */}
        <div className="flex items-center gap-3.5 bg-neutral-50/50 dark:bg-neutral-900/30 p-3.5 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Created At
            </span>
            <span className="text-sm font-bold text-foreground">
              {new Date(question.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Categories / Topics */}
        <div className="flex items-start gap-3.5 col-span-2 bg-neutral-50/50 dark:bg-neutral-900/30 p-3.5 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Categories / Topics
            </span>
            <div className="flex flex-wrap gap-1.5">
              {question.categories?.map((cat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-muted-foreground border border-neutral-200 dark:border-neutral-700"
                >
                  {cat}
                </span>
              )) || <span className="text-muted-foreground font-medium text-xs">-</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Question Statement Section */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Question Statement
        </h4>
        <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200/40 dark:border-neutral-800/80 rounded-xl p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed font-medium">
          {question.question}
        </div>
      </div>

      {/* MCQ Options Section */}
      {question.type === "Mcq" && question.mcqOptions && question.mcqOptions.length > 0 && (
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Options
          </h4>
          <div className="flex flex-col gap-2">
            {question.mcqOptions.map((opt) => (
              <div
                key={opt.id}
                className={cn(
                  "flex items-start gap-3 p-3.5 rounded-xl border transition-colors",
                  opt.isCorrect
                    ? "bg-primary/5 border-primary/30 dark:border-primary/20 text-foreground"
                    : "bg-neutral-50/50 dark:bg-neutral-950/20 border-neutral-200/40 dark:border-neutral-800/60 text-muted-foreground"
                )}
              >
                <div className="mt-0.5 flex-shrink-0">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center",
                      opt.isCorrect
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-neutral-300 dark:border-neutral-700 bg-transparent"
                    )}
                  >
                    {opt.isCorrect && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
                  </div>
                </div>
                <span className={cn("text-xs leading-relaxed font-medium", opt.isCorrect && "font-bold text-foreground")}>
                  {opt.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
