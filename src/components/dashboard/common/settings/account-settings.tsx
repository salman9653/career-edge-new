"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useToastStore } from "@/store/useToastStore";
import { CheckCircle, AlertCircle, User as UserIcon, Users, LogOut, Trash } from "lucide-react";
import { User as UserType } from "@/types";

interface AccountSettingsProps {
  user: UserType;
  onClose: () => void;
}

export function AccountSettings({ user, onClose }: AccountSettingsProps) {
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const [verifying, setVerifying] = useState(false);
  const isEmailVerified = user.emailVerified ?? false;

  const handleVerifyEmail = async () => {
    setVerifying(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: user.email,
        callbackURL: window.location.origin + "/dashboard",
      });
      if (error) {
        addToast(error.message || "Failed to send verification email.", "error");
      } else {
        addToast("Verification email has been sent successfully!", "success");
      }
    } catch (err) {
      console.error("Verification email error:", err);
      addToast("An error occurred while sending the verification email.", "error");
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            onClose();
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch (err) {
      console.error("Failed to sign out:", err);
      addToast("Failed to log out.", "error");
    }
  };

  const showAccountManagers = user.accountType === "admin" || user.accountType === "company";
  const accountManagersTitle = user.accountType === "admin" ? "App Account Managers" : "Company Account Managers";
  const accountManagersDesc = user.accountType === "admin"
    ? "Manage who has access to the application's account."
    : "Manage who has access to your company's account.";

  return (
    <>
      <div>
        <h4 className="text-base font-bold text-foreground">Account</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your account details and settings.
        </p>
      </div>

      <div className="border-t border-border my-4" />

      {/* Email Address Section */}
      <div className="space-y-2">
        <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</h5>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{user.email}</span>
          {isEmailVerified ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500">
              <CheckCircle className="w-3.5 h-3.5" /> Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500">
              <AlertCircle className="w-3.5 h-3.5" /> Unverified
            </span>
          )}
        </div>
        {!isEmailVerified && (
          <button
            onClick={handleVerifyEmail}
            disabled={verifying}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer mt-1"
          >
            {verifying ? "Sending..." : "Verify Email"}
          </button>
        )}
      </div>

      <div className="border-t border-border my-4" />

      {/* Profile Details Section */}
      <div className="space-y-3">
        <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Profile Details</h5>
        <p className="text-xs text-muted-foreground leading-relaxed">
          To update your display name, phone number, or profile picture, please visit your profile page.
        </p>
        <button
          onClick={() => {
            onClose();
            router.push("/dashboard/profile");
          }}
          className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 w-fit cursor-pointer"
        >
          <UserIcon className="w-4 h-4 text-muted-foreground" /> Go to my Profile
        </button>
      </div>

      {showAccountManagers && (
        <>
          <div className="border-t border-border my-4" />

          {/* Account Managers Section */}
          <div className="space-y-3">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Account Managers</h5>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {accountManagersDesc}
            </p>
            <button
              onClick={() => addToast(`Manage ${accountManagersTitle.toLowerCase()} is coming soon.`, "info")}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 w-fit cursor-pointer"
            >
              <Users className="w-4 h-4 text-muted-foreground" /> {accountManagersTitle}
            </button>
          </div>
        </>
      )}

      <div className="border-t border-border my-4" />

      {/* Log Out Section */}
      <div className="space-y-3">
        <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Log Out</h5>
        <p className="text-xs text-muted-foreground leading-relaxed">
          End your current session and return to the login screen.
        </p>
        <button
          onClick={handleLogout}
          className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 w-fit cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-muted-foreground" /> Log Out
        </button>
      </div>

      <div className="border-t border-border my-4" />

      {/* Delete Account Section */}
      <div className="space-y-3">
        <h5 className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Delete Account</h5>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          disabled
          className="bg-rose-500/10 text-rose-500/50 border border-rose-500/10 opacity-60 cursor-not-allowed font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 w-fit"
        >
          <Trash className="w-4 h-4" /> Delete My Account
        </button>
      </div>
    </>
  );
}
