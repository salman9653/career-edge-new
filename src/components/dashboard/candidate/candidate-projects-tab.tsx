"use client";

import React, { useState } from "react";
import { Plus, Trash, FolderGit2, Link2, User, Users, Clock, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProjectItem {
  title: string;
  description: string;
  projectLink: string;
  role: string;
  teamSize: string;
  duration: string;
}

interface CandidateProjectsTabProps {
  formData: any;
  updateField: (key: string, value: any) => void;
  onProjectsAutoSaved: (updatedProjects: any[]) => void;
}

export function CandidateProjectsTab({ formData, updateField, onProjectsAutoSaved }: CandidateProjectsTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [newProj, setNewProj] = useState<ProjectItem>({
    title: "",
    description: "",
    projectLink: "",
    role: "",
    teamSize: "",
    duration: "",
  });

  const saveProjectsToDb = async (updatedProjects: ProjectItem[]) => {
    setSaveStatus("saving");
    try {
      const body = {
        ...formData,
        projects: updatedProjects,
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
      
      onProjectsAutoSaved(updatedProjects);
      setSaveStatus("saved");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    } catch (err) {
      console.error("Auto-save projects error:", err);
      setSaveStatus("error");
    }
  };

  const handleAddProj = () => {
    if (!newProj.title.trim()) return;
    const current = formData.projects || [];
    const updated = [...current, newProj];
    updateField("projects", updated);
    setNewProj({
      title: "",
      description: "",
      projectLink: "",
      role: "",
      teamSize: "",
      duration: "",
    });
    setShowAddForm(false);
    saveProjectsToDb(updated);
  };

  const removeProj = (index: number) => {
    const current = formData.projects || [];
    const updated = current.filter((_: any, i: number) => i !== index);
    updateField("projects", updated);
    saveProjectsToDb(updated);
  };

  return (
    <div className="space-y-6 text-left font-semibold text-xs text-foreground">
      {/* Title & Subtitle */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-extrabold text-foreground">Projects</h3>
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
            Showcase your build history and work portfolio.
          </p>
        </div>
        {!showAddForm && (formData.projects || []).length > 0 && (
          <Button
            type="button"
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="text-[10px] font-bold h-8 gap-1.5 rounded-lg cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Project
          </Button>
        )}
      </div>

      {showAddForm && (
        <div className="p-4 bg-neutral-100/10 dark:bg-neutral-900/15 rounded-2xl border border-primary/20 dark:border-primary/30 space-y-4">
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider pl-1">New Project Entry</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Project Title</label>
              <div className="relative">
                <FolderGit2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={newProj.title}
                  onChange={(e) => setNewProj(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Chat App Redesign"
                  className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Project Link</label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={newProj.projectLink}
                  onChange={(e) => setNewProj(prev => ({ ...prev, projectLink: e.target.value }))}
                  placeholder="e.g. github.com/username/project"
                  className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Your Role</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={newProj.role}
                  onChange={(e) => setNewProj(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g. Lead Developer"
                  className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Team Size</label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={newProj.teamSize}
                  onChange={(e) => setNewProj(prev => ({ ...prev, teamSize: e.target.value }))}
                  placeholder="e.g. 5"
                  className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Duration</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={newProj.duration}
                  onChange={(e) => setNewProj(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g. 3 Months"
                  className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Project Description</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-muted-foreground" />
              <textarea
                value={newProj.description}
                onChange={(e) => setNewProj(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Describe your contributions and the technologies used..."
                className="flex min-h-[80px] w-full rounded-xl border border-input bg-neutral-50/50 dark:bg-neutral-900/40 pl-11 pr-3 py-3 text-xs font-medium leading-relaxed resize-none focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/30"
              />
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
              onClick={handleAddProj}
              disabled={!newProj.title}
              size="sm"
              className="text-[10px] font-bold h-8 rounded-lg cursor-pointer"
            >
              Add Entry
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(formData.projects || []).length > 0 ? (
          (formData.projects || []).map((proj: ProjectItem, index: number) => (
            <div
              key={index}
              className="flex justify-between items-start p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-850/20 text-xs"
            >
              <div className="space-y-2 flex-1 pr-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <FolderGit2 className="w-4 h-4 text-primary" /> {proj.title}
                  </h4>
                  {proj.projectLink && (
                    <a
                      href={proj.projectLink.startsWith("http") ? proj.projectLink : `https://${proj.projectLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-[10px] font-bold"
                    >
                      View Link <Link2 className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground/60 font-medium bg-neutral-50/50 dark:bg-neutral-950/20 p-2 rounded-xl border border-neutral-200/5 dark:border-neutral-850/10">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/50 font-bold mb-0.5">Role</span>
                    <span className="font-bold text-foreground flex items-center gap-1"><User className="w-3 h-3" /> {proj.role || "Developer"}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/50 font-bold mb-0.5">Team Size</span>
                    <span className="font-bold text-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {proj.teamSize || "1"}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/50 font-bold mb-0.5">Duration</span>
                    <span className="font-bold text-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {proj.duration || "N/A"}</span>
                  </div>
                </div>

                {proj.description && (
                  <p className="text-[11px] text-foreground/80 font-medium pt-1 leading-relaxed">
                    {proj.description}
                  </p>
                )}
              </div>
              <Button
                type="button"
                onClick={() => removeProj(index)}
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
            <FolderGit2 className="w-10 h-10 text-slate-700 dark:text-slate-300 stroke-[1.5]" />
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-foreground">No Projects Yet</h4>
              <p className="text-xs text-muted-foreground font-medium max-w-md">
                You haven't showcased any projects yet. Add your projects.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setShowAddForm(true)}
              variant="secondary"
              className="text-xs font-bold px-5 py-2.5 h-10 rounded-xl gap-1.5 cursor-pointer shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-100/50 dark:bg-neutral-900/50 hover:bg-neutral-250/60 dark:hover:bg-neutral-800/80"
            >
              <Plus className="w-3.5 h-3.5" /> Add Project
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
