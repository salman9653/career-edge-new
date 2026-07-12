import { Sparkles, Target, Compass, Video, Users, Cpu, LayoutGrid, Calendar } from "lucide-react";

export const NAVIGATION_LINKS = [
  { label: "Features", href: "#features" },
  { label: "CTA", href: "#cta" },
];

export const SOCIAL_PROVIDERS = [
  { id: "google" as const, name: "Google" },
  { id: "github" as const, name: "GitHub" },
];

export const ACCOUNT_TYPES = [
  {
    id: "candidate" as const,
    title: "I am a Candidate",
    description: "Build an AI-optimized profile, practice mock interviews, and apply to top matching roles.",
  },
  {
    id: "company" as const,
    title: "I am a Company",
    description: "Publish listings, use semantic screening agents, and automate candidate interviewing pipelines.",
  },
];

export const CANDIDATE_FEATURES = [
  {
    title: "AI Resume Tailoring",
    description: "Auto-scan and rebuild your resume to highlight the exact skills matching your target job descriptions.",
    icon: Sparkles,
    highlight: "Increase interview invites by 3x",
    badge: "AI Powered",
  },
  {
    title: "Smart Job Matching",
    description: "Skip sorting through pages of listings. Get a curated feed of jobs ranked by your alignment score.",
    icon: Target,
    highlight: "98% match accuracy",
  },
  {
    title: "AI Career Pathways",
    description: "Visualize skill gaps and certification pathways needed to hit your target salary and job title.",
    icon: Compass,
    highlight: "Interactive visual mapping",
  },
  {
    title: "AI Mock Interviews",
    description: "Practice answering behavioral and technical questions with our voice/text bot, getting instant feedback.",
    icon: Video,
    highlight: "Real-time confidence scoring",
    badge: "Interactive",
  },
];

export const COMPANY_FEATURES = [
  {
    title: "Semantic Auto-Screening",
    description: "Scan thousands of applicants instantly. Rank matches based on actual skills, not just resume keywords.",
    icon: Users,
    highlight: "Save up to 80% screening time",
    badge: "Fast Track",
  },
  {
    title: "AI Interview Agents",
    description: "Conduct automated initial technical assessments with our interactive, customized AI interview bots.",
    icon: Cpu,
    highlight: "Standardized grading metrics",
    badge: "AI Powered",
  },
  {
    title: "ATS Pipeline Automation",
    description: "Auto-move applicants through custom stages with drag-and-drop boards, automatic triggers, and email sync.",
    icon: LayoutGrid,
    highlight: "Eliminate manual follow-ups",
  },
  {
    title: "Intelligent Auto-Scheduler",
    description: "Ditch the back-and-forth emails. Sync calendars to auto-find the perfect slot for interviewers and candidates.",
    icon: Calendar,
    highlight: "Reduced interview dropout by 40%",
  },
];

export const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-1000 employees",
  "1000+ employees",
];

export const EXPERIENCE_LEVELS = [
  "Entry Level (0-2 yrs)",
  "Mid Level (2-5 yrs)",
  "Senior Level (5-10 yrs)",
  "Director / Executive (10+ yrs)",
];

export const FADE_IN_VARIANTS = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const STAGGER_CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const SUPPORT_CONTACT = {
  whatsappDisplay: "+91 87088 60428",
  whatsappLink: "https://wa.me/918708860428"
};
