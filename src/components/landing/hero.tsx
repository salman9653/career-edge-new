
import Link from "next/link";
import { ArrowRight, Sparkles, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerChildren } from "@/components/common";
import { HeroAnimations } from "./hero-animations";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 grid-bg hero-glow min-h-[calc(100vh-4rem)] flex items-center">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading, sub-headline, and CTAs */}
          <StaggerChildren className="lg:col-span-7 text-left space-y-8">
            {/* Tagline */}
            <FadeIn className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full glass border border-indigo-200/20 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span>Next-Gen AI Hiring & Job Search</span>
            </FadeIn>

            {/* Title */}
            <FadeIn>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-neutral-900 dark:text-white">
                Hire <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Smarter</span>. <br />
                Land <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">Faster</span>.
              </h1>
            </FadeIn>

            {/* Subtext */}
            <FadeIn>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Career Edge leverages artificial intelligence to seamlessly align elite candidates with top-tier companies. Streamline interview scheduling, optimize resumes, and match skills instantly.
              </p>
            </FadeIn>

            {/* CTAs */}
            <FadeIn className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Button asChild variant="premium" size="lg" className="rounded-xl shadow-lg group">
                <Link href="/signin">
                  Find Your Edge <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl border-indigo-500/30 hover:bg-indigo-500/5 hover:border-indigo-500/50">
                <Link href="/signin">
                  <Building className="mr-2 w-5 h-5 text-indigo-500" /> Hire Top Talent
                </Link>
              </Button>
            </FadeIn>

            {/* Live Stats */}
            <FadeIn className="grid grid-cols-3 gap-6 pt-6 border-t border-neutral-200 dark:border-neutral-800/80 max-w-lg">
              <div>
                <p className="text-3xl font-extrabold text-indigo-500 dark:text-indigo-400">98%</p>
                <p className="text-xs text-muted-foreground mt-1">AI Match Accuracy</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-indigo-500 dark:text-indigo-400">14 Days</p>
                <p className="text-xs text-muted-foreground mt-1">Average Time to Hire</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-indigo-500 dark:text-indigo-400">10k+</p>
                <p className="text-xs text-muted-foreground mt-1">Interviews Automated</p>
              </div>
            </FadeIn>
          </StaggerChildren>

          {/* Right Column: Visual Dashboard Mockup Showcase */}
          <HeroAnimations />
        </div>
      </div>
    </section>
  );
}
