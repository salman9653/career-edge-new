import { Dialog } from "@/components/ui/dialog";
import { User, Palette, MessageSquare, Bell, Shield, HelpCircle, Coins } from "lucide-react";
import { User as UserType } from "@/types";
import { SettingsSidebar } from "./settings-sidebar";
import { AccountSettings } from "./account-settings";
import { AppearanceSettings } from "./appearance-settings";
import { ChatSettings } from "./chat-settings";
import { NotificationsSettings } from "./notifications-settings";
import { SecuritySettings } from "./security-settings";
import { HelpSettings } from "./help-settings";
import { BillingSettings } from "./billing-settings";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { name: "Account", icon: User },
  { name: "Appearance", icon: Palette },
  { name: "Billing", icon: Coins },
  { name: "Chat", icon: MessageSquare },
  { name: "Notifications", icon: Bell },
  { name: "Security", icon: Shield },
  { name: "Help", icon: HelpCircle },
];

export function SettingsModal({
  isOpen,
  onClose,
  user,
  activeTab,
  onTabChange,
}: SettingsModalProps) {
  const allowedTabs = TABS.filter(t => {
    if (t.name === "Billing" && user?.accountType !== "company" && user?.accountType !== "candidate") return false;
    return true;
  });

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl h-[75vh] max-h-[640px] p-0 sm:p-0 overflow-hidden !bg-white dark:!bg-card text-foreground border-border shadow-2xl"
    >
      <div className="flex flex-row h-full w-full">
        {/* Sidebar Nav */}
        <SettingsSidebar
          tabs={allowedTabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />

        {/* Content Panel */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto h-full flex flex-col">
          <div className="space-y-6">
            {activeTab === "Account" && (
              <AccountSettings user={user} onClose={onClose} />
            )}

            {activeTab === "Appearance" && (
              <AppearanceSettings />
            )}

            {activeTab === "Billing" && (
              <BillingSettings />
            )}

            {activeTab === "Chat" && (
              <ChatSettings />
            )}

            {activeTab === "Notifications" && (
              <NotificationsSettings />
            )}

            {activeTab === "Security" && (
              <SecuritySettings activeTab={activeTab} onClose={onClose} />
            )}

            {activeTab === "Help" && (
              <HelpSettings />
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
