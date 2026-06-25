"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Trash2, Calendar, Tag, Shield, Clock, HelpCircle, ArrowLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
          {!confirmDelete ? (
            <>
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
            </>
          ) : (
            <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
              <span className="text-[10px] text-red-500 font-bold mr-1">Delete?</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-7 text-[10px] px-2.5"
              >
                {isDeleting ? "Deleting..." : "Yes"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
                className="h-7 text-[10px] px-2.5 border border-neutral-200 dark:border-neutral-800"
              >
                No
              </Button>
            </div>
          )}
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
        <div className="flex flex-col gap-1 bg-neutral-50/50 dark:bg-neutral-900/30 p-2.5 rounded-xl border border-neutral-200/20 dark:border-neutral-800/20">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-indigo-500" /> Question Type
          </span>
          <span className="font-semibold text-foreground">{question.type}</span>
        </div>
        <div className="flex flex-col gap-1 bg-neutral-50/50 dark:bg-neutral-900/30 p-2.5 rounded-xl border border-neutral-200/20 dark:border-neutral-800/20">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Shield className="w-3 h-3 text-indigo-500" /> Status
          </span>
          <div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/10">
              {question.status || "Active"}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 bg-neutral-50/50 dark:bg-neutral-900/30 p-2.5 rounded-xl border border-neutral-200/20 dark:border-neutral-800/20">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-500" /> Difficulty
          </span>
          <div>
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border", diffColor)}>
              {question.difficulty}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 bg-neutral-50/50 dark:bg-neutral-900/30 p-2.5 rounded-xl border border-neutral-200/20 dark:border-neutral-800/20">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-indigo-500" /> Created At
          </span>
          <span className="font-semibold text-foreground">
            {new Date(question.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex flex-col gap-1 col-span-2 bg-neutral-50/50 dark:bg-neutral-900/30 p-2.5 rounded-xl border border-neutral-200/20 dark:border-neutral-800/20">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3 h-3 text-indigo-500" /> Categories / Topics
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {question.categories?.map((cat, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-foreground border border-neutral-200 dark:border-neutral-700"
              >
                {cat}
              </span>
            )) || <span className="text-muted-foreground font-medium">-</span>}
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
                    ? "bg-indigo-500/5 border-indigo-500/30 dark:border-indigo-500/20 text-foreground"
                    : "bg-neutral-50/50 dark:bg-neutral-950/20 border-neutral-200/40 dark:border-neutral-800/60 text-muted-foreground"
                )}
              >
                <div className="mt-0.5 flex-shrink-0">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center",
                      opt.isCorrect
                        ? "border-indigo-500 bg-indigo-500 text-white"
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
    </div>
  );
}
