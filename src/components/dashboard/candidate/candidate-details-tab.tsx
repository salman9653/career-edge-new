"use client";

import React, { useRef } from "react";
import { User, Phone, MapPin, FileText, Upload, Trash2 } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";

interface CandidateDetailsTabProps {
  formData: any;
  updateField: (key: string, value: any) => void;
}

export function CandidateDetailsTab({ formData, updateField }: CandidateDetailsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateField("image", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    updateField("image", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 text-left font-semibold text-xs text-foreground">
      {/* Profile Picture */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block pl-1">Profile Picture</label>
        <div className="flex items-center gap-6 bg-neutral-100/10 dark:bg-neutral-900/10 p-5 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center text-primary text-4xl font-extrabold shadow-md border border-neutral-200/50 dark:border-neutral-800/50 shrink-0">
            {formData.image ? (
              <Image src={formData.image} alt={formData.name || "Avatar"} fill className="object-cover" />
            ) : (
              formData.name ? formData.name.charAt(0).toUpperCase() : "U"
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-3">
              {formData.image ? (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-5 h-11 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Upload className="w-4 h-4" /> Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex items-center gap-2 px-5 h-11 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-5 h-11 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  <Upload className="w-4 h-4" /> Upload Photo
                </button>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold pl-1">PNG, JPG or GIF. Max 2MB.</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Basic Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="e.g. 9876567890"
              className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      <div className="space-y-0.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Location</label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={formData.location}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="e.g. New Delhi"
            className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
          />
        </div>
      </div>

      <div className="space-y-0.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Profile Summary</label>
        <div className="relative">
          <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
          <textarea
            value={formData.bio}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("bio", e.target.value)}
            rows={4}
            placeholder="A short brief about your career profile..."
            className="flex min-h-[100px] w-full rounded-xl border border-input bg-neutral-50/50 dark:bg-neutral-900/40 pl-11 pr-3 py-3 text-xs font-medium leading-relaxed resize-none focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>
    </div>
  );
}
