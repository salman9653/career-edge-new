import "server-only";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "./db";

import { sendEmail } from "./email";

if (!client) {
  throw new Error("MongoDB client is not initialized.");
}

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!githubClientId || !githubClientSecret) {
  console.warn("WARNING: GitHub OAuth credentials are not set in environment variables.");
}

if (!googleClientId || !googleClientSecret) {
  console.warn("WARNING: Google OAuth credentials are not set in environment variables.");
}

export const auth = betterAuth({
  database: mongodbAdapter(client.db(), {
    client,
  }),
  trustedOrigins: [
    "http://localhost:3000",
    "https://*.ngrok-free.dev",
    "https://*.ngrok-free.app",
    "https://*.localtunnel.me"
  ],
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendOnSignUp: false,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address - Career Edge",
        html: `
          <div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: auto; background-color: #030303; color: #f8fafc; border-radius: 16px; border: 1px solid #1f1f2e;">
            <h2 style="color: #818cf8; margin-top: 0;">Verify your Career Edge account</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
              Thank you for choosing Career Edge. Please verify your email address to ensure account security and access all dashboard features.
            </p>
            <div style="margin: 24px 0;">
              <a href="${url}" style="background-color: #818cf8; color: #0f0f12; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 12px; display: inline-block; font-size: 14px;">
                Verify Email Address
              </a>
            </div>
            <p style="font-size: 12px; color: #5e6675;">
              If you didn't request this email, you can safely ignore it.
            </p>
          </div>
        `,
      });
    },
  },
  socialProviders: {
    github: {
      clientId: githubClientId || "dummy-github-id",
      clientSecret: githubClientSecret || "dummy-github-secret",
    },
    google: {
      clientId: googleClientId || "dummy-google-id",
      clientSecret: googleClientSecret || "dummy-google-secret",
    },
  },
  user: {
    additionalFields: {
      accountType: {
        type: "string",
        required: true,
        defaultValue: "unselected", // 'unselected', 'candidate', 'company', or 'admin'
      },
      // Onboarding state tracking
      isOnboarded: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      onboardingSkipped: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },
});
