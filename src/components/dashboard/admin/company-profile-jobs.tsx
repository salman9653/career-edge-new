"use client";

import React from "react";
import { Briefcase } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface JobRow {
  id?: string;
  title: string;
  type: string;
  positions: number;
  status: string;
  postedOn: string;
}

interface CompanyProfileJobsProps {
  companyName: string;
  jobs?: JobRow[];
}

function DummyTag() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-500/10 text-[7px] font-bold text-amber-500 dark:text-amber-400 border border-amber-500/15 ml-1.5 select-none uppercase tracking-wider scale-90 origin-left">
      dummy
    </span>
  );
}

export function CompanyProfileJobs({ companyName, jobs }: CompanyProfileJobsProps) {
  const isDummy = !jobs || jobs.length === 0;
  const jobsList: JobRow[] = jobs && jobs.length > 0 
    ? jobs 
    : [
        {
          title: "Frontend Developer",
          type: "Full-time",
          positions: 2,
          status: "Live",
          postedOn: "02 Oct 2025"
        }
      ];

  return (
    <Card className="rounded-3xl glass border shadow-xl p-2 bg-neutral-50/20 dark:bg-neutral-950/20 w-full text-left">
      <CardHeader className="pb-3 text-left">
        <CardTitle className="text-base font-extrabold flex items-center gap-2">
          <Briefcase className="w-4.5 h-4.5 text-primary animate-pulse" /> Job Postings
        </CardTitle>
        <CardDescription className="text-xs">
          A list of all jobs posted by {companyName}.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto border-t border-neutral-200/20 dark:border-neutral-850/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200/40 dark:border-neutral-850/50 bg-neutral-50/25 dark:bg-neutral-950/25">
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">S.No.</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Job Title</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Positions</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Posted On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100/50 dark:divide-neutral-900/50">
              {jobsList.map((job, idx) => (
                <tr
                  key={job.id || idx}
                  onClick={() => {}}
                  className="cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-all duration-200"
                >
                  <td className="p-4 text-xs text-muted-foreground font-semibold">{idx + 1}</td>
                  <td className="p-4 text-sm font-semibold text-foreground flex items-center">
                    {job.title} {isDummy && <DummyTag />}
                  </td>
                  <td className="p-4 text-xs text-muted-foreground font-medium">{job.type}</td>
                  <td className="p-4 text-xs font-semibold text-foreground">{job.positions}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-orange-500/10 text-orange-500 dark:text-orange-400 border border-orange-500/10">
                      {job.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground font-medium">{job.postedOn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
