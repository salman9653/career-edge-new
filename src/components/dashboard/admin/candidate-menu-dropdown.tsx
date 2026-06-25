"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  MoreHorizontal, ChevronRight, User, Star, Gem, 
  Trash2, ShieldCheck, ShieldX, ShieldAlert, UserCheck
} from "lucide-react";
import { Button, Dialog } from "@/components/ui";
import { useToastStore } from "@/store/useToastStore";
import { useClickOutside } from "@/hooks/useClickOutside";

interface CandidateMenuDropdownProps {
  candidateId: string;
  currentStatus: string;
  currentPlan: string;
}

export function CandidateMenuDropdown({
  candidateId,
  currentStatus,
  currentPlan,
}: CandidateMenuDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    if (isOpen) {
      handleClose();
    }
  });

  const [activeSubmenu, setActiveSubmenu] = useState<"none" | "status" | "plan">("none");
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    | null
    | { type: "status"; value: string }
    | { type: "plan"; value: string }
    | { type: "delete" }
  >(null);

  const { addToast } = useToastStore();
  const router = useRouter();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setActiveSubmenu("none");
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveSubmenu("none");
  };

  const updateCandidate = async (updates: { status?: string; activePlan?: string }) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/candidates/${candidateId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update candidate");
      }

      addToast("Candidate details updated successfully", "success");
      router.refresh();
    } catch (error: any) {
      addToast(error.message || "An error occurred", "error");
    } finally {
      setIsUpdating(false);
      setPendingAction(null);
    }
  };

  const isStatusActive = currentStatus === "Active";
  const isStatusInactive = currentStatus === "Inactive";
  const isStatusBanned = currentStatus === "Banned";

  const isPlanFree = currentPlan === "Free";
  const isPlanPro = currentPlan === "candidate-pro";
  const isPlanProPlus = currentPlan === "candidate-pro+";

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleDropdown}
        className="rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200/30 dark:border-neutral-800/30 cursor-pointer"
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      {isOpen && (
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
                <div className="absolute right-[100%] top-0 mr-1.5 w-38 rounded-xl border border-neutral-200/80 dark:border-neutral-800 p-1.5 shadow-2xl z-50 bg-popover text-foreground animate-in fade-in slide-in-from-right-2 duration-150">
                  <button
                    onClick={() => {
                      setPendingAction({ type: "status", value: "Active" });
                      handleClose();
                    }}
                    disabled={isStatusActive || isUpdating}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors text-left ${
                      isStatusActive 
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                        : "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> Active
                    </div>
                    {isStatusActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </button>
                  <button
                    onClick={() => {
                      setPendingAction({ type: "status", value: "Inactive" });
                      handleClose();
                    }}
                    disabled={isStatusInactive || isUpdating}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors text-left ${
                      isStatusInactive 
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                        : "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldX className="w-4 h-4 text-amber-500" /> Inactive
                    </div>
                    {isStatusInactive && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  </button>
                  <button
                    onClick={() => {
                      setPendingAction({ type: "status", value: "Banned" });
                      handleClose();
                    }}
                    disabled={isStatusBanned || isUpdating}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors text-left ${
                      isStatusBanned 
                        ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                        : "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-red-500">
                      <ShieldAlert className="w-4 h-4 text-red-500" /> Banned
                    </div>
                    {isStatusBanned && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                  </button>
                </div>
              )}
            </div>

            {/* Change Plan sub-trigger */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSubmenu(activeSubmenu === "plan" ? "none" : "plan");
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Gem className="w-4 h-4 text-muted-foreground" />
                  <span>Change Plan</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              {activeSubmenu === "plan" && (
                <div className="absolute right-[100%] top-0 mr-1.5 w-38 rounded-xl border border-neutral-200/80 dark:border-neutral-800 p-1.5 shadow-2xl z-50 bg-popover text-foreground animate-in fade-in slide-in-from-right-2 duration-150">
                  <button
                    onClick={() => {
                      setPendingAction({ type: "plan", value: "Free" });
                      handleClose();
                    }}
                    disabled={isPlanFree || isUpdating}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors text-left ${
                      isPlanFree 
                        ? "bg-primary/10 text-primary border border-primary/20" 
                        : "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" /> Free
                    </div>
                    {isPlanFree && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </button>
                  <button
                    onClick={() => {
                      setPendingAction({ type: "plan", value: "candidate-pro" });
                      handleClose();
                    }}
                    disabled={isPlanPro || isUpdating}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors text-left ${
                      isPlanPro 
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                        : "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" /> Pro
                    </div>
                    {isPlanPro && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  </button>
                  <button
                    onClick={() => {
                      setPendingAction({ type: "plan", value: "candidate-pro+" });
                      handleClose();
                    }}
                    disabled={isPlanProPlus || isUpdating}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors text-left ${
                      isPlanProPlus 
                        ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" 
                        : "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Gem className="w-4 h-4 text-indigo-500" /> Pro+
                    </div>
                    {isPlanProPlus && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                  </button>
                </div>
              )}
            </div>

            <div className="h-px bg-neutral-200/30 dark:bg-neutral-800/30 my-1" />

            {/* Delete Candidate option */}
            <button
              onClick={() => {
                setPendingAction({ type: "delete" });
                handleClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors text-left"
            >
              <Trash2 className="w-4 h-4 text-red-500" /> Delete Candidate
            </button>
          </div>
      )}

      {/* Confirmation Modal */}
      {pendingAction && (
        <Dialog 
          isOpen={pendingAction !== null} 
          onClose={() => setPendingAction(null)}
          className="max-w-md"
        >
          <div className="space-y-4 text-left">
            <h3 className="text-lg font-bold text-foreground">
              {pendingAction.type === "delete" ? "Delete Candidate Profile" : "Confirm Changes"}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {pendingAction.type === "status" && (
                <>Are you sure you want to change the candidate's status to <span className="font-bold text-foreground">{pendingAction.value}</span>?</>
              )}
              {pendingAction.type === "plan" && (
                <>Are you sure you want to change the candidate's subscription plan to <span className="font-bold text-foreground">{pendingAction.value === "candidate-pro" ? "Pro" : pendingAction.value === "candidate-pro+" ? "Pro+" : "Free"}</span>?</>
              )}
              {pendingAction.type === "delete" && (
                <>Are you sure you want to delete this candidate? This action is permanent and cannot be undone.</>
              )}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPendingAction(null)}
                className="rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </Button>
              {pendingAction.type === "delete" ? (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled
                  className="rounded-xl font-bold cursor-not-allowed opacity-50"
                >
                  Delete (Disabled)
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => {
                    if (pendingAction.type === "status") {
                      updateCandidate({ status: pendingAction.value });
                    } else if (pendingAction.type === "plan") {
                      updateCandidate({ activePlan: pendingAction.value });
                    }
                  }}
                  className="rounded-xl font-bold cursor-pointer"
                >
                  {isUpdating ? "Confirming..." : "Confirm"}
                </Button>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
