import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AppLayout } from "@/components/app-layout";
import { useAuth } from "@/hooks/use-auth";
import Home from "@/pages/home";
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
import PriceCompare from "@/pages/price-compare";
import NotFound from "@/pages/not-found";
import { Loader2, TreePine } from "lucide-react";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

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

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/identify" component={Identify} />
        <Route path="/trails" component={Trails} />
        <Route path="/planner" component={Planner} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/track/:id" component={Track} />
        <Route path="/explore" component={Explore} />
        <Route path="/admin" component={Admin} />
        <Route path="/hunting" component={Hunting} />
        <Route path="/climbing" component={Climbing} />
        <Route path="/fishing" component={Fishing} />
        <Route path="/public-lands" component={PublicLands} />
        <Route path="/arborist" component={Arborist} />
        <Route path="/survival" component={Survival} />
        <Route path="/conservation" component={Conservation} />
        <Route path="/mtb" component={Mtb} />
        <Route path="/camping" component={Camping} />
        <Route path="/emobility" component={Emobility} />
        <Route path="/winter" component={Winter} />
        <Route path="/watersports" component={Watersports} />
        <Route path="/charters" component={Charters} />
        <Route path="/price-compare" component={PriceCompare} />
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
