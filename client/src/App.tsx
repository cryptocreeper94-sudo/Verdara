import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AppLayout } from "@/components/app-layout";
import { useAuth } from "@/hooks/use-auth";
import Landing from "@/pages/landing";
import Identify from "@/pages/identify";
import Trails from "@/pages/trails";
import Planner from "@/pages/planner";
import Marketplace from "@/pages/marketplace";
import Dashboard from "@/pages/dashboard";
import Track from "@/pages/track";
import Explore from "@/pages/explore";
import Admin from "@/pages/admin";
import Hunting from "@/pages/hunting";
import Climbing from "@/pages/climbing";
import Fishing from "@/pages/fishing";
import PublicLands from "@/pages/public-lands";
import Arborist from "@/pages/arborist";
import AuthPage from "@/pages/auth";
import Survival from "@/pages/survival";
import Conservation from "@/pages/conservation";
import Mtb from "@/pages/mtb";
import Camping from "@/pages/camping";
import Emobility from "@/pages/emobility";
import Winter from "@/pages/winter";
import Watersports from "@/pages/watersports";
import Charters from "@/pages/charters";
import Coastal from "@/pages/coastal";
import Desert from "@/pages/desert";
import Wetlands from "@/pages/wetlands";
import Caves from "@/pages/caves";
import Prairie from "@/pages/prairie";
import Foraging from "@/pages/foraging";
import SignalChat from "@/pages/signal-chat";
import PriceCompare from "@/pages/price-compare";
import Catalog from "@/pages/catalog";
import CatalogDetail from "@/pages/catalog-detail";
import DeveloperPortal from "@/pages/developer-portal";
import Vault from "@/pages/vault";
import Pricing from "@/pages/pricing";
import Blog from "@/pages/blog";
import BlogDetail from "@/pages/blog-detail";
import BlogAdmin from "@/pages/blog-admin";
import NotFound from "@/pages/not-found";
import { Loader2, TreePine } from "lucide-react";
import { useState } from "react";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) {
    return <AuthPage onBack={() => setShowAuth(false)} />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-6">
          <TreePine className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Sign Up to Unlock This Feature</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create a free account to access AI identification, trip planning, bookings, and more.
        </p>
        <button
          onClick={() => setShowAuth(true)}
          data-testid="button-auth-gate-signup"
          className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm transition-colors"
        >
          Create Free Account
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [showAuth, setShowAuth] = useState(false);
  const [browsing, setBrowsing] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
            <TreePine className="w-7 h-7 text-white" />
          </div>
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (showAuth) {
    return <AuthPage onBack={() => setShowAuth(false)} />;
  }

  if (!isAuthenticated && location === "/" && !browsing) {
    return <Landing onGetStarted={() => setShowAuth(true)} onBrowse={() => setBrowsing(true)} />;
  }

  if (location === "/signal-chat") {
    return <SignalChat />;
  }

  return (
    <AppLayout onShowAuth={() => setShowAuth(true)}>
      <Switch>
        <Route path="/" component={Explore} />
        <Route path="/trails" component={Trails} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/catalog/:slug" component={CatalogDetail} />
        <Route path="/catalog" component={Catalog} />
        <Route path="/price-compare" component={PriceCompare} />
        <Route path="/developer" component={DeveloperPortal} />
        <Route path="/hunting" component={Hunting} />
        <Route path="/climbing" component={Climbing} />
        <Route path="/fishing" component={Fishing} />
        <Route path="/public-lands" component={PublicLands} />
        <Route path="/survival" component={Survival} />
        <Route path="/conservation" component={Conservation} />
        <Route path="/mtb" component={Mtb} />
        <Route path="/camping" component={Camping} />
        <Route path="/emobility" component={Emobility} />
        <Route path="/winter" component={Winter} />
        <Route path="/watersports" component={Watersports} />
        <Route path="/charters" component={Charters} />
        <Route path="/coastal" component={Coastal} />
        <Route path="/desert" component={Desert} />
        <Route path="/wetlands" component={Wetlands} />
        <Route path="/caves" component={Caves} />
        <Route path="/prairie" component={Prairie} />
        <Route path="/foraging" component={Foraging} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/blog/admin">
          <AuthGate><BlogAdmin /></AuthGate>
        </Route>
        <Route path="/blog/:slug" component={BlogDetail} />
        <Route path="/blog" component={Blog} />

        <Route path="/identify">
          <AuthGate><Identify /></AuthGate>
        </Route>
        <Route path="/planner">
          <AuthGate><Planner /></AuthGate>
        </Route>
        <Route path="/dashboard">
          <AuthGate><Dashboard /></AuthGate>
        </Route>
        <Route path="/arborist">
          <AuthGate><Arborist /></AuthGate>
        </Route>
        <Route path="/vault">
          <AuthGate><Vault /></AuthGate>
        </Route>
        <Route path="/admin">
          <AuthGate><Admin /></AuthGate>
        </Route>
        <Route path="/track/:id">
          <AuthGate><Track /></AuthGate>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AppContent />
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
