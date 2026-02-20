import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanSearch, Mountain, Bike, Tent, Fish, Crosshair,
  Zap, Snowflake, Waves, TreePine, Axe, ShoppingBag, MapPinned,
  Anchor, ShieldAlert, Heart, DollarSign, ChevronRight, ChevronDown,
  Search, Compass, Layers, Star, Navigation, BarChart3, Users,
  Megaphone, Settings, Shield, Server, CreditCard, Globe, Code2,
  LineChart, PieChart, TrendingUp, Activity, FileText, Target,
  Bell, Mail, Palette, Lock, Database, Gauge, Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { featureCategories } from "./explore";

const adminCategories = [
  {
    id: "analytics",
    title: "Analytics Dashboard",
    subtitle: "Real-time metrics, engagement, and revenue",
    image: "/images/cat-analytics.jpg",
    icon: BarChart3,
    featureCount: 10,
    color: "emerald",
    features: [
      "Real-time active users tracking",
      "Daily/weekly/monthly active users (DAU/WAU/MAU)",
      "Feature usage heatmaps",
      "User session duration analytics",
      "Conversion funnel tracking",
      "Revenue per user (ARPU) metrics",
      "Churn rate and retention cohorts",
      "Geographic user distribution",
      "Device and platform breakdown",
      "Custom dashboard builder",
    ],
  },
  {
    id: "user-mgmt",
    title: "User Management",
    subtitle: "Accounts, roles, and moderation",
    image: "/images/cat-publiclands.jpg",
    icon: Users,
    featureCount: 8,
    color: "slate",
    features: [
      "User account directory with search",
      "Role-based access control (RBAC)",
      "Subscription tier management",
      "User activity logs and audit trail",
      "Account suspension and moderation",
      "Bulk user operations (email, export)",
      "User feedback and support tickets",
      "Identity verification management",
    ],
  },
  {
    id: "marketing",
    title: "Marketing Hub",
    subtitle: "Campaigns, SEO, and affiliate management",
    image: "/images/cat-marketing.jpg",
    icon: Megaphone,
    featureCount: 9,
    color: "amber",
    features: [
      "Push notification campaign builder",
      "Email marketing automation",
      "In-app banner management",
      "Affiliate program dashboard (50+ retailers)",
      "Commission tracking and payouts",
      "SEO performance monitoring",
      "Social media integration",
      "Referral program management",
      "A/B testing for features and UI",
    ],
  },
  {
    id: "revenue",
    title: "Revenue & Billing",
    subtitle: "Subscriptions, payments, and commissions",
    image: "/images/cat-pricecompare.jpg",
    icon: CreditCard,
    featureCount: 8,
    color: "emerald",
    features: [
      "Subscription revenue dashboard",
      "Payment processing overview (Stripe)",
      "Affiliate commission reports",
      "AdSense revenue tracking",
      "Invoice management",
      "Refund and dispute handling",
      "Revenue forecasting",
      "Tax reporting exports",
    ],
  },
  {
    id: "content",
    title: "Content Management",
    subtitle: "Trails, species, and educational content",
    image: "/images/cat-conservation.jpg",
    icon: FileText,
    featureCount: 7,
    color: "emerald",
    features: [
      "Trail database management (add/edit/remove)",
      "Species database curation",
      "Educational content editor",
      "Image and media library",
      "Featured content scheduling",
      "User-submitted content moderation",
      "Conservation partner management",
    ],
  },
  {
    id: "trustshield",
    title: "TrustShield Admin",
    subtitle: "Blockchain verification and dispute resolution",
    image: "/images/cat-woodmarket.jpg",
    icon: Shield,
    featureCount: 7,
    color: "amber",
    features: [
      "Vendor verification queue",
      "Trust Score oversight and adjustments",
      "Escrow transaction monitoring",
      "Dispute resolution dashboard",
      "Smart contract audit logs",
      "Fraud detection alerts",
      "Blockchain health monitoring",
    ],
  },
  {
    id: "infrastructure",
    title: "Infrastructure",
    subtitle: "Servers, APIs, and system health",
    image: "/images/cat-analytics.jpg",
    icon: Server,
    featureCount: 6,
    color: "slate",
    features: [
      "API health monitoring and uptime",
      "Database performance metrics",
      "CDN and asset delivery stats",
      "Error tracking and logging",
      "Rate limiting configuration",
      "Third-party integration status",
    ],
  },
  {
    id: "api-mgmt",
    title: "Public API",
    subtitle: "Developer portal and API key management",
    image: "/images/cat-emobility.jpg",
    icon: Code2,
    featureCount: 5,
    color: "slate",
    features: [
      "API key generation and management",
      "Usage quota tracking per tier",
      "Developer documentation portal",
      "Webhook configuration",
      "API rate limiting per key",
    ],
  },
];

