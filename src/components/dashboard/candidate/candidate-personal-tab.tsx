"use client";

import React, { useState } from "react";
import { User, Calendar, MapPin, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

interface CandidatePersonalTabProps {
  formData: any;
  updateField: (key: string, value: any) => void;
}

export function CandidatePersonalTab({ formData, updateField }: CandidatePersonalTabProps) {
  const handleAddressChange = (field: string, value: string) => {
    updateField("address", {
      ...formData.address,
      [field]: value
    });
  };

  const addLanguage = () => {
    const current = formData.languages || [];
    updateField("languages", [
      ...current,
      { language: "", proficiency: "Proficient", read: true, write: true, speak: true }
    ]);
  };

  const removeLanguage = (index: number) => {
    const current = formData.languages || [];
    updateField("languages", current.filter((_: any, i: number) => i !== index));
  };

  const handleLanguageFieldChange = (index: number, field: string, value: any) => {
    const current = formData.languages || [];
    const updated = current.map((l: any, i: number) => {
      if (i === index) {
        return { ...l, [field]: value };
      }
      return l;
    });
    updateField("languages", updated);
  };

  return (
    <div className="space-y-6 text-left font-semibold text-xs text-foreground">
      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Date of Birth</label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
            <DatePicker
              value={formData.dob}
              onChange={(val) => updateField("dob", val)}
              placeholder="Select date of birth"
              className="pl-11"
            />
          </div>
        </div>
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Gender</label>
          <Select
            value={formData.gender}
            onChange={(val) => updateField("gender", val)}
            options={["Male", "Female", "Other"]}
            placeholder="Select Gender"
            icon={<User className="w-4 h-4" />}
            className="h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold px-3.5"
          />
        </div>
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Marital Status</label>
          <Select
            value={formData.maritalStatus}
            onChange={(val) => updateField("maritalStatus", val)}
            options={["Single", "Married", "Divorced", "Widowed", "Prefer not to say"]}
            placeholder="Select Marital Status"
            icon={<User className="w-4 h-4" />}
            className="h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold px-3.5"
          />
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
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 6) {
                      handleAddressChange("pin", val);
                    }
                  }}
                  placeholder="PIN code"
                  className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-4 pt-4 border-t border-neutral-200/10 dark:border-neutral-855/30">
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-foreground">Language proficiency</h3>
          <p className="text-xs text-muted-foreground font-medium">
            Strengthen your resume by letting recruiters know you can communicate in multiple languages
          </p>
        </div>

        <div className="space-y-6">
          {(formData.languages || []).map((l: any, index: number) => (
            <div key={index} className="space-y-3 pb-6 border-b border-neutral-200/10 dark:border-neutral-850/20 last:border-b-0 last:pb-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">
                    Language <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={l.language}
                    onChange={(val) => handleLanguageFieldChange(index, "language", val)}
                    options={["English", "Hindi", "Spanish", "French", "German", "Mandarin", "Japanese", "Russian", "Arabic", "Portuguese", "Italian", "Korean", "Bengali", "Punjabi", "Marathi", "Telugu", "Tamil", "Gujarati", "Urdu", "Kannada", "Odia", "Malayalam"]}
                    placeholder="Select Language"
                    className="h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold px-3.5"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">
                    Proficiency <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={l.proficiency || "Proficient"}
                    onChange={(val) => handleLanguageFieldChange(index, "proficiency", val)}
                    options={["Beginner", "Intermediate", "Proficient", "Expert"]}
                    placeholder="Select Proficiency"
                    className="h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold px-3.5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pl-1">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!l.read}
                      onChange={(e) => handleLanguageFieldChange(index, "read", e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 accent-primary cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-foreground">Read</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!l.write}
                      onChange={(e) => handleLanguageFieldChange(index, "write", e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 accent-primary cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-foreground">Write</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!l.speak}
                      onChange={(e) => handleLanguageFieldChange(index, "speak", e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 accent-primary cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-foreground">Speak</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => removeLanguage(index)}
                  className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none p-0"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addLanguage}
            className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1.5 bg-transparent border-none p-0 mt-2"
          >
            + {(formData.languages || []).length > 0 ? "Add another language" : "Add language"}
          </button>
        </div>
      </div>
    </div>
  );
}
