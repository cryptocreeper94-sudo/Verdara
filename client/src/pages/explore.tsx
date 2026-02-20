import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanSearch, Mountain, Bike, RockingChair, Tent, Fish, Crosshair,
  Zap, Snowflake, Waves, TreePine, Axe, ShoppingBag, MapPinned,
  Anchor, ShieldAlert, Heart, DollarSign, ChevronRight, ArrowLeft,
  Search, Compass, Layers, Star, Lock, Navigation, Flame, BookOpen, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const featureCategories = [
  {
    id: "ai-identify",
    title: "AI Nature ID",
    subtitle: "Camera-powered species identification",
    image: "/images/cat-ai-identify.jpg",
    icon: ScanSearch,
    featureCount: 11,
    color: "emerald",
    href: "/identify",
    features: [
      "Camera/upload species identification",
      "Tree species ID (bark, leaves, form)",
      "Plant identification (wildflowers, shrubs)",
      "Fish species ID (freshwater + saltwater)",
      "Wildlife ID (mammals, birds, reptiles)",
      "Confidence score display",
      "Detailed species information",
      "Similar species suggestions",
      "Save to user collection",
      "Identification history",
      "Share results to social media",
    ],
  },
  {
    id: "hiking",
    title: "Hiking",
    subtitle: "Trail discovery and GPS tracking",
    image: "/images/cat-hiking.jpg",
    icon: Mountain,
    featureCount: 7,
    color: "emerald",
    href: "/trails",
    features: [
      "Trail discovery with map visualization",
      "Trail difficulty ratings",
      "Distance & elevation calculations",
      "Trail reviews and ratings",
      "Real-time trail condition reports",
      "Downloadable offline trail maps",
      "Trailhead parking & access info",
    ],
  },
  {
    id: "mtb",
    title: "Mountain Biking",
    subtitle: "MTB trails, parks, and routes",
    image: "/images/cat-mtb.jpg",
    icon: Bike,
    featureCount: 5,
    color: "amber",
    href: "/trails",
    features: [
      "MTB-specific trail filtering",
      "Technical difficulty ratings",
      "Trail features tagging (jumps, drops, berms)",
      "Bike park directory with lift-served trails",
      "Strava/TrailForks integration",
    ],
  },
  {
    id: "climbing",
    title: "Rock Climbing",
    subtitle: "Crags, routes, and partner finder",
    image: "/images/cat-climbing.jpg",
    icon: Mountain,
    featureCount: 6,
    color: "amber",
    href: "/climbing",
    features: [
      "Climbing area database (sport, trad, bouldering)",
      "Route grades (YDS, V-scale, French, UIAA)",
      "Route beta and descriptions",
      "Crag approach information",
      "Climbing gym directory",
      "Partner finder for climbing buddies",
    ],
  },
  {
    id: "camping",
    title: "Camping",
    subtitle: "Campgrounds, booking, and dispersed spots",
    image: "/images/cat-camping.jpg",
    icon: Tent,
    featureCount: 6,
    color: "emerald",
    href: "/planner",
    features: [
      "Campground directory (developed + dispersed)",
      "Campsite booking integration",
      "Amenities filtering (water, toilets, hookups)",
      "Campground reviews and photos",
      "Dispersed camping regulations",
      "Camp spot GPS coordinates & access",
    ],
  },
  {
    id: "fishing",
    title: "Fishing",
    subtitle: "Spots, species, and regulations",
    image: "/images/cat-fishing.jpg",
    icon: Fish,
    featureCount: 5,
    color: "slate",
    href: "/fishing",
    features: [
      "Fishing spot database (lakes, rivers, streams)",
      "Species availability by season",
      "Fishing regulations by state/region",
      "Tackle and bait recommendations",
      "Catch logging with photo upload",
    ],
  },
  {
    id: "hunting",
    title: "Hunting",
    subtitle: "Units, seasons, and regulations",
    image: "/images/cat-hunting.jpg",
    icon: Crosshair,
    featureCount: 6,
    color: "amber",
    href: "/hunting",
    features: [
      "Hunting unit/WMA database by state",
      "Game species seasons and bag limits",
      "Licensing requirements",
      "Hunting regulations by jurisdiction",
      "Public land hunting access",
      "Harvest reporting and logging",
    ],
  },
  {
    id: "emobility",
    title: "Electric Mobility",
    subtitle: "E-bikes, EUCs, and charging stations",
    image: "/images/cat-emobility.jpg",
    icon: Zap,
    featureCount: 8,
    color: "emerald",
    href: "/trails",
    features: [
      "E-bike trail compatibility filtering",
      "E-bike charging station map",
      "Onewheel trail recommendations",
      "Electric Unicycle group ride finder",
      "E-scooter urban trail routes",
      "Battery range calculators by terrain",
      "Electric mobility gear price comparison",
      "GarageBot integration for e-bike maintenance",
    ],
  },
  {
    id: "winter",
    title: "Winter Sports",
    subtitle: "Skiing, snowshoeing, and ice fishing",
    image: "/images/cat-winter.jpg",
    icon: Snowflake,
    featureCount: 5,
    color: "slate",
    href: "/trails",
    features: [
      "Ski resort directory with conditions",
      "Backcountry skiing/snowboarding zones",
      "Snowshoeing trail recommendations",
      "Ice fishing locations and regulations",
      "Winter avalanche safety resources",
    ],
  },
  {
    id: "watersports",
    title: "Water Sports",
    subtitle: "Kayaking, SUP, surfing, and rafting",
    image: "/images/cat-watersports.jpg",
    icon: Waves,
    featureCount: 5,
    color: "slate",
    href: "/trails",
    features: [
      "Kayaking/canoeing launch sites",
      "Stand-up paddleboarding locations",
      "Whitewater rafting river sections",
      "Surfing spot directory",
      "Water temperature and flow data",
    ],
  },
  {
    id: "publiclands",
    title: "Public Lands",
    subtitle: "National parks, forests, and WMAs",
    image: "/images/cat-publiclands.jpg",
    icon: TreePine,
    featureCount: 8,
    color: "emerald",
    href: "/public-lands",
    features: [
      "National Parks database with entrance fees",
      "State Parks by region",
      "Wildlife Management Areas",
      "Bureau of Land Management lands",
      "National Forests with regulations",
      "National Wildlife Refuges",
      "State Forests and game lands",
      "Land ownership maps (public/private)",
    ],
  },
  {
    id: "arborist",
    title: "Arborist Pro",
    subtitle: "Professional tree care business tools",
    image: "/images/cat-arborist.jpg",
    icon: Axe,
    featureCount: 15,
    color: "emerald",
    href: "/arborist",
    features: [
      "Client database with service history",
      "Job scheduling with reminders",
      "Quote/estimate generation",
      "Invoice creation & payment tracking",
      "Tree inventory for client properties",
      "Work order management with crews",
      "Equipment maintenance (GarageBot)",
      "Certificate/license expiration reminders",
      "Before/after job photo documentation",
      "GPS-tagged job site locations",
      "Revenue reporting & tax exports",
      "Client communication log",
      "Service package templates",
      "Insurance claim documentation",
      "Subcontractor management",
    ],
  },
  {
    id: "woodmarket",
    title: "Wood Marketplace",
    subtitle: "Buy and sell lumber with TrustShield",
    image: "/images/cat-woodmarket.jpg",
    icon: ShoppingBag,
    featureCount: 12,
    color: "amber",
    href: "/marketplace",
    features: [
      "Wood listing creation",
      "Advanced search filters",
      "Vendor verification (TrustShield 4 levels)",
      "Trust Score display (0-1000)",
      "Escrow payment system",
      "Smart contract enforcement",
      "Dispute resolution system",
      "Review authentication",
      "Equipment authenticity verification",
      "Buyer-seller messaging",
      "Offer/counteroffer negotiation",
      "Transaction history with blockchain receipts",
    ],
  },
  {
    id: "tripplan",
    title: "Trip Planning",
    subtitle: "Itineraries, gear lists, and bookings",
    image: "/images/cat-tripplan.jpg",
    icon: MapPinned,
    featureCount: 10,
    color: "emerald",
    href: "/planner",
    features: [
      "Multi-day trip itinerary builder",
      "Drag-drop waypoint management",
      "Gear checklist with templates",
      "Custom gear item addition",
      "Weather forecast integration",
      "Campground availability calendar",
      "Campsite reservation with payment",
      "Trip sharing with friends/family",
      "Emergency contact management",
      "Offline trip access",
    ],
  },
  {
    id: "charters",
    title: "Charters",
    subtitle: "Deep sea fishing & hunting charters",
    image: "/images/cat-charters.jpg",
    icon: Anchor,
    featureCount: 8,
    color: "slate",
    href: "/trails",
    features: [
      "Charter boat directory",
      "Captain profiles with ratings",
      "Charter availability calendar",
      "Species targeting options",
      "Pricing per person/full boat",
      "Gear included/BYO specifications",
      "Charter booking with deposit",
      "Charter review system with photos",
    ],
  },
  {
    id: "survival",
    title: "Survival Hub",
    subtitle: "Skills, gear, and emergency prep",
    image: "/images/cat-survival.jpg",
    icon: ShieldAlert,
    featureCount: 7,
    color: "amber",
    href: "/survival",
    features: [
      "Survival skills library",
      "Emergency preparation checklists",
      "Survival gear reviews",
      "Edible/medicinal plant guide",
      "Emergency signal techniques",
      "First aid for wilderness injuries",
      "Survival scenario simulations",
    ],
  },
  {
    id: "conservation",
    title: "Conservation",
    subtitle: "Education, grants, and volunteering",
    image: "/images/cat-conservation.jpg",
    icon: Heart,
    featureCount: 6,
    color: "emerald",
    href: "/conservation",
    features: [
      "Conservation organization directory",
      "Featured orgs: RMEF, Ducks Unlimited, etc.",
      "Educational content library",
      "User-voted quarterly grants",
      "Conservation impact tracking",
      "Volunteer opportunity listings",
    ],
  },
  {
    id: "pricecompare",
    title: "Price Compare",
    subtitle: "Compare prices across 50+ retailers",
    image: "/images/cat-pricecompare.jpg",
    icon: DollarSign,
    featureCount: 8,
    color: "amber",
    href: "/marketplace",
    features: [
      "Product search across 50+ retailers",
      "Real-time price comparison",
      "Price history charts (6-month)",
      "Price drop alerts",
      "Affiliate link generation",
      "Product reviews aggregation",
      "Stock availability checking",
      "Retailer reputation scores",
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

const totalFeatures = featureCategories.reduce((sum, cat) => sum + cat.featureCount, 0);

export default function Explore() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = searchQuery.trim()
    ? featureCategories.filter(
        (cat) =>
          cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : featureCategories;

  return (
    <div className="min-h-screen">
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src="/images/cat-publiclands.jpg"
          alt="Verdara Explore"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Compass className="w-6 h-6 text-emerald-400" />
              <Badge className="bg-emerald-500/20 text-emerald-400">Command Center</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2">
              Explore Verdara
            </h1>
            <p className="text-white/70 text-sm md:text-base max-w-lg">
              {totalFeatures} features across {featureCategories.length} categories. Your complete outdoor adventure toolkit.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-5 md:px-10 py-6 space-y-6">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search features, activities, tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-card-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            data-testid="input-explore-search"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          <div className="rounded-xl bg-card border border-card-border p-3 text-center">
            <div className="text-lg font-bold text-emerald-500">{totalFeatures}</div>
            <div className="text-[11px] text-muted-foreground">Total Features</div>
          </div>
          <div className="rounded-xl bg-card border border-card-border p-3 text-center">
            <div className="text-lg font-bold text-amber-500">{featureCategories.length}</div>
            <div className="text-[11px] text-muted-foreground">Categories</div>
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
                data-testid={`card-category-${cat.id}`}
              >
                <div className="relative h-40">
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
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-black/30 backdrop-blur-md", colorMap[cat.color])}>
                        <cat.icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-white font-semibold text-sm">{cat.title}</h3>
                    </div>
                    <p className="text-white/60 text-xs">{cat.subtitle}</p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <Link href={cat.href}>
                      <Button className="bg-emerald-500 text-white gap-2 text-xs" data-testid={`button-go-${cat.id}`}>
                        <Navigation className="w-3.5 h-3.5" /> Open
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="gap-2 text-xs"
                      onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                      data-testid={`button-expand-${cat.id}`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      {expandedCategory === cat.id ? "Hide" : "Features"}
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

export { featureCategories };
