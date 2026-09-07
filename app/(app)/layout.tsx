"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!isAuthenticated()) router.replace("/login");
    else setOk(true);
  }, [router]);
  if (!ok) return null;
  return <AppShell>{children}</AppShell>;
}

