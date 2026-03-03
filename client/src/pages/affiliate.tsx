import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Copy, Check, Users, UserCheck, Coins, Wallet, ChevronRight,
  TrendingUp, Share2, ExternalLink, Award, ArrowUpRight, Shield,
  Sparkles, Gift, Lock, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/glass-card";
import { cn } from "@/lib/utils";

const tierConfig = [
  { name: "Base", icon: Shield, gradient: "from-slate-600 to-slate-500", glow: "shadow-slate-500/20", text: "text-slate-300", bg: "bg-slate-500/15", ring: "ring-slate-500/30" },
  { name: "Silver", icon: Award, gradient: "from-gray-400 to-gray-300", glow: "shadow-gray-400/20", text: "text-gray-300", bg: "bg-gray-400/15", ring: "ring-gray-400/30" },
  { name: "Gold", icon: Sparkles, gradient: "from-amber-600 to-amber-400", glow: "shadow-amber-500/25", text: "text-amber-400", bg: "bg-amber-500/15", ring: "ring-amber-500/30" },
  { name: "Platinum", icon: Zap, gradient: "from-slate-400 to-slate-300", glow: "shadow-slate-400/25", text: "text-slate-300", bg: "bg-slate-400/15", ring: "ring-slate-400/30" },
  { name: "Diamond", icon: Gift, gradient: "from-emerald-500 to-emerald-400", glow: "shadow-emerald-500/25", text: "text-emerald-400", bg: "bg-emerald-500/15", ring: "ring-emerald-500/30" },
];

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  converted: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  expired: { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-400" },
  processing: { bg: "bg-amber-600/10", text: "text-amber-500", dot: "bg-amber-500" },
  paid: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
};

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } },
};

