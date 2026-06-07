"use client";

import React, { useState } from "react";
import { Plus, Trash, Briefcase, Building, Calendar, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const JOB_TYPE_OPTIONS = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" }
];

interface EmploymentItem {
  designation: string;
  company: string;
  jobProfile: string;
  joinedDate: string;
  leftDate: string;
  jobType: string;
  currentlyWorking: boolean;
}

interface CandidateEmploymentTabProps {
  formData: any;
  updateField: (key: string, value: any) => void;
}

export function CandidateEmploymentTab({ formData, updateField }: CandidateEmploymentTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmp, setNewEmp] = useState<EmploymentItem>({
    designation: "",
    company: "",
    jobProfile: "",
    joinedDate: "",
    leftDate: "",
    jobType: "Full-time",
    currentlyWorking: false,
  });

  const handleAddEmp = () => {
    if (!newEmp.designation.trim() || !newEmp.company.trim()) return;
    const current = formData.employment || [];
    updateField("employment", [...current, newEmp]);
    setNewEmp({
      designation: "",
      company: "",
      jobProfile: "",
      joinedDate: "",
      leftDate: "",
      jobType: "Full-time",
      currentlyWorking: false,
    });
    setShowAddForm(false);
  };

  const removeEmp = (index: number) => {
    const current = formData.employment || [];
    updateField("employment", current.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-6 text-left font-semibold text-xs text-foreground">
      <div className="flex justify-between items-center">
        <label className="text-[10px] uppercase text-muted-foreground">Employment History</label>
        {!showAddForm && (
          <Button
            type="button"
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="text-[10px] font-bold h-8 gap-1.5 rounded-lg cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Experience
          </Button>
        )}
      </div>

      {showAddForm && (
        <div className="p-4 bg-neutral-100/10 dark:bg-neutral-900/15 rounded-2xl border border-primary/20 dark:border-primary/30 space-y-4">
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider pl-1">New Employment Entry</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Designation</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={newEmp.designation}
                  onChange={(e) => setNewEmp(prev => ({ ...prev, designation: e.target.value }))}
                  placeholder="e.g. Lead UI Designer"
                  className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Company</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={newEmp.company}
                  onChange={(e) => setNewEmp(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="e.g. Google Inc"
                  className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Job Type</label>
              <Select
                value={newEmp.jobType}
                onChange={(val) => setNewEmp(prev => ({ ...prev, jobType: val }))}
                options={JOB_TYPE_OPTIONS}
                placeholder="Select Job Type"
                icon={<Briefcase className="w-3.5 h-3.5" />}
                className="h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold px-3.5"
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Joined Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={newEmp.joinedDate}
                  onChange={(e) => setNewEmp(prev => ({ ...prev, joinedDate: e.target.value }))}
                  placeholder="e.g. June 2023"
                  className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Left Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={newEmp.currentlyWorking ? "" : newEmp.leftDate}
                  onChange={(e) => setNewEmp(prev => ({ ...prev, leftDate: e.target.value }))}
                  placeholder="e.g. Present"
                  disabled={newEmp.currentlyWorking}
                  className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-1">
            <input
              type="checkbox"
              id="currentlyWorking"
              checked={newEmp.currentlyWorking}
              onChange={(e) => setNewEmp(prev => ({ ...prev, currentlyWorking: e.target.checked, leftDate: e.target.checked ? "Present" : "" }))}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <label htmlFor="currentlyWorking" className="text-[10px] text-foreground font-bold cursor-pointer select-none">
              I am currently working in this role
            </label>
          </div>

          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Job Profile Description</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-muted-foreground" />
              <textarea
                value={newEmp.jobProfile}
                onChange={(e) => setNewEmp(prev => ({ ...prev, jobProfile: e.target.value }))}
                rows={3}
                placeholder="Describe your role and accomplishments..."
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
              onClick={handleAddEmp}
              disabled={!newEmp.designation || !newEmp.company}
              size="sm"
              className="text-[10px] font-bold h-8 rounded-lg cursor-pointer"
            >
              Add Entry
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(formData.employment || []).length > 0 ? (
          (formData.employment || []).map((emp: EmploymentItem, index: number) => (
            <div
              key={index}
              className="flex justify-between items-start p-4 bg-neutral-100/10 dark:bg-neutral-900/10 rounded-2xl border border-neutral-200/20 dark:border-neutral-850/20 text-xs"
            >
              <div className="space-y-1.5 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-foreground text-sm">{emp.designation}</h4>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-wider">
                    {emp.jobType}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-muted-foreground/60" /> {emp.company}
                </p>
                <p className="text-[10px] text-muted-foreground/60 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" /> {emp.joinedDate} - {emp.currentlyWorking ? "Present" : emp.leftDate}
                </p>
                {emp.jobProfile && (
                  <p className="text-[11px] text-foreground/80 font-medium pt-1 border-t border-neutral-200/5 dark:border-neutral-850/5 mt-1 leading-relaxed">
                    {emp.jobProfile}
                  </p>
                )}
              </div>
              <Button
                type="button"
                onClick={() => removeEmp(index)}
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
            No employment history listed yet. Click "Add Experience" to add one.
          </div>
        )}
      </div>
    </div>
  );
}
