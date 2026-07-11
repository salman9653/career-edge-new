"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Sparkles, AlertCircle, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface GeneratedQuestion {
  question: string;
  type: "Mcq";
  difficulty: "Easy" | "Medium" | "Hard";
  categories: string[];
  status: string;
  mcqOptions: MCQOption[];
}

interface AIGenerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jobTitle: string;
  keySkills: string;
  difficulty: "Easy" | "Medium" | "Hard";
  count: number;
}

type DialogStep = "generating" | "success-summary" | "reviewing" | "review-summary";

const cardVariants = {
  enter: (custom: { direction: "next" | "prev" | "approve" | "reject" | "none" }) => {
    const x = custom?.direction === "prev" ? "-100%" : "100%";
    return {
      x,
      y: 0,
      rotate: 0,
      opacity: 0,
      scale: 0.98
    };
  },
  center: {
    x: 0,
    y: 0,
    rotate: 0,
    opacity: 1,
    scale: 1
  },
  exit: (custom: { direction: "next" | "prev" | "approve" | "reject" | "none" }) => {
    const dir = custom?.direction || "none";
    if (dir === "approve") {
      return {
        x: "-100%",
        y: -60,
        rotate: -10,
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.25, ease: "easeIn" as const }
      };
    }
    if (dir === "reject") {
      return {
        x: "100%",
        y: 60,
        rotate: 10,
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.25, ease: "easeIn" as const }
      };
    }
    const x = dir === "prev" ? "100%" : "-100%";
    return {
      x,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.25, ease: "easeIn" as const }
    };
  }
};

const stepVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

function getFriendlyErrorMessage(errStr: string | null): string {
  if (!errStr) return "An unexpected error occurred during generation.";
  
  // Try to parse if it is JSON
  try {
    const parsed = JSON.parse(errStr);
    
    // Check for nested error structures like {"error": {"message": "..."}}
    if (parsed.error && typeof parsed.error === "object") {
      if (parsed.error.message) {
        return getFriendlyErrorMessage(parsed.error.message);
      }
    }
    
    // Check for direct message keys
    if (parsed.message) {
      return getFriendlyErrorMessage(parsed.message);
    }
  } catch (e) {
    // Not a JSON string, proceed to text matches
  }

  // Handle common API error patterns
  const lowerStr = errStr.toLowerCase();
  
  if (lowerStr.includes("experiencing high demand") || lowerStr.includes("unavailable") || lowerStr.includes("503")) {
    return "The AI service is temporarily unavailable due to high demand. Please try again in a few moments.";
  }
  
  if (lowerStr.includes("rate limit") || lowerStr.includes("429") || lowerStr.includes("too many requests")) {
    return "API rate limit exceeded. Please wait a few seconds and try again.";
  }
  
  if (lowerStr.includes("quota exceeded") || lowerStr.includes("billing")) {
    return "AI generation quota has been exceeded. Please check your developer API limits.";
  }

  if (lowerStr.includes("api key") || lowerStr.includes("invalid key") || lowerStr.includes("credentials")) {
    return "Authentication with the AI service failed. Please check your API configuration.";
  }

  // If it's a raw JSON string that escaped parsing, clean it up manually
  if (errStr.startsWith("{") && errStr.includes('"message":')) {
    const match = errStr.match(/"message"\s*:\s*"([^"]+)"/);
    if (match && match[1]) {
      return getFriendlyErrorMessage(match[1]);
    }
  }

  return errStr;
}

