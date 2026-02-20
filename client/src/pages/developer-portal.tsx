import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Rocket, Target, Map, TrendingUp, BarChart3, Code, Pen, Users,
  ExternalLink, CheckCircle2, Clock, Circle, DollarSign, Globe,
  Zap, ShieldCheck, Star, ChevronDown, ChevronUp, ArrowRight,
  Layers, Network
} from "lucide-react";

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

type PhaseStatus = "completed" | "in-progress" | "planned";

interface RoadmapPhase {
  id: string;
  phase: number;
  title: string;
  status: PhaseStatus;
  features: string[];
}

const roadmapPhases: RoadmapPhase[] = [
  {
    id: "phase-1",
    phase: 1,
    title: "Foundation",
    status: "completed",
    features: [
      "Custom auth with email verification",
      "24 activity category pages",
      "AI Nature Identification engine",
      "GPS Trail Tracker with live positioning",
      "Trip Planner with gear checklists",
    ],
  },
  {
    id: "phase-2",
    phase: 2,
    title: "Marketplace & Payments",
    status: "completed",
    features: [
      "Wood Economy Marketplace with TrustShield",
      "Stripe payment integration",
      "Escrow system for marketplace transactions",
      "Arborist Pro business suite (clients, jobs, invoices)",
    ],
  },
  {
    id: "phase-3",
    phase: 3,
    title: "Data & Discovery",
    status: "completed",
    features: [
      "Living catalog (170+ locations, 41 states, growing daily)",
      "Proximity search by zip code",
      "Species database (fish, wildlife, game)",
      "Wild Edibles & Natural Medicine database (15+ plants)",
      "Activity location seeding (100+ locations, 16 types)",
      "Complete geographic coverage (mountains to coastlines to caves)",
    ],
  },
  {
    id: "phase-4",
    phase: 4,
    title: "Monetization",
    status: "in-progress",
    features: [
      "Price Compare with 60+ retailer integrations",
      "Affiliate program network (7 networks, 62+ brands)",
      "Subscription tiers (Free/Explorer/Pro Adventurer/Elite)",
      "Revenue analytics dashboard",
    ],
  },
  {
    id: "phase-5",
    phase: 5,
    title: "Intelligence & SEO",
    status: "planned",
    features: [
      "AI-powered blog engine with auto-generated content",
      "SEO optimization (structured data, meta tags, sitemaps)",
      "Location-based content generation",
      "Social media sharing optimization",
    ],
  },
  {
    id: "phase-6",
    phase: 6,
    title: "Advanced Analytics",
    status: "planned",
    features: [
      "Business intelligence dashboard",
      "User behavior analytics",
      "Affiliate conversion tracking",
      "Revenue forecasting",
      "A/B testing framework",
    ],
  },
  {
    id: "phase-7",
    phase: 7,
    title: "Ecosystem Expansion",
    status: "planned",
    features: [
      "VedaSolus wellness hub integration (Ayurvedic, TCM, herbal medicine)",
      "Additional business verticals beyond Arborist",
      "Trust Layer SSO ecosystem integration",
      "GarageBot API connection",
      "White-label partner API",
      "Mobile native app (iOS/Android)",
    ],
  },
  {
    id: "phase-8",
    phase: 8,
    title: "Living Catalog & Knowledge Base",
    status: "planned",
    features: [
      "Expand to 5,000+ outdoor locations nationwide",
      "Comprehensive wild edibles encyclopedia (500+ plants)",
      "Natural medicine database with historical ethnobotany",
      "AI-powered foraging identification (plant + mushroom)",
      "Regional seasonal foraging calendars",
      "User-contributed location and plant sightings",
    ],
  },
  {
    id: "phase-9",
    phase: 9,
    title: "Scale & Growth",
    status: "planned",
    features: [
      "CDN and edge caching",
      "Internationalization (i18n)",
      "Enterprise features",
      "Advanced AI recommendations",
      "Community features (forums, reviews, guides)",
    ],
  },
];

interface AffiliateNetwork {
  name: string;
  website: string;
  signupUrl: string;
  signupFee: string;
  paymentTerms: string;
  brands: string[];
  priority: "HIGH" | "MEDIUM" | "LOW";
}

