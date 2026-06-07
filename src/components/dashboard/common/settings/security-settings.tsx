import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { ChangePassword } from "./change-password";
import { TwoFactorAuth } from "./two-factor-auth";

interface SecuritySettingsProps {
  activeTab: string;
  onClose: () => void;
}

export function SecuritySettings({ activeTab, onClose }: SecuritySettingsProps) {
  const [securityView, setSecurityView] = useState<"menu" | "change-password" | "2fa">("menu");

  // Reset view on tab change
  useEffect(() => {
    setSecurityView("menu");
  }, [activeTab]);

  if (securityView === "change-password") {
    return <ChangePassword onBack={() => setSecurityView("menu")} onClose={onClose} />;
  }

  if (securityView === "2fa") {
    return <TwoFactorAuth onBack={() => setSecurityView("menu")} />;
  }

  return (
    <>
      <div>
        <h4 className="text-lg font-bold text-foreground">Security</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your account's security settings.
        </p>
      </div>

      <div className="space-y-1">
        <button
          onClick={() => setSecurityView("change-password")}
          className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-secondary/40 dark:hover:bg-secondary/20 transition-all text-left cursor-pointer group"
        >
          <span className="text-sm font-semibold text-foreground">Change Password</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>

        <button
          onClick={() => setSecurityView("2fa")}
          className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-secondary/40 dark:hover:bg-secondary/20 transition-all text-left cursor-pointer group"
        >
          <span className="text-sm font-semibold text-foreground">Two-Factor Authentication (2FA)</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </div>
    </>
  );
}
