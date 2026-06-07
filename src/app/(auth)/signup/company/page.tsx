"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Mail, Lock, Building, Globe, Users, CheckCircle, Eye, EyeOff } from "lucide-react"
import { motion } from "motion/react"
import { SocialLogins } from "@/components/auth/social-logins"
import { authClient } from "@/lib/auth-client"

export default function CompanySignUp() {
  const router = useRouter()
  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [website, setWebsite] = useState("")
  const [companySize, setCompanySize] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName || !email || !password) return
    setLoading(true)
    setError("")

    try {
      const { error: authError } = await authClient.signUp.email({
        email,
        password,
        name: companyName,
        accountType: "company",
      })

      if (authError) {
        setError(authError.message || "Failed to register employer account.")
      } else {
        // Save company profile details in the decoupled Company Profile collection
        try {
          await fetch("/api/profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              companyName,
              websiteUrl: website || undefined,
              companySize: companySize || undefined,
              industry: "",
              location: "",
            }),
          })
        } catch (profileErr) {
          console.error("Failed to pre-save company details during signup:", profileErr)
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

  const sizes = ["1-10 employees", "11-50 employees", "51-200 employees", "201-1000 employees", "1000+ employees"]


  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 grid-bg hero-glow bg-background">
      <div className="w-full max-w-lg relative z-10 my-8">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <Card className="rounded-3xl glass border shadow-2xl overflow-hidden p-2">
          <CardHeader className="space-y-1.5 text-center pt-8">
            <CardTitle className="text-2xl font-extrabold tracking-tight">Join as an Employer</CardTitle>
            <CardDescription className="text-sm">Find and screen top candidates at scale using AI</CardDescription>
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
                <h4 className="font-bold text-lg text-foreground">Employer Profile Created!</h4>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Your employer account is registered. Redirecting to set up your job pipeline dashboard...
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
                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Company Name</label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Vercel Inc."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Business Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="hiring@company.com"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Website URL */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Website URL (Optional)</label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                        <Input
                          type="url"
                          placeholder="https://company.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Company Size */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Company Size (Optional)</label>
                      <Select
                        value={companySize}
                        onChange={setCompanySize}
                        options={sizes}
                        placeholder="Select size"
                        icon={<Users className="w-4.5 h-4.5" />}
                      />
                    </div>
                  </div>

                  {/* Submit button */}
                  <Button type="submit" variant="premium" className="w-full h-11 rounded-xl font-bold mt-4" disabled={loading}>
                    {loading ? "Registering Company..." : "Create Recruiter Account"}
                  </Button>
                </form>

                <SocialLogins accountType="company" />
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
