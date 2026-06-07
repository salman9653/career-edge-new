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
}

export function CandidateEducationTab({ formData, updateField }: CandidateEducationTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEdu, setNewEdu] = useState<EducationItem>({
    degree: "",
    school: "",
    passingYear: "",
    grade: "",
  });

  const handleAddEdu = () => {
    if (!newEdu.degree.trim() || !newEdu.school.trim()) return;
    const current = formData.education || [];
    updateField("education", [...current, newEdu]);
    setNewEdu({
      degree: "",
      school: "",
      passingYear: "",
      grade: "",
    });
    setShowAddForm(false);
  };

  const removeEdu = (index: number) => {
    const current = formData.education || [];
    updateField("education", current.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-6 text-left font-semibold text-xs text-foreground">
      <div className="flex justify-between items-center">
        <label className="text-[10px] uppercase text-muted-foreground">Education Credentials</label>
        {!showAddForm && (
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
                size="sm"
                className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-250/20 dark:border-neutral-750/10 text-xs text-muted-foreground font-medium text-center">
            No education credentials listed yet. Click "Add Education" to add one.
          </div>
        )}
      </div>
    </div>
  );
}
