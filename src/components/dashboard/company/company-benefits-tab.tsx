"use client";

import React from "react";
import { 
  Heart, Laptop, Clock, Activity, Sparkles, Gift, BookOpen, Calendar,
  Coffee, Baby, Coins, Shield, Users, Car, GraduationCap, Smile
} from "lucide-react";

interface CompanyBenefitsTabProps {
  formData: any;
  toggleBenefit: (benefit: string) => void;
}

const BENEFIT_OPTIONS = [
  { name: "Health Insurance", icon: Heart },
  { name: "WFH / Remote Work", icon: Laptop },
  { name: "Flexible Hours", icon: Clock },
  { name: "Dental Care", icon: Activity },
  { name: "Gym & Wellness", icon: Sparkles },
  { name: "Performance Bonus", icon: Gift },
  { name: "Training & Mentorship", icon: BookOpen },
  { name: "Paid Time Off", icon: Calendar },
  { name: "Free Meals & Snacks", icon: Coffee },
  { name: "Maternity/Paternity Leave", icon: Baby },
  { name: "Stock Options / Equity", icon: Coins },
  { name: "Pension & 401(k)", icon: Shield },
  { name: "Team Outings", icon: Users },
  { name: "Commuter Benefits", icon: Car },
  { name: "Tuition Assistance", icon: GraduationCap },
  { name: "Pet-Friendly Office", icon: Smile }
];

export function CompanyBenefitsTab({ formData, toggleBenefit }: CompanyBenefitsTabProps) {
  return (
    <div className="space-y-4 text-left text-xs font-semibold">
      <label className="text-[10px] font-bold uppercase text-muted-foreground">Select Company Benefits & Perks</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {BENEFIT_OPTIONS.map(b => {
          const selected = formData.benefits.includes(b.name);
          const Icon = b.icon;
          return (
            <button
              key={b.name}
              type="button"
              onClick={() => toggleBenefit(b.name)}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border text-center cursor-pointer transition-all duration-200 gap-3 min-h-[120px] ${
                selected
                  ? "bg-primary/10 border-primary text-primary shadow-md shadow-primary/5"
                  : "bg-neutral-100/50 dark:bg-neutral-900/50 border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              }`}
            >
              <div className={`p-2 rounded-xl ${selected ? "bg-primary/20 text-primary" : "bg-neutral-200/50 dark:bg-neutral-800/50 text-muted-foreground"}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="block text-xs font-bold text-foreground">{b.name}</span>
                <span className="block text-[9px] text-muted-foreground font-medium">
                  {selected ? "Selected Perks" : "Click to select"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
