"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleVerify = async () => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or expired verification link");
      return;
    }

    setStatus("loading");

    try {
      await api.post("/auth/verify-email", { token });
      setStatus("success");
      setMessage("Email verified successfully!");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Invalid or expired verification link");
    }
  };

  if (status === "idle" && token) {
    handleVerify();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-soil-dark">Email Verification</CardTitle>
        <CardDescription>Verifying your email address</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          {status === "loading" && (
            <p className="text-muted-foreground">Verifying your email...</p>
          )}
          {status === "success" && (
            <div className="bg-green-50 text-green-700 p-4 rounded-md text-sm">
              {message}
            </div>
          )}
          {status === "error" && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">
              {message}
            </div>
          )}
          {(status === "success" || status === "error") && (
            <Link href="/auth/login">
              <Button className="bg-soil-clay hover:bg-soil-dark">
                Go to Sign In
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-soil-cream to-white px-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardContent><div className="text-center text-muted-foreground">Loading...</div></CardContent>
        </Card>
      }>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
