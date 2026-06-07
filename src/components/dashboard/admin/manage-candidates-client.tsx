"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable, ColumnDef } from "@/components/dashboard/common";
import Image from "next/image";
import { useUIStore } from "@/store/useUIStore";
import { CandidateRow } from "@/dummy-data/admin-manage_candidates_table";

interface ManageCandidatesClientProps {
  candidates: CandidateRow[];
}

export function ManageCandidatesClient({ candidates }: ManageCandidatesClientProps) {
  const router = useRouter();

  // Set TopBar details dynamically
  useEffect(() => {
    const { setHeader, clearHeader } = useUIStore.getState();
    setHeader(
      "Manage Candidates",
      "Overview of all active job seeker accounts registered on the platform."
    );
    return () => clearHeader();
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

  return (
    <div className="w-full h-[calc(100vh-104px)] sm:h-[calc(100vh-112px)] flex flex-col overflow-hidden -mb-[40px] sm:-mb-[48px]">
      <DataTable
        data={candidates}
        columns={columns}
        searchPlaceholder="Search candidates by name..."
        searchKey="name"
        entityName="Candidate"
        onRowClick={handleRowClick}
      />
    </div>
  );
}
