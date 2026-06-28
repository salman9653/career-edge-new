"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

interface CustomQuestionFormProps {
  mode: "create" | "edit";
  question?: QuestionDetail;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function CustomQuestionForm({ mode, question, onCancel, onSuccess }: CustomQuestionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Custom Question Form State
  const [questionStatement, setQuestionStatement] = useState(() => mode === "edit" && question ? (question.question || "") : "");
  const [questionType, setQuestionType] = useState(() => mode === "edit" && question ? (question.type || "Mcq") : ""); // empty by default if create ("Select a type")
  const [categories, setCategories] = useState(() => mode === "edit" && question ? (question.categories?.join(", ") || "") : "");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(() => mode === "edit" && question ? (question.difficulty || "Medium") : "Medium");
  const [mcqOptions, setMcqOptions] = useState<MCQOption[]>(() => {
    if (mode === "edit" && question && question.mcqOptions && question.mcqOptions.length > 0) {
      return question.mcqOptions;
    }
    return [
      { id: "1", text: "Option A", isCorrect: true },
      { id: "2", text: "Option B", isCorrect: false },
      { id: "3", text: "Option C", isCorrect: false },
      { id: "4", text: "Option D", isCorrect: false },
    ];
  });

  // Track the previous question prop to adjust state if the question prop changes dynamically
  const [prevQuestion, setPrevQuestion] = useState(question);
  if (question !== prevQuestion) {
    setPrevQuestion(question);
    if (mode === "edit" && question) {
      setQuestionStatement(question.question || "");
      setQuestionType(question.type || "Mcq");
      setCategories(question.categories?.join(", ") || "");
      setDifficulty(question.difficulty || "Medium");
      if (question.mcqOptions && question.mcqOptions.length > 0) {
        setMcqOptions(question.mcqOptions);
      }
    }
  }

  // Dropdown open states
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);

  // Dropdown click outside refs
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const difficultyDropdownRef = useRef<HTMLDivElement>(null);

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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    } else {
      if (mode === "edit" && question) {
        router.push(`/dashboard/questions/${question.id}`);
      } else {
        router.push("/dashboard/questions");
      }
    }
  };

  // Submit custom question
  const handleSubmit = async (e: React.FormEvent) => {
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
      status: question?.status || "Active",
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
          if (onSuccess) {
            onSuccess();
          } else {
            router.push("/dashboard/questions");
            router.refresh();
          }
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

  return (
    <div className={cn("flex flex-col text-left", mode === "edit" ? "gap-6 pb-12" : "h-full")}>
      {/* Title/Header block for edit mode inside slide panel */}
      {mode === "edit" && (
        <div className="flex-shrink-0 border-b border-neutral-200/50 dark:border-neutral-800/80 pb-4">
          <h3 className="text-lg font-bold text-foreground">Edit Question</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Modify existing evaluation question details.
          </p>
        </div>
      )}

      {mode === "create" && (
        <div className="flex-shrink-0 mb-4">
          <h3 className="text-base font-extrabold text-foreground">Create Custom Question</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            This question will be saved to your company&apos;s private question bank.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={cn("flex flex-col min-h-0", mode === "create" ? "flex-1 overflow-hidden" : "w-full gap-5")}>
        {/* Scrollable Form Inputs (only scrollable when creating/full height container) */}
        <div className={cn("flex flex-col gap-5", mode === "create" ? "flex-1 min-h-0 overflow-y-auto pr-1 pb-4" : "w-full")}>
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

          {/* Question Type, Category, Difficulty */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start w-full">
            {/* Question Type Select */}
            <div ref={typeDropdownRef} className="flex-1 min-w-[140px] w-full flex flex-col gap-2 relative">
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
            <div className="flex-[2] min-w-[200px] w-full flex flex-col gap-2">
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
            <div ref={difficultyDropdownRef} className="flex-1 min-w-[140px] w-full flex flex-col gap-2 relative">
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
            <div className="flex flex-col gap-3 mt-2 bg-neutral-50/50 dark:bg-neutral-900/10 p-4 rounded-xl border border-neutral-200/30 dark:border-neutral-800/50 w-full">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                MCQ Options
              </h4>
              <div className="flex flex-col gap-3">
                {mcqOptions.map((opt, index) => (
                  <div key={opt.id} className="flex items-center gap-3">
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
                        <span className="pointer-events-none absolute bottom-full right-0 mb-1.5 w-max opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 dark:bg-neutral-800 text-white dark:text-neutral-100 text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl border border-neutral-800/20 z-50">
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
                    className="text-xs font-bold gap-1.5 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-foreground cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Option
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={cn("flex justify-end gap-3 pt-5 mt-4", mode === "create" ? "border-t border-neutral-200/20 dark:border-neutral-800/50" : "")}>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancelClick}
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
      </form>
    </div>
  );
}
