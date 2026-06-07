
import type { Metadata } from "next";
import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import CTA from "@/components/landing/cta";
import Footer from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "AI-Powered Hiring Platform for Candidates & Companies",
  description: "Accelerate your career search or streamline your hiring process. Connect top talent with leading companies through AI-driven matching, resume screening, and automated pipelines.",
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative bg-background">
      {/* Decorative Top-Right Corner Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Sections */}
      <main className="flex-grow">
        <Hero />

        {/* Anchor link targets */}
        <div id="features" className="scroll-mt-16">
          <Features />
        </div>

        <div id="cta" className="scroll-mt-16">
          <CTA />
        </div>
      </main>

      {/* Footer Navigation */}
      <Footer />
    </div>
  );
}
