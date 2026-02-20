import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AppLayout } from "@/components/app-layout";
import Home from "@/pages/home";
import Identify from "@/pages/identify";
import Trails from "@/pages/trails";
import Planner from "@/pages/planner";
import Marketplace from "@/pages/marketplace";
import Dashboard from "@/pages/dashboard";
import Track from "@/pages/track";
import Explore from "@/pages/explore";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AppLayout>
            <Router />
          </AppLayout>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
