"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, Building, Mail, Check } from "lucide-react";
import { FadeIn } from "@/components/common";
import { motion } from "motion/react";

export default function CTA() {
  const [candidateEmail, setCandidateEmail] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [candidateSuccess, setCandidateSuccess] = useState(false);
  const [companySuccess, setCompanySuccess] = useState(false);

  const handleCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateEmail) return;
    setCandidateSuccess(true);
    setTimeout(() => {
      setCandidateEmail("");
      setCandidateSuccess(false);
    }, 4000);
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyEmail) return;
    setCompanySuccess(true);
    setTimeout(() => {
      setCompanyEmail("");
      setCompanySuccess(false);
    }, 4000);
  };

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Decorative Radial Backgrounds */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Card 1: For Candidates */}
          <FadeIn className="flex">
            <div className="relative p-8 sm:p-12 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-neutral-950 text-white shadow-2xl border border-indigo-500/10 group flex flex-col justify-between w-full">
              {/* Glowing spot */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Job Seekers</span>
                </div>
                <h3 className="text-3xl font-extrabold tracking-tight">
                  Unlock Your Next Career Edge
                </h3>
                <p className="text-indigo-200/70 text-sm sm:text-base leading-relaxed">
                  Join our premium network. Let our AI optimizer tailormade your applications and match you with companies looking for your exact skill sets.
                </p>
              </div>

              <div className="mt-8">
                {!candidateSuccess ? (
                  <form onSubmit={handleCandidateSubmit} className="flex flex-col sm:flex-row items-stretch gap-3">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-indigo-300" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-indigo-200/40 rounded-xl focus:outline-none [--active-color:#818cf8] w-full"
                        required
                      />
                    </div>
                    <Button type="submit" variant="premium" className="h-12 px-6 rounded-xl font-bold cursor-pointer">
                      Join Waitlist <ArrowRight className="ml-2 w-4.5 h-4.5" />
                    </Button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl"
                  >
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-sm font-semibold">You&apos;re on the list! We&apos;ll reach out shortly.</span>
                  </motion.div>
                )}
                <p className="text-[11px] text-indigo-200/40 mt-3 text-center sm:text-left">
                  No spam. Unsubscribe at any time.
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Card 2: For Companies */}
          <FadeIn className="flex" delay={0.15}>
            <div className="relative p-8 sm:p-12 rounded-3xl overflow-hidden bg-gradient-to-br from-violet-900 via-violet-950 to-neutral-950 text-white shadow-2xl border border-violet-500/10 group flex flex-col justify-between w-full">
              {/* Glowing spot */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400">
                  <Building className="w-3.5 h-3.5" />
                  <span>Employers</span>
                </div>
                <h3 className="text-3xl font-extrabold tracking-tight">
                  Hire the Best, Automated
                </h3>
                <p className="text-violet-200/70 text-sm sm:text-base leading-relaxed">
                  Source, screen, and interview applicants at scale using AI automation tools. Decrease time-to-hire by 50% without compromising candidate quality.
                </p>
              </div>

              <div className="mt-8">
                {!companySuccess ? (
                  <form onSubmit={handleCompanySubmit} className="flex flex-col sm:flex-row items-stretch gap-3">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-violet-300" />
                      <Input
                        type="email"
                        placeholder="Enter company email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-violet-200/40 rounded-xl focus:outline-none [--active-color:#a78bfa] w-full"
                        required
                      />
                    </div>
                    <Button type="submit" className="h-12 px-6 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-none shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all cursor-pointer">
                      Book a Demo <ArrowRight className="ml-2 w-4.5 h-4.5" />
                    </Button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl"
                  >
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-sm font-semibold">Demo requested! A representative will contact you.</span>
                  </motion.div>
                )}
                <p className="text-[11px] text-violet-200/40 mt-3 text-center sm:text-left">
                  Accelerated screening pilot options available.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