export default function Affiliate() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [copiedCross, setCopiedCross] = useState<string | null>(null);

  const { data: dashboardData, isLoading: dashLoading } = useQuery<any>({
    queryKey: ["/api/affiliate/dashboard"],
    enabled: isAuthenticated,
  });

  const { data: linkData, isLoading: linkLoading } = useQuery<any>({
    queryKey: ["/api/affiliate/link"],
    enabled: isAuthenticated,
  });

  const payoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/affiliate/request-payout");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Payout Requested", description: `${data.amount} SIG payout submitted for processing.` });
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate/dashboard"] });
    },
    onError: (error: any) => {
      toast({ title: "Payout Failed", description: error.message, variant: "destructive" });
    },
  });

  const copyToClipboard = async (text: string, isCross?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isCross) {
        setCopiedCross(isCross);
        setTimeout(() => setCopiedCross(null), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      toast({ title: "Copied!", description: "Referral link copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", description: "Please copy the link manually.", variant: "destructive" });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-amber-500/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-3" data-testid="text-affiliate-auth-required">Sign in to start earning</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">Earn SIG commission across all 32 Trust Layer apps with a single referral link.</p>
        </motion.div>
      </div>
    );
  }

  const dash = dashboardData || {};
  const tierName = dash.tier || "Base";
  const currentTierConfig = tierConfig.find(t => t.name === tierName) || tierConfig[0];
  const currentTierIndex = tierConfig.findIndex(t => t.name === tierName);
  const allTiers = dash.allTiers || [];
  const pendingEarnings = parseFloat(dash.pendingEarnings || "0");
  const paidEarnings = parseFloat(dash.paidEarnings || "0");
  const referrals = dash.referrals || [];
  const commissions = dash.commissions || [];
  const nextTier = dash.nextTier;
  const convertedReferrals = dash.convertedReferrals || 0;

  const progressToNext = nextTier
    ? Math.min(100, (convertedReferrals / nextTier.minConverted) * 100)
    : 100;

  const referralLink = linkData?.referralLink || "";
  const crossPlatformLinks = linkData?.crossPlatformLinks || [];

  const stats = [
    { label: "Total Referrals", value: dash.totalReferrals || 0, icon: Users, gradient: "from-emerald-500 to-emerald-600" },
    { label: "Converted", value: convertedReferrals, icon: UserCheck, gradient: "from-amber-500 to-amber-600" },
    { label: "Pending", value: `${pendingEarnings.toFixed(2)}`, unit: "SIG", icon: Coins, gradient: "from-emerald-500 to-teal-600" },
    { label: "Paid Out", value: `${paidEarnings.toFixed(2)}`, unit: "SIG", icon: Wallet, gradient: "from-slate-500 to-slate-600" },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-background to-amber-900/20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />

        <div className="relative px-5 md:px-10 pt-8 pb-6 md:pt-12 md:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", currentTierConfig.gradient, currentTierConfig.glow)}>
                <currentTierConfig.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-affiliate-title">Share & Earn</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className={cn(currentTierConfig.bg, currentTierConfig.text, "text-[10px]")} data-testid="badge-current-tier">{tierName} Tier</Badge>
                  {pendingEarnings > 0 && (
                    <Badge className="bg-amber-500/15 text-amber-400 text-[10px]">
                      <Coins className="w-2.5 h-2.5 mr-1" />
                      {pendingEarnings.toFixed(2)} SIG pending
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-5 md:px-10 space-y-5 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <GlassCard className="p-5" data-testid="referral-link-section">
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-foreground">Your Referral Link</h3>
            </div>
            {linkLoading ? (
              <div className="h-12 rounded-xl bg-white/5 animate-pulse" />
            ) : (
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="flex-1 min-w-0 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground/80 font-mono truncate" data-testid="text-referral-link">
                  {referralLink}
                </div>
                <Button
                  onClick={() => copyToClipboard(referralLink)}
                  className={cn(
                    "min-w-[120px] gap-2 transition-all duration-300",
                    copied
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                      : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/25"
                  )}
                  data-testid="button-copy-referral"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.span key="check" initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> Copied!
                      </motion.span>
                    ) : (
                      <motion.span key="copy" initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
                        <Copy className="w-4 h-4" /> Copy Link
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            )}
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-5" data-testid="tier-progress-section">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-foreground">Tier Progress</h3>
              </div>
              {nextTier && (
                <div className="flex items-center gap-2">
                  <Badge className={cn(currentTierConfig.bg, currentTierConfig.text, "text-[10px]")}>{tierName}</Badge>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <Badge variant="outline" className="text-[10px]">{nextTier.name}</Badge>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 mb-3">
              {tierConfig.map((tier, i) => (
                <div key={tier.name} className="flex-1 relative">
                  <div className={cn(
                    "h-2 rounded-full transition-all duration-700",
                    i <= currentTierIndex ? `bg-gradient-to-r ${tier.gradient}` : "bg-white/10",
                    i === 0 && "rounded-l-full",
                    i === tierConfig.length - 1 && "rounded-r-full",
                  )} />
                  {i === currentTierIndex && (
                    <motion.div
                      layoutId="tier-indicator"
                      className={cn("absolute -top-1 right-0 w-4 h-4 rounded-full border-2 border-background bg-gradient-to-br shadow-lg", tier.gradient, tier.glow)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {nextTier
                  ? `${convertedReferrals} / ${nextTier.minConverted} converted to reach ${nextTier.name}`
                  : `Max tier reached — ${(dash.tierRate * 100 || 20).toFixed(1)}% commission`}
              </p>
              {nextTier && (
                <span className="text-xs font-medium text-emerald-400">{Math.round(progressToNext)}%</span>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={stagger.item}>
              <GlassCard className="p-4 md:p-5" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-lg", stat.gradient)}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg md:text-xl font-bold text-foreground">{dashLoading ? "—" : stat.value}</span>
                  {stat.unit && <span className="text-[10px] text-muted-foreground font-medium">{stat.unit}</span>}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <GlassCard className="p-5" data-testid="tier-table-section">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-foreground">Commission Tiers</h3>
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2.5 px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Tier</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Min. Referrals</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Rate</th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allTiers.map((tier: any) => {
                    const isCurrentTier = tier.name === tierName;
                    const tc = tierConfig.find(t => t.name === tier.name) || tierConfig[0];
                    return (
                      <tr key={tier.name} className={cn("border-b border-white/5 last:border-0 transition-colors", isCurrentTier && "bg-emerald-500/5")} data-testid={`tier-row-${tier.name.toLowerCase()}`}>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-6 h-6 rounded-lg bg-gradient-to-br flex items-center justify-center", tc.gradient)}>
                              <tc.icon className="w-3 h-3 text-white" />
                            </div>
                            <span className={cn("text-xs font-semibold", tc.text)}>{tier.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-xs text-foreground">{tier.minConverted}</td>
                        <td className="py-3 px-3 text-xs text-foreground font-semibold">{(tier.rate * 100).toFixed(1)}%</td>
                        <td className="py-3 px-3 text-right">
                          {isCurrentTier ? (
                            <Badge className="bg-emerald-500/15 text-emerald-400 text-[10px]">Current</Badge>
                          ) : convertedReferrals >= tier.minConverted ? (
                            <span className="text-[10px] text-muted-foreground">Unlocked</span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">{tier.minConverted - convertedReferrals} more</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden space-y-2">
              {allTiers.map((tier: any) => {
                const isCurrentTier = tier.name === tierName;
                const tc = tierConfig.find(t => t.name === tier.name) || tierConfig[0];
                return (
                  <div key={tier.name} className={cn("flex items-center justify-between gap-3 p-3 rounded-xl transition-colors", isCurrentTier ? "bg-emerald-500/10 ring-1 ring-emerald-500/20" : "bg-white/5")} data-testid={`tier-card-${tier.name.toLowerCase()}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-md", tc.gradient)}>
                        <tc.icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <span className={cn("text-xs font-semibold block", tc.text)}>{tier.name}</span>
                        <span className="text-[10px] text-muted-foreground">{tier.minConverted} referrals</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground block">{(tier.rate * 100).toFixed(1)}%</span>
                      {isCurrentTier && <Badge className="bg-emerald-500/15 text-emerald-400 text-[9px]">Current</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-5 h-full" data-testid="recent-referrals-section">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-foreground">Recent Referrals</h3>
                {referrals.length > 0 && (
                  <Badge className="bg-white/10 text-muted-foreground text-[10px] ml-auto">{referrals.length}</Badge>
                )}
              </div>
              {referrals.length > 0 ? (
                <div className="space-y-2">
                  {referrals.slice(0, 8).map((ref: any) => {
                    const s = statusStyles[ref.status] || statusStyles.pending;
                    return (
                      <div key={ref.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/8 transition-colors" data-testid={`referral-item-${ref.id}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                            <Users className="w-3.5 h-3.5 text-emerald-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground truncate capitalize">{ref.platform || "verdara"}</p>
                            <p className="text-[10px] text-muted-foreground">{ref.createdAt ? new Date(ref.createdAt).toLocaleDateString() : "—"}</p>
                          </div>
                        </div>
                        <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium", s.bg, s.text)}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
                          {ref.status}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">No referrals yet</p>
                  <p className="text-[11px] text-muted-foreground/60">Share your link to start earning SIG</p>
                </div>
              )}
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <GlassCard className="p-5 h-full" data-testid="recent-commissions-section">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-foreground">Recent Commissions</h3>
                {commissions.length > 0 && (
                  <Badge className="bg-white/10 text-muted-foreground text-[10px] ml-auto">{commissions.length}</Badge>
                )}
              </div>
              {commissions.length > 0 ? (
                <div className="space-y-2">
                  {commissions.slice(0, 8).map((c: any) => {
                    const s = statusStyles[c.status] || statusStyles.pending;
                    return (
                      <div key={c.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/8 transition-colors" data-testid={`commission-item-${c.id}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground">{parseFloat(c.amount || "0").toFixed(2)} SIG</p>
                            <p className="text-[10px] text-muted-foreground capitalize">{c.tier || "base"} tier &middot; {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</p>
                          </div>
                        </div>
                        <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium", s.bg, s.text)}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
                          {c.status}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <Coins className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">No commissions yet</p>
                  <p className="text-[11px] text-muted-foreground/60">Commissions appear when referrals convert</p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className={cn(
            "p-5 text-center",
            pendingEarnings >= 10 && "ring-1 ring-emerald-500/20"
          )}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  pendingEarnings >= 10 ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25" : "bg-white/10"
                )}>
                  <Wallet className={cn("w-5 h-5", pendingEarnings >= 10 ? "text-white" : "text-muted-foreground")} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{pendingEarnings.toFixed(2)} SIG available</p>
                  <p className="text-[10px] text-muted-foreground">Minimum payout: 10 SIG</p>
                </div>
              </div>
              <Button
                onClick={() => payoutMutation.mutate()}
                disabled={pendingEarnings < 10 || payoutMutation.isPending}
                className={cn(
                  "gap-2 min-w-[160px]",
                  pendingEarnings >= 10
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                    : ""
                )}
                data-testid="button-request-payout"
              >
                <Wallet className="w-4 h-4" />
                {payoutMutation.isPending ? "Processing..." : "Request Payout"}
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <GlassCard className="p-5" data-testid="cross-platform-section">
            <div className="flex items-center gap-2 mb-1">
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-foreground">Cross-Platform Links</h3>
            </div>
            <p className="text-[11px] text-muted-foreground mb-4">Your referral works across the entire Trust Layer ecosystem.</p>
            {linkLoading ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {crossPlatformLinks.map((cp: any) => (
                  <div key={cp.app} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors border border-white/5" data-testid={`cross-link-${cp.domain}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground">{cp.app}</p>
                        <p className="text-[10px] text-muted-foreground truncate font-mono">{cp.link}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 min-h-[44px] min-w-[44px] h-11 w-11 rounded-xl hover:bg-emerald-500/15"
                      onClick={() => copyToClipboard(cp.link, cp.app)}
                      data-testid={`button-copy-${cp.domain}`}
                    >
                      {copiedCross === cp.app ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}