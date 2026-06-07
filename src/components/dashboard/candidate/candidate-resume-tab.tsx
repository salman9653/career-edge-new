"use client";

import React from "react";
import { FileText, Upload, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CandidateResumeTabProps {
  formData: any;
  updateField: (key: string, value: any) => void;
}

export function CandidateResumeTab({ formData, updateField }: CandidateResumeTabProps) {
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateField("resumeName", file.name);
      updateField("resumeBase64", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveResume = () => {
    updateField("resumeName", "");
    updateField("resumeBase64", "");
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

  return (
    <div className="space-y-6 text-left font-semibold text-xs text-foreground">
      <div className="space-y-4">
        <label className="text-[10px] uppercase text-muted-foreground block">Resume Document</label>
        
        {formData.resumeName ? (
          <div className="flex items-center justify-between p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <div className="max-w-[280px] sm:max-w-md">
                <p className="text-xs font-bold text-foreground truncate">{formData.resumeName}</p>
                <p className="text-[10px] text-muted-foreground font-medium">Uploaded resume CV file</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="text-[10px] font-bold gap-1.5 h-8 rounded-lg cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </Button>
              <Button
                type="button"
                onClick={handleRemoveResume}
                variant="ghost"
                size="sm"
                className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border border-dashed border-neutral-250 dark:border-neutral-750 px-6 py-10 rounded-2xl hover:bg-neutral-100/20 w-full cursor-pointer gap-2 transition-all">
            <Upload className="w-8 h-8 text-muted-foreground mb-1" />
            <span className="text-xs font-bold text-foreground">Upload your resume</span>
            <span className="text-[10px] text-muted-foreground font-medium">Supports PDF, DOC, or DOCX formats (Max 2MB)</span>
            <input
              type="file"
              onChange={handleResumeUpload}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}
