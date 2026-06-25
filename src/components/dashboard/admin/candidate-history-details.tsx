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

  if (!hasResume && !hasEmployment && !hasEducation && !hasProjects) return null;

  return (
    <div className="space-y-6 pt-5 border-t border-neutral-200/30 dark:border-neutral-850/50">
      {/* Resume Section */}
      {hasResume && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-primary" /> Resume
          </h3>
          <div className="flex items-center justify-between p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  {candidate.resumeName || "resume.pdf"}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  Uploaded PDF/Document
                </p>
              </div>
            </div>
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="text-[10px] font-bold gap-1.5 h-8 rounded-lg cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </Button>
          </div>
        </div>
      )}

      {/* Employment Section */}
      {hasEmployment && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-primary" /> Employment History
          </h3>
          <div className="space-y-3">
            {candidate.employment!.map((emp, idx) => (
              <div key={idx} className="p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-850/50 space-y-2 text-xs">
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
            ))}
          </div>
        </div>
      )}

      {/* Education Section */}
      {hasEducation && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-primary" /> Education
          </h3>
          <div className="space-y-3">
            {candidate.education!.map((edu, idx) => (
              <div key={idx} className="p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-850/50 space-y-1.5 text-xs">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-foreground">{edu.degree}</h4>
                  <span className="text-[10px] text-primary font-bold">{edu.grade || "N/A"}</span>
                </div>
                <p className="text-[11px] text-muted-foreground font-semibold">{edu.school}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70 font-medium">
                  <Calendar className="w-3.5 h-3.5" /> Passing Year: {edu.passingYear}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Section */}
      {hasProjects && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FolderGit2 className="w-4 h-4 text-primary" /> Projects
          </h3>
          <div className="space-y-3">
            {candidate.projects!.map((project, idx) => (
              <div key={idx} className="p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-850/50 space-y-2 text-xs">
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
