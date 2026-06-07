"use client";

import React from "react";
import { FileSpreadsheet } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface ApplicationRow {
  id?: string;
  jobTitle: string;
  employerName: string;
  appliedDate: string;
  status: string;
}

interface CandidateProfileApplicationsProps {
  candidateName: string;
  applications?: ApplicationRow[];
}

function DummyTag() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-500/10 text-[7px] font-bold text-amber-500 dark:text-amber-400 border border-amber-500/15 ml-1.5 select-none uppercase tracking-wider scale-90 origin-left">
      dummy
    </span>
  );
}

export function CandidateProfileApplications({ candidateName, applications }: CandidateProfileApplicationsProps) {
  const isDummy = !applications || applications.length === 0;
  
  const applicationsList: ApplicationRow[] = applications && applications.length > 0 
    ? applications 
    : [
        {
          jobTitle: "Senior Software Engineer",
          employerName: "Stark Industries",
          appliedDate: "2025-05-26",
          status: "Shortlisted",
        },
        {
          jobTitle: "Full Stack Engineer (React/Node)",
          employerName: "Wayne Enterprises",
          appliedDate: "2025-05-28",
          status: "Under Review",
        },
        {
          jobTitle: "Cloud Solutions Architect",
          employerName: "Oscorp Technologies",
          appliedDate: "2025-06-01",
          status: "Applied",
        },
      ];

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("shortlist") || s.includes("hired") || s.includes("offer")) {
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/10";
    }
    if (s.includes("reject") || s.includes("decline")) {
      return "bg-red-500/10 text-red-500 border-red-500/10";
    }
    if (s.includes("review") || s.includes("interview")) {
      return "bg-amber-500/10 text-amber-500 border-amber-500/10";
    }
    return "bg-blue-500/10 text-blue-500 border-blue-500/10";
  };

  return (
    <Card className="rounded-3xl glass border shadow-xl p-2 bg-neutral-50/20 dark:bg-neutral-950/20 w-full text-left">
      <CardHeader className="pb-3 text-left">
        <CardTitle className="text-base font-extrabold flex items-center gap-2">
          <FileSpreadsheet className="w-4.5 h-4.5 text-primary animate-pulse" /> Application History
        </CardTitle>
        <CardDescription className="text-xs">
          Track active and past job applications submitted by {candidateName}.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto border-t border-neutral-200/20 dark:border-neutral-850/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200/40 dark:border-neutral-850/50 bg-neutral-50/25 dark:bg-neutral-950/25">
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">S.No.</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Job Title</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Employer</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date Applied</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100/50 dark:divide-neutral-900/50">
              {applicationsList.map((app, idx) => {
                const date = new Date(app.appliedDate);
                const formattedDate = date.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <tr
                    key={app.id || idx}
                    className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-all duration-200"
                  >
                    <td className="p-4 text-xs text-muted-foreground font-semibold">{idx + 1}</td>
                    <td className="p-4 text-sm font-semibold text-foreground">
                      {app.jobTitle} {isDummy && <DummyTag />}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground font-semibold">{app.employerName}</td>
                    <td className="p-4 text-xs text-muted-foreground font-medium">{formattedDate}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${getStatusStyle(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
