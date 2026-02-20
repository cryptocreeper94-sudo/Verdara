import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Check, Crown, TreePine, Axe, Building2, Rocket,
  Sparkles, Shield, Zap, ArrowRight, Leaf, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSearch } from "wouter";

interface TierData {
  key: string;
  name: string;
  price: number;
  interval: string | null;
  level: number;
  features: string[];
  popular?: boolean;
}

const tierIcons: Record<string, typeof TreePine> = {
  free_explorer: Leaf,
  outdoor_explorer: TreePine,
  craftsman_pro: Axe,
  arborist_starter: Sparkles,
  arborist_business: Building2,
  arborist_enterprise: Rocket,
};

const tierColors: Record<string, { bg: string; border: string; badge: string; glow: string }> = {
  free_explorer: {
    bg: "from-slate-800/60 to-slate-900/60",
    border: "border-slate-700/50",
    badge: "bg-slate-600/30 text-slate-300",
    glow: "",
  },
  outdoor_explorer: {
    bg: "from-emerald-900/40 to-emerald-950/60",
    border: "border-emerald-700/40",
    badge: "bg-emerald-500/20 text-emerald-400",
    glow: "",
  },
  craftsman_pro: {
    bg: "from-amber-900/40 to-amber-950/60",
    border: "border-amber-600/40",
    badge: "bg-amber-500/20 text-amber-400",
    glow: "shadow-amber-500/10 shadow-lg",
  },
  arborist_starter: {
    bg: "from-emerald-800/50 to-slate-900/60",
    border: "border-emerald-600/40",
    badge: "bg-emerald-500/20 text-emerald-400",
    glow: "",
  },
  arborist_business: {
    bg: "from-emerald-700/40 to-emerald-950/60",
    border: "border-emerald-500/50",
    badge: "bg-emerald-400/20 text-emerald-300",
    glow: "shadow-emerald-500/20 shadow-xl ring-1 ring-emerald-500/30",
  },
  arborist_enterprise: {
    bg: "from-amber-800/40 to-slate-900/60",
    border: "border-amber-500/40",
    badge: "bg-amber-400/20 text-amber-300",
    glow: "shadow-amber-500/15 shadow-lg",
  },
};

const tierDescriptions: Record<string, string> = {
  free_explorer: "Start your outdoor journey",
  outdoor_explorer: "For active outdoor enthusiasts",
  craftsman_pro: "Sell on the marketplace",
  arborist_starter: "Launch your arborist business",
  arborist_business: "Scale with unlimited clients",
  arborist_enterprise: "Enterprise-grade operations",
};

