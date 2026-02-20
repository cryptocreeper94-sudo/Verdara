import { useLocation, Link } from "wouter";
import { useTheme } from "./theme-provider";
import { useAuth } from "@/hooks/use-auth";
import {
  Home, ScanSearch, Map, CalendarDays, Store, User,
  Sun, Moon, TreePine, Menu, Compass, Gauge, Axe, MapPinned, Code, LogIn, DollarSign, Radio, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const sidebarNav = [
  { path: "/", label: "Command Center", icon: Compass, authRequired: false },
  { path: "/identify", label: "Identify", icon: ScanSearch, authRequired: true },
  { path: "/trails", label: "Trails", icon: Map, authRequired: false },
  { path: "/planner", label: "Planner", icon: CalendarDays, authRequired: true },
  { path: "/marketplace", label: "Market", icon: Store, authRequired: false },
  { path: "/catalog", label: "Catalog", icon: MapPinned, authRequired: false },
  { path: "/price-compare", label: "Price Compare", icon: DollarSign, authRequired: false },
  { path: "/dashboard", label: "Profile", icon: User, authRequired: true },
  { path: "/arborist", label: "Arborist", icon: Axe, authRequired: true },
  { path: "/vault", label: "TrustVault", icon: Shield, authRequired: true },
  { path: "/signal-chat", label: "Signal Chat", icon: Radio, authRequired: false },
  { path: "/developer", label: "Developer", icon: Code, authRequired: false },
  { path: "/admin", label: "Admin", icon: Gauge, authRequired: true },
];

const mobileNav = [
  { path: "/", label: "Home", icon: Compass },
  { path: "/trails", label: "Trails", icon: Map },
  { path: "/marketplace", label: "Market", icon: Store },
  { path: "/catalog", label: "Catalog", icon: MapPinned },
  { path: "/identify", label: "Identify", icon: ScanSearch },
];

export function AppLayout({ children, onShowAuth }: { children: React.ReactNode; onShowAuth?: () => void }) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (document.getElementById("dwsc-ecosystem-widget")) return;
    const script = document.createElement("script");
    script.id = "dwsc-ecosystem-widget";
    script.src = "https://dwsc.io/api/ecosystem/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      const el = document.getElementById("dwsc-ecosystem-widget");
      if (el) el.remove();
    };
  }, []);

  const visibleSidebarNav = sidebarNav.filter(item => isAuthenticated || !item.authRequired);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <aside className={cn(
        "hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        sidebarOpen ? "w-[240px]" : "w-[68px]"
      )}>
        <div className={cn("flex items-center gap-3 p-4 border-b border-sidebar-border", !sidebarOpen && "justify-center")}>
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <TreePine className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <span className="text-lg font-bold text-sidebar-foreground tracking-tight">Verdara</span>
              )}
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {visibleSidebarNav.map((item) => {
            const isActive = location === item.path;
            const isAdmin = item.path === "/admin";
            const isArborist = item.path === "/arborist";
            const isDeveloper = item.path === "/developer";
            return (
              <Link key={item.path} href={item.path}>
                <div
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer hover-elevate",
                    isActive
                      ? (isAdmin || isArborist || isDeveloper) ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"
                      : "text-sidebar-foreground/70",
                    !sidebarOpen && "justify-center px-2"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && ((isAdmin || isArborist || isDeveloper) ? "text-amber-400" : "text-emerald-400"))} />
                  {sidebarOpen && <span>{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className={cn("p-3 border-t border-sidebar-border", !sidebarOpen ? "flex flex-col items-center gap-2" : "space-y-2")}>
          {!isAuthenticated && onShowAuth && (
            <button
              onClick={onShowAuth}
              data-testid="button-sidebar-login"
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold bg-emerald-500 text-white transition-colors",
                !sidebarOpen && "justify-center px-2"
              )}
            >
              <LogIn className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Log In / Sign Up</span>}
            </button>
          )}
          <div className={cn("flex gap-2", !sidebarOpen ? "flex-col items-center" : "items-center")}>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              className="text-sidebar-foreground/70"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-sidebar-foreground/70"
              data-testid="button-sidebar-toggle"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <TreePine className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-foreground">Verdara</span>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            {!isAuthenticated && onShowAuth && (
              <Button size="sm" onClick={onShowAuth} className="bg-emerald-500 text-white text-xs mr-1" data-testid="button-mobile-login">
                <LogIn className="w-3.5 h-3.5 mr-1" />
                Log In
              </Button>
            )}
            <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle-mobile">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </main>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border">
          <div className="flex items-center justify-around py-2 px-1 safe-area-bottom">
            {mobileNav.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                    className={cn(
                      "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer min-w-[44px] min-h-[44px] justify-center",
                      isActive ? "text-emerald-500" : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
