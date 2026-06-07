import React from "react";
import { ArrowLeft } from "lucide-react";

interface TwoFactorAuthProps {
  onBack: () => void;
}

export function TwoFactorAuth({ onBack }: TwoFactorAuthProps) {
  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground text-xs font-bold flex items-center gap-1.5 cursor-pointer mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Security
      </button>

      <div>
        <h4 className="text-lg font-bold text-foreground">Two-Factor Authentication (2FA)</h4>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          Add an extra layer of security to your account.
        </p>
      </div>

      <button
        disabled
        className="bg-primary/35 text-white/40 cursor-not-allowed font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 w-fit transition-all"
      >
        Enable 2FA (Coming Soon)
      </button>
    </div>
  );
}