const affiliateNetworks: AffiliateNetwork[] = [
  {
    name: "Impact",
    website: "impact.com",
    signupUrl: "https://app.impact.com/signup",
    signupFee: "Free",
    paymentTerms: "NET 30-60",
    brands: ["REI", "Bass Pro", "Backcountry", "Dick's"],
    priority: "HIGH",
  },
  {
    name: "AvantLink",
    website: "avantlink.com",
    signupUrl: "https://www.avantlink.com/affiliate-signup",
    signupFee: "Free",
    paymentTerms: "Monthly, 30-day hold",
    brands: ["Simms", "Big Agnes", "NRS", "evo", "Black Diamond"],
    priority: "HIGH",
  },
  {
    name: "Awin",
    website: "awin.com",
    signupUrl: "https://www.awin.com/us/publishers",
    signupFee: "$1 (refunded)",
    paymentTerms: "Monthly, NET 30",
    brands: ["Moosejaw", "Chain Reaction Cycles"],
    priority: "MEDIUM",
  },
  {
    name: "ShareASale",
    website: "shareasale.com",
    signupUrl: "https://www.shareasale.com/newsignup.cfm",
    signupFee: "Free",
    paymentTerms: "Monthly, on the 20th",
    brands: ["Sierra", "Karl's", "Fishing brands"],
    priority: "MEDIUM",
  },
  {
    name: "CJ Affiliates",
    website: "cj.com",
    signupUrl: "https://signup.cj.com/member/signup/publisher/",
    signupFee: "Free",
    paymentTerms: "Monthly, NET 20",
    brands: ["Academy", "Midway USA", "Brownells"],
    priority: "MEDIUM",
  },
  {
    name: "Rakuten",
    website: "rakutenadvertising.com",
    signupUrl: "https://rakutenadvertising.com/en/publishers/",
    signupFee: "Free",
    paymentTerms: "Monthly",
    brands: ["Orvis"],
    priority: "LOW",
  },
  {
    name: "Partnerize",
    website: "partnerize.com",
    signupUrl: "https://partnerize.com/partners/",
    signupFee: "Free",
    paymentTerms: "Monthly",
    brands: ["General retail"],
    priority: "LOW",
  },
];

interface TopPartner {
  rank: number;
  retailer: string;
  commission: string;
  avgOrder: string;
  estPerSale: string;
  cookie: string;
  priority: "HIGH" | "MEDIUM";
}

const topPartners: TopPartner[] = [
  { rank: 1, retailer: "Rad Power Bikes", commission: "3-6%", avgOrder: "$1,500", estPerSale: "$45-90", cookie: "30d", priority: "HIGH" },
  { rank: 2, retailer: "Aventon", commission: "5-8%", avgOrder: "$1,500", estPerSale: "$75-120", cookie: "30d", priority: "HIGH" },
  { rank: 3, retailer: "Backcountry", commission: "4-12%", avgOrder: "$125", estPerSale: "$5-15", cookie: "30d", priority: "HIGH" },
  { rank: 4, retailer: "Simms Fishing", commission: "10%", avgOrder: "$200", estPerSale: "$20", cookie: "30-90d", priority: "HIGH" },
  { rank: 5, retailer: "REI", commission: "5%", avgOrder: "$120", estPerSale: "$6", cookie: "15d", priority: "HIGH" },
  { rank: 6, retailer: "BOTE", commission: "5-8%", avgOrder: "$1,000", estPerSale: "$50-80", cookie: "30d", priority: "MEDIUM" },
  { rank: 7, retailer: "Arc'teryx", commission: "3-5%", avgOrder: "$400", estPerSale: "$12-20", cookie: "14-30d", priority: "MEDIUM" },
  { rank: 8, retailer: "Big Agnes", commission: "8%", avgOrder: "$250", estPerSale: "$20", cookie: "30d", priority: "MEDIUM" },
  { rank: 9, retailer: "First Lite", commission: "8-10%", avgOrder: "$150", estPerSale: "$12-15", cookie: "30d", priority: "MEDIUM" },
  { rank: 10, retailer: "Bass Pro Shops", commission: "5%", avgOrder: "$100", estPerSale: "$5", cookie: "14d", priority: "HIGH" },
];

const platformStats = [
  { label: "Features", value: "184", icon: Layers },
  { label: "Categories", value: "24", icon: Target },
  { label: "Locations", value: "170+", icon: Map },
  { label: "States", value: "41", icon: Globe },
  { label: "Affiliate Partners", value: "62+", icon: Network },
  { label: "Affiliate Networks", value: "7", icon: ShieldCheck },
];

const businessTools = [
  { title: "Advanced Analytics", icon: BarChart3, description: "Revenue forecasting, user analytics, conversion tracking" },
  { title: "Partner Management", icon: Users, description: "Manage affiliate relationships, track performance" },
  { title: "Content Engine", icon: Pen, description: "AI-driven blog, SEO optimization, content calendar" },
  { title: "API Gateway", icon: Code, description: "RESTful API, webhooks, partner integrations" },
];

