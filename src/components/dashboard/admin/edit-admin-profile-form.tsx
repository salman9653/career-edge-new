"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Save, Loader2 } from "lucide-react";

interface AdminProfileFormProps {
  initialProfile: {
    name: string;
    phone?: string;
    image?: string | null;
  };
}

export function EditAdminProfileForm({ initialProfile }: AdminProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: initialProfile.name || "",
    phone: initialProfile.phone || "",
    image: initialProfile.image || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update admin profile.");
      }

      router.push("/dashboard/profile");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-3xl glass border shadow-xl p-6 bg-neutral-50/20 dark:bg-neutral-950/20 w-full text-left">
      <CardHeader className="p-0 pb-4 border-b border-neutral-200/30 dark:border-neutral-850/50 mb-6">
        <CardTitle className="text-base font-extrabold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-500" /> Admin Profile Details
        </CardTitle>
        <CardDescription className="text-xs">Update your system administrator credentials and bio details.</CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-4.5">
          {error && (
            <div className="p-3 text-xs bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl font-bold">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
            <Input name="name" value={formData.name} onChange={handleChange} required className="rounded-xl h-10 text-xs font-semibold" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
            <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 010-0000" className="rounded-xl h-10 text-xs font-semibold" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Profile Image URL</label>
            <Input name="image" value={formData.image || ""} onChange={handleChange} placeholder="https://example.com/avatar.png" className="rounded-xl h-10 text-xs font-semibold" />
          </div>



          <Button type="submit" disabled={loading} className="w-full h-10 text-xs font-bold gap-2 rounded-xl mt-4 cursor-pointer">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
