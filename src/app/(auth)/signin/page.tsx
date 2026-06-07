"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUIStore } from "@/store/useUIStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import { motion } from "motion/react"
import { SocialLogins } from "@/components/auth/social-logins"
import { authClient } from "@/lib/auth-client"

export default function SignIn() {
  const router = useRouter()
  const openModal = useUIStore((state) => state.openModal)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError("")

    try {
      const { error: authError } = await authClient.signIn.email({
        email,
        password,
      })

      if (authError) {
        setError(authError.message || "Invalid email or password.")
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 1500)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during sign in.";
      setError(message);
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 grid-bg hero-glow bg-background">

      <div className="w-full max-w-md relative z-10">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <Card className="rounded-3xl glass border shadow-2xl overflow-hidden p-2">
          <CardHeader className="space-y-1.5 text-center pt-8">
            <CardTitle className="text-2xl font-extrabold tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="text-sm">Sign in to your account to continue</CardDescription>
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
                <h4 className="font-bold text-lg text-foreground">Successfully Signed In</h4>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Welcome to Career Edge. Redirecting you to your dashboard...
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-xs bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 font-medium">
                    {error}
                  </div>
                )}
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-11 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between pl-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                    <a href="#" className="text-xs text-indigo-500 hover:underline">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
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

                {/* Submit button */}
                <Button type="submit" variant="premium" className="w-full h-11 rounded-xl font-bold mt-2" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            )}

            {!success && (
              <>
                <SocialLogins />
              </>
            )}
          </CardContent>

          <CardFooter className="text-center justify-center pb-8 pt-4 text-sm text-muted-foreground border-t border-neutral-100 dark:border-neutral-900 mt-6">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => openModal("signup")}
              className="text-indigo-500 hover:underline font-semibold cursor-pointer ml-1"
            >
              Sign Up
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
