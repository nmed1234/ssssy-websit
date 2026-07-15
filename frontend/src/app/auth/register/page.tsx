"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useSiteName } from "@/lib/SiteSettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "", firstNameEn: "", lastNameEn: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const siteName = useSiteName(language);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      router.push("/admin");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-soil-cream to-white px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-soil-dark">Create Account</CardTitle>
          <CardDescription>Join the {siteName}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input id="username" value={form.username} onChange={update("username")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={update("email")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" value={form.password} onChange={update("password")} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstNameEn">First Name</Label>
                <Input id="firstNameEn" value={form.firstNameEn} onChange={update("firstNameEn")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastNameEn">Last Name</Label>
                <Input id="lastNameEn" value={form.lastNameEn} onChange={update("lastNameEn")} />
              </div>
            </div>
            <Button type="submit" className="w-full bg-forest hover:bg-forest/90" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-forest hover:underline">Sign In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
