import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import wayamLogoLight from "@/assets/brand/wayam-logo-light.svg";
import wayamLogoDark from "@/assets/brand/wayam-logo-dark.svg";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { login } from "@/lib/auth";

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
      setError("Enter a valid email and a password to continue.");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-page">
      {/* Brand panel (large screens) */}
      <div className="hidden flex-[1.4] flex-col justify-between bg-action-primary p-10 text-on-color lg:flex">
        <div className="flex items-center gap-2.5">
          <img src={wayamLogoLight} alt="" className="size-8 shrink-0 dark:hidden" />
          <img src={wayamLogoDark} alt="" className="hidden size-8 shrink-0 dark:block" />
          <span className="type-label-md">Wayam AI</span>
        </div>
        <div className="max-w-xl">
          <p className="type-eyebrow opacity-70">BOM Synchronization</p>
          <p className="type-display-2xl mt-3">One bill of materials across engineering, manufacturing, service and software.</p>
        </div>
      </div>

      {/* Form column */}
      <div className="flex w-full flex-col border-l border-hairline bg-container lg:w-[min(28rem,42%)]">
        <div className="flex h-14 shrink-0 items-center justify-between px-8">
          <div className="flex items-center gap-2.5 lg:invisible">
            <img src={wayamLogoLight} alt="Wayam AI" className="size-8 dark:hidden" />
            <img src={wayamLogoDark} alt="Wayam AI" className="hidden size-8 dark:block" />
          </div>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 flex-col justify-center px-8 pb-12">
          <div className="mx-auto w-full max-w-sm">
            <h1 className="type-display-xl text-foreground">Sign in</h1>
            <p className="type-body-md mt-1 text-tertiary">BOM Synchronization Command Center</p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="type-body-sm text-error">{error}</p>}
              <Button type="submit" size="lg" className="mt-1 w-full">Sign in</Button>
            </form>

            <div className="mt-6 rounded-md border border-hairline bg-raised p-3">
              <p className="type-eyebrow text-quaternary">Demo access</p>
              <p className="type-body-sm mt-1 text-tertiary">Any email address and any password will sign you in. This is a demo gate, not a real account system.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
