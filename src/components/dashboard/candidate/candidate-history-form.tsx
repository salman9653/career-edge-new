"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Briefcase, GraduationCap, Code } from "lucide-react";

interface CandidateHistoryFormProps {
  formData: any;
  updateField: (key: string, value: any) => void;
}

export function CandidateHistoryForm({ formData, updateField }: CandidateHistoryFormProps) {
  const [emp, setEmp] = useState({ designation: "", company: "", joinedDate: "", leftDate: "" });
  const [edu, setEdu] = useState({ degree: "", school: "", passingYear: "", grade: "" });
  const [proj, setProj] = useState({ title: "", description: "", link: "", role: "" });

  const addEmployment = () => {
    if (!emp.designation || !emp.company) return;
    updateField("employment", [...(formData.employment || []), emp]);
    setEmp({ designation: "", company: "", joinedDate: "", leftDate: "" });
  };

  const addEducation = () => {
    if (!edu.degree || !edu.school) return;
    updateField("education", [...(formData.education || []), edu]);
    setEdu({ degree: "", school: "", passingYear: "", grade: "" });
  };

  const addProject = () => {
    if (!proj.title) return;
    updateField("projects", [...(formData.projects || []), proj]);
    setProj({ title: "", description: "", link: "", role: "" });
  };

  return (
    <div className="space-y-6 text-left font-semibold text-xs text-foreground">
      {/* Work History */}
      <div className="space-y-3">
        <label className="text-[10px] uppercase text-muted-foreground flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-primary" /> Work History</label>
        <div className="bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input value={emp.designation} onChange={e => setEmp({...emp, designation: e.target.value})} placeholder="Designation" className="h-9 text-xs" />
            <Input value={emp.company} onChange={e => setEmp({...emp, company: e.target.value})} placeholder="Company" className="h-9 text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input value={emp.joinedDate} onChange={e => setEmp({...emp, joinedDate: e.target.value})} placeholder="Joined Date (e.g. June 2023)" className="h-9 text-xs" />
            <Input value={emp.leftDate} onChange={e => setEmp({...emp, leftDate: e.target.value})} placeholder="Left Date (or Present)" className="h-9 text-xs" />
          </div>
          <Button type="button" onClick={addEmployment} variant="secondary" className="h-9 w-full rounded-xl"><Plus className="w-4 h-4 mr-1" /> Add Job</Button>
          <div className="space-y-2 mt-2">
            {(formData.employment || []).map((e: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-white/5 border border-neutral-200/10 dark:border-neutral-800/10 text-[11px]">
                <span>{e.designation} at <strong className="text-foreground">{e.company}</strong> ({e.joinedDate} - {e.leftDate})</span>
                <button type="button" onClick={() => updateField("employment", formData.employment.filter((_: any, idx: number) => idx !== i))} className="text-rose-500 hover:bg-rose-500/10 p-1 rounded-lg"><Trash className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Academic Background */}
      <div className="space-y-3 pt-4 border-t border-neutral-200/30 dark:border-neutral-855/30">
        <label className="text-[10px] uppercase text-muted-foreground flex items-center gap-1.5"><GraduationCap className="w-4.5 h-4.5 text-primary" /> Education History</label>
        <div className="bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input value={edu.degree} onChange={e => setEdu({...edu, degree: e.target.value})} placeholder="Degree / Course" className="h-9 text-xs" />
            <Input value={edu.school} onChange={e => setEdu({...edu, school: e.target.value})} placeholder="School / University" className="h-9 text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input value={edu.passingYear} onChange={e => setEdu({...edu, passingYear: e.target.value})} placeholder="Passing Year (e.g. 2022)" className="h-9 text-xs" />
            <Input value={edu.grade} onChange={e => setEdu({...edu, grade: e.target.value})} placeholder="Grade / CGPA" className="h-9 text-xs" />
          </div>
          <Button type="button" onClick={addEducation} variant="secondary" className="h-9 w-full rounded-xl"><Plus className="w-4 h-4 mr-1" /> Add Education</Button>
          <div className="space-y-2 mt-2">
            {(formData.education || []).map((e: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-white/5 border border-neutral-200/10 dark:border-neutral-800/10 text-[11px]">
                <span>{e.degree} from <strong className="text-foreground">{e.school}</strong> ({e.passingYear} | {e.grade})</span>
                <button type="button" onClick={() => updateField("education", formData.education.filter((_: any, idx: number) => idx !== i))} className="text-rose-500 hover:bg-rose-500/10 p-1 rounded-lg"><Trash className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="space-y-3 pt-4 border-t border-neutral-200/30 dark:border-neutral-855/30">
        <label className="text-[10px] uppercase text-muted-foreground flex items-center gap-1.5"><Code className="w-4 h-4 text-primary" /> Projects</label>
        <div className="bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input value={proj.title} onChange={e => setProj({...proj, title: e.target.value})} placeholder="Project Title" className="h-9 text-xs" />
            <Input value={proj.role} onChange={e => setProj({...proj, role: e.target.value})} placeholder="Your Role (e.g. Lead Dev)" className="h-9 text-xs" />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Input value={proj.description} onChange={e => setProj({...proj, description: e.target.value})} placeholder="Project Description" className="h-9 text-xs" />
            <Input value={proj.link} onChange={e => setProj({...proj, link: e.target.value})} placeholder="Project Link (e.g. GitHub / Live)" className="h-9 text-xs" />
          </div>
          <Button type="button" onClick={addProject} variant="secondary" className="h-9 w-full rounded-xl"><Plus className="w-4 h-4 mr-1" /> Add Project</Button>
          <div className="space-y-2 mt-2">
            {(formData.projects || []).map((e: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-white/5 border border-neutral-200/10 dark:border-neutral-800/10 text-[11px]">
                <span>{e.title} ({e.role})</span>
                <button type="button" onClick={() => updateField("projects", formData.projects.filter((_: any, idx: number) => idx !== i))} className="text-rose-500 hover:bg-rose-500/10 p-1 rounded-lg"><Trash className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