export function AIGenerationDialog({
  isOpen,
  onClose,
  onSuccess,
  jobTitle,
  keySkills,
  difficulty,
  count,
}: AIGenerationDialogProps) {
  const [step, setStep] = useState<DialogStep>("generating");
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const handleRetry = () => {
    setError(null);
    setStep("generating");
    setSmoothProgress(0);
    setQuestions([]);
    setApprovedIndices(new Set());
    setReviewedIndices(new Set());
    setCurrentIndex(0);
    setSavePending(false);
    setGenStatus([
      { id: 1, label: "Analyzing job title & requirements...", status: "active" },
      { id: 2, label: "Formulating skills assessment parameters...", status: "pending" },
      { id: 3, label: "Generating technical evaluation questions...", status: "pending" },
      { id: 4, label: "Validating question options & answers...", status: "pending" },
      { id: 5, label: "Running database duplicate checks...", status: "pending" },
    ]);
    setRetryTrigger((prev) => prev + 1);
  };

  // Generation status indicators
  const [genStatus, setGenStatus] = useState([
    { id: 1, label: "Analyzing job title & requirements...", status: "active" },
    { id: 2, label: "Formulating skills assessment parameters...", status: "pending" },
    { id: 3, label: "Generating technical evaluation questions...", status: "pending" },
    { id: 4, label: "Validating question options & answers...", status: "pending" },
    { id: 5, label: "Running database duplicate checks...", status: "pending" },
  ]);

  // AI-generated questions state
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  
  // Selection curation state (tracks indices of approved questions)
  const [approvedIndices, setApprovedIndices] = useState<Set<number>>(new Set());
  const [reviewedIndices, setReviewedIndices] = useState<Set<number>>(new Set());
  
  // Current index in Screen B review flow
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savePending, setSavePending] = useState(false);

  // Animation variants for exit card swipe triggers
  const [transitionDirection, setTransitionDirection] = useState<"next" | "prev" | "approve" | "reject" | "none">("none");
  const [animateFlash, setAnimateFlash] = useState<"approve" | "reject" | "none">("none");
  const [smoothProgress, setSmoothProgress] = useState(0);

  const currentActiveStep = genStatus.find(s => s.status === "active") || genStatus[genStatus.length - 1];
  const completedSteps = genStatus.filter(s => s.status === "done").length;


  // Smoothly increment generation progress bar by 1% intervals
  useEffect(() => {
    if (step !== "generating" || !isOpen) return;

    let target = 20;
    if (completedSteps === 1) target = 40;
    else if (completedSteps === 2) target = 60;
    else if (completedSteps === 3) target = 80;
    else if (completedSteps === 4) target = 95;
    else if (completedSteps === 5) target = 100;

    const interval = setInterval(() => {
      setSmoothProgress(prev => {
        if (prev < target) {
          return prev + 1;
        }
        return prev;
      });
    }, 45); // 1% increment every 45ms is very smooth and responsive!

    return () => clearInterval(interval);
  }, [completedSteps, step, isOpen]);

  // Call API to generate questions when dialog opens
  useEffect(() => {
    if (!isOpen) return;

    const abortController = new AbortController();

    // Timer animations for step checklist to feel high-fidelity
    const timers: NodeJS.Timeout[] = [];
    
    // Step 1 -> Done, Step 2 -> Active (after 1s)
    timers.push(setTimeout(() => {
      setGenStatus(prev => prev.map(s => {
        if (s.id === 1) return { ...s, status: "done" };
        if (s.id === 2) return { ...s, status: "active" };
        return s;
      }));
    }, 1200));

    // Step 2 -> Done, Step 3 -> Active (after 2.5s)
    timers.push(setTimeout(() => {
      setGenStatus(prev => prev.map(s => {
        if (s.id === 2) return { ...s, status: "done" };
        if (s.id === 3) return { ...s, status: "active" };
        return s;
      }));
    }, 2600));

    // Trigger API call immediately
    const fetchAIQuestions = async () => {
      try {
        setError(null);
        const res = await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            generateAI: true,
            jobTitle,
            keySkills,
            difficulty,
            count,
          }),
          signal: abortController.signal,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to generate questions");
        }

        const data = await res.json();
        const generatedList = data.questions as GeneratedQuestion[];

        if (abortController.signal.aborted) return;

        if (generatedList.length === 0) {
          throw new Error("No unique questions could be generated. Try specifying different skills.");
        }

        // Fast-forward loaders to complete
        setGenStatus(prev => prev.map(s => {
          if (s.id === 3) return { ...s, status: "done" };
          if (s.id === 4) return { ...s, status: "active" };
          return s;
        }));

        await new Promise((resolve, reject) => {
          const t = setTimeout(resolve, 800);
          abortController.signal.addEventListener("abort", () => {
            clearTimeout(t);
            reject(new DOMException("Aborted", "AbortError"));
          });
        });

        setGenStatus(prev => prev.map(s => {
          if (s.id === 4) return { ...s, status: "done" };
          if (s.id === 5) return { ...s, status: "active" };
          return s;
        }));

        await new Promise((resolve, reject) => {
          const t = setTimeout(resolve, 600);
          abortController.signal.addEventListener("abort", () => {
            clearTimeout(t);
            reject(new DOMException("Aborted", "AbortError"));
          });
        });

        if (abortController.signal.aborted) return;

        setGenStatus(prev => prev.map(s => ({ ...s, status: "done" })));
        setQuestions(generatedList);
        setError(null);
        
        // Wait a brief moment to let user see final checks before transitioning
        await new Promise((resolve, reject) => {
          const t = setTimeout(resolve, 500);
          abortController.signal.addEventListener("abort", () => {
            clearTimeout(t);
            reject(new DOMException("Aborted", "AbortError"));
          });
        });

        if (abortController.signal.aborted) return;
        setStep("success-summary");

      } catch (err: unknown) {
        if (err instanceof Error && (err.name === "AbortError" || err.message === "Aborted")) {
          console.log("Fetch aborted cleanly");
          return;
        }
        const errMsg = err instanceof Error ? err.message : "An unexpected error occurred during generation.";
        setError(errMsg);
      }
    };

    fetchAIQuestions();

    return () => {
      timers.forEach(clearTimeout);
      abortController.abort();
    };
  }, [isOpen, jobTitle, keySkills, difficulty, count, retryTrigger]);

  // Action: Add all immediately
  const handleAddAll = async () => {
    setSavePending(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchSave: true,
          questions,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save questions");
      }

      onSuccess();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to save questions.";
      alert(errMsg);
      setSavePending(false);
    }
  };

  // Action: Approve current card and advance
  const handleApproveCard = () => {
    setAnimateFlash("approve");
    setTransitionDirection("approve");

    // Add to approved queue
    setApprovedIndices(prev => {
      const next = new Set(prev);
      next.add(currentIndex);
      return next;
    });

    setReviewedIndices(prev => {
      const next = new Set(prev);
      next.add(currentIndex);
      return next;
    });

    // Transition helper - advance index after 200ms
    setTimeout(() => {
      setAnimateFlash("none");
      advanceCard();
      setTimeout(() => {
        setTransitionDirection("none");
      }, 50);
    }, 200);
  };

  // Action: Reject current card and advance
  const handleRejectCard = () => {
    setAnimateFlash("reject");
    setTransitionDirection("reject");

    // Remove from approved queue
    setApprovedIndices(prev => {
      const next = new Set(prev);
      next.delete(currentIndex);
      return next;
    });

    setReviewedIndices(prev => {
      const next = new Set(prev);
      next.add(currentIndex);
      return next;
    });

    // Transition helper - advance index after 200ms
    setTimeout(() => {
      setAnimateFlash("none");
      advanceCard();
      setTimeout(() => {
        setTransitionDirection("none");
      }, 50);
    }, 200);
  };

  const advanceCard = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setStep("review-summary");
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setTransitionDirection("prev");
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => {
        setTransitionDirection("none");
      }, 50);
    }
  };

  const handleNextCardArrow = () => {
    setTransitionDirection("next");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setStep("review-summary");
    }
    setTimeout(() => {
      setTransitionDirection("none");
    }, 50);
  };

  // Action: Save filtered approved selections
  const handleSaveApproved = async () => {
    const approvedList = questions.filter((_, idx) => approvedIndices.has(idx));
    if (approvedList.length === 0) {
      // If none approved, clicking "Reject All" closes the dialog cleanly
      onClose();
      return;
    }

    setSavePending(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchSave: true,
          questions: approvedList,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save questions");
      }

      onSuccess();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to save questions.";
      alert(errMsg);
      setSavePending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-default"
      />

      {/* Main Dialog Panel Wrapper (for rotating border) */}
      <div 
        className={cn(
          "relative w-full max-w-lg lg:w-[33.33vw] lg:max-w-none rounded-[28px] shadow-2xl overflow-hidden transition-all duration-300 z-10",
          step === "reviewing" ? "h-full md:h-auto" : "h-auto",
          step === "generating" ? "p-[2.5px] bg-neutral-900/50" : "border border-neutral-200/30 dark:border-neutral-800/80 p-0"
        )}
      >
        {/* Rotating gradient background for loader */}
        {step === "generating" && !error && (
          <div 
            className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,#a855f7,#ec4899,#f43f5e,#ec4899,#a855f7)] animate-spin-gradient"
          />
        )}

        {/* Inner Dialog Panel */}
        <div 
          className={cn(
            "w-full bg-card flex flex-col focus:outline-none text-left transition-all duration-300 relative z-20",
            step === "generating" ? "rounded-[25.5px] p-[21.5px] sm:p-[29.5px] h-auto min-h-[380px]" : 
            step === "reviewing" ? "rounded-[28px] p-6 sm:p-8 h-full md:h-[70vh] md:min-h-[580px] md:max-h-[90vh]" :
            "rounded-[28px] p-6 sm:p-8 h-auto min-h-[480px]"
          )}
        >
          {/* Soft background sparkles */}
          {step === "generating" && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/15 via-pink-500/5 to-transparent blur-2xl pointer-events-none" />
          )}

          <AnimatePresence mode="popLayout">
            {/* STATE 1: GENERATING / LOADING */}
            {step === "generating" && !error && (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full flex-1 flex flex-col justify-between py-4"
              >
                {/* Centered Header (Top Center) */}
                <div className="flex flex-col items-center text-center mt-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-3">
                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-base font-extrabold text-foreground">AI Generation in Progress</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Creating unique evaluation questions.</p>
                </div>

                {/* Centered Progress Message (No background card, pulsing text) */}
                <div className="flex-1 flex flex-col justify-center items-center py-6 min-h-[160px] relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentActiveStep.id}
                      variants={stepVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="flex flex-col items-center text-center gap-3 animate-pulse duration-1000"
                    >
                      <span className="text-foreground text-2xl sm:text-3xl font-extrabold tracking-wide max-w-md leading-relaxed">
                        {currentActiveStep.label}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Progress Bar (Bottom of card, themed bg-primary, smooth 1% increment) */}
                <div className="mt-auto flex flex-col gap-2 w-full">
                  <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <span>Generation Progress</span>
                    <span>{Math.round(smoothProgress)}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden p-[1px]">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-75"
                      style={{ width: `${smoothProgress}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ERROR STATE */}
            {error && step === "generating" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex-1 flex flex-col justify-center items-center text-center py-6"
              >
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mb-4 text-red-500 border border-red-200/30">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-foreground mb-2">Generation Failed</h3>
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed mb-6">
                  {getFriendlyErrorMessage(error)}
                </p>
                <div className="flex gap-3 justify-center w-full max-w-[280px]">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="font-bold text-xs h-9.5 px-5 rounded-xl cursor-pointer flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleRetry}
                    variant="default"
                    className="font-bold text-xs h-9.5 px-5 rounded-xl cursor-pointer flex-1"
                  >
                    Retry
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STATE 2: SUCCESS SUMMARY (SCREEN A) */}
            {step === "success-summary" && (
              <motion.div
                key="success-summary"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
                className="w-full flex-1 flex flex-col justify-between py-2"
              >
                <div className="flex flex-col items-center text-center my-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20 relative">
                    <BookOpen className="w-7 h-7 text-emerald-500" />
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-extrabold border-2 border-card">
                      {questions.length}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Questions Generated!</h3>
                  <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                    Gemini created <strong className="text-foreground">{questions.length} technical questions</strong> matching your criteria. Choose how you would like to proceed:
                  </p>
                </div>

                <div className="flex flex-row gap-3 w-full mt-6">
                  <Button
                    onClick={handleAddAll}
                    disabled={savePending}
                    variant="ghost"
                    className="flex-1 border border-neutral-200 dark:border-neutral-800 text-foreground font-bold h-11 rounded-xl cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 text-xs truncate"
                  >
                    {savePending ? "Saving..." : "Add All to Bank"}
                  </Button>
                  <Button
                    onClick={() => {
                      setTransitionDirection("none");
                      setStep("reviewing");
                    }}
                    className="flex-1 bg-primary hover:bg-primary/95 text-white font-bold h-11 rounded-xl cursor-pointer shadow-md text-xs flex items-center justify-center gap-1.5 truncate"
                  >
                    <Sparkles className="w-4 h-4 text-white" /> Analyze Questions
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STATE 3: CARD REVIEW FLOW (SCREEN B) */}
            {step === "reviewing" && (
              <motion.div
                key="reviewing"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
                className="w-full flex-1 flex flex-col h-full justify-between min-h-0"
              >
                {/* Top Header */}
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/10">
                      Question {currentIndex + 1} of {questions.length}
                    </span>
                    {approvedIndices.has(currentIndex) && (
                      <span className="text-[9px] font-extrabold uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded animate-in zoom-in-50 duration-150">
                        Approved
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={handlePrevCard}
                      disabled={currentIndex === 0 || transitionDirection !== "none"}
                      className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Previous Question"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleNextCardArrow}
                      disabled={transitionDirection !== "none"}
                      className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Skip / Next"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* The Curation Card */}
                <div className="flex-1 min-h-0 relative overflow-hidden mb-5">
                  <AnimatePresence mode="popLayout" custom={{ direction: transitionDirection }}>
                    <motion.div
                      key={currentIndex}
                      custom={{ direction: transitionDirection }}
                      variants={cardVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.6}
                      onDragEnd={(_e, info) => {
                        const swipeThreshold = 80;
                        if (info.offset.x < -swipeThreshold) {
                          handleNextCardArrow();
                        } else if (info.offset.x > swipeThreshold) {
                          handlePrevCard();
                        }
                      }}
                      className={cn(
                        "w-full h-full flex flex-col gap-4 text-left border rounded-2xl p-0 bg-card transition-all duration-300 shadow-md relative overflow-hidden cursor-grab active:cursor-grabbing select-none touch-pan-y",
                        animateFlash === "approve" ? "animate-approve-flash border-emerald-500" :
                        animateFlash === "reject" ? "animate-reject-flash border-red-500" :
                        approvedIndices.has(currentIndex)
                          ? "border-emerald-500 bg-emerald-500/5"
                          : reviewedIndices.has(currentIndex) && !approvedIndices.has(currentIndex)
                          ? "border-red-500 bg-red-500/5"
                          : "border-neutral-200/50 dark:border-neutral-800/80 bg-neutral-50/10 dark:bg-neutral-950/10"
                      )}
                    >
                      {/* Glowing checks and cross indicators on swipe exits */}
                      {transitionDirection === "approve" && (
                        <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl flex items-center justify-center z-20 animate-in fade-in duration-100">
                          <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-150">
                            <Check className="w-8 h-8 stroke-[3]" />
                          </div>
                        </div>
                      )}
                      {transitionDirection === "reject" && (
                        <div className="absolute inset-0 bg-red-500/10 rounded-2xl flex items-center justify-center z-20 animate-in fade-in duration-100">
                          <div className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-150">
                            <X className="w-8 h-8 stroke-[3]" />
                          </div>
                        </div>
                      )}

                      {/* Scrollable inner content area to prevent vertical jumps */}
                      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 p-5 pr-4">
                        {/* Meta Badge Indicators */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold border text-primary border-primary/10 bg-primary/5">
                            {questions[currentIndex].difficulty}
                          </span>
                          {questions[currentIndex].categories.map((cat, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-neutral-100 dark:bg-neutral-800 text-muted-foreground"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>

                        {/* Question text */}
                        <p className="text-sm font-semibold text-foreground leading-relaxed">
                          {questions[currentIndex].question}
                        </p>

                        {/* MCQ Choices */}
                        <div className="flex flex-col gap-2 w-full mt-1">
                          {questions[currentIndex].mcqOptions.map((opt) => (
                            <div
                              key={opt.id}
                              className={cn(
                                "flex items-start gap-2.5 p-2.5 rounded-xl border text-xs leading-relaxed font-medium transition-all",
                                opt.isCorrect
                                  ? "bg-emerald-500/5 border-emerald-500/30 text-foreground dark:border-emerald-500/20"
                                  : "bg-background border-neutral-200/50 dark:border-neutral-800/80 text-muted-foreground"
                              )}
                            >
                              <div className="mt-0.5 flex-shrink-0">
                                <div className={cn(
                                  "w-3.5 h-3.5 rounded-full border flex items-center justify-center text-white",
                                  opt.isCorrect ? "bg-emerald-500 border-emerald-500" : "border-neutral-300 dark:border-neutral-700 bg-transparent"
                                )}>
                                  {opt.isCorrect && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                                </div>
                              </div>
                              <span className={cn(opt.isCorrect && "font-bold text-foreground")}>
                                {opt.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Action Buttons with active animations */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <Button
                    onClick={handleRejectCard}
                    disabled={transitionDirection !== "none"}
                    className="flex-1 h-11 border border-red-200 dark:border-red-950/40 text-red-500 hover:bg-red-500/5 font-extrabold rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-1 bg-transparent active:scale-95 duration-100"
                  >
                    <X className="w-4 h-4 stroke-[3]" /> Reject
                  </Button>
                  <Button
                    onClick={handleApproveCard}
                    disabled={transitionDirection !== "none"}
                    className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-1 shadow-md hover:shadow-lg active:scale-95 duration-100"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Add to Bank
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STATE 4: REVIEW SUMMARY (SCREEN C) */}
            {step === "review-summary" && (
              <motion.div
                key="review-summary"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
                className="w-full flex-1 flex flex-col justify-between py-2"
              >
                <div className="flex flex-col items-center text-center my-6 animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 relative">
                    <Check className="w-7 h-7 text-primary stroke-[2.5]" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Review Complete!</h3>
                  <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                    You reviewed all questions and approved <strong className="text-foreground">{approvedIndices.size} of {questions.length}</strong> questions to be added to your question library.
                  </p>
                </div>

                <div className="flex flex-row gap-3 w-full mt-6">
                  <Button
                    onClick={() => {
                      setTransitionDirection("none");
                      // Reset to review page from index 0
                      setStep("reviewing");
                      setCurrentIndex(0);
                    }}
                    variant="ghost"
                    className="flex-1 border border-neutral-200 dark:border-neutral-800 text-foreground font-bold h-11 rounded-xl cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 text-xs truncate"
                  >
                    Restart Review
                  </Button>
                  <Button
                    onClick={handleSaveApproved}
                    disabled={savePending}
                    className={cn(
                      "flex-1 font-bold h-11 rounded-xl cursor-pointer shadow-md text-xs truncate",
                      approvedIndices.size === 0 
                        ? "bg-red-500 hover:bg-red-600 text-white" 
                        : "bg-primary hover:bg-primary/95 text-white"
                    )}
                  >
                    {savePending 
                      ? "Saving..." 
                      : approvedIndices.size === 0 
                      ? "Reject All" 
                      : `Save ${approvedIndices.size} Questions`}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
