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
}

export function CandidateProjectsTab({ formData, updateField }: CandidateProjectsTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProj, setNewProj] = useState<ProjectItem>({
    title: "",
    description: "",
    projectLink: "",
    role: "",
    teamSize: "",
    duration: "",
  });

  const handleAddProj = () => {
    if (!newProj.title.trim()) return;
    const current = formData.projects || [];
    updateField("projects", [...current, newProj]);
    setNewProj({
      title: "",
      description: "",
      projectLink: "",
      role: "",
      teamSize: "",
      duration: "",
    });
    setShowAddForm(false);
  };

  const removeProj = (index: number) => {
    const current = formData.projects || [];
    updateField("projects", current.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-6 text-left font-semibold text-xs text-foreground">
      <div className="flex justify-between items-center">
        <label className="text-[10px] uppercase text-muted-foreground">Projects</label>
        {!showAddForm && (
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
                size="sm"
                className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-250/20 dark:border-neutral-750/10 text-xs text-muted-foreground font-medium text-center">
            No projects listed yet. Click "Add Project" to add one.
          </div>
        )}
      </div>
    </div>
  );
}
