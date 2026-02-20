import { useState } from "react";
import { motion } from "framer-motion";
import {
  ScanSearch, Mountain, Bike, RockingChair, Tent, Fish, Crosshair,
  Zap, Snowflake, Waves, TreePine, Axe, ShoppingBag, MapPinned,
  Anchor, ShieldAlert, Heart, DollarSign, ChevronRight, ArrowLeft,
  Search, Compass, Layers, Star, Lock, Navigation, Flame, BookOpen, Package,
  Camera, Map, CloudSun, Clock, Activity, TrendingUp,
  Shell, Sun, Droplets, Wheat, Sprout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { GlassCard } from "@/components/glass-card";
import { useQuery } from "@tanstack/react-query";
import { userActivities } from "@/lib/mock-data";

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
    href: "/mtb",
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
    href: "/camping",
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
    href: "/emobility",
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
    href: "/winter",
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
    href: "/watersports",
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
    href: "/charters",
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
    href: "/price-compare",
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
  {
    id: "coastal",
    title: "Coastal & Beach",
    subtitle: "Beaches, tide pools, and coastal trails",
    image: "/images/cat-coastal.jpg",
    icon: Shell,
    featureCount: 8,
    color: "slate",
    href: "/coastal",
    features: [
      "Beach and coastal trail discovery",
      "Tide pool exploration guides",
      "Surf spot conditions and reports",
      "Coastal camping and beach camping",
      "Snorkeling and reef exploration",
      "Beachcombing and shell identification",
      "Coastal wildlife watching (seabirds, seals)",
      "Beach safety (rip currents, jellyfish, UV)",
    ],
  },
  {
    id: "desert",
    title: "Desert & Canyon",
    subtitle: "Deserts, slot canyons, and arid landscapes",
    image: "/images/cat-desert.jpg",
    icon: Sun,
    featureCount: 7,
    color: "amber",
    href: "/desert",
    features: [
      "Desert trail and canyon hiking routes",
      "Slot canyon exploration guides",
      "Rock formation and geology points of interest",
      "Desert camping with water source maps",
      "Stargazing and dark sky locations",
      "Desert wildlife identification",
      "Heat safety and hydration planning",
    ],
  },
  {
    id: "wetlands",
    title: "Wetlands & Swamps",
    subtitle: "Bayous, marshes, and swamp trails",
    image: "/images/cat-wetlands.jpg",
    icon: Droplets,
    featureCount: 7,
    color: "emerald",
    href: "/wetlands",
    features: [
      "Bayou and swamp exploration routes",
      "Wetland bird watching hotspots",
      "Kayak trails through mangroves",
      "Wetland ecosystem guides",
      "Alligator and wildlife safety",
      "Boardwalk trail directory",
      "Wetland conservation education",
    ],
  },
  {
    id: "caves",
    title: "Caves & Underground",
    subtitle: "Caverns, lava tubes, and spelunking",
    image: "/images/cat-caves.jpg",
    icon: Mountain,
    featureCount: 6,
    color: "slate",
    href: "/caves",
    features: [
      "Cave and cavern directory",
      "Guided tour schedules and booking",
      "Lava tube and volcanic cave exploration",
      "Spelunking difficulty ratings",
      "Underground river and lake access",
      "Geological formation guides",
    ],
  },
  {
    id: "prairie",
    title: "Prairie & Grasslands",
    subtitle: "Open plains, wildflowers, and bison country",
    image: "/images/cat-prairie.jpg",
    icon: Wheat,
    featureCount: 6,
    color: "emerald",
    href: "/prairie",
    features: [
      "Prairie and grassland trail discovery",
      "Bison herd viewing locations",
      "Wildflower meadow seasonal guides",
      "Prairie wildlife watching",
      "Great Plains stargazing spots",
      "Prairie restoration and conservation sites",
    ],
  },
  {
    id: "foraging",
    title: "Wild Edibles & Medicine",
    subtitle: "Wild foods, natural remedies, and plant wisdom",
    image: "/images/cat-foraging.jpg",
    icon: Sprout,
    featureCount: 12,
    color: "emerald",
    href: "/foraging",
    features: [
      "Wild edible plant identification guide",
      "Natural medicine and herbal remedy database",
      "Historical and traditional plant uses",
      "AI-powered plant identification integration",
      "Foraging location directory by region",
      "Seasonal harvesting calendars",
      "Safety warnings and look-alike alerts",
      "Mushroom foraging guides",
      "Native American ethnobotany traditions",
      "VedaSolus wellness hub integration",
      "Medicinal plant preparation methods",
      "Foraging regulations by state",
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

const quickActions = [
  { label: "AI Identify", icon: Camera, href: "/identify", color: "bg-emerald-500" },
  { label: "Trail Discovery", icon: Map, href: "/trails", color: "bg-amber-500" },
  { label: "Wood Market", icon: ShoppingBag, href: "/marketplace", color: "bg-slate-500" },
  { label: "Trip Planner", icon: MapPinned, href: "/planner", color: "bg-emerald-600" },
];

const activityTypeColors: Record<string, string> = {
  identification: "text-emerald-400",
  trail: "text-amber-400",
  marketplace: "text-slate-400",
  conservation: "text-emerald-400",
};

const stagger = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  },
};

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: catalogLocations, isLoading: catalogLoading } = useQuery<any[]>({
    queryKey: ["/api/catalog", { limit: 4, featured: true }],
    queryFn: async () => {
      const res = await fetch("/api/catalog?limit=4&featured=true");
      if (!res.ok) throw new Error("Failed to fetch catalog");
      return res.json();
    },
  });

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
      <div className="relative overflow-hidden">
        <img
          src="/images/hero-landscape.jpg"
          alt="Verdara Command Center"
          className="w-full h-72 md:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        <div className="absolute inset-0 flex items-center px-5 md:px-10">
          <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1"
            >
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Compass className="w-5 h-5 text-emerald-400" />
                <Badge className="bg-emerald-500/20 text-emerald-400">Command Center</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2" data-testid="text-hero-title">
                Welcome back, Explorer
              </h1>
              <p className="text-white/70 text-sm md:text-base max-w-md mb-4">
                {totalFeatures} features across {featureCategories.length} categories
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/80 text-xs" data-testid="text-stat-features">{totalFeatures} Features</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="text-white/80 text-xs" data-testid="text-stat-categories">{featureCategories.length} Categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-400" />
                  <span className="text-white/80 text-xs" data-testid="text-stat-phases">8 Dev Phases</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-2"
            >
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <Button className={cn(action.color, "text-white gap-2 text-xs")} data-testid={`button-hero-${action.label.toLowerCase().replace(/\s+/g, "-")}`}>
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </Button>
                </Link>
              ))}
            </motion.div>
          </div>
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

        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {quickActions.map((action) => (
            <motion.div key={action.label} variants={stagger.item}>
              <Link href={action.href}>
                <GlassCard hover className="p-4 flex flex-col items-center gap-3 text-center" data-testid={`card-quick-${action.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", action.color)}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <Link href="/catalog">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md p-5 cursor-pointer hover-elevate"
            data-testid="link-location-catalog"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <MapPinned className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Location Catalog</h3>
                  <p className="text-xs text-muted-foreground">170+ verified outdoor locations across 41 states — search by zip code</p>
                </div>
              </div>
              <Button className="bg-emerald-500 text-white gap-2 text-xs" data-testid="button-open-catalog">
                <Navigation className="w-3.5 h-3.5" /> Browse Catalog
              </Button>
            </div>
          </motion.div>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <GlassCard className="p-5" data-testid="card-featured-locations">
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <MapPinned className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-foreground">Featured Locations</h2>
                </div>
                <Link href="/catalog">
                  <Button variant="outline" className="text-xs gap-1" data-testid="button-view-all-locations">
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
              {catalogLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : catalogLocations && catalogLocations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catalogLocations.slice(0, 4).map((loc: any, i: number) => (
                    <Link key={loc.id || i} href={`/catalog/${loc.id}`}>
                      <div className="relative rounded-xl overflow-hidden h-28 group cursor-pointer" data-testid={`card-location-${loc.id || i}`}>
                        <img
                          src={loc.imageUrl || loc.image || "/images/trail_1.jpg"}
                          alt={loc.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-2 left-3 right-3">
                          <p className="text-white text-xs font-semibold truncate">{loc.name}</p>
                          <p className="text-white/60 text-[10px] truncate">{loc.location || loc.state}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-28 text-muted-foreground text-sm">
                  No featured locations available
                </div>
              )}
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <GlassCard className="p-5 h-full" data-testid="card-weather-widget">
              <div className="flex items-center gap-2 mb-4">
                <CloudSun className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-semibold text-foreground">Weather</h2>
              </div>
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <CloudSun className="w-16 h-16 text-amber-400/60" />
                <p className="text-2xl font-bold text-foreground">72°F</p>
                <p className="text-xs text-muted-foreground">Partly Cloudy</p>
                <Badge className="bg-amber-500/15 text-amber-400 text-[10px]">Open-Meteo</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">Wind</p>
                  <p className="text-xs font-medium text-foreground">8 mph</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">Humidity</p>
                  <p className="text-xs font-medium text-foreground">45%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">UV Index</p>
                  <p className="text-xs font-medium text-foreground">6</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <GlassCard className="p-5" data-testid="card-recent-activity">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              {userActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3" data-testid={`activity-item-${activity.id}`}>
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={activity.image}
                      alt={activity.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{activity.title}</p>
                    <p className={cn("text-[10px]", activityTypeColors[activity.type] || "text-muted-foreground")}>{activity.date}</p>
                  </div>
                  <Badge className={cn(
                    "text-[10px]",
                    activity.type === "identification" ? "bg-emerald-500/15 text-emerald-400" :
                    activity.type === "trail" ? "bg-amber-500/15 text-amber-400" :
                    activity.type === "marketplace" ? "bg-slate-500/15 text-slate-400" :
                    "bg-emerald-500/15 text-emerald-400"
                  )}>
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-semibold text-foreground">Activity Categories</h2>
            {searchQuery && (
              <Badge className="bg-emerald-500/15 text-emerald-400 text-[10px]">
                {filteredCategories.length} results
              </Badge>
            )}
          </div>
          <motion.div
            variants={stagger.container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            {filteredCategories.map((cat) => (
              <motion.div key={cat.id} variants={stagger.item}>
                <Link href={cat.href}>
                  <div
                    className="relative rounded-xl overflow-hidden h-36 group cursor-pointer"
                    data-testid={`card-category-${cat.id}`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute top-2 right-2">
                      <Badge className={cn(bgColorMap[cat.color], colorMap[cat.color], "text-[10px]")}>
                        {cat.featureCount}
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 left-3 right-3">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <cat.icon className={cn("w-3.5 h-3.5", colorMap[cat.color])} />
                        <h3 className="text-white font-semibold text-xs">{cat.title}</h3>
                      </div>
                      <p className="text-white/60 text-[10px] truncate">{cat.subtitle}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export { featureCategories };
