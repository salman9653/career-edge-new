"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, ColumnDef } from "@/components/dashboard/common";
import { User, CheckSquare, Square } from "lucide-react";
import Image from "next/image";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

interface CompanyRow {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  location: string;
  websiteUrl: string;
  companySize: string;
  companyType: string;
  subscription: string;
  status: string;
  jobsPosted: number;
  memberSince: string;
  image: string | null;
  email: string;
}

interface ManageCompaniesClientProps {
  companies: CompanyRow[];
}

export function ManageCompaniesClient({ companies: initialCompanies }: ManageCompaniesClientProps) {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyRow[]>(initialCompanies);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialCompanies.length === 20);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/companies?search=${encodeURIComponent(search)}&page=${nextPage}&limit=20`);
      const resData = await res.json();
      if (resData.data && Array.isArray(resData.data)) {
        if (resData.data.length < 20) {
          setHasMore(false);
        }
        setCompanies((prev) => [...prev, ...resData.data]);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more companies:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search === "") {
      setCompanies(initialCompanies);
      setPage(1);
      setHasMore(initialCompanies.length === 20);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/companies?search=${encodeURIComponent(search)}&page=1&limit=20`);
        const resData = await res.json();
        if (resData.data && Array.isArray(resData.data)) {
          setCompanies(resData.data);
          setPage(1);
          setHasMore(resData.data.length === 20);
        }
      } catch (err) {
        console.error("Failed to search companies:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [search, initialCompanies]);

  // Set TopBar details dynamically
  useEffect(() => {
    const { setHeader, clearHeader, setViewSwitcher } = useUIStore.getState();
    setHeader(
      "Manage Companies",
      "Overview of all active and pending employer accounts registered on the platform."
    );
    setViewSwitcher(true, "manage-company-view");
    return () => {
      clearHeader();
      setViewSwitcher(false);
    };
  }, []);

  const handleRowClick = (row: CompanyRow) => {
    router.push(`/dashboard/manage-companies/${row.id}`);
  };

  const columns: ColumnDef<CompanyRow>[] = [
    {
      key: "sNo",
      label: "S.No.",
      render: (_, index) => <span className="text-muted-foreground text-xs">{index + 1}</span>,
    },
    {
      key: "companyName",
      label: "Company Name",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {row.image ? (
              <Image src={row.image} alt={row.companyName} fill className="object-cover" />
            ) : (
              row.companyName.charAt(0).toUpperCase()
            )}
          </div>
          <span className="font-semibold text-foreground text-sm">{row.companyName}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-500/10">
          {row.status}
        </span>
      ),
    },
    {
      key: "subscription",
      label: "Subscription",
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
            {plan.replace("company-", "").toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "jobsPosted",
      label: "Jobs Posted",
      sortable: true,
      render: (row) => <span className="text-xs">{row.jobsPosted}</span>,
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

  const renderCompanyCard = (
    row: CompanyRow,
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

        {/* Company Profile Info */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shadow-sm border border-primary/10">
            {row.image ? (
              <Image src={row.image} alt={row.companyName} fill className="object-cover" />
            ) : (
              row.companyName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors truncate">
              {row.companyName}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">{row.email}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-200/50 dark:bg-neutral-800/50" />

        {/* Company Details */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Subscription</span>
            <div className="flex items-center gap-1.5 text-foreground">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-medium">{row.subscription}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Company Size</span>
            <span className="font-medium text-foreground">{row.companySize}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Company Type</span>
            <span className="font-medium text-foreground truncate">{row.companyType}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Jobs Posted</span>
            <span className="font-medium text-foreground">{row.jobsPosted}</span>
          </div>
          <div className="flex flex-col gap-1 col-span-2">
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
        data={companies}
        columns={columns}
        searchPlaceholder="Search companies..."
        searchKey="companyName"
        entityName="Company"
        onRowClick={handleRowClick}
        renderCard={renderCompanyCard}
        searchQuery={search}
        onSearchChange={setSearch}
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoadingMore={loading}
      />
    </div>
  );
}
