import { Bell, ChevronDown, Download, Search, Command, MapPin, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { locate } from "./nav";

const pill = "h-8 gap-1.5 rounded-full border-hairline bg-action px-3 text-xs font-medium text-tertiary hover:border-strong hover:bg-raised-2 hover:text-foreground";
const iconBtn = "size-8 rounded-full bg-action text-tertiary hover:bg-raised-2 hover:text-secondary-foreground";

export const TopNav = ({ onOpenNav }: { onOpenNav: () => void }) => {
  const { activeProgram, setActiveProgramId } = useProgramContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { group, title } = locate(location.pathname);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-hairline bg-page px-4 sm:px-5">
      {/* Location: group eyebrow + page title (no breadcrumbs in Chronus) */}
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation"
          className={`${iconBtn} lg:hidden`}
          onClick={onOpenNav}
        >
          <Menu className="size-4" aria-hidden />
        </Button>
        {/* The visible page title is the PageHeader h2; this h1 keeps one h1 per page for assistive tech. */}
        <h1 className="sr-only">{title}</h1>
        {group && <div className="type-eyebrow hidden truncate text-quaternary sm:block" aria-hidden>{group}</div>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Program switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className={pill}>
              <span className="max-w-[9rem] truncate text-foreground">{activeProgram.name}</span>
              <Badge variant="secondary" className="hidden h-5 px-1.5 text-[10px] font-mono sm:inline-flex">{activeProgram.modelYear}</Badge>
              <ChevronDown className="size-3 text-quaternary" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Switch vehicle program</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {products.map(p => (
              <DropdownMenuItem key={p.id} onClick={() => setActiveProgramId(p.id)} className="flex items-center justify-between cursor-pointer">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-[10px] text-muted-foreground">{p.category} · {p.stage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono tabular text-muted-foreground">{p.modelYear}</span>
                  {activeProgram.id === p.id && <span className="size-1.5 rounded-full bg-action-primary" />}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Scope */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={`${pill} hidden lg:inline-flex`}>
              <MapPin className="size-3.5" aria-hidden />
              <span>Program scope</span>
              <ChevronDown className="size-3 text-quaternary" aria-hidden />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
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

        {/* Universal search */}
        <div className="relative hidden xl:block">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-quaternary" aria-hidden />
          <Input
            aria-label="Search"
            placeholder="Search parts, ECNs, suppliers"
            className="h-8 w-72 rounded-full border-hairline bg-action pl-9 pr-14 text-xs"
          />
          <kbd className="absolute right-2.5 top-1/2 inline-flex h-5 -translate-y-1/2 items-center gap-0.5 rounded-full border border-hairline bg-container px-1.5 text-[10px] text-quaternary">
            <Command className="size-3" aria-hidden />K
          </kbd>
        </div>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications" className={`${iconBtn} relative`}>
              <Bell className="size-4" aria-hidden />
              <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-error-surface text-[10px] font-medium leading-none text-error tabular">
                {notifications.length}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex h-11 items-center justify-between border-b border-hairline px-4">
              <span className="type-section text-quaternary">Notifications</span>
              <span className="type-caption tabular text-quaternary">{notifications.length} new</span>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {notifications.map(n => (
                <div key={n.id} className="cursor-pointer border-b border-hairline px-4 py-3 last:border-0 hover:bg-raised">
                  <div className="flex items-start justify-between gap-2">
                    <span className="type-body-md text-foreground">{n.title}</span>
                    <span className="type-caption shrink-0 text-quaternary">{n.time}</span>
                  </div>
                  <p className="type-body-sm mt-0.5 text-tertiary">{n.desc}</p>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <ThemeToggle />

        <Button variant="ghost" size="icon" className={`${iconBtn} hidden md:inline-flex`} aria-label="Export">
          <Download className="size-4" aria-hidden />
        </Button>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Account menu"
              className="flex items-center gap-2 rounded-full py-0.5 pl-0.5 pr-0.5 outline-none transition-colors duration-[180ms] hover:bg-action focus-visible:ring-2 focus-visible:ring-active xl:pr-3"
            >
              <span className="grid size-8 place-items-center rounded-full bg-raised-2 text-xs font-medium text-foreground">RK</span>
              <span className="hidden flex-col items-start leading-tight xl:flex">
                <span className="text-xs font-medium text-foreground">Ravi Kumar</span>
                <span className="type-caption text-quaternary">Program manager</span>
              </span>
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
    </header>
  );
};
