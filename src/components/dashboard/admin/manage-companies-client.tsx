"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable, ColumnDef } from "@/components/dashboard/common";
import { User } from "lucide-react";
import Image from "next/image";
import { useUIStore } from "@/store/useUIStore";

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

export function ManageCompaniesClient({ companies }: ManageCompaniesClientProps) {
  const router = useRouter();

  // Set TopBar details dynamically
  useEffect(() => {
    const { setHeader, clearHeader } = useUIStore.getState();
    setHeader(
      "Manage Companies",
      "Overview of all active and pending employer accounts registered on the platform."
    );
    return () => clearHeader();
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
      render: (row) => (
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <User className="w-3.5 h-3.5" />
          <span>{row.subscription}</span>
        </div>
      ),
    },
    {
      key: "companySize",
      label: "Company Size",
      sortable: true,
      render: (row) => <span className="text-xs">{row.companySize}</span>,
    },
    {
      key: "companyType",
      label: "Company Type",
      sortable: true,
      render: (row) => <span className="text-xs">{row.companyType}</span>,
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

  return (
    <div className="w-full h-[calc(100vh-104px)] sm:h-[calc(100vh-112px)] flex flex-col overflow-hidden -mb-[40px] sm:-mb-[48px]">
      <DataTable
        data={companies}
        columns={columns}
        searchPlaceholder="Search companies..."
        searchKey="companyName"
        entityName="Company"
        onRowClick={handleRowClick}
      />
    </div>
  );
}
