"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useUIStore } from "@/store/useUIStore"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { User, Building, Check, ArrowRight } from "lucide-react"

export default function SignupModal() {
  const router = useRouter()
  const { activeModal, closeModal } = useUIStore()
  const isOpen = activeModal === "signup"

  const handleSelection = (path: string) => {
    closeModal()
    router.push(path)
  }

  return (
    <Dialog isOpen={isOpen} onClose={closeModal} className="max-w-4xl">
      <div className="text-center space-y-3 mb-8">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Create Your Account
        </h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Choose how you want to join Career Edge. Get started in minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Candidate Option */}
        <div
          onClick={() => handleSelection("/signup/candidate")}
          className="group relative p-6 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/30 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-lg shadow-indigo-500/5 hover:-translate-y-0.5"
        >
          <div className="space-y-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-lg font-bold tracking-tight text-foreground">
                For Candidates
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Find your next career edge with AI-driven resume optimization and matchmaking.
              </p>
            </div>
            <ul className="space-y-2 text-[11px] text-muted-foreground pt-2">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" /> Find AI-matched jobs
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" /> Tailor resumes automatically
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" /> AI interview practice
              </li>
            </ul>
          </div>
          <div className="pt-6">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleSelection("/signup/candidate")
              }}
              variant="outline"
              className="w-full justify-between rounded-xl group-hover:bg-indigo-500 group-hover:text-white group-hover:border-transparent transition-all duration-300 font-bold"
            >
              Sign Up as Candidate <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Company Option */}
        <div
          onClick={() => handleSelection("/signup/company")}
          className="group relative p-6 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/30 hover:border-violet-500/30 dark:hover:border-violet-500/30 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-lg shadow-violet-500/5 hover:-translate-y-0.5"
        >
          <div className="space-y-4">
            <div className="w-11 h-11 rounded-xl bg-violet-500/10 text-violet-500 dark:text-violet-400 flex items-center justify-center group-hover:bg-violet-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <Building className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-lg font-bold tracking-tight text-foreground">
                For Employers
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Streamline and scale your recruitment funnel with smart candidate matching and schedules.
              </p>
            </div>
            <ul className="space-y-2 text-[11px] text-muted-foreground pt-2">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" /> Score applicants instantly
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" /> AI-driven screening calls
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" /> Dynamic ATS pipelines
              </li>
            </ul>
          </div>
          <div className="pt-6">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleSelection("/signup/company")
              }}
              variant="outline"
              className="w-full justify-between rounded-xl group-hover:bg-violet-500 group-hover:text-white group-hover:border-transparent transition-all duration-300 font-bold"
            >
              Sign Up as Employer <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="text-center pt-6 text-xs text-muted-foreground border-t border-neutral-100 dark:border-neutral-900 mt-6">
        Already have an account?{" "}
        <button
          onClick={() => handleSelection("/signin")}
          className="text-indigo-500 hover:underline font-semibold cursor-pointer"
        >
          Sign In
        </button>
      </div>
    </Dialog>
  )
}
