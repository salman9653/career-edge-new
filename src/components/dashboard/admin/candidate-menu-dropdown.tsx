"use client";

import React, { useState } from "react";
import { 
  MoreHorizontal, ChevronRight, Trash2, ShieldCheck, ShieldX, ShieldAlert, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function CandidateMenuDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<"none" | "status">("none");

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setActiveSubmenu("none");
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveSubmenu("none");
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleDropdown}
        className="rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200/30 dark:border-neutral-800/30 cursor-pointer"
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          {/* Overlay click-away listener */}
          <div className="fixed inset-0 z-40" onClick={handleClose} />
          
          <div className="absolute right-0 mt-2 w-48 rounded-xl glass border border-neutral-200/50 dark:border-neutral-800/50 p-1.5 shadow-2xl z-50 bg-background/95 backdrop-blur-md text-left font-semibold">
            {/* Change Status sub-trigger */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSubmenu(activeSubmenu === "status" ? "none" : "status");
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                  <span>Change Status</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              {activeSubmenu === "status" && (
                <div className="absolute right-[100%] top-0 mr-1.5 w-36 rounded-xl glass border border-neutral-200/50 dark:border-neutral-800/50 p-1.5 shadow-2xl z-50 bg-background/95 backdrop-blur-md animate-in fade-in slide-in-from-right-2 duration-150">
                  <button
                    onClick={handleClose}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg cursor-pointer transition-colors text-left"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Active
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg cursor-pointer transition-colors text-left"
                  >
                    <ShieldX className="w-4 h-4 text-amber-500" /> Inactive
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors text-left"
                  >
                    <ShieldAlert className="w-4 h-4 text-red-500" /> Banned
                  </button>
                </div>
              )}
            </div>

            <div className="h-px bg-neutral-200/30 dark:bg-neutral-800/30 my-1" />

            {/* Delete Candidate option */}
            <button
              onClick={handleClose}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors text-left"
            >
              <Trash2 className="w-4 h-4 text-red-500" /> Delete Candidate
            </button>
          </div>
        </>
      )}
    </div>
  );
}
