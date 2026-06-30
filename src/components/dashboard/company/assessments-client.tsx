"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable, ColumnDef } from "@/components/dashboard/common";
import { useUIStore } from "@/store/useUIStore";
import { Square, CheckSquare, Plus, FileText, Clock, HelpCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { User } from "@/types";
import { Tooltip } from "@/components/ui";

interface AssessmentRow {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Active" | "Inactive";
  questionsCount: number;
  createdByName: string;
  createdAt: string;
}

interface AssessmentsClientProps {
  user: User;
}

const dummyAssessments: AssessmentRow[] = [
  {
    id: "a1",
    title: "Frontend Engineer Assessment",
    description: "Core UI skills assessment covering React, Tailwind CSS, JavaScript, and general styling principles.",
    duration: 45,
    difficulty: "Medium",
    status: "Active",
    questionsCount: 15,
    createdByName: "Acme Corp",
    createdAt: "2026-06-15T10:00:00Z"
  },
  {
    id: "a2",
    title: "Senior Backend Architect (Node/Go)",
    description: "Advanced database scaling, system design, concurrency, memory profiling, and microservices architecture.",
    duration: 60,
    difficulty: "Hard",
    status: "Active",
    questionsCount: 10,
    createdByName: "Acme Corp",
    createdAt: "2026-06-20T14:30:00Z"
  },
  {
    id: "a3",
    title: "Junior QA Engineer",
    description: "Fundamental testing methodologies, automation concepts, bug reporting, and unit testing basics.",
    duration: 30,
    difficulty: "Easy",
    status: "Active",
    questionsCount: 20,
    createdByName: "Acme Corp",
    createdAt: "2026-06-25T09:15:00Z"
  },
  {
    id: "a4",
    title: "Product Manager Evaluation",
    description: "Scenario-based questions covering roadmap planning, feature prioritization, stakeholder coordination, and metrics.",
    duration: 45,
    difficulty: "Medium",
    status: "Inactive",
    questionsCount: 12,
    createdByName: "Acme Corp",
    createdAt: "2026-06-28T11:00:00Z"
  }
];

export function AssessmentsClient({ user }: AssessmentsClientProps) {
  const router = useRouter();
  const [assessments, setAssessments] = React.useState<AssessmentRow[]>(dummyAssessments);
  const [search, setSearch] = React.useState("");
  
  const tabs = React.useMemo(() => [
    { id: "assessments", label: "Assessments", isActive: true, onClick: () => {} },
    { id: "ai-interview", label: "AI Interviews", isActive: false, onClick: () => router.push("/dashboard/templates/ai-interview") },
  ], [router]);

  // Enable List/Card mode switcher
  useEffect(() => {
    const { setViewSwitcher } = useUIStore.getState();
    setViewSwitcher(true, "assessments-view-mode");
    return () => {
      setViewSwitcher(false);
    };
  }, []);

  const handleRowClick = (row: AssessmentRow) => {
    // When row clicked, we will show details later
    console.log("Clicked assessment:", row.id);
  };

  const handleAddAssessment = () => {
    // Will implement adding/creating later
    alert("Creation flow will be implemented next!");
  };

  // Filter assessments based on search local query
  const filteredAssessments = React.useMemo(() => {
    if (!search.trim()) return assessments;
    const query = search.toLowerCase();
    return assessments.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query)
    );
  }, [search, assessments]);

  // Filter configurations for categories, difficulty, status
  const filterConfigs = React.useMemo(() => {
    return [
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
  }, []);

  // Columns definition
  const columns: ColumnDef<AssessmentRow>[] = [
    {
      key: "sNo",
      label: "S.No.",
      render: (_, index) => <span className="text-muted-foreground text-xs">{index + 1}</span>,
    },
    {
      key: "title",
      label: "Assessment Title",
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold text-foreground line-clamp-1 text-left max-w-[240px] truncate block">
          {row.title}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <span className="text-xs text-muted-foreground line-clamp-1 text-left max-w-[340px] truncate block">
          {row.description}
        </span>
      ),
    },
    {
      key: "duration",
      label: "Duration",
      sortable: true,
      render: (row) => (
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-neutral-400" /> {row.duration} mins
        </span>
      ),
    },
    {
      key: "questionsCount",
      label: "Questions",
      sortable: true,
      render: (row) => (
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-neutral-400" /> {row.questionsCount} items
        </span>
      ),
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
        const isActive = row.status === "Active";
        const colorClass = isActive
          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10"
          : "bg-red-500/10 text-red-500 border-red-500/10";
        return (
          <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", colorClass)}>
            {row.status}
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

  // Card view rendering
  const renderAssessmentCard = (
    row: AssessmentRow,
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
        {/* Checkbox for batch actions */}
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

        {/* Card Header (Meta Details) */}
        <div className="flex items-center justify-between gap-2 pr-6">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
            <FileText className="w-3 h-3 text-neutral-400" /> {row.questionsCount} Questions
          </span>
          <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold border", diffColor)}>
            {diff}
          </span>
        </div>

        {/* Title & Description */}
        <div className="flex-1 min-h-[50px]">
          <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1 leading-relaxed">
            {row.title}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
            {row.description}
          </p>
        </div>

        <div className="h-px bg-neutral-200/50 dark:bg-neutral-800/50" />

        {/* Info Rows */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-neutral-400" /> {row.duration} Mins
          </span>
          <span className={cn(
            "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border",
            row.status === "Active"
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10"
              : "bg-red-500/10 text-red-500 border-red-500/10"
          )}>
            {row.status}
          </span>
        </div>

        {/* Card Footer Details */}
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

  return (
    <div className="w-full h-[calc(100vh-148px)] md:h-[calc(100vh-108px)] flex flex-col overflow-hidden -mb-[24px] md:-mb-[32px] relative">
      <DataTable
        data={filteredAssessments}
        columns={columns}
        searchPlaceholder="Search assessments..."
        searchKey="title"
        entityName="Assessment"
        filterConfigs={filterConfigs}
        onRowClick={handleRowClick}
        renderCard={renderAssessmentCard}
        primaryAction={{
          label: "Add Assessment",
          onClick: handleAddAssessment,
        }}
        searchQuery={search}
        onSearchChange={setSearch}
        onDeleteSelected={async (ids) => {
          setAssessments((prev) => prev.filter((a) => !ids.includes(a.id)));
          return true;
        }}
        tabs={tabs}
      />

      {/* Mobile Floating Action Button (FAB) */}
      <button
        onClick={handleAddAssessment}
        className="sm:hidden fixed bottom-20 right-6 z-40 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer border-0"
        aria-label="Add Assessment"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
