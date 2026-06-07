import React from "react";
import { MessageSquare } from "lucide-react";

export function ChatSettings() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center h-full">
      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground mb-4">
        <MessageSquare className="w-6 h-6 animate-pulse" />
      </div>
      <h4 className="text-sm font-bold text-foreground">Chat Settings</h4>
      <p className="text-xs text-muted-foreground max-w-xs mt-1">
        The chat settings section is under development.
      </p>
    </div>
  );
}
