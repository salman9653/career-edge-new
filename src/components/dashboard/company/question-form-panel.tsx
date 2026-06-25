"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Sparkles, ChevronDown, Check, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";

interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionDetail {
  id: string;
  question: string;
  type: string;
  categories: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  status: string;
  createdByName: string;
  createdAt: string;
  mcqOptions?: MCQOption[];
}

interface QuestionFormPanelProps {
  mode: "create" | "edit";
  question?: QuestionDetail;
}

export function QuestionFormPanel({ mode, question }: QuestionFormPanelProps) {
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

  // Custom Question Form State
  const [questionStatement, setQuestionStatement] = useState("");
  const [questionType, setQuestionType] = useState(""); // empty by default ("Select a type")
  const [categories, setCategories] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [mcqOptions, setMcqOptions] = useState<MCQOption[]>([
    { id: "1", text: "Option A", isCorrect: true },
    { id: "2", text: "Option B", isCorrect: false },
    { id: "3", text: "Option C", isCorrect: false },
    { id: "4", text: "Option D", isCorrect: false },
  ]);

  // Dropdown open states
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);

  // AI Generator State
  const [aiJobTitle, setAiJobTitle] = useState("");
  const [aiKeySkills, setAiKeySkills] = useState("");
  const [aiType, setAiType] = useState(""); // empty by default
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [showAiDifficultyDropdown, setShowAiDifficultyDropdown] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Dropdown click outside refs
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const difficultyDropdownRef = useRef<HTMLDivElement>(null);
  const aiDifficultyDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(target)) {
        setShowTypeDropdown(false);
      }
      if (difficultyDropdownRef.current && !difficultyDropdownRef.current.contains(target)) {
        setShowDifficultyDropdown(false);
      }
      if (aiDifficultyDropdownRef.current && !aiDifficultyDropdownRef.current.contains(target)) {
        setShowAiDifficultyDropdown(false);
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
    if (mode === "edit") {
      setHeader(
        "Edit Question",
        "Modify existing evaluation question.",
        "/dashboard/questions"
      );
    } else if (isGenerateRoute) {
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
  }, [mode, isGenerateRoute]);

  // Load question data for Edit mode
  useEffect(() => {
    if (mode === "edit" && question) {
      setQuestionStatement(question.question || "");
      setQuestionType(question.type || "Mcq");
      setCategories(question.categories?.join(", ") || "");
      setDifficulty(question.difficulty || "Medium");
      if (question.mcqOptions && question.mcqOptions.length > 0) {
        setMcqOptions(question.mcqOptions);
      }
    }
  }, [mode, question]);

  // Back to list helper
  const handleBack = () => {
    router.push("/dashboard/questions");
  };

  // MCQ Options modifications
  const handleMarkCorrect = (id: string) => {
    setMcqOptions(
      mcqOptions.map((opt) => ({
        ...opt,
        isCorrect: opt.id === id,
      }))
    );
  };

  const handleOptionTextChange = (id: string, text: string) => {
    setMcqOptions(
      mcqOptions.map((opt) => ({
        ...opt,
        text,
      }))
    );
  };

  const handleAddOption = () => {
    if (mcqOptions.length >= 6) {
      alert("An MCQ question can have a maximum of 6 options.");
      return;
    }
    const nextId = String(
      mcqOptions.reduce((max, opt) => Math.max(max, parseInt(opt.id) || 0), 0) + 1
    );
    setMcqOptions([
      ...mcqOptions,
      { id: nextId, text: `Option ${String.fromCharCode(64 + parseInt(nextId)) || nextId}`, isCorrect: false },
    ]);
  };

  const handleDeleteOption = (id: string) => {
    if (mcqOptions.length <= 2) {
      return;
    }
    const filtered = mcqOptions.filter((opt) => opt.id !== id);
    // If we deleted the correct option, mark the first remaining option as correct
    const hasCorrect = filtered.some((o) => o.isCorrect);
    if (!hasCorrect && filtered.length > 0) {
      filtered[0].isCorrect = true;
    }
    setMcqOptions(filtered);
  };

  // Submit custom question
  const handleSubmitCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionStatement.trim()) {
      alert("Please enter a question statement.");
      return;
    }
    if (!questionType) {
      alert("Please select a question type.");
      return;
    }
    if (!categories.trim()) {
      alert("Please specify at least one category tag.");
      return;
    }

    if (questionType === "Mcq") {
      const emptyOption = mcqOptions.some((opt) => !opt.text.trim());
      if (emptyOption) {
        alert("Please fill in all MCQ options.");
        return;
      }
    }

    const payload = {
      question: questionStatement,
      type: questionType,
      difficulty,
      categories,
      mcqOptions: questionType === "Mcq" ? mcqOptions : [],
    };

    try {
      const url = mode === "edit" && question ? `/api/questions/${question.id}` : "/api/questions";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        startTransition(() => {
          router.push("/dashboard/questions");
          router.refresh();
        });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save question.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving the question.");
    }
  };

  // Submit AI generator
  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiJobTitle.trim()) {
      alert("Please fill in the target job title.");
      return;
    }
    if (!aiKeySkills.trim()) {
      alert("Please specify the key skills (e.g. React, TypeScript).");
      return;
    }

    setIsGeneratingAI(true);

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generateAI: true,
          jobTitle: aiJobTitle,
          keySkills: aiKeySkills,
          difficulty: aiDifficulty,
          count: aiCount,
        }),
      });

      if (res.ok) {
        startTransition(() => {
          router.push("/dashboard/questions");
          router.refresh();
        });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to generate questions.");
        setIsGeneratingAI(false);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during AI generation.");
      setIsGeneratingAI(false);
    }
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
      <div className={cn("grid gap-6 items-stretch h-full min-h-0 w-full", mode === "create" ? "grid-cols-1 lg:grid-cols-3" : "max-w-3xl mx-auto")}>
        
        {/* Custom Question Panel */}
        <div className={cn(
          "glass border border-neutral-200/40 dark:border-neutral-800/80 rounded-2xl p-6 text-left bg-card shadow-xl h-full overflow-hidden",
          mode === "create" ? "lg:col-span-2" : "w-full",
          isGenerateRoute ? "hidden lg:flex" : "flex flex-col"
        )}>
          <div className="flex-shrink-0 mb-4">
            <h3 className="text-base font-extrabold text-foreground">Create Custom Question</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              This question will be saved to your company's private question bank.
            </p>
          </div>

          <form onSubmit={handleSubmitCustom} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Scrollable Form Inputs */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-5 pb-4">
              {/* Question Statement */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Question Statement
                </label>
                <textarea
                  value={questionStatement}
                  onChange={(e) => setQuestionStatement(e.target.value)}
                  placeholder="Enter the question statement..."
                  className="flex min-h-[120px] w-full rounded-lg border border-input bg-transparent px-4 py-3 text-sm shadow-sm transition-all focus:outline-none focus:border-primary placeholder:text-muted-foreground text-foreground leading-relaxed"
                  required
                />
              </div>

              {/* Question Type, Category, Difficulty row */}
              <div className="flex flex-wrap gap-4 items-start w-full">
                {/* Question Type Select */}
                <div ref={typeDropdownRef} className="flex-1 min-w-[200px] flex flex-col gap-2 relative">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Question Type
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-all focus:outline-none focus:border-primary text-foreground cursor-pointer text-left"
                  >
                    <span className={cn(!questionType && "text-muted-foreground")}>
                      {questionType || "Select a type"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>

                  {showTypeDropdown && (
                    <div className="absolute top-[72px] left-0 z-50 w-full rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/95 dark:bg-[#07070b]/95 backdrop-blur-md shadow-2xl p-1.5 animate-in fade-in duration-150">
                      <button
                        type="button"
                        onClick={() => {
                          setQuestionType("Mcq");
                          setShowTypeDropdown(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer mb-0.5",
                          questionType === "Mcq"
                            ? "bg-primary/10 text-primary dark:text-white"
                            : "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
                        )}
                      >
                        <span>MCQ</span>
                        {questionType === "Mcq" && <Check className="w-3.5 h-3.5" />}
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

                {/* Category tag input */}
                <div className="flex-[2] min-w-[240px] flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Category (comma-separated)
                  </label>
                  <Input
                    type="text"
                    value={categories}
                    onChange={(e) => setCategories(e.target.value)}
                    placeholder="e.g., React, JavaScript, Behavioral"
                    required
                  />
                </div>

                {/* Difficulty Dropdown */}
                <div ref={difficultyDropdownRef} className="flex-1 min-w-[180px] flex flex-col gap-2 relative">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Difficulty
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDifficultyDropdown(!showDifficultyDropdown)}
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-all focus:outline-none focus:border-primary text-foreground cursor-pointer text-left"
                  >
                    <span>{difficulty}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>

                  {showDifficultyDropdown && (
                    <div className="absolute top-[72px] left-0 z-50 w-full rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/95 dark:bg-[#07070b]/95 backdrop-blur-md shadow-2xl p-1.5 animate-in fade-in duration-150">
                      {(["Easy", "Medium", "Hard"] as const).map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => {
                            setDifficulty(diff);
                            setShowDifficultyDropdown(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer mb-0.5",
                            difficulty === diff
                              ? "bg-primary/10 text-primary dark:text-white"
                              : "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
                          )}
                        >
                          <span>{diff}</span>
                          {difficulty === diff && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* MCQ Options Builder */}
              {questionType === "Mcq" && (
                <div className="flex flex-col gap-3 mt-2 bg-neutral-50/50 dark:bg-neutral-900/10 p-4 rounded-xl border border-neutral-200/30 dark:border-neutral-800/50">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    MCQ Options
                  </h4>
                  <div className="flex flex-col gap-3">
                    {mcqOptions.map((opt, index) => (
                      <div key={opt.id} className="flex items-center gap-3.5">
                        {/* Check radio */}
                        <button
                          type="button"
                          onClick={() => handleMarkCorrect(opt.id)}
                          className="flex-shrink-0 cursor-pointer"
                          title="Mark as correct answer"
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                              opt.isCorrect
                                ? "border-primary bg-primary text-white"
                                : "border-neutral-300 dark:border-neutral-700 bg-transparent hover:border-neutral-400"
                            )}
                          >
                            {opt.isCorrect && <div className="w-2 h-2 rounded-full bg-background" />}
                          </div>
                        </button>

                        {/* Text Input */}
                        <Input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1"
                          required
                        />

                        {/* Delete option */}
                        <div className="relative group flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteOption(opt.id)}
                            disabled={mcqOptions.length <= 2}
                            className={cn(
                              "p-2 rounded-lg transition-colors flex items-center justify-center",
                              mcqOptions.length <= 2
                                ? "text-neutral-300 dark:text-neutral-700 cursor-not-allowed opacity-50"
                                : "hover:bg-red-500/10 text-muted-foreground hover:text-red-500 cursor-pointer"
                            )}
                            aria-label="Delete option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {mcqOptions.length <= 2 && (
                            <span className="pointer-events-none absolute bottom-full right-0 mb-1.5 w-max opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 dark:bg-neutral-850 text-white dark:text-neutral-100 text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl border border-neutral-800/20 z-50">
                              At least 2 options required
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {mcqOptions.length < 6 && (
                    <div className="flex justify-start mt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleAddOption}
                        className="text-xs font-bold gap-1.5 border border-neutral-200 dark:border-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-foreground cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Option
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {/* Actions inside Scrollable Container */}
              <div className="flex justify-end gap-3 border-t border-neutral-200/20 dark:border-neutral-800/50 pt-5 mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="font-bold border border-neutral-200 dark:border-neutral-800 text-foreground cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="font-bold bg-primary text-white hover:bg-primary/95 cursor-pointer"
                >
                  {mode === "edit" ? "Save Changes" : "Save Question"}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* AI Generator Panel (Only visible in CREATE mode) */}
        {mode === "create" && (
          <div className={cn(
            "glass border-ai-gradient rounded-2xl p-6 text-left bg-card shadow-xl relative overflow-hidden h-full",
            isGenerateRoute ? "flex flex-col w-full lg:col-span-3" : "hidden lg:flex lg:flex-col lg:col-span-1"
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
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Question Type
                    </label>
                    <button
                      type="button"
                      className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-all focus:outline-none text-muted-foreground cursor-not-allowed text-left"
                      disabled
                    >
                      <span className="text-muted-foreground">Select a type</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
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
                  <div className="flex justify-end border-t border-neutral-200/20 dark:border-neutral-800/50 pt-5 mt-4">
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
        )}
      </div>
    </div>
  );
}
