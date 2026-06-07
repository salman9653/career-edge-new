import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/common/theme-provider";
import Navbar from "@/components/common/navbar";
import SignupModal from "@/components/auth/signup-modal";
import { Toaster } from "@/components/ui";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Career Edge",
    template: "%s | Career Edge",
  },
  description: "Accelerate your career search or streamline your hiring process. Connect top talent with leading companies through AI-driven matching, resume screening, and automated pipelines.",
  keywords: "hiring, jobs, career, recruiter, applicant tracking system, AI resume builder, career edge, job search",
  authors: [{ name: "Career Edge Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        <meta name="darkreader-lock" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <ThemeProvider>
          <Navbar />
          {children}
          <SignupModal />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
