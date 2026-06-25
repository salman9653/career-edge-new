"use client";

import React, { useState } from "react";
import { Plus, Trash, GraduationCap, Building, Calendar, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EducationItem {
  degree: string;
  school: string;
  passingYear: string;
  grade: string;
}

interface CandidateEducationTabProps {
  formData: any;
  updateField: (key: string, value: any) => void;
  onEducationAutoSaved: (updatedEducation: any[]) => void;
}

export function CandidateEducationTab({ formData, updateField, onEducationAutoSaved }: CandidateEducationTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [newEdu, setNewEdu] = useState<EducationItem>({
    degree: "",
    school: "",
    passingYear: "",
    grade: "",
  });

  const saveEducationToDb = async (updatedEducation: EducationItem[]) => {
    setSaveStatus("saving");
    try {
      const body = {
        ...formData,
        education: updatedEducation,
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
      
      onEducationAutoSaved(updatedEducation);
      setSaveStatus("saved");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    } catch (err) {
      console.error("Auto-save education error:", err);
      setSaveStatus("error");
    }
  };

  const handleAddEdu = () => {
    if (!newEdu.degree.trim() || !newEdu.school.trim()) return;
    const current = formData.education || [];
    const updated = [...current, newEdu];
    updateField("education", updated);
    setNewEdu({
      degree: "",
      school: "",
      passingYear: "",
      grade: "",
    });
    setShowAddForm(false);
    saveEducationToDb(updated);
  };

  const removeEdu = (index: number) => {
    const current = formData.education || [];
    const updated = current.filter((_: any, i: number) => i !== index);
    updateField("education", updated);
    saveEducationToDb(updated);
  };

  return (
    <div className="space-y-6 text-left font-semibold text-xs text-foreground">
      {/* Title & Subtitle */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-extrabold text-foreground">Education</h3>
            {saveStatus !== "idle" && (
              <span className={`text-[10px] font-bold ${
                saveStatus === "saving" ? "text-indigo-500 animate-pulse" :
                saveStatus === "saved" ? "text-emerald-500" :
                "text-rose-500"
              }`}>
                {saveStatus === "saving" ? "Saving..." :
                 saveStatus === "saved" ? "Saved!" :
                 "Failed to save"}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Detail your academic credentials.
          </p>
        </div>
        {!showAddForm && (formData.education || []).length > 0 && (
          <Button
            type="button"
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="text-[10px] font-bold h-8 gap-1.5 rounded-lg cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Education
          </Button>
        )}
      </div>

      {showAddForm && (
        <div className="p-4 bg-neutral-100/10 dark:bg-neutral-900/15 rounded-2xl border border-primary/20 dark:border-primary/30 space-y-4">
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider pl-1">New Education Entry</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Degree / Qualification</label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={newEdu.degree}
                  onChange={(e) => setNewEdu(prev => ({ ...prev, degree: e.target.value }))}
                  placeholder="e.g. B.Tech Computer Science"
                  className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">School / College / University</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={newEdu.school}
                  onChange={(e) => setNewEdu(prev => ({ ...prev, school: e.target.value }))}
                  placeholder="e.g. Stanford University"
                  className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Passing Year</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={newEdu.passingYear}
                  onChange={(e) => setNewEdu(prev => ({ ...prev, passingYear: e.target.value }))}
                  placeholder="e.g. 2024"
                  className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Grade / GPA / Percentage</label>
              <div className="relative">
                <Star className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={newEdu.grade}
                  onChange={(e) => setNewEdu(prev => ({ ...prev, grade: e.target.value }))}
                  placeholder="e.g. 3.8/4.0 or 85%"
                  className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200/10 dark:border-neutral-850/20">
            <Button
              type="button"
              onClick={() => setShowAddForm(false)}
              variant="ghost"
              size="sm"
              className="text-[10px] font-bold h-8 rounded-lg cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddEdu}
              disabled={!newEdu.degree || !newEdu.school}
              size="sm"
              className="text-[10px] font-bold h-8 rounded-lg cursor-pointer"
            >
              Add Entry
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(formData.education || []).length > 0 ? (
          (formData.education || []).map((edu: EducationItem, index: number) => (
            <div
              key={index}
              className="flex justify-between items-start p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-850/20 text-xs"
            >
              <div className="space-y-1 flex-1 pr-4">
                <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-primary" /> {edu.degree}
                </h4>
                <p className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-muted-foreground/60" /> {edu.school}
                </p>
                <div className="flex gap-4 text-[10px] text-muted-foreground/60 font-medium pt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-muted-foreground/60" /> Passing Year: {edu.passingYear}</span>
                  {edu.grade && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-muted-foreground/60" /> Grade: {edu.grade}</span>}
                </div>
              </div>
              <Button
                type="button"
                onClick={() => removeEdu(index)}
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-xl cursor-pointer shrink-0 flex items-center justify-center"
              >
                <Trash className="w-5 h-5" />
              </Button>
            </div>
          ))
        ) : !showAddForm ? (
          <div className="border border-dashed border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/20 dark:bg-neutral-950/10 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4">
            <GraduationCap className="w-10 h-10 text-slate-700 dark:text-slate-300 stroke-[1.5]" />
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-foreground">No Education Yet</h4>
              <p className="text-xs text-muted-foreground font-medium max-w-md">
                You haven't added any academic credentials yet. Add your education history.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setShowAddForm(true)}
              variant="secondary"
              className="text-xs font-bold px-5 py-2.5 h-10 rounded-xl gap-1.5 cursor-pointer shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-100/50 dark:bg-neutral-900/50 hover:bg-neutral-250/60 dark:hover:bg-neutral-800/80"
            >
              <Plus className="w-3.5 h-3.5" /> Add Education
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
