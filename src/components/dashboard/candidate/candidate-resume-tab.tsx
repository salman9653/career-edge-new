"use client";

import React, { useRef, useState } from "react";
import { Upload, Trash2, Download, RefreshCw } from "lucide-react";
import { FaFilePdf, FaFileImage, FaFileWord, FaFile } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface CandidateResumeTabProps {
  formData: any;
  updateField: (key: string, value: any) => void;
  onResumeAutoSaved: (resumeName: string, resumeBase64: string) => void;
  updatedAt?: string;
}

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

export function CandidateResumeTab({ formData, updateField, onResumeAutoSaved, updatedAt }: CandidateResumeTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localLastUpdated, setLocalLastUpdated] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const getExtension = (fileName: string) => {
    if (!fileName) return "pdf";
    const parts = fileName.split(".");
    return parts[parts.length - 1].toLowerCase();
  };

  const getBase64Size = (base64String?: string) => {
    if (!base64String) return "0 KB";
    const base64Content = base64String.split(",")[1] || base64String;
    const padding = (base64Content.match(/=/g) || []).length;
    const sizeInBytes = (base64Content.length * 3) / 4 - padding;
    const sizeInKb = sizeInBytes / 1024;
    if (sizeInKb > 1024) {
      return `${(sizeInKb / 1024).toFixed(2)} MB`;
    }
    return `${sizeInKb.toFixed(2)} KB`;
  };

  const formatLastUpdated = (updatedAtStr?: string) => {
    if (localLastUpdated) return `Last updated: ${localLastUpdated}`;
    if (!updatedAtStr) return "Last updated: active profile CV";
    const date = new Date(updatedAtStr);
    if (isNaN(date.getTime())) return "Last updated: active profile CV";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffMonth / 12);
    
    if (diffSec < 60) return "Last updated: Just now";
    if (diffMin < 60) return `Last updated: ${diffMin} ${diffMin === 1 ? "minute" : "minutes"} ago`;
    if (diffHr < 24) return `Last updated: ${diffHr} ${diffHr === 1 ? "hour" : "hours"} ago`;
    if (diffDay < 30) return `Last updated: ${diffDay} ${diffDay === 1 ? "day" : "days"} ago`;
    if (diffMonth < 12) return `Last updated: ${diffMonth} ${diffMonth === 1 ? "month" : "months"} ago`;
    return `Last updated: ${diffYear} ${diffYear === 1 ? "year" : "years"} ago`;
  };

  const saveResumeToDb = async (resumeName: string, resumeBase64: string) => {
    setSaveStatus("saving");
    try {
      const body = {
        ...formData,
        resumeName,
        resumeBase64,
        jobTitle: formData.career.jobTitle || formData.jobTitle
      };
      
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      
      onResumeAutoSaved(resumeName, resumeBase64);
      setSaveStatus("saved");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    } catch (err) {
      console.error("Auto-save resume error:", err);
      setSaveStatus("error");
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      updateField("resumeName", file.name);
      updateField("resumeBase64", base64);
      setLocalLastUpdated("Just now");
      saveResumeToDb(file.name, base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveResume = () => {
    updateField("resumeName", "");
    updateField("resumeBase64", "");
    setLocalLastUpdated(null);
    saveResumeToDb("", "");
  };

  const handleDownload = () => {
    if (!formData.resumeBase64) return;
    const link = document.createElement("a");
    link.href = formData.resumeBase64;
    link.download = formData.resumeName || "resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateClick = () => {
    fileInputRef.current?.click();
  };

  const { Icon: FileIcon, colorClass } = getFileIconInfo(formData.resumeName || "");

  return (
    <div className="space-y-5 text-left text-foreground">
      {/* Title & Subtitle */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-foreground">Resume</h3>
          <p className="text-xs text-muted-foreground font-medium">
            Upload your latest resume. This will be used for AI analysis.
          </p>
        </div>
        {saveStatus !== "idle" && (
          <span className={`text-[10px] font-bold ${
            saveStatus === "saving" ? "text-indigo-500 animate-pulse" :
            saveStatus === "saved" ? "text-emerald-500" :
            "text-rose-500"
          }`}>
            {saveStatus === "saving" ? "Saving to database..." :
             saveStatus === "saved" ? "Saved successfully!" :
             "Failed to save"}
          </span>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleResumeUpload}
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp"
        className="hidden"
      />

      {formData.resumeName ? (
        <div className="relative flex flex-col items-center justify-center p-8 bg-neutral-100/5 dark:bg-neutral-900/5 rounded-3xl border border-neutral-200/40 dark:border-neutral-800/40 bg-neutral-50/20 dark:bg-[#07070b]/20">
          {/* Download Button in Top-Right Corner */}
          <Button
            type="button"
            onClick={handleDownload}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 w-9 h-9 rounded-full border border-neutral-200/50 dark:border-neutral-850/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer flex items-center justify-center text-foreground transition-all duration-200"
            title="Download Resume"
          >
            <Download className="w-4 h-4" />
          </Button>

          {/* Centered File Details */}
          <div className="flex flex-col items-center mt-3 mb-6">
            <FileIcon className={`w-14 h-16 ${colorClass} drop-shadow-md transition-transform duration-200 hover:scale-105`} />
            <span className="text-sm font-extrabold text-foreground mt-4 text-center truncate max-w-[280px] sm:max-w-md">
              {formData.resumeName}
            </span>
            <span className="text-[11px] text-muted-foreground font-semibold mt-1">
              Type: {getExtension(formData.resumeName)} • Size: {getBase64Size(formData.resumeBase64)}
            </span>
            <span className="text-[11px] text-muted-foreground/85 font-medium mt-1">
              {formatLastUpdated(updatedAt)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handleUpdateClick}
              variant="outline"
              size="sm"
              className="text-[11px] font-bold gap-2 h-9 px-4 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer transition-colors duration-200"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Update
            </Button>
            <Button
              type="button"
              onClick={handleRemoveResume}
              variant="destructive"
              size="sm"
              className="text-[11px] font-bold gap-2 h-9 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 border-none text-white cursor-pointer shadow-md shadow-rose-500/10 transition-colors duration-200"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/10 dark:bg-neutral-950/10 hover:bg-neutral-100/20 dark:hover:bg-neutral-900/20 px-6 py-12 rounded-3xl w-full cursor-pointer gap-2.5 transition-all">
          <div className="p-3.5 bg-primary/10 rounded-2xl text-primary mb-1">
            <Upload className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-foreground">Upload your resume</span>
          <span className="text-[10px] text-muted-foreground font-medium">
            Supports PDF, Word Documents, or Image formats (Max 2MB)
          </span>
          <input
            type="file"
            onChange={handleResumeUpload}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp"
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
