import React, { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useToastStore } from "@/store/useToastStore";
import { useRouter } from "next/navigation";

interface ChangePasswordProps {
  onBack: () => void;
  onClose: () => void;
}

export function ChangePassword({ onBack, onClose }: ChangePasswordProps) {
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast("Please fill in all password fields.", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast("New password and confirmation do not match.", "error");
      return;
    }
    if (newPassword.length < 8) {
      addToast("New password must be at least 8 characters.", "warning");
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        addToast(error.message || "Failed to change password.", "error");
      } else {
        addToast("Password changed successfully! Logging out...", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(async () => {
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                onClose();
                router.push("/");
                router.refresh();
              },
            },
          });
        }, 1500);
      }
    } catch (err) {
      console.error("Change password error:", err);
      addToast("An unexpected error occurred.", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground text-xs font-bold flex items-center gap-1.5 cursor-pointer mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Security
      </button>

      <div>
        <h4 className="text-lg font-bold text-foreground">Change Password</h4>
      </div>

      <div className="space-y-0.5">
        <h5 className="text-xs font-bold text-muted-foreground">Change Password</h5>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Update your account password. For security, you will be logged out after a successful password change.
        </p>
      </div>

      <div className="space-y-4">
        {/* Current Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Current Password</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              name="current-password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full h-10 rounded-xl border border-border bg-transparent pl-3 pr-10 text-xs text-foreground focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">New Password</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              name="new-password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full h-10 rounded-xl border border-border bg-transparent pl-3 pr-10 text-xs text-foreground focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirm-password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full h-10 rounded-xl border border-border bg-transparent pl-3 pr-10 text-xs text-foreground focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={changingPassword}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          {changingPassword ? "Changing Password..." : "Change Password"}
        </button>
      </div>
    </form>
  );
}
