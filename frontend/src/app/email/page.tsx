"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmailRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/email/inbox"); }, [router]);
  return null;
}
