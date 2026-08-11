import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import wayamLogoLight from "@/assets/brand/wayam-logo-light.svg";
import wayamLogoDark from "@/assets/brand/wayam-logo-dark.svg";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DEMO_EMAIL, DEMO_PASSWORD, login } from "@/lib/auth";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate("/", { replace: true });
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center space-y-3">
          <img src={wayamLogoLight} alt="Wayam AI" className="h-8 w-auto dark:hidden" />
          <img src={wayamLogoDark} alt="Wayam AI" className="hidden h-8 w-auto dark:block" />
          <CardTitle>Sign in</CardTitle>
          <CardDescription>BOM Synchronization Command Center</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={DEMO_EMAIL}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
          <div className="mt-6 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Demo credentials</p>
            <p>Email: {DEMO_EMAIL}</p>
            <p>Password: {DEMO_PASSWORD}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
