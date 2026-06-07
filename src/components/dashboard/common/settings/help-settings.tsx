import React from "react";
import { ChevronRight } from "lucide-react";

export function HelpSettings() {
  const options = [
    { name: "What's New" },
    { name: "Give Feedback" },
    { name: "Contact Us" },
    { name: "Terms and Policies" },
    { name: "About Career Edge" },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div>
        <h4 className="text-lg font-bold text-foreground">Help & Support</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Get help, give feedback, or learn more about Career Edge.
        </p>
      </div>

      <div className="border-t border-border my-2" />

      {/* Options List */}
      <div className="space-y-1 max-w-2xl pt-2">
        {options.map((item) => (
          <button
            key={item.name}
            type="button"
            className="flex items-center justify-between w-full py-4 px-3.5 rounded-xl hover:bg-secondary/15 dark:hover:bg-secondary/25 transition-all text-left cursor-pointer group"
          >
            <span className="text-sm font-semibold text-foreground group-hover:text-primary dark:group-hover:text-white transition-colors">
              {item.name}
            </span>
            <ChevronRight className="w-4.5 h-4.5 text-muted-foreground group-hover:text-foreground transition-all group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
