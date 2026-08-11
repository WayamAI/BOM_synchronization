import { Bell, ChevronDown, Download, Search, Command, MapPin } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import wayamLogoLight from "@/assets/brand/wayam-logo-light.svg";
import wayamLogoDark from "@/assets/brand/wayam-logo-dark.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { products, notifications } from "@/lib/mockData";
import { useProgramContext } from "@/context/ProgramContext";
import { logout } from "@/lib/auth";

const routeLabels: Record<string, string> = {
  "": "Command Center",
  variants: "Variants & Configuration",
  ebom: "Engineering BOM",
  mbom: "Manufacturing BOM",
  service: "Service BOM",
  software: "Software BOM",
  changes: "Change Management",
  compare: "BOM Compare",
  parts: "Part Master",
  suppliers: "Supplier Intelligence",
  field: "Field Quality",
  reports: "Reports & Exports",
};

export const TopNav = () => {
  const { activeProgram, setActiveProgramId } = useProgramContext();
  const location = useLocation();
  const navigate = useNavigate();
  const segments = location.pathname.split("/").filter(Boolean);
  const crumbs = segments.length === 0
    ? [{ label: "Command Center", path: "/" }]
    : [{ label: "Command Center", path: "/" }, ...segments.map((s, i) => ({
        label: routeLabels[s] || s, path: "/" + segments.slice(0, i + 1).join("/")
      }))];

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="flex h-full items-center gap-3 px-5">
        {/* Logo mark */}
        <Link to="/" className="flex items-center gap-2.5 pr-3 border-r border-border mr-1">
          <img src={wayamLogoLight} alt="Wayam AI" className="h-8 w-auto dark:hidden" />
          <img src={wayamLogoDark} alt="Wayam AI" className="hidden h-8 w-auto dark:block" />
          <div className="leading-tight border-l border-border pl-2.5 ml-0.5">
            <div className="font-semibold text-base tracking-tight text-gradient-primary">Wayam AI</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">BOM Synchronization</div>
          </div>
        </Link>

        {/* Program switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-9 rounded-lg">
              <span className="text-xs font-medium">{activeProgram.name}</span>
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-mono">{activeProgram.modelYear}</Badge>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuLabel>Switch vehicle program</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {products.map(p => (
              <DropdownMenuItem key={p.id} onClick={() => setActiveProgramId(p.id)} className="flex items-center justify-between cursor-pointer">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-[10px] text-muted-foreground">{p.category} · {p.stage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{p.modelYear}</span>
                  {activeProgram.id === p.id && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Scope chip */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 rounded-lg text-xs">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="hidden lg:inline">Program scope</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="start">
            <p className="text-xs font-semibold mb-2">VIN scope</p>
            <p className="text-[11px] text-muted-foreground mb-2">Default: aggregate across all produced VINs.</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Plant</span><span>All (2)</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Market</span><span>All (5)</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Variant</span><span>All trims</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">VIN range</span><span>—</span></div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground ml-1">
          {crumbs.map((c, i) => (
            <span key={c.path} className="flex items-center gap-1.5">
              {i > 0 && <span className="opacity-50">/</span>}
              <Link to={c.path} className="hover:text-foreground transition-colors">{c.label}</Link>
            </span>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Universal search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search parts, ECNs, suppliers…"
              className="h-9 w-80 pl-9 pr-16 text-xs rounded-lg bg-muted/50 border-border focus-visible:ring-primary/30"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden xl:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 text-[10px] font-mono text-muted-foreground">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-critical ring-2 ring-background" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-semibold">Notifications</span>
                <Badge variant="secondary" className="text-[10px]">{notifications.length} new</Badge>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 border-b border-border/50 last:border-0 hover:bg-muted/40 cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold">{n.title}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <ThemeToggle />

          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" aria-label="Export">
            <Download className="h-4 w-4" />
          </Button>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full pl-1 pr-2.5 py-1 hover:bg-secondary transition-colors">
                <div className="h-8 w-8 rounded-full bg-gradient-accent grid place-items-center text-xs font-semibold text-accent-foreground ring-2 ring-background">
                  RK
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-xs font-medium">Ravi Kumar</span>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Program Manager</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile settings</DropdownMenuItem>
              <DropdownMenuItem>Switch organization</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
