"use client";

import React from "react";
import { Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CompanyContactTabProps {
  formData: any;
  handleNestedChange: (category: "socials" | "contact", field: string, value: string) => void;
}

export function CompanyContactTab({ formData, handleNestedChange }: CompanyContactTabProps) {
  return (
    <div className="space-y-6 font-semibold text-left text-xs">
      <div className="space-y-0.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Contact Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            value={formData.contact.email}
            onChange={(e) => handleNestedChange("contact", "email", e.target.value)}
            placeholder="e.g. contact@company.com"
            className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
          />
        </div>
      </div>
      <div className="space-y-0.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Contact Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={formData.contact.phone}
            onChange={(e) => handleNestedChange("contact", "phone", e.target.value)}
            placeholder="e.g. +1 (555) 012-3456"
            className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl text-xs font-semibold"
          />
        </div>
      </div>
    </div>
  );
}