const colorMap: Record<string, string> = {
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  slate: "text-slate-400",
};

const bgColorMap: Record<string, string> = {
  emerald: "bg-emerald-500/15",
  amber: "bg-amber-500/15",
  slate: "bg-slate-500/15",
};

const adminTotal = adminCategories.reduce((sum, cat) => sum + cat.featureCount, 0);
const userTotal = featureCategories.reduce((sum, cat) => sum + cat.featureCount, 0);

export default function Admin() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"admin" | "features">("admin");
  const [searchQuery, setSearchQuery] = useState("");

  const displayCategories = activeTab === "admin" ? adminCategories : featureCategories;

  const filteredCategories = searchQuery.trim()
    ? displayCategories.filter(
        (cat) =>
          cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : displayCategories;

  return (
    <div className="min-h-screen">
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src="/images/cat-analytics.jpg"
          alt="Verdara Admin"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Gauge className="w-6 h-6 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-400">Developer Console</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2">
              Owner Dashboard
            </h1>
            <p className="text-white/70 text-sm md:text-base max-w-lg">
              {adminTotal + userTotal} total features. Manage your platform, users, revenue, and the entire Verdara ecosystem.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-5 md:px-10 py-6 space-y-6">
        <div className="flex items-center gap-2 max-w-xl mx-auto">
          <Button
            variant={activeTab === "admin" ? "default" : "outline"}
            className={cn(
              "flex-1 gap-2 text-xs",
              activeTab === "admin" && "bg-amber-500 text-white"
            )}
            onClick={() => { setActiveTab("admin"); setSearchQuery(""); setExpandedCategory(null); }}
            data-testid="tab-admin-tools"
          >
            <Wrench className="w-3.5 h-3.5" /> Business Tools ({adminCategories.length})
          </Button>
          <Button
            variant={activeTab === "features" ? "default" : "outline"}
            className={cn(
              "flex-1 gap-2 text-xs",
              activeTab === "features" && "bg-emerald-500 text-white"
            )}
            onClick={() => { setActiveTab("features"); setSearchQuery(""); setExpandedCategory(null); }}
            data-testid="tab-user-features"
          >
            <Compass className="w-3.5 h-3.5" /> User Features ({featureCategories.length})
          </Button>
        </div>

        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={activeTab === "admin" ? "Search admin tools..." : "Search user features..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-card-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            data-testid="input-admin-search"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
          <div className="rounded-xl bg-card border border-card-border p-3 text-center">
            <div className="text-lg font-bold text-emerald-500" data-testid="stat-total-features">{adminTotal + userTotal}</div>
            <div className="text-[11px] text-muted-foreground">Total Features</div>
          </div>
          <div className="rounded-xl bg-card border border-card-border p-3 text-center">
            <div className="text-lg font-bold text-amber-500">{adminCategories.length}</div>
            <div className="text-[11px] text-muted-foreground">Admin Tools</div>
          </div>
          <div className="rounded-xl bg-card border border-card-border p-3 text-center">
            <div className="text-lg font-bold text-emerald-500">{featureCategories.length}</div>
            <div className="text-[11px] text-muted-foreground">User Categories</div>
          </div>
          <div className="rounded-xl bg-card border border-card-border p-3 text-center">
            <div className="text-lg font-bold text-slate-400">8</div>
            <div className="text-[11px] text-muted-foreground">Dev Phases</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <div
                className="rounded-2xl overflow-hidden bg-card border border-card-border group cursor-pointer"
                data-testid={`card-admin-${cat.id}`}
              >
                <div className="relative h-36">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <Badge className={cn(bgColorMap[cat.color], colorMap[cat.color], "text-[10px]")}>
                      {cat.featureCount} features
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center bg-black/30 backdrop-blur-md", colorMap[cat.color])}>
                        <cat.icon className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-white font-semibold text-sm">{cat.title}</h3>
                    </div>
                    <p className="text-white/60 text-xs">{cat.subtitle}</p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    {"href" in cat ? (
                      <Link href={(cat as any).href}>
                        <Button className="bg-emerald-500 text-white gap-2 text-xs" data-testid={`button-open-${cat.id}`}>
                          <Navigation className="w-3.5 h-3.5" /> Open
                        </Button>
                      </Link>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30 gap-1">
                        <Lock className="w-3 h-3" /> Coming Soon
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      className="gap-2 text-xs"
                      onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                      data-testid={`button-details-${cat.id}`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      {expandedCategory === cat.id ? "Hide" : "Details"}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {expandedCategory === cat.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 border-t border-card-border space-y-1.5">
                          {cat.features.map((feature, fi) => (
                            <div key={fi} className="flex items-start gap-2 text-xs">
                              <Star className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