const quickLinks = [
  { title: "Affiliate Research Doc", description: "Download the full affiliate program directory", href: "#", available: true },
  { title: "API Documentation", description: "RESTful API reference and guides", href: "#", available: false },
  { title: "Brand Guidelines", description: "Verdara brand assets and usage rules", href: "#", available: false },
  { title: "Contact DarkWave", description: "Reach the development team", href: "mailto:contact@darkwavestudios.dev", available: true },
];

const statusConfig: Record<PhaseStatus, { label: string; badgeClass: string; icon: typeof CheckCircle2; borderClass: string }> = {
  completed: { label: "COMPLETED", badgeClass: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle2, borderClass: "border-l-emerald-500" },
  "in-progress": { label: "IN PROGRESS", badgeClass: "bg-amber-500/20 text-amber-400", icon: Clock, borderClass: "border-l-amber-500" },
  planned: { label: "PLANNED", badgeClass: "bg-slate-500/20 text-slate-400", icon: Circle, borderClass: "border-l-slate-500" },
};

const priorityBadgeClass: Record<string, string> = {
  HIGH: "bg-emerald-500/20 text-emerald-400",
  MEDIUM: "bg-amber-500/20 text-amber-400",
  LOW: "bg-slate-500/20 text-slate-400",
};

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function DeveloperPortal() {
  useEffect(() => {
    document.title = "Developer Portal - Verdara by DarkWave Studios";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Verdara Developer Portal: 8-phase product roadmap, 62+ affiliate partner directory across 7 networks, business intelligence preview, and platform resources for DarkWave Studios.");
    return () => { document.title = "Verdara - AI-Powered Outdoor Recreation Super-App | DarkWave Studios"; };
  }, []);

  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    roadmapPhases.forEach((p) => {
      if (p.status === "in-progress") initial.add(p.id);
    });
    return initial;
  });

  const togglePhase = (id: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen" data-testid="page-developer-portal">
      <div className="relative overflow-hidden py-20 px-5 md:px-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/60 via-black/80 to-amber-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <Badge className="bg-amber-500/20 text-amber-400 mb-4" data-testid="badge-studio">
              <Zap className="w-3 h-3 mr-1" />
              DarkWave Studios
            </Badge>
          </motion.div>
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight"
            variants={fadeUp}
            data-testid="text-hero-title"
          >
            Verdara Developer Portal
          </motion.h1>
          <motion.p
            className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-8"
            variants={fadeUp}
            data-testid="text-hero-subtitle"
          >
            Platform roadmap, partner integrations, and business intelligence
          </motion.p>
          <motion.div className="flex flex-wrap items-center justify-center gap-3" variants={fadeUp}>
            <Button
              className="bg-emerald-600 text-white gap-2"
              onClick={() => scrollTo("roadmap")}
              data-testid="button-view-roadmap"
            >
              <Rocket className="w-4 h-4" />
              View Roadmap
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => scrollTo("affiliates")}
              data-testid="button-affiliate-partners"
            >
              <Network className="w-4 h-4" />
              Affiliate Partners
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <div className="px-5 md:px-10 -mt-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 md:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {platformStats.map((stat) => (
                <div key={stat.label} className="text-center" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <stat.icon className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                  <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-[11px] text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-5 md:px-10 py-16 max-w-5xl mx-auto" id="roadmap">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-roadmap-title">
                Product Roadmap
              </h2>
            </div>
            <p className="text-sm text-muted-foreground ml-[52px]">
              8 phases from foundation to scale
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/40 via-amber-500/30 to-slate-500/20 hidden md:block" />

            <div className="space-y-4">
              {roadmapPhases.map((phase) => {
                const config = statusConfig[phase.status];
                const isExpanded = expandedPhases.has(phase.id);
                const StatusIcon = config.icon;

                return (
                  <motion.div key={phase.id} variants={fadeUp}>
                    <div className="flex gap-4 items-start">
                      <div className="hidden md:flex flex-col items-center flex-shrink-0">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2",
                            phase.status === "completed" && "border-emerald-500 bg-emerald-500/15",
                            phase.status === "in-progress" && "border-amber-500 bg-amber-500/15",
                            phase.status === "planned" && "border-slate-500 bg-slate-500/15"
                          )}
                        >
                          <StatusIcon
                            className={cn(
                              "w-4 h-4",
                              phase.status === "completed" && "text-emerald-400",
                              phase.status === "in-progress" && "text-amber-400",
                              phase.status === "planned" && "text-slate-400"
                            )}
                          />
                        </div>
                      </div>
                      <Card
                        className={cn(
                          "flex-1 overflow-visible cursor-pointer border-l-4",
                          config.borderClass
                        )}
                        onClick={() => togglePhase(phase.id)}
                        data-testid={`card-phase-${phase.phase}`}
                      >
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <CardTitle className="text-sm md:text-base">
                              Phase {phase.phase} — {phase.title}
                            </CardTitle>
                            <Badge className={cn("text-[10px]", config.badgeClass)} data-testid={`badge-status-${phase.phase}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {config.label}
                            </Badge>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            data-testid={`button-toggle-phase-${phase.phase}`}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        </CardHeader>
                        {isExpanded && (
                          <CardContent className="pt-0 pb-4">
                            <div className="space-y-2">
                              {phase.features.map((f, fi) => (
                                <div key={fi} className="flex items-start gap-2 text-sm">
                                  {phase.status === "completed" ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                  ) : phase.status === "in-progress" ? (
                                    <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                                  )}
                                  <span className="text-muted-foreground">{f}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-5 md:px-10 py-16 max-w-6xl mx-auto" id="affiliates">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <Network className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-networks-title">
                Affiliate Network Directory
              </h2>
            </div>
            <p className="text-sm text-muted-foreground ml-[52px]">
              7 networks hosting 62+ outdoor brands
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {affiliateNetworks.map((net) => (
              <motion.div key={net.name} variants={fadeUp}>
                <Card className="overflow-visible h-full" data-testid={`card-network-${net.name.toLowerCase().replace(/\s+/g, "-")}`}>
                  <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-sm">{net.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{net.website}</p>
                    </div>
                    <Badge className={cn("text-[10px] flex-shrink-0", priorityBadgeClass[net.priority])}>
                      {net.priority}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between gap-2">
                        <span>Sign-up Fee</span>
                        <span className="text-foreground font-medium">{net.signupFee}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span>Payment</span>
                        <span className="text-foreground font-medium">{net.paymentTerms}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {net.brands.map((brand) => (
                        <Badge key={brand} variant="secondary" className="text-[10px]">
                          {brand}
                        </Badge>
                      ))}
                    </div>
                    <a href={net.signupUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full gap-2 text-xs mt-1" data-testid={`button-signup-${net.name.toLowerCase().replace(/\s+/g, "-")}`}>
                        <ExternalLink className="w-3.5 h-3.5" />
                        Sign Up
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground" data-testid="text-top-partners-title">
                Top Affiliate Partners by Revenue Potential
              </h3>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="overflow-visible">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="table-top-partners">
                    <thead>
                      <tr className="border-b border-card-border">
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">#</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Retailer</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Commission</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Avg Order</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Est. / Sale</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Cookie</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPartners.map((p) => (
                        <tr
                          key={p.rank}
                          className="border-b border-card-border last:border-b-0"
                          data-testid={`row-partner-${p.rank}`}
                        >
                          <td className="px-4 py-3 font-medium text-foreground">{p.rank}</td>
                          <td className="px-4 py-3 font-medium text-foreground">{p.retailer}</td>
                          <td className="px-4 py-3 text-emerald-400">{p.commission}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.avgOrder}</td>
                          <td className="px-4 py-3 text-amber-400 font-medium hidden md:table-cell">{p.estPerSale}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{p.cookie}</td>
                          <td className="px-4 py-3">
                            <Badge className={cn("text-[10px]", priorityBadgeClass[p.priority])}>
                              {p.priority}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      <div className="px-5 md:px-10 py-16 max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-business-suite-title">
                Business Suite
              </h2>
            </div>
            <p className="text-sm text-muted-foreground ml-[52px]">
              Enterprise tools for managing the Verdara ecosystem
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {businessTools.map((tool) => (
              <motion.div key={tool.title} variants={fadeUp}>
                <div
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 h-full"
                  data-testid={`card-tool-${tool.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <tool.icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-400 text-[10px] flex-shrink-0">
                      Coming Soon
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{tool.title}</h3>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="px-5 md:px-10 py-16 max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-500/15 flex items-center justify-center">
                <Layers className="w-5 h-5 text-slate-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-resources-title">
                Resources
              </h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link) => (
              <motion.div key={link.title} variants={fadeUp}>
                {link.available ? (
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    <Card
                      className="overflow-visible hover-elevate cursor-pointer"
                      data-testid={`card-resource-${link.title.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <CardContent className="p-5 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-sm text-foreground">{link.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </CardContent>
                    </Card>
                  </a>
                ) : (
                  <Card
                    className="overflow-visible opacity-60"
                    data-testid={`card-resource-${link.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <CardContent className="p-5 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-sm text-foreground">{link.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
                      </div>
                      <Badge className="bg-slate-500/20 text-slate-400 text-[10px] flex-shrink-0">Soon</Badge>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="px-5 md:px-10 py-10 text-center">
        <p className="text-xs text-muted-foreground">
          Verdara Developer Portal — DarkWave Studios
        </p>
      </div>
    </div>
  );
}