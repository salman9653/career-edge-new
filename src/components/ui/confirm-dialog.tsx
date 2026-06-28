"use client";

import React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { Dialog } from "./dialog";
import { Button } from "./button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  
  // Icon based on variant
  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return (
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4 mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
      case "warning":
        return (
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 mb-4 mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mb-4 mx-auto">
            <Info className="w-6 h-6" />
          </div>
        );
    }
  };

  const getConfirmButtonStyles = () => {
    switch (variant) {
      case "destructive":
        return "bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer";
      case "warning":
        return "bg-yellow-500 hover:bg-yellow-600 text-white font-bold cursor-pointer";
      default:
        return "bg-primary hover:bg-primary/90 text-white font-bold cursor-pointer";
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-md text-center p-8">
      {getIcon()}
      <h3 className="text-lg font-extrabold text-foreground mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground mb-6 leading-relaxed max-w-sm mx-auto">
        {description}
      </p>
      
      <div className="flex gap-3 justify-center w-full">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 font-bold border border-neutral-200 dark:border-neutral-800 text-foreground cursor-pointer"
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className={`flex-1 ${getConfirmButtonStyles()}`}
        >
          {isLoading ? "Processing..." : confirmText}
        </Button>
      </div>
    </Dialog>
  );
}
