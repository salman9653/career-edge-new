"use client";

import React, { useState } from "react";
import { Plus, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CandidateSkillsTabProps {
  formData: any;
  updateField: (key: string, value: any) => void;
}

export function CandidateSkillsTab({ formData, updateField }: CandidateSkillsTabProps) {
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const current = formData.skills || [];
    if (current.includes(newSkill.trim())) return;
    updateField("skills", [...current, newSkill.trim()]);
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    const current = formData.skills || [];
    updateField("skills", current.filter((s: string) => s !== skill));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-6 text-left font-semibold text-xs text-foreground">
      <div className="space-y-4">
        <label className="text-[10px] uppercase text-muted-foreground block">Key Skills</label>
        <div className="space-y-4 bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="e.g. Next.js, Product Design, AWS"
                className="pl-10 h-9 text-xs"
              />
            </div>
            <Button
              type="button"
              onClick={addSkill}
              variant="secondary"
              className="h-9 px-3 rounded-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 rounded-xl bg-neutral-50/5 dark:bg-neutral-950/20 border border-neutral-200/5 dark:border-neutral-850/10">
            {(formData.skills || []).length > 0 ? (
              (formData.skills || []).map((s: string) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/10 text-[10px] font-bold text-primary"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-[10px] text-muted-foreground font-medium p-1">No skills added yet.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