export default function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  const { data: tiers, isLoading } = useQuery<TierData[]>({
    queryKey: ["/api/subscriptions/tiers"],
  });

  const subscribeMutation = useMutation({
    mutationFn: async (tierKey: string) => {
      const res = await apiRequest("POST", "/api/subscriptions/create-checkout", { tier: tierKey });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (params.get("subscription") === "success") {
      toast({
        title: "Subscription Active!",
        description: "Your plan has been upgraded successfully. Enjoy your new features!",
      });
    } else if (params.get("subscription") === "cancelled") {
      toast({
        title: "Checkout Cancelled",
        description: "No changes were made to your plan.",
      });
    }
  }, []);

  const currentTierLevel = (() => {
    if (!user?.tier) return 0;
    const match = tiers?.find((t) => t.name === user.tier);
    return match?.level ?? 0;
  })();

  const recreationalTiers = tiers?.filter((t) => t.level <= 2) ?? [];
  const arboristTiers = tiers?.filter((t) => t.level >= 3) ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-emerald-400" data-testid="text-pricing-header">Choose Your Plan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3" data-testid="text-pricing-title">
            Unlock the Full Verdara Experience
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From casual trail walks to running a professional arborist business — there's a plan for every outdoor adventurer.
          </p>
          {user && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300" data-testid="text-current-plan">
                Current plan: <strong>{user.tier || "Free Explorer"}</strong>
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-1 flex items-center gap-2">
            <TreePine className="w-5 h-5 text-emerald-500" />
            Recreation Plans
          </h2>
          <p className="text-sm text-muted-foreground mb-4">For outdoor enthusiasts and marketplace sellers</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {recreationalTiers.map((tier, i) => (
            <TierCard
              key={tier.key}
              tier={tier}
              index={i}
              currentLevel={currentTierLevel}
              isAuthenticated={!!user}
              onSubscribe={() => subscribeMutation.mutate(tier.key)}
              isLoading={subscribeMutation.isPending}
              popular={tier.key === "craftsman_pro"}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-1 flex items-center gap-2">
            <Axe className="w-5 h-5 text-amber-500" />
            Arborist Pro Plans
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Professional business management tools for arborists</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {arboristTiers.map((tier, i) => (
            <TierCard
              key={tier.key}
              tier={tier}
              index={i + 3}
              currentLevel={currentTierLevel}
              isAuthenticated={!!user}
              onSubscribe={() => subscribeMutation.mutate(tier.key)}
              isLoading={subscribeMutation.isPending}
              popular={tier.key === "arborist_business"}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-700/50 p-8 text-center"
        >
          <h3 className="text-lg font-semibold text-foreground mb-2">Need a Custom Plan?</h3>
          <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
            For large arborist operations, municipal contracts, or enterprise deployments — reach out and we'll build a plan tailored to your needs.
          </p>
          <Button variant="outline" data-testid="button-contact-sales">
            Contact Sales <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function TierCard({
  tier,
  index,
  currentLevel,
  isAuthenticated,
  onSubscribe,
  isLoading,
  popular,
}: {
  tier: TierData;
  index: number;
  currentLevel: number;
  isAuthenticated: boolean;
  onSubscribe: () => void;
  isLoading: boolean;
  popular: boolean;
}) {
  const Icon = tierIcons[tier.key] || TreePine;
  const colors = tierColors[tier.key] || tierColors.free_explorer;
  const description = tierDescriptions[tier.key] || "";
  const isCurrent = isAuthenticated && tier.level === currentLevel;
  const isDowngrade = isAuthenticated && tier.level < currentLevel;
  const isFree = tier.price === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.4 }}
      className={cn(
        "relative rounded-2xl overflow-hidden backdrop-blur-sm border p-6 flex flex-col",
        `bg-gradient-to-b ${colors.bg} ${colors.border}`,
        popular && colors.glow,
        isCurrent && "ring-2 ring-emerald-500/50",
      )}
      data-testid={`card-tier-${tier.key}`}
    >
      {popular && (
        <div className="absolute top-3 right-3">
          <Badge variant="default" className="flex items-center gap-1" data-testid={`badge-popular-${tier.key}`}>
            <Star className="w-3 h-3" /> Most Popular
          </Badge>
        </div>
      )}
      {isCurrent && (
        <div className="absolute top-3 right-3">
          <Badge variant="outline" data-testid={`badge-current-${tier.key}`}>
            Current Plan
          </Badge>
        </div>
      )}

      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", colors.badge)}>
        <Icon className="w-5 h-5" />
      </div>

      <h3 className="text-lg font-bold text-foreground mb-1" data-testid={`text-tier-name-${tier.key}`}>{tier.name}</h3>
      <p className="text-sm text-muted-foreground mb-4" data-testid={`text-tier-desc-${tier.key}`}>{description}</p>

      <div className="mb-6" data-testid={`text-tier-price-${tier.key}`}>
        {isFree ? (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">Free</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">${tier.price}</span>
            <span className="text-sm text-muted-foreground">/{tier.interval}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 flex-1 mb-6">
        {tier.features.map((feature, fi) => (
          <div key={fi} className="flex items-start gap-2.5" data-testid={`text-feature-${tier.key}-${fi}`}>
            <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-slate-300">{feature}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        {isCurrent ? (
          <Button
            disabled
            className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
            data-testid={`button-tier-current-${tier.key}`}
          >
            <Shield className="w-4 h-4 mr-2" /> Your Current Plan
          </Button>
        ) : isFree ? (
          <Button
            disabled
            variant="outline"
            className="w-full border-slate-600/50 text-slate-400 cursor-default"
            data-testid={`button-tier-free-${tier.key}`}
          >
            Included Free
          </Button>
        ) : isDowngrade ? (
          <Button
            disabled
            variant="outline"
            className="w-full border-slate-600/50 text-slate-500 cursor-default"
            data-testid={`button-tier-downgrade-${tier.key}`}
          >
            Included in Your Plan
          </Button>
        ) : (
          <Button
            onClick={onSubscribe}
            disabled={isLoading || !isAuthenticated}
            variant={popular ? "default" : "secondary"}
            className="w-full"
            data-testid={`button-tier-subscribe-${tier.key}`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : !isAuthenticated ? (
              "Sign Up to Subscribe"
            ) : (
              <>
                Upgrade <Zap className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
