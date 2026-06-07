"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";

interface CandidatePersonalFormProps {
  formData: any;
  updateField: (key: string, value: any) => void;
}

export function CandidatePersonalForm({ formData, updateField }: CandidatePersonalFormProps) {
  const [newLang, setNewLang] = useState("");

  const handleAddressChange = (field: string, value: string) => {
    updateField("address", {
      ...formData.address,
      [field]: value
    });
  };

  const addLanguage = () => {
    if (!newLang.trim()) return;
    const current = formData.languages || [];
    if (current.some((l: any) => l.language.toLowerCase() === newLang.trim().toLowerCase())) return;
    
    updateField("languages", [
      ...current,
      { language: newLang.trim(), read: true, write: false, speak: true }
    ]);
    setNewLang("");
  };

  const removeLanguage = (langName: string) => {
    const current = formData.languages || [];
    updateField("languages", current.filter((l: any) => l.language !== langName));
  };

  const toggleLangCapability = (langName: string, cap: "read" | "write" | "speak") => {
    const current = formData.languages || [];
    updateField("languages", current.map((l: any) => {
      if (l.language === langName) {
        return { ...l, [cap]: !l[cap] };
      }
      return l;
    }));
  };

  return (
    <div className="space-y-6 text-left font-semibold text-xs text-foreground">
      {/* General Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-muted-foreground">Full Name</label>
            <Input value={formData.name} onChange={(e) => updateField("name", e.target.value)} required className="h-9 text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-muted-foreground">Phone Number</label>
            <Input value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="9876567890" className="h-9 text-xs" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-muted-foreground">Location</label>
          <Input value={formData.location} onChange={(e) => updateField("location", e.target.value)} placeholder="e.g. New Delhi" className="h-9 text-xs" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-muted-foreground">Profile Summary</label>
          <textarea
            value={formData.bio}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("bio", e.target.value)}
            rows={3}
            placeholder="A short brief about your career profile..."
            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-xs font-medium leading-relaxed resize-none"
          />
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200/30 dark:border-neutral-855/30">
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-muted-foreground">Date of Birth</label>
          <Input value={formData.dob} onChange={(e) => updateField("dob", e.target.value)} placeholder="e.g. 07 Sep 2004" className="h-9 text-xs" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-muted-foreground">Gender</label>
          <Input value={formData.gender} onChange={(e) => updateField("gender", e.target.value)} placeholder="e.g. Male" className="h-9 text-xs" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-muted-foreground">Marital Status</label>
          <Input value={formData.maritalStatus} onChange={(e) => updateField("maritalStatus", e.target.value)} placeholder="e.g. Single" className="h-9 text-xs" />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4 pt-4 border-t border-neutral-200/30 dark:border-neutral-855/30">
        <label className="text-[10px] uppercase text-muted-foreground block">Permanent Address</label>
        <div className="space-y-3 bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-muted-foreground">Address Line</label>
            <Input value={formData.address.addressLine} onChange={(e) => handleAddressChange("addressLine", e.target.value)} className="h-9 text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase text-muted-foreground">City</label>
              <Input value={formData.address.city} onChange={(e) => handleAddressChange("city", e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase text-muted-foreground">State</label>
              <Input value={formData.address.state} onChange={(e) => handleAddressChange("state", e.target.value)} className="h-9 text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase text-muted-foreground">Country</label>
              <Input value={formData.address.country} onChange={(e) => handleAddressChange("country", e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase text-muted-foreground">PIN Code</label>
              <Input value={formData.address.pin} onChange={(e) => handleAddressChange("pin", e.target.value)} className="h-9 text-xs" />
            </div>
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-4 pt-4 border-t border-neutral-200/30 dark:border-neutral-855/30">
        <label className="text-[10px] uppercase text-muted-foreground block">Language Proficiency</label>
        <div className="bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20 space-y-3">
          <div className="flex gap-2">
            <Input value={newLang} onChange={(e) => setNewLang(e.target.value)} placeholder="e.g. English" className="h-9 text-xs" />
            <Button type="button" onClick={addLanguage} variant="secondary" className="h-9 px-3 rounded-lg"><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="space-y-2">
            {(formData.languages || []).map((l: any) => (
              <div key={l.language} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-neutral-200/10 dark:border-neutral-800/10">
                <span className="text-xs font-semibold">{l.language}</span>
                <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground">
                  {["read", "write", "speak"].map(cap => (
                    <label key={cap} className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={l[cap]} onChange={() => toggleLangCapability(l.language, cap as any)} className="w-3.5 h-3.5 accent-primary cursor-pointer" />
                      <span className="capitalize">{cap}</span>
                    </label>
                  ))}
                  <button type="button" onClick={() => removeLanguage(l.language)} className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors"><Trash className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
