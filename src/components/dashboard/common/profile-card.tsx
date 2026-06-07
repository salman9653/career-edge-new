"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { User } from "@/types";
import { ChevronsUpDown } from "lucide-react";

interface ProfileCardProps {
  user: User;
  isCollapsed: boolean;
  onClick: () => void;
}

export function ProfileCard({ user, isCollapsed, onClick }: ProfileCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center p-3 rounded-2xl border-none hover:bg-neutral-200/60 dark:hover:bg-[#252c48] transition-all cursor-pointer bg-neutral-150/80 dark:bg-[#1c2237] text-left relative overflow-hidden group shadow-md",
        isCollapsed ? "justify-center" : "gap-3.5"
      )}
    >
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-gradient-from to-primary-gradient-to flex items-center justify-center text-white font-extrabold text-sm shadow-sm flex-shrink-0 transition-transform group-hover:scale-105 relative overflow-hidden">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            fill
            sizes="36px"
            className="object-cover"
          />
        ) : (
          user.name.charAt(0).toUpperCase()
        )}
      </div>
      {!isCollapsed && (
        <>
          <div className="flex flex-col min-w-0 flex-1 pr-1">
            <span className="text-xs font-bold text-foreground truncate">{user.name}</span>
            <span className="text-[10px] text-muted-foreground truncate leading-none mt-1">{user.email}</span>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </>
      )}
    </button>
  );
}
