"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FileText, Download, Eye, Calendar, User, MapPin, Pencil, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkedinIcon, GitHubIcon } from "@/components/common";
import { FaFilePdf, FaFileImage, FaFileWord, FaFile } from "react-icons/fa";
import { cn } from "@/lib/utils";

const getFileIconInfo = (fileName: string) => {
  if (!fileName) {
    return {
      Icon: FaFile,
      colorClass: "text-neutral-500 dark:text-neutral-400"
    };
  }
  const parts = fileName.split(".");
  const ext = parts[parts.length - 1].toLowerCase();
  switch (ext) {
    case "pdf":
      return {
        Icon: FaFilePdf,
        colorClass: "text-red-500 dark:text-red-400"
      };
    case "doc":
    case "docx":
      return {
        Icon: FaFileWord,
        colorClass: "text-blue-500 dark:text-blue-400"
      };
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
    case "svg":
      return {
        Icon: FaFileImage,
        colorClass: "text-emerald-500 dark:text-emerald-400"
      };
    default:
      return {
        Icon: FaFile,
        colorClass: "text-neutral-500 dark:text-neutral-400"
      };
  }
};

interface CandidateOwnProfileProps {
  candidate: any;
  emailVerified?: boolean;
}

export function CandidateOwnProfile({ candidate, emailVerified = false }: CandidateOwnProfileProps) {
  const router = useRouter();
  const { Icon: FileIcon, colorClass } = getFileIconInfo(candidate.resumeName || "");

  const career = candidate.career || {};
  const socials = candidate.socials || {};
  const languages = candidate.languages || [];
  
  const jobTitle = career.jobTitle || candidate.jobTitle || "";
  const currentCompany = career.currentCompany || "";
  const totalExperience = career.totalExperience ? `${career.totalExperience} ${Number(career.totalExperience) === 1 ? "year" : "years"}` : "";
  
  const getNoticePeriodLabel = (val: string) => {
    if (val === "0") return "Immediate";
    if (val === "15") return "15 Days";
    if (val === "30") return "1 Month";
    if (val === "45") return "45 Days";
    if (val === "60") return "2 Months";
    if (val === "90") return "3 Months";
    return val ? `${val} Days` : "";
  };
  const noticePeriod = getNoticePeriodLabel(career.noticePeriod);

  const workStatus = career.workStatus ? (
    career.workStatus === "student" ? "Student" :
    career.workStatus === "fresher" ? "Fresher" :
    career.workStatus === "experienced" ? "Experienced" : career.workStatus
  ) : "";
  const currentSalary = career.currentSalary ? `${career.currentSalary} LPA` : "";

  const github = socials.github || candidate.github || "";
  const linkedin = socials.linkedin || candidate.linkedin || "";

  let addressStr = "";
  if (candidate.address) {
    if (typeof candidate.address === "string") {
      addressStr = candidate.address;
    } else {
      addressStr = [
        candidate.address.addressLine,
        candidate.address.city,
        candidate.address.state,
        candidate.address.country,
        candidate.address.pin,
      ].filter(Boolean).join(", ");
    }
  }

  const firstEdu = candidate.education?.[0] || null;
  const moreEduCount = candidate.education ? candidate.education.length - 1 : 0;

  const handleDownload = () => {
    if (!candidate.resumeBase64) return;
    const link = document.createElement("a");
    link.href = candidate.resumeBase64;
    link.download = candidate.resumeName || "resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = () => {
    if (!candidate.resumeBase64) return;
    const win = window.open();
    if (win) {
      win.document.write(`<iframe src="${candidate.resumeBase64}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    }
  };

  return (
    <div className="w-full rounded-3xl glass border shadow-xl p-8 bg-neutral-50/20 dark:bg-neutral-950/20 space-y-8 text-left text-foreground">
      {/* Header Profile Info */}
      <div className="flex justify-between items-start border-b border-neutral-200/30 dark:border-neutral-850/50 pb-6">
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center text-primary text-3xl font-extrabold shadow-md border border-neutral-200/50 dark:border-neutral-800/50">
            {candidate.image ? (
              <Image src={candidate.image} alt={candidate.name} fill className="object-cover" />
            ) : (
              candidate.name?.charAt(0).toUpperCase() || "U"
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight">{candidate.name}</h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span>{candidate.email}</span>
              {emailVerified ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Verified
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold text-rose-500">
                  <AlertCircle className="w-4 h-4 text-rose-500" /> Unverified
                </span>
              )}
            </div>
            {candidate.phone && <p className="text-xs font-bold text-muted-foreground">{candidate.phone}</p>}
          </div>
        </div>
        <Button
          onClick={() => router.push("/dashboard/profile/edit")}
          variant="outline"
          size="sm"
          className="text-xs font-bold gap-1.5 h-9 rounded-xl cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit Profile
        </Button>
      </div>

      {/* Career Profile */}
      {(jobTitle || currentCompany || totalExperience || noticePeriod || workStatus || currentSalary) && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">Career Profile</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/15 dark:border-neutral-800/15 text-xs">
            {jobTitle && (<div><span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-1">Current Job Title</span><span className="font-bold">{jobTitle}</span></div>)}
            {currentCompany && (<div><span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-1">Current Company</span><span className="font-bold">{currentCompany}</span></div>)}
            {workStatus && (<div><span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-1">Work Status</span><span className="font-bold">{workStatus}</span></div>)}
            {totalExperience && (<div><span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-1">Total Years of Experience</span><span className="font-bold">{totalExperience}</span></div>)}
            {noticePeriod && (<div><span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-1">Notice Period</span><span className="font-bold">{noticePeriod}</span></div>)}
            {currentSalary && (<div><span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-1">Current Salary</span><span className="font-bold">{currentSalary}</span></div>)}
          </div>
        </div>
      )}

      {/* Resume Section */}
      {candidate.resumeName && candidate.resumeBase64 && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">Resume</h3>
          <div className="flex items-center justify-between p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/15 dark:border-neutral-800/15 text-xs">
            <div className="flex items-center gap-3">
              <FileIcon className={cn("w-7 h-7 shrink-0", colorClass)} />
              <div>
                <p className="font-bold text-foreground">{candidate.resumeName}</p>
                <p className="text-[10px] text-muted-foreground font-medium">Last updated: active profile CV</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleView} variant="outline" size="sm" className="text-[10px] font-bold gap-1.5 h-8 rounded-lg cursor-pointer">
                <Eye className="w-3.5 h-3.5" /> View
              </Button>
              <Button onClick={handleDownload} variant="outline" size="sm" className="text-[10px] font-bold gap-1.5 h-8 rounded-lg cursor-pointer">
                <Download className="w-3.5 h-3.5" /> Download
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Key Skills */}
      {candidate.skills && candidate.skills.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">Key Skills</h3>
          <div className="flex flex-wrap gap-1.5 p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/15 dark:border-neutral-800/15">
            {candidate.skills.map((s: string) => (
              <span key={s} className="px-2.5 py-1 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/10 text-[10px] font-bold text-primary">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Highest Education */}
      {firstEdu && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">Highest Education</h3>
          <div className="space-y-2">
            <div className="p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/15 dark:border-neutral-800/15 text-xs space-y-1">
              <h4 className="font-bold text-foreground text-sm">{firstEdu.degree}</h4>
              <p className="text-[11px] text-muted-foreground font-semibold">{firstEdu.school}</p>
              <p className="text-[10px] text-muted-foreground/60 font-medium">Passing Year: {firstEdu.passingYear} {firstEdu.grade ? `• Grade: ${firstEdu.grade}` : ""}</p>
            </div>
            {moreEduCount > 0 && (
              <p className="text-xs font-bold text-primary flex items-center gap-1 cursor-pointer hover:underline pl-1">
                + {moreEduCount} more education
              </p>
            )}
          </div>
        </div>
      )}

      {/* Online Profiles */}
      {(github || linkedin) && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">Online Profiles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/15 dark:border-neutral-800/15 text-xs font-medium">
            {github && (
              <a href={github.startsWith("http") ? github : `https://${github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                <GitHubIcon className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-col"><span className="text-[9px] text-muted-foreground font-bold uppercase">GitHub</span><span className="font-semibold">{github}</span></div>
              </a>
            )}
            {linkedin && (
              <a href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                <LinkedinIcon className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-col"><span className="text-[9px] text-muted-foreground font-bold uppercase">LinkedIn</span><span className="font-semibold">{linkedin}</span></div>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Personal Details */}
      {(candidate.dob || candidate.gender || candidate.maritalStatus || addressStr || languages.length > 0) && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-4 bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/15 dark:border-neutral-800/15 text-xs">
            {candidate.dob && (<div><span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-1">Date of Birth</span><span className="font-bold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {candidate.dob}</span></div>)}
            {candidate.gender && (<div><span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-1">Gender</span><span className="font-bold flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-muted-foreground" /> {candidate.gender}</span></div>)}
            {candidate.maritalStatus && (<div><span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-1">Marital Status</span><span className="font-bold flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-muted-foreground" /> {candidate.maritalStatus}</span></div>)}
            {addressStr && (
              <div className="col-span-1 md:col-span-3 border-t border-neutral-200/5 dark:border-neutral-850/10 pt-4">
                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-1">Address</span>
                <span className="font-bold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {addressStr}</span>
              </div>
            )}
            {languages.length > 0 && (
              <div className="col-span-1 md:col-span-3 border-t border-neutral-200/5 dark:border-neutral-850/10 pt-4">
                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-2">Languages</span>
                <div className="flex flex-wrap gap-1.5">
                  {languages.map((l: any, i: number) => {
                    const capabilities = [];
                    if (l.read) capabilities.push("Read");
                    if (l.write) capabilities.push("Write");
                    if (l.speak) capabilities.push("Speak");
                    const capStr = capabilities.length > 0 ? ` (${capabilities.join(", ")})` : "";
                    return (<span key={i} className="px-2 py-0.5 rounded bg-primary/5 dark:bg-primary/10 border border-primary/10 text-[10px] font-bold text-primary">{l.language}{capStr}</span>);
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
