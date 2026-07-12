"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, ColumnDef } from "@/components/dashboard/common";
import Image from "next/image";
import { useUIStore } from "@/store/useUIStore";
import { CandidateRow } from "@/dummy-data/admin-manage_candidates_table";
import { CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface ManageCandidatesClientProps {
  candidates: CandidateRow[];
}

export function ManageCandidatesClient({ candidates: initialCandidates }: ManageCandidatesClientProps) {
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateRow[]>(initialCandidates);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialCandidates.length === 20);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/candidates?search=${encodeURIComponent(search)}&page=${nextPage}&limit=20`);
      const resData = await res.json();
      if (resData.data && Array.isArray(resData.data)) {
        if (resData.data.length < 20) {
          setHasMore(false);
        }
        setCandidates((prev) => [...prev, ...resData.data]);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more candidates:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search === "") {
      setCandidates(initialCandidates);
      setPage(1);
      setHasMore(initialCandidates.length === 20);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/candidates?search=${encodeURIComponent(search)}&page=1&limit=20`);
        const resData = await res.json();
        if (resData.data && Array.isArray(resData.data)) {
          setCandidates(resData.data);
          setPage(1);
          setHasMore(resData.data.length === 20);
        }
      } catch (err) {
        console.error("Failed to search candidates:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [search, initialCandidates]);

  // Set TopBar details dynamically
  useEffect(() => {
    const { setHeader, clearHeader, setViewSwitcher } = useUIStore.getState();
    setHeader(
      "Manage Candidates",
      "Overview of all active job seeker accounts registered on the platform."
    );
    setViewSwitcher(true, "manage-candidate-view");
    return () => {
      clearHeader();
      setViewSwitcher(false);
    };
  }, []);

  const handleRowClick = (row: CandidateRow) => {
    router.push(`/dashboard/candidates/${row.id}`);
  };


  const columns: ColumnDef<CandidateRow>[] = [
    {
      key: "sNo",
      label: "S.No.",
      render: (_, index) => <span className="text-muted-foreground text-xs">{index + 1}</span>,
    },
    {
      key: "name",
      label: "Candidate Name",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {row.image ? (
              <Image src={row.image} alt={row.name} fill className="object-cover" />
            ) : (
              row.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-foreground text-sm">{row.name}</span>
            <span className="text-[10px] text-muted-foreground">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "jobTitle",
      label: "Job Title",
      sortable: true,
      render: (row) => <span className="text-xs font-medium text-foreground">{row.jobTitle}</span>,
    },
    {
      key: "experience",
      label: "Experience",
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-foreground border border-neutral-200 dark:border-neutral-700">
          {row.experience}
        </span>
      ),
    },
    {
      key: "subscription",
      label: "Plan",
      sortable: true,
      render: (row) => {
        const plan = row.subscription || "Free";
        const isPremium = plan.includes("pro") || plan.includes("elite") || plan.includes("plus");
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
              isPremium
                ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                : "bg-neutral-100 dark:bg-neutral-800 text-muted-foreground border-neutral-200 dark:border-neutral-700"
            }`}
          >
            {plan.replace("candidate-", "").replace("company-", "").toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const isBanned = row.status === "Banned";
        const isInactive = row.status === "Inactive";
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              isBanned
                ? "bg-red-500/10 text-red-500 border-red-500/10"
                : isInactive
                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/10"
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/10"
            }`}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      key: "applicationsCount",
      label: "Applications",
      sortable: true,
      render: (row) => <span className="text-xs">{row.applicationsCount}</span>,
    },
    {
      key: "memberSince",
      label: "Member Since",
      sortable: true,
      render: (row) => {
        const date = new Date(row.memberSince);
        const formatted = date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        return <span className="text-xs text-muted-foreground">{formatted}</span>;
      },
    },
  ];

  const renderCandidateCard = (
    row: CandidateRow,
    isSelected: boolean,
    toggleSelect: (e: React.MouseEvent) => void,
    selectMode: boolean
  ) => {
    return (
      <div
        className={cn(
          "relative rounded-2xl glass border p-5 flex flex-col gap-4 transition-all duration-300 hover:shadow-lg group text-left h-full",
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

        {/* Candidate Profile Info */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shadow-sm border border-primary/10">
            {row.image ? (
              <Image src={row.image} alt={row.name} fill className="object-cover" />
            ) : (
              row.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors truncate">
              {row.name}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">{row.email}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-200/50 dark:bg-neutral-800/50" />

        {/* Candidate Details */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Job Title</span>
            <span className="font-medium text-foreground truncate">{row.jobTitle}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Experience</span>
            <div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-foreground border border-neutral-200 dark:border-neutral-700">
                {row.experience}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Applications</span>
            <span className="font-medium text-foreground">{row.applicationsCount}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Status</span>
            <div>
              {(() => {
                const isBanned = row.status === "Banned";
                const isInactive = row.status === "Inactive";
                return (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isBanned
                        ? "bg-red-500/10 text-red-500 border-red-500/10"
                        : isInactive
                        ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/10"
                        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/10"
                    }`}
                  >
                    {row.status}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Member Since (Footer style) */}
        <div className="mt-auto pt-2 text-[10px] text-muted-foreground flex justify-between items-center border-t border-neutral-100/50 dark:border-neutral-900/50">
          <span>Member Since</span>
          <span className="font-medium">
            {new Date(row.memberSince).toLocaleDateString("en-GB", {
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
    <div className="w-full h-[calc(100vh-88px)] sm:h-[calc(100vh-48px)] flex flex-col overflow-hidden -mb-[24px] sm:-mb-[32px]">
      <DataTable
        data={candidates}
        columns={columns}
        searchPlaceholder="Search candidates by name..."
        searchKey="name"
        entityName="Candidate"
        onRowClick={handleRowClick}
        renderCard={renderCandidateCard}
        searchQuery={search}
        onSearchChange={setSearch}
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoadingMore={loading}
      />
    </div>
  );
}
