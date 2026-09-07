"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      router.replace("/");
    } else {
      setError("Enter a valid email and a password to continue.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4">
      <Card className="w-full max-w-sm bg-card border-border shadow-xl rounded-lg">
        <CardHeader className="items-center text-center space-y-3">
          <BrandLogo showWordmark={true} href={false} className="justify-center mb-1" />
          <CardTitle className="text-xl font-bold tracking-tight">Sign in</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">SAMA Command Center</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="border-border/60 bg-surface-secondary/40 rounded-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="border-border/60 bg-surface-secondary/40 rounded-md"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" className="w-full h-9 btn-primary-white font-medium text-xs rounded-md">Sign in</Button>
          </form>
          <div className="mt-5 rounded-md border border-border/60 bg-surface-secondary/50 p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Demo access</p>
            <p className="mt-0.5">Any email address and password will sign you in — this is a demo gate.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
