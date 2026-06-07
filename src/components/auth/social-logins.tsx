import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { SOCIAL_PROVIDERS } from "@/lib/constants";
import { GoogleIcon, GitHubIcon } from "@/components/common";

interface SocialLoginsProps {
  accountType?: "candidate" | "company" | "unselected";
}

export function SocialLogins({ accountType = "unselected" }: SocialLoginsProps) {
  const handleSocialSignIn = async (provider: "google" | "github") => {
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
        newUserCallbackURL: `/dashboard?social_signup=true&accountType=${accountType}`,
      });
    } catch (err) {
      console.error(`Failed to sign in with ${provider}:`, err);
    }
  };

  return (
    <>
      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-neutral-200 dark:border-neutral-800" />
        </div>
        <span className="relative bg-card px-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Or continue with
        </span>
      </div>

      {/* Social logins */}
      <div className="grid grid-cols-2 gap-3">
        {SOCIAL_PROVIDERS.map((provider) => (
          <Button
            key={provider.id}
            onClick={() => handleSocialSignIn(provider.id)}
            variant="outline"
            className="rounded-xl border-neutral-200 dark:border-neutral-800 font-bold h-11"
          >
            {provider.id === "google" ? (
              <GoogleIcon className="w-5 h-5 mr-2" />
            ) : (
              <GitHubIcon className="w-5 h-5 mr-2" />
            )}
            {provider.name}
          </Button>
        ))}
      </div>
    </>
  );
}
