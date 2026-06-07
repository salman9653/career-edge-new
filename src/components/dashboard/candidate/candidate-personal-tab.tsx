"use client";

import React, { useState } from "react";
import { User, Calendar, MapPin, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CandidatePersonalTabProps {
  formData: any;
  updateField: (key: string, value: any) => void;
}

export function CandidatePersonalTab({ formData, updateField }: CandidatePersonalTabProps) {
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
      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Date of Birth</label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={formData.dob}
              onChange={(e) => updateField("dob", e.target.value)}
              placeholder="e.g. 07 Sep 2004"
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Gender</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={formData.gender}
              onChange={(e) => updateField("gender", e.target.value)}
              placeholder="e.g. Male"
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Marital Status</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={formData.maritalStatus}
              onChange={(e) => updateField("maritalStatus", e.target.value)}
              placeholder="e.g. Single"
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block pl-1">Permanent Address</label>
        <div className="space-y-4 bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Address Line</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={formData.address.addressLine}
                onChange={(e) => handleAddressChange("addressLine", e.target.value)}
                placeholder="Street address, apartment, etc."
                className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">City</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={formData.address.city}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                  placeholder="City"
                  className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">State</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={formData.address.state}
                  onChange={(e) => handleAddressChange("state", e.target.value)}
                  placeholder="State"
                  className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">Country</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={formData.address.country}
                  onChange={(e) => handleAddressChange("country", e.target.value)}
                  placeholder="Country"
                  className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">PIN Code</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={formData.address.pin}
                  onChange={(e) => handleAddressChange("pin", e.target.value)}
                  placeholder="PIN code"
                  className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block pl-1">Language Proficiency</label>
        <div className="bg-neutral-100/10 dark:bg-neutral-900/10 p-4 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20 space-y-3">
          <div className="flex gap-2">
            <Input
              value={newLang}
              onChange={(e) => setNewLang(e.target.value)}
              placeholder="e.g. English, Spanish"
              className="h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold px-4 flex-grow"
            />
            <Button
              type="button"
              onClick={addLanguage}
              variant="secondary"
              className="h-11 px-4 rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {(formData.languages || []).map((l: any) => (
              <div
                key={l.language}
                className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-neutral-200/10 dark:border-neutral-800/10 text-xs"
              >
                <span className="font-semibold text-foreground pl-2">{l.language}</span>
                <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground pr-2">
                  {["read", "write", "speak"].map(cap => (
                    <label key={cap} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={l[cap]}
                        onChange={() => toggleLangCapability(l.language, cap as any)}
                        className="w-3.5 h-3.5 accent-primary cursor-pointer"
                      />
                      <span className="capitalize">{cap}</span>
                    </label>
                  ))}
                  <Button
                    type="button"
                    onClick={() => removeLanguage(l.language)}
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 p-0 rounded-lg cursor-pointer flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
