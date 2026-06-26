"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles, ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { AIGenerationDialog } from "./ai-generation-dialog";
import { CustomQuestionForm } from "./custom-question-form";

interface QuestionFormPanelProps {
  mode: "create";
}

export function QuestionFormPanel({ mode }: QuestionFormPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const isGenerateRoute = pathname === "/dashboard/questions/generate";

  // Redirect /generate to /add on desktop to keep the 2-column view unified
  useEffect(() => {
    if (isGenerateRoute) {
      const handleResize = () => {
        if (window.innerWidth >= 1024) {
          router.replace("/dashboard/questions/add");
        }
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isGenerateRoute, router]);

  // AI Generator State
  const [aiJobTitle, setAiJobTitle] = useState("");
  const [aiKeySkills, setAiKeySkills] = useState("");
  const [aiType, setAiType] = useState("Mcq");
  const [showAiTypeDropdown, setShowAiTypeDropdown] = useState(false);
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [showAiDifficultyDropdown, setShowAiDifficultyDropdown] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Dropdown click outside refs
  const aiDifficultyDropdownRef = useRef<HTMLDivElement>(null);
  const aiTypeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (aiDifficultyDropdownRef.current && !aiDifficultyDropdownRef.current.contains(target)) {
        setShowAiDifficultyDropdown(false);
      }
      if (aiTypeDropdownRef.current && !aiTypeDropdownRef.current.contains(target)) {
        setShowAiTypeDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Configure TopBar header for Add/Edit routes
  useEffect(() => {
    const { setHeader, setViewSwitcher } = useUIStore.getState();
    if (isGenerateRoute) {
      setHeader(
        "Generate Questions",
        "Create assessment questions using AI.",
        "/dashboard/questions"
      );
    } else {
      setHeader(
        "Add Question",
        "Create custom or AI-generated assessment questions.",
        "/dashboard/questions"
      );
    }
    setViewSwitcher(false); // Disable card/list view mode switcher

    return () => {
      // Restore default Question Bank header on unmount
      setHeader(
        "Question Bank",
        "Manage your database of evaluation and interview questions."
      );
      setViewSwitcher(true, "questions-view-mode");
    };
  }, [isGenerateRoute]);

  // Back to list helper
  const handleBack = () => {
    router.push("/dashboard/questions");
  };

  // Submit AI generator
  const handleGenerateAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiJobTitle.trim()) {
      alert("Please fill in the target job title.");
      return;
    }
    if (!aiKeySkills.trim()) {
      alert("Please specify the key skills (e.g. React, TypeScript).");
      return;
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* SVG definitions for gradient icons */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <linearGradient id="ai-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch h-full min-h-0 w-full">
        
        {/* Custom Question Panel */}
        <div className={cn(
          "glass border border-neutral-200/40 dark:border-neutral-800/80 rounded-2xl p-6 text-left bg-card shadow-xl h-full overflow-hidden flex flex-col",
          isGenerateRoute ? "hidden lg:flex" : "lg:col-span-3"
        )}>
          <CustomQuestionForm
            mode="create"
            onCancel={handleBack}
            onSuccess={() => {
              router.push("/dashboard/questions");
              router.refresh();
            }}
          />
        </div>

        {/* AI Generator Panel */}
        <div className={cn(
          "glass border-ai-gradient rounded-2xl p-6 text-left bg-card shadow-xl relative overflow-hidden h-full",
          isGenerateRoute ? "flex flex-col w-full lg:col-span-5" : "hidden lg:flex lg:flex-col lg:col-span-2"
        )}>
          {/* Subtle Gradient background on AI box */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/15 via-pink-500/5 to-transparent blur-2xl pointer-events-none" />

          <div className="flex-shrink-0 mb-4">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" stroke="url(#ai-grad)" /> Generate Questions with AI
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Describe what you're looking for, and let AI do the work.
            </p>
          </div>

          {isGeneratingAI ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 animate-in fade-in duration-300">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-neutral-200/20 dark:border-neutral-800/50 border-t-pink-500 rounded-full animate-spin" />
                <Sparkles className="w-5 h-5 animate-ping" stroke="url(#ai-grad)" />
              </div>
              <p className="text-xs font-bold text-foreground mt-4">Generating Technical Questions...</p>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px] text-center leading-normal">
                Our AI is curating, formatting, and balancing the difficulty of your questions.
              </p>
            </div>
          ) : (
            <form onSubmit={handleGenerateAI} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Scrollable Form Inputs */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-5 pb-4">
                {/* Job Title */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Job Title
                  </label>
                  <Input
                    type="text"
                    value={aiJobTitle}
                    onChange={(e) => setAiJobTitle(e.target.value)}
                    placeholder="e.g., Senior Frontend Developer"
                    required
                  />
                </div>

                {/* Key Skills */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Key Skills (comma-separated)
                  </label>
                  <Input
                    type="text"
                    value={aiKeySkills}
                    onChange={(e) => setAiKeySkills(e.target.value)}
                    placeholder="e.g., React, TypeScript, GraphQL"
                    required
                  />
                </div>

                {/* Question Type */}
                <div ref={aiTypeDropdownRef} className="flex flex-col gap-2 relative">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Question Type
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAiTypeDropdown(!showAiTypeDropdown)}
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-all focus:outline-none focus:border-primary text-foreground cursor-pointer text-left"
                  >
                    <span>{aiType === "Mcq" ? "MCQ" : aiType}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>

                  {showAiTypeDropdown && (
                    <div className="absolute top-[72px] left-0 z-50 w-full rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/95 dark:bg-[#07070b]/95 backdrop-blur-md shadow-2xl p-1.5 animate-in fade-in duration-150">
                      <button
                        type="button"
                        onClick={() => {
                          setAiType("Mcq");
                          setShowAiTypeDropdown(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer mb-0.5",
                          aiType === "Mcq"
                            ? "bg-primary/10 text-primary dark:text-white"
                            : "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
                        )}
                      >
                        <span>MCQ</span>
                        {aiType === "Mcq" && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-muted-foreground/50 bg-transparent flex items-center justify-between cursor-not-allowed mb-0.5"
                        title="Subjective (Inactive)"
                        disabled
                      >
                        <span>Subjective (Inactive)</span>
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-muted-foreground/50 bg-transparent flex items-center justify-between cursor-not-allowed"
                        title="Code (Inactive)"
                        disabled
                      >
                        <span>Code (Inactive)</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Count & Difficulty row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Number of questions */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Number of Questions
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={aiCount}
                      onChange={(e) => setAiCount(parseInt(e.target.value) || 5)}
                      required
                    />
                  </div>

                  {/* AI Difficulty dropdown */}
                  <div ref={aiDifficultyDropdownRef} className="flex flex-col gap-2 relative">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Difficulty
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAiDifficultyDropdown(!showAiDifficultyDropdown)}
                      className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-all focus:outline-none focus:border-primary text-foreground cursor-pointer text-left"
                    >
                      <span>{aiDifficulty}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>

                    {showAiDifficultyDropdown && (
                      <div className="absolute top-[72px] left-0 z-50 w-full rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/95 dark:bg-[#07070b]/95 backdrop-blur-md shadow-2xl p-1.5 animate-in fade-in duration-150">
                        {(["Easy", "Medium", "Hard"] as const).map((diff) => (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => {
                              setAiDifficulty(diff);
                              setShowAiDifficultyDropdown(false);
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer mb-0.5",
                              aiDifficulty === diff
                                ? "bg-primary/10 text-primary dark:text-white"
                                : "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
                            )}
                          >
                            <span>{diff}</span>
                            {aiDifficulty === diff && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions inside Scrollable Container */}
                <div className="flex justify-between items-center border-t border-neutral-200/20 dark:border-neutral-800/50 pt-5 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAiJobTitle("React.js Developer");
                      setAiKeySkills("React.js, Next.js, JavaScript, TypeScript");
                      setAiType("Mcq");
                      setAiCount(2);
                      setAiDifficulty("Easy");
                    }}
                    className="bg-yellow-400 text-black border-2 border-dashed border-red-500 font-mono text-[9px] px-2 py-1 rounded-none hover:bg-red-500 hover:text-white cursor-pointer active:bg-black"
                  >
                    DEV FILL FORM
                  </button>
                  <Button
                    type="submit"
                    className="font-bold bg-ai-gradient hover:opacity-90 text-white flex items-center justify-center gap-2 cursor-pointer h-10 px-5 rounded-lg shadow-md border-0 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="w-4 h-4 text-white" /> Generate Questions
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <AIGenerationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => {
          setIsDialogOpen(false);
          startTransition(() => {
            router.push("/dashboard/questions");
            router.refresh();
          });
        }}
        jobTitle={aiJobTitle}
        keySkills={aiKeySkills}
        difficulty={aiDifficulty}
        count={aiCount}
      />
    </div>
  );
}
