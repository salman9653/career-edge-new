"use client";

import React, { useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DataTable, ColumnDef } from "@/components/dashboard/common";
import { useUIStore } from "@/store/useUIStore";
import { Square, CheckSquare, Plus, Sparkles, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { User } from "@/types";
import { Button, Tooltip } from "@/components/ui";

interface QuestionRow {
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

interface QuestionBankClientProps {
  questions: QuestionRow[];
  user: User;
  children: React.ReactNode;
}

export function QuestionBankClient({ questions: initialQuestions, children }: QuestionBankClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [fabMenuOpen, setFabMenuOpen] = React.useState(false);
  
  const [questions, setQuestions] = React.useState<QuestionRow[]>(initialQuestions);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(initialQuestions.length === 20);
  const [loading, setLoading] = React.useState(false);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/questions?search=${encodeURIComponent(search)}&page=${nextPage}&limit=20`);
      const resData = await res.json();
      if (resData.data && Array.isArray(resData.data)) {
        if (resData.data.length < 20) {
          setHasMore(false);
        }
        setQuestions((prev) => [...prev, ...resData.data]);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more questions:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (search === "") {
      setQuestions(initialQuestions);
      setPage(1);
      setHasMore(initialQuestions.length === 20);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/questions?search=${encodeURIComponent(search)}&page=1&limit=20`);
        const resData = await res.json();
        if (resData.data && Array.isArray(resData.data)) {
          setQuestions(resData.data);
          setPage(1);
          setHasMore(resData.data.length === 20);
        }
      } catch (err) {
        console.error("Failed to search questions:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [search, initialQuestions]);

  const isAddRoute = pathname === "/dashboard/questions/add" || pathname === "/dashboard/questions/generate";
  const isEditRoute = pathname?.endsWith("/edit");
  const isDetailRoute = !isAddRoute && !isEditRoute && pathname !== "/dashboard/questions";

  // Custom filter configs to filter by categories, difficulty, and status
  const filterConfigs = React.useMemo(() => {
    const categoriesSet = new Set<string>();
    questions.forEach((q) => {
      if (q.categories && Array.isArray(q.categories)) {
        q.categories.forEach((cat) => {
          if (cat && cat.trim()) categoriesSet.add(cat.trim());
        });
      }
    });
    const uniqueCategories = Array.from(categoriesSet).sort();

    return [
      {
        key: "categories",
        label: "Category",
        options: uniqueCategories,
      },
      {
        key: "difficulty",
        label: "Difficulty",
        options: ["Easy", "Medium", "Hard"],
      },
      {
        key: "status",
        label: "Status",
        options: ["Active", "Inactive"],
      },
    ];
  }, [questions]);

  // Dynamic header updates
  useEffect(() => {
    const { setHeader, clearHeader, setViewSwitcher } = useUIStore.getState();
    
    setHeader(
      "Question Bank",
      "Manage your database of evaluation and interview questions."
    );
    // Enable List/Card toggle switcher
    setViewSwitcher(true, "questions-view-mode");

    return () => {
      clearHeader();
      setViewSwitcher(false);
    };
  }, []);

  const handleRowClick = (row: QuestionRow) => {
    startTransition(() => {
      router.push(`/dashboard/questions/${row.id}`);
    });
  };

  const handleClosePanel = () => {
    startTransition(() => {
      router.push("/dashboard/questions");
    });
  };

  // Define Columns
  const columns: ColumnDef<QuestionRow>[] = [
    {
      key: "sNo",
      label: "S.No.",
      render: (_, index) => <span className="text-muted-foreground text-xs">{index + 1}</span>,
    },
    {
      key: "question",
      label: "Question",
      sortable: true,
      render: (row) => {
        const cleanText = row.question ? row.question.replace(/\n+/g, " ") : "";
        return (
          <span className="text-xs font-semibold text-foreground line-clamp-1 text-left max-w-[280px] md:max-w-[400px] truncate block">
            {cleanText}
          </span>
        );
      },
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (row) => <span className="text-xs font-medium text-muted-foreground">{row.type}</span>,
    },
    {
      key: "categories",
      label: "Category",
      render: (row, rIndex) => {
        const cats = row.categories || [];
        if (cats.length === 0) return <span className="text-muted-foreground text-xs">-</span>;
        return (
          <Tooltip
            content={cats.join(", ")}
            side={rIndex === 0 ? "bottom" : "top"}
          >
            <div className="flex items-center gap-1 cursor-help">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-foreground border border-neutral-200 dark:border-neutral-700 max-w-[90px] truncate">
                {cats[0]}
              </span>
              {cats.length > 1 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-primary/10 text-primary border border-primary/10">
                  +{cats.length - 1}
                </span>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      key: "difficulty",
      label: "Difficulty",
      sortable: true,
      render: (row) => {
        const diff = row.difficulty;
        const color =
          diff === "Easy"
            ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/10"
            : diff === "Medium"
            ? "text-yellow-500 bg-yellow-500/5 border-yellow-500/10"
            : "text-red-500 bg-red-500/5 border-red-500/10";
        return (
          <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border", color)}>
            {diff}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const isActive = (row.status || "Active") === "Active";
        const colorClass = isActive
          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10"
          : "bg-red-500/10 text-red-500 border-red-500/10";
        return (
          <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", colorClass)}>
            {row.status || "Active"}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Created At",
      sortable: true,
      render: (row) => {
        const date = new Date(row.createdAt);
        return (
          <span className="text-xs text-muted-foreground">
            {date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
  ];

  // Render responsive Card View
  const renderQuestionCard = (
    row: QuestionRow,
    isSelected: boolean,
    toggleSelect: (e: React.MouseEvent) => void,
    selectMode: boolean
  ) => {
    const diff = row.difficulty;
    const diffColor =
      diff === "Easy"
        ? "text-emerald-500 border-emerald-500/10 bg-emerald-500/5"
        : diff === "Medium"
        ? "text-yellow-500 border-yellow-500/10 bg-yellow-500/5"
        : "text-red-500 border-red-500/10 bg-red-500/5";

    return (
      <div
        className={cn(
          "relative rounded-2xl glass border p-5 flex flex-col gap-4 transition-all duration-300 hover:shadow-lg group text-left h-full cursor-pointer",
          isSelected
            ? "border-primary bg-primary/5 shadow-md"
            : "border-neutral-200/30 dark:border-neutral-800/50 bg-card hover:border-neutral-300 dark:hover:border-neutral-700"
        )}
      >
        {/* Selection Checkbox */}
        {selectMode && (
          <button
            onClick={toggleSelect}
            className="absolute top-4 right-4 cursor-pointer text-muted-foreground hover:text-foreground z-10 transition-colors"
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-primary animate-in zoom-in-50 duration-150" />
            ) : (
              <Square className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            )}
          </button>
        )}

        {/* Card Header (Type & Difficulty) */}
        <div className="flex items-center justify-between gap-2 pr-6">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            {row.type} Question
          </span>
          <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold border", diffColor)}>
            {diff}
          </span>
        </div>

        {/* Question Statement */}
        <div className="flex-1 min-h-[44px]">
          <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
            {row.question}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-200/50 dark:bg-neutral-800/50" />

        {/* Categories / Tags */}
        <div className="flex flex-wrap gap-1">
          {row.categories?.map((cat, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-medium bg-neutral-100 dark:bg-neutral-800 text-muted-foreground border border-neutral-200 dark:border-neutral-700"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Footer Details */}
        <div className="mt-auto pt-2 text-[10px] text-muted-foreground flex justify-between items-center border-t border-neutral-100/50 dark:border-neutral-900/50">
          <span className="truncate max-w-[120px]">{row.createdByName}</span>
          <span>
            {new Date(row.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    );
  };

  // If we are on full page forms (add/generate), render them directly
  if (isAddRoute) {
    return (
      <div className="w-full h-[calc(100vh-88px)] md:h-[calc(100vh-48px)] flex flex-col overflow-hidden -mb-[24px] md:-mb-[32px] relative">
        {children}
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-88px)] md:h-[calc(100vh-48px)] flex flex-col overflow-hidden -mb-[24px] md:-mb-[32px] relative">
      {questions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto h-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass border border-neutral-200/30 dark:border-neutral-800/50 rounded-3xl p-8 shadow-2xl flex flex-col items-center relative overflow-hidden text-center bg-card"
          >
            {/* Soft decorative background glow */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl" />

            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 relative">
              <HelpCircle className="w-8 h-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-pink-500 animate-ping" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-pink-500" />
            </div>

            <h3 className="text-lg font-bold text-foreground mb-2">Build Your Question Bank</h3>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed max-w-sm">
              Your question bank is currently empty. Get started by adding a custom question or using our AI Generator to template realistic technical questions in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={() => router.push("/dashboard/questions/add")}
                className="bg-primary text-white font-bold h-10 px-5 rounded-xl hover:bg-primary/95 cursor-pointer shadow-md text-xs flex-1"
              >
                Create Custom Question
              </Button>
              <Button
                onClick={() => router.push("/dashboard/questions/generate")}
                className="border border-neutral-200 dark:border-neutral-800 text-foreground font-bold h-10 px-5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer flex items-center justify-center gap-1.5 text-xs flex-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-500" /> Generate with AI
              </Button>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
          <DataTable
            data={questions}
            columns={columns}
            searchPlaceholder="Search questions..."
            searchKey="question"
            entityName="Question"
            filterConfigs={filterConfigs}
            onRowClick={handleRowClick}
            renderCard={renderQuestionCard}
            primaryAction={{
              label: "Add Question",
              onClick: () => router.push("/dashboard/questions/add"),
            }}
            searchQuery={search}
            onSearchChange={setSearch}
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoadingMore={loading}
            onDeleteSelected={async (ids) => {
              try {
                const res = await fetch("/api/questions", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ids }),
                });
                if (res.ok) {
                  setQuestions((prev) => prev.filter((q) => !ids.includes(q.id)));
                  startTransition(() => {
                    router.refresh();
                  });
                  return true;
                } else {
                  const data = await res.json();
                  alert(data.error || "Failed to delete selected questions");
                  return false;
                }
              } catch (err) {
                console.error(err);
                alert("An error occurred while deleting selected questions.");
                return false;
              }
            }}
          />

          {/* Mobile Floating Action Button Menu Backdrop */}
          <AnimatePresence>
            {fabMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setFabMenuOpen(false)}
                className="sm:hidden fixed inset-0 bg-black/60 z-30 pointer-events-auto"
              />
            )}
          </AnimatePresence>

          {/* Mobile FAB and Speed Dial Options */}
          <div className="sm:hidden fixed bottom-20 right-6 z-40 flex flex-col items-end gap-3.5">
            <AnimatePresence>
              {fabMenuOpen && (
                <>
                  {/* Cloudy separation glow — soft radial blobs behind the speed dial */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="pointer-events-none fixed bottom-16 right-0 z-[-1]"
                    aria-hidden="true"
                  >
                    <div
                      className="w-72 h-64 blur-2xl rounded-full translate-x-8 translate-y-4"
                      style={{
                        background: 'radial-gradient(circle, var(--fab-glow-from) 0%, var(--fab-glow-via) 40%, transparent 70%)',
                      }}
                    />
                  </motion.div>

                  <div className="flex flex-col items-end gap-3.5 mb-1">
                    {/* Option 1: AI Generator */}
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.8 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="flex items-center gap-3"
                    >
                      <span className="bg-background text-foreground text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-neutral-200/50 dark:border-neutral-800">
                        Generate with AI
                      </span>
                      <button
                        onClick={() => {
                          setFabMenuOpen(false);
                          router.push("/dashboard/questions/generate");
                        }}
                        className="w-12 h-12 rounded-full bg-ai-gradient text-white flex items-center justify-center shadow-lg cursor-pointer border-0 active:scale-95 transition-transform"
                      >
                        <Sparkles className="w-5 h-5 text-white" />
                      </button>
                    </motion.div>

                    {/* Option 2: Custom Question */}
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.8 }}
                      transition={{ type: "spring", damping: 15, delay: 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <span className="bg-background text-foreground text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-neutral-200/50 dark:border-neutral-800">
                        Create Custom Question
                      </span>
                      <button
                        onClick={() => {
                          setFabMenuOpen(false);
                          router.push("/dashboard/questions/add");
                        }}
                        className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 text-foreground flex items-center justify-center shadow-lg cursor-pointer border-0 active:scale-95 transition-transform"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </motion.div>
                  </div>
                </>
              )}
            </AnimatePresence>

            {/* Primary FAB */}
            <button
              onClick={() => setFabMenuOpen(!fabMenuOpen)}
              className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer border-0"
              aria-label="Add Question Menu"
            >
              <motion.div
                animate={{ rotate: fabMenuOpen ? 45 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center justify-center"
              >
                <Plus className="w-6 h-6 text-white" />
              </motion.div>
            </button>
          </div>
        </>
      )}

      {/* Side Slide-Over Panel for details or edit */}
      <AnimatePresence mode="wait">
        {(isDetailRoute || isEditRoute) && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={handleClosePanel}
              className="fixed inset-0 bg-black/60 z-30"
            />
            {/* Slide-out panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 xl:w-1/3 bg-background/95 backdrop-blur-md border-l border-neutral-200/50 dark:border-neutral-800/80 shadow-2xl z-40 flex flex-col h-full"
            >
              {/* Render the details page */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
