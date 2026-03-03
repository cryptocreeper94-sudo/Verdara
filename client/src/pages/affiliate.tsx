import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Copy, Check, Users, UserCheck, Coins, Wallet, ChevronRight,
  TrendingUp, Share2, ExternalLink, Award, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  Base: { bg: "bg-slate-500/15", text: "text-slate-400", border: "border-slate-500/30" },
  Silver: { bg: "bg-gray-400/15", text: "text-gray-300", border: "border-gray-400/30" },
  Gold: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
  Platinum: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
  Diamond: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400",
  converted: "bg-emerald-500/15 text-emerald-400",
  expired: "bg-red-500/15 text-red-400",
  processing: "bg-blue-500/15 text-blue-400",
  paid: "bg-emerald-500/15 text-emerald-400",
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Share2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2" data-testid="text-affiliate-auth-required">Sign in to access the Affiliate Program</h2>
          <p className="text-sm text-muted-foreground">Earn SIG across all 32 Trust Layer apps with one link.</p>
        </div>
      </div>
    );
  }

  const dash = dashboardData || {};
  const tierName = dash.tier || "Base";
  const tierColor = tierColors[tierName] || tierColors.Base;
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

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <Share2 className="w-6 h-6 text-emerald-400" />
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-affiliate-title">Share & Earn</h1>
          <Badge className={cn(tierColor.bg, tierColor.text)} data-testid="badge-current-tier">{tierName}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Earn up to 20% commission on referrals across all Trust Layer apps.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl bg-card border border-card-border p-5 mb-6"
        data-testid="referral-link-section"
      >
        <div className="flex items-center gap-2 mb-3">
          <Share2 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground">Your Referral Link</h3>
        </div>
        {linkLoading ? (
          <div className="h-10 bg-muted/30 rounded-lg animate-pulse" />
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 bg-muted/20 rounded-lg px-4 py-2.5 text-sm text-foreground truncate border border-card-border" data-testid="text-referral-link">
              {referralLink}
            </div>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(referralLink)}
              data-testid="button-copy-referral"
            >
              {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl bg-card border border-card-border p-5 mb-6"
        data-testid="tier-progress-section"
      >
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-foreground">Tier Progress</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn(tierColor.bg, tierColor.text)}>{tierName}</Badge>
            {nextTier && (
              <>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <Badge variant="outline">{nextTier.name}</Badge>
              </>
            )}
          </div>
        </div>
        <div className="w-full h-2.5 bg-muted/30 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressToNext}%` }}
            data-testid="progress-tier"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {nextTier
            ? `${convertedReferrals} / ${nextTier.minConverted} converted referrals to reach ${nextTier.name} (${(nextTier.rate * 100).toFixed(1)}%)`
            : `Maximum tier reached — ${(dash.tierRate * 100 || 20).toFixed(1)}% commission rate`}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Referrals", value: dash.totalReferrals || 0, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Converted", value: convertedReferrals, icon: UserCheck, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Pending Earnings", value: `${pendingEarnings.toFixed(2)} SIG`, icon: Coins, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Paid Earnings", value: `${paidEarnings.toFixed(2)} SIG`, icon: Wallet, color: "text-slate-500", bg: "bg-slate-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="rounded-xl bg-card border border-card-border p-5"
            data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", stat.bg)}>
              <stat.icon className={cn("w-4.5 h-4.5", stat.color)} />
            </div>
            <div className="text-xl font-bold text-foreground">{dashLoading ? "--" : stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-xl bg-card border border-card-border p-5 mb-6"
        data-testid="tier-table-section"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground">Commission Tiers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border">
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Tier</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Min. Referrals</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Commission Rate</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {allTiers.map((tier: any) => {
                const isCurrentTier = tier.name === tierName;
                const tc = tierColors[tier.name] || tierColors.Base;
                return (
                  <tr key={tier.name} className={cn("border-b border-card-border/50 last:border-0", isCurrentTier && "bg-emerald-500/5")} data-testid={`tier-row-${tier.name.toLowerCase()}`}>
                    <td className="py-2.5 px-3">
                      <Badge className={cn(tc.bg, tc.text)}>{tier.name}</Badge>
                    </td>
                    <td className="py-2.5 px-3 text-foreground">{tier.minConverted}</td>
                    <td className="py-2.5 px-3 text-foreground font-medium">{(tier.rate * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3">
                      {isCurrentTier ? (
                        <Badge className="bg-emerald-500/15 text-emerald-400">Current</Badge>
                      ) : convertedReferrals >= tier.minConverted ? (
                        <span className="text-xs text-muted-foreground">Unlocked</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{tier.minConverted - convertedReferrals} more</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl bg-card border border-card-border p-5"
          data-testid="recent-referrals-section"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Referrals</h3>
          {referrals.length > 0 ? (
            <div className="space-y-3">
              {referrals.slice(0, 10).map((ref: any) => (
                <div key={ref.id} className="flex items-center justify-between gap-3 py-1.5" data-testid={`referral-item-${ref.id}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{ref.platform || "verdara"}</p>
                      <p className="text-xs text-muted-foreground">{ref.createdAt ? new Date(ref.createdAt).toLocaleDateString() : "—"}</p>
                    </div>
                  </div>
                  <Badge className={cn(statusColors[ref.status] || statusColors.pending)}>{ref.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No referrals yet. Share your link to start earning!</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-xl bg-card border border-card-border p-5"
          data-testid="recent-commissions-section"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Commissions</h3>
          {commissions.length > 0 ? (
            <div className="space-y-3">
              {commissions.slice(0, 10).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between gap-3 py-1.5" data-testid={`commission-item-${c.id}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground font-medium">{parseFloat(c.amount || "0").toFixed(2)} SIG</p>
                      <p className="text-xs text-muted-foreground">{c.tier || "base"} tier &middot; {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</p>
                    </div>
                  </div>
                  <Badge className={cn(statusColors[c.status] || statusColors.pending)}>{c.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Coins className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No commissions yet. Commissions appear when referrals convert.</p>
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center mb-8"
      >
        <Button
          onClick={() => payoutMutation.mutate()}
          disabled={pendingEarnings < 10 || payoutMutation.isPending}
          className="bg-emerald-500 text-white gap-2"
          data-testid="button-request-payout"
        >
          <Wallet className="w-4 h-4" />
          {payoutMutation.isPending ? "Processing..." : "Request Payout"}
        </Button>
        {pendingEarnings < 10 && (
          <p className="text-xs text-muted-foreground ml-3">Minimum payout: 10 SIG</p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="rounded-xl bg-card border border-card-border p-5"
        data-testid="cross-platform-section"
      >
        <div className="flex items-center gap-2 mb-4">
          <ExternalLink className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground">Cross-Platform Referral Links</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Your referral link works across all Trust Layer ecosystem apps.</p>
        {linkLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted/30 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-2.5">
            {crossPlatformLinks.map((cp: any) => (
              <div key={cp.app} className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-muted/10 border border-card-border/50" data-testid={`cross-link-${cp.domain}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground font-medium">{cp.app}</p>
                    <p className="text-xs text-muted-foreground truncate">{cp.link}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(cp.link, cp.app)}
                  data-testid={`button-copy-${cp.domain}`}
                >
                  {copiedCross === cp.app ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}