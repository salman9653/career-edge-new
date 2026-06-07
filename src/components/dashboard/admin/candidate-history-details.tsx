"use client";

import React from "react";
import { Briefcase, GraduationCap, FolderGit2, FileText, Download, Calendar, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmploymentItem {
  designation: string;
  company: string;
  jobProfile: string;
  joinedDate: string;
  leftDate: string;
  jobType: string;
  currentlyWorking: boolean;
}

interface EducationItem {
  degree: string;
  school: string;
  passingYear: string;
  grade: string;
}

interface ProjectItem {
  title: string;
  description: string;
  projectLink: string;
  role: string;
  teamSize: string;
  duration: string;
}

interface CandidateDetails {
  resumeName?: string;
  resumeBase64?: string;
  employment?: EmploymentItem[];
  education?: EducationItem[];
  projects?: ProjectItem[];
}

interface CandidateHistoryDetailsProps {
  candidate: CandidateDetails;
}

const DummyTag = () => (
  <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-500/10 text-[7px] font-bold text-amber-500 dark:text-amber-400 border border-amber-500/15 ml-1.5 uppercase select-none tracking-wider scale-90 origin-left">
    dummy
  </span>
);

export function CandidateHistoryDetails({ candidate }: CandidateHistoryDetailsProps) {
  const handleDownload = () => {
    if (!candidate.resumeBase64) return;
    const link = document.createElement("a");
    link.href = candidate.resumeBase64;
    link.download = candidate.resumeName || "resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasResume = !!candidate.resumeBase64;
  const hasEmployment = candidate.employment && candidate.employment.length > 0;
  const hasEducation = candidate.education && candidate.education.length > 0;
  const hasProjects = candidate.projects && candidate.projects.length > 0;

  return (
    <div className="space-y-6 pt-5 border-t border-neutral-200/30 dark:border-neutral-850/50">
      {/* Resume Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-primary" /> Resume {!hasResume && <DummyTag />}
        </h3>
        <div className="flex items-center justify-between p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                {hasResume ? candidate.resumeName : "Resume_CV_2026.pdf"}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">
                {hasResume ? "Uploaded PDF/Document" : "Fallback sample resume document"}
              </p>
            </div>
          </div>
          {hasResume ? (
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="text-[10px] font-bold gap-1.5 h-8 rounded-lg cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </Button>
          ) : (
            <Button
              disabled
              variant="ghost"
              size="sm"
              className="text-[10px] font-bold gap-1.5 h-8 rounded-lg text-muted-foreground/50"
            >
              <Download className="w-3.5 h-3.5" /> Not Uploaded
            </Button>
          )}
        </div>
      </div>

      {/* Employment Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-primary" /> Employment History {!hasEmployment && <DummyTag />}
        </h3>
        <div className="space-y-3">
          {hasEmployment ? (
            candidate.employment!.map((emp, idx) => (
              <div key={idx} className="p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-foreground">{emp.designation}</h4>
                    <p className="text-[11px] text-primary font-semibold">{emp.company}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-neutral-200/40 dark:bg-neutral-800/60 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    {emp.jobType || "Full-time"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{emp.joinedDate}</span>
                  <span>–</span>
                  <span>{emp.currentlyWorking ? "Present" : emp.leftDate}</span>
                </div>
                {emp.jobProfile && (
                  <p className="text-[11px] text-foreground/80 font-medium pt-1 leading-relaxed">
                    {emp.jobProfile}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20 text-xs text-muted-foreground font-medium">
              No employment history listed.
            </div>
          )}
        </div>
      </div>

      {/* Education Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-primary" /> Education {!hasEducation && <DummyTag />}
        </h3>
        <div className="space-y-3">
          {hasEducation ? (
            candidate.education!.map((edu, idx) => (
              <div key={idx} className="p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20 space-y-1.5 text-xs">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-foreground">{edu.degree}</h4>
                  <span className="text-[10px] text-primary font-bold">{edu.grade || "N/A"}</span>
                </div>
                <p className="text-[11px] text-muted-foreground font-semibold">{edu.school}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70 font-medium">
                  <Calendar className="w-3.5 h-3.5" /> Passing Year: {edu.passingYear}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20 text-xs text-muted-foreground font-medium">
              No education credentials listed.
            </div>
          )}
        </div>
      </div>

      {/* Projects Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <FolderGit2 className="w-4 h-4 text-primary" /> Projects {!hasProjects && <DummyTag />}
        </h3>
        <div className="space-y-3">
          {hasProjects ? (
            candidate.projects!.map((project, idx) => (
              <div key={idx} className="p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-foreground">{project.title}</h4>
                  {project.projectLink && (
                    <a
                      href={project.projectLink.startsWith("http") ? project.projectLink : `https://${project.projectLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-[10px] font-bold"
                    >
                      View Project <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground font-medium bg-neutral-50/50 dark:bg-neutral-950/30 p-2 rounded-xl border border-neutral-200/10 dark:border-neutral-800/10">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/60 font-bold">Role</span>
                    <span className="font-bold text-foreground">{project.role || "Developer"}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/60 font-bold">Team Size</span>
                    <span className="font-bold text-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {project.teamSize || "1"}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/60 font-bold">Duration</span>
                    <span className="font-bold text-foreground">{project.duration || "1 month"}</span>
                  </div>
                </div>
                {project.description && (
                  <p className="text-[11px] text-foreground/80 font-medium leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20 text-xs text-muted-foreground font-medium">
              No projects listed.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
