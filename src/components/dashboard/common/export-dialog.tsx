"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entityName: string;
  selectMode: boolean;
  selectedCount: number;
  onConfirm: () => void;
}

export function ExportDialog({
  isOpen,
  onClose,
  entityName,
  selectMode,
  selectedCount,
  onConfirm,
}: ExportDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="space-y-4 text-left p-1">
        <h3 className="text-lg font-bold text-foreground">Export {entityName} List</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          This will export the{" "}
          {selectMode && selectedCount > 0
            ? `selected ${selectedCount}`
            : "currently visible list of"}{" "}
          {entityName.toLowerCase()}s as a CSV file. Are you sure you want to proceed?
        </p>
        <div className="flex justify-end gap-3 pt-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="h-10 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs cursor-pointer shadow-md shadow-amber-500/10"
          >
            Export
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
