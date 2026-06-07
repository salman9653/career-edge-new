"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Mail, Lock, User, UploadCloud, CheckCircle, FileText, Eye, EyeOff } from "lucide-react"
import { motion } from "motion/react"
import { SocialLogins } from "@/components/auth/social-logins"
import { authClient } from "@/lib/auth-client"

export default function CandidateSignUp() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [resumeName, setResumeName] = useState<string | null>(null)
  const [resumeBase64, setResumeBase64] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setResumeName(file.name)

      const reader = new FileReader()
      reader.onloadend = () => {
        setResumeBase64(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) return
    setLoading(true)
    setError("")

    try {
      const { error: authError } = await authClient.signUp.email({
        email,
        password,
        name,
        accountType: "candidate",
      })

      if (authError) {
        setError(authError.message || "Failed to register candidate account.")
      } else {
        // Always initialize the Candidate Profile document
        try {
          await fetch("/api/profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              resumeName
                 ? { jobTitle: "", resumeName, resumeBase64 }
                 : {}
            ),
          })
        } catch (profileErr) {
          console.error("Failed to initialize profile during signup:", profileErr)
        }

        setSuccess(true)
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 1500)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during signup.";
      setError(message);
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 grid-bg hero-glow bg-background">
      <div className="w-full max-w-lg relative z-10 my-8">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <Card className="rounded-3xl glass border shadow-2xl overflow-hidden p-2">
          <CardHeader className="space-y-1.5 text-center pt-8">
            <CardTitle className="text-2xl font-extrabold tracking-tight">Join as a Candidate</CardTitle>
            <CardDescription className="text-sm">Find your dream job with AI career guidance</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center p-6 space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-lg text-foreground">Registration Successful!</h4>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Your candidate profile has been created. Redirecting to build your AI resume portfolio...
                </p>
              </motion.div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 text-xs bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 font-medium">
                      {error}
                    </div>
                  )}
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Alex Rivera"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="alex.rivera@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 pr-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Resume Upload Box */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Upload Resume (Optional)</label>
                    <div className="relative group/upload border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 rounded-2xl bg-neutral-50/30 dark:bg-neutral-900/20 p-6 transition-all text-center flex flex-col items-center justify-center cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      {resumeName ? (
                        <div className="flex items-center space-x-2 text-indigo-500 font-semibold text-sm">
                          <FileText className="w-6 h-6 animate-bounce" />
                          <span className="max-w-[250px] truncate">{resumeName}</span>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 text-muted-foreground group-hover/upload:text-indigo-500 transition-colors mb-2" />
                          <p className="text-xs font-semibold text-foreground">
                            Drag & drop or <span className="text-indigo-500 hover:underline">browse files</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">Supported: PDF, DOC, DOCX up to 10MB</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Submit button */}
                  <Button type="submit" variant="premium" className="w-full h-11 rounded-xl font-bold mt-2" disabled={loading}>
                    {loading ? "Creating Profile..." : "Sign Up"}
                  </Button>
                </form>

                <SocialLogins accountType="candidate" />
              </>
            )}
          </CardContent>

          <CardFooter className="text-center justify-center pb-8 pt-4 text-sm text-muted-foreground border-t border-neutral-100 dark:border-neutral-900 mt-6">
            Already have an account?{" "}
            <Link href="/signin" className="text-indigo-500 hover:underline font-semibold ml-1">
              Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
