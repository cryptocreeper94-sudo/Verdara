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
import { ArboraLayout } from "@/components/arbora-layout";
import ArboraDashboard from "@/pages/arbora-dashboard";
import ArboraClients from "@/pages/arbora-clients";
import ArboraDeals from "@/pages/arbora-deals";
import ArboraJobs from "@/pages/arbora-jobs";
import ArboraEstimates from "@/pages/arbora-estimates";
import ArboraInvoices from "@/pages/arbora-invoices";
import ArboraCalendar from "@/pages/arbora-calendar";
import ArboraCrew from "@/pages/arbora-crew";
import ArboraInventory from "@/pages/arbora-inventory";
import ArboraEquipment from "@/pages/arbora-equipment";
import NotFound from "@/pages/not-found";
import { Loader2, TreePine } from "lucide-react";
import { useState } from "react";


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
    return <Landing onGetStarted={() => setShowAuth(true)} onBrowse={() => { setBrowsing(true); }} />;
  }

  if (location === "/signal-chat") {
    return <SignalChat />;
  }

  if (location.startsWith("/arbora")) {
    return (
      <ArboraLayout>
        <Switch>
          <Route path="/arbora" component={ArboraDashboard} />
          <Route path="/arbora/clients" component={ArboraClients} />
          <Route path="/arbora/deals" component={ArboraDeals} />
          <Route path="/arbora/jobs" component={ArboraJobs} />
          <Route path="/arbora/estimates" component={ArboraEstimates} />
          <Route path="/arbora/invoices" component={ArboraInvoices} />
          <Route path="/arbora/calendar" component={ArboraCalendar} />
          <Route path="/arbora/crew" component={ArboraCrew} />
          <Route path="/arbora/inventory" component={ArboraInventory} />
          <Route path="/arbora/equipment" component={ArboraEquipment} />
          <Route component={NotFound} />
        </Switch>
      </ArboraLayout>
    );
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
        <Route path="/blog/admin" component={BlogAdmin} />
        <Route path="/blog/:slug" component={BlogDetail} />
        <Route path="/blog" component={Blog} />
        <Route path="/identify" component={Identify} />
        <Route path="/planner" component={Planner} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/arborist" component={Arborist} />
        <Route path="/vault" component={Vault} />
        <Route path="/admin" component={Admin} />
        <Route path="/track/:id" component={Track} />

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
