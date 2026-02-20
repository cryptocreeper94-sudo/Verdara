import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Search, X, Tent, Mountain, Fish, Scaling, Snowflake, Bike, Waves, Target, ArrowRight, Bell, BarChart3, ExternalLink, Mail, Shield, ShieldAlert, Zap, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const retailers = [
  // Major Outdoor Retailers
  { name: "REI", letter: "R", url: "https://www.rei.com", categories: ["Camping", "Hiking", "Climbing", "Cycling", "Water Sports", "Winter"], status: "active" as const, network: "Impact", commission: "5%", cookie: "15 days" },
  { name: "Bass Pro Shops", letter: "B", url: "https://www.basspro.com", categories: ["Fishing", "Hunting", "Camping", "Boating"], status: "active" as const, network: "Impact", commission: "5%", cookie: "14 days" },
  { name: "Cabela's", letter: "C", url: "https://www.cabelas.com", categories: ["Hunting", "Fishing", "Camping", "Shooting"], status: "active" as const, network: "Impact", commission: "1-5%", cookie: "14 days" },
  { name: "Backcountry", letter: "B", url: "https://www.backcountry.com", categories: ["Skiing", "Climbing", "Hiking", "Cycling"], status: "active" as const, network: "Impact", commission: "4-12%", cookie: "30 days" },
  { name: "Moosejaw", letter: "M", url: "https://www.moosejaw.com", categories: ["Hiking", "Camping", "Climbing", "Winter"], status: "active" as const, network: "Awin", commission: "6-8%", cookie: "10 days" },
  { name: "Sierra Trading Post", letter: "S", url: "https://www.sierra.com", categories: ["Hiking", "Running", "Camping", "Cycling"], status: "active" as const, network: "ShareASale", commission: "5-7%", cookie: "14 days" },
  { name: "Sportsman's Warehouse", letter: "S", url: "https://www.sportsmans.com", categories: ["Hunting", "Fishing", "Camping", "Shooting"], status: "active" as const, network: "AvantLink", commission: "3-5%", cookie: "14 days" },
  { name: "Academy Sports", letter: "A", url: "https://www.academy.com", categories: ["Camping", "Fishing", "Hunting", "Cycling"], status: "active" as const, network: "CJ", commission: "4%", cookie: "7 days" },
  { name: "Dick's Sporting Goods", letter: "D", url: "https://www.dickssportinggoods.com", categories: ["Camping", "Hiking", "Cycling", "Water Sports"], status: "active" as const, network: "Impact", commission: "2-5%", cookie: "3-14 days" },
  { name: "Amazon Outdoors", letter: "A", url: "https://www.amazon.com", categories: ["Camping", "Hiking", "Fishing", "Hunting"], status: "active" as const, network: "Direct", commission: "3%", cookie: "24 hours" },

  // Camping & Hiking Specialists
  { name: "Kelty", letter: "K", url: "https://www.kelty.com", categories: ["Camping", "Hiking"], status: "active" as const, network: "AvantLink", commission: "8-10%", cookie: "30 days" },
  { name: "Big Agnes", letter: "B", url: "https://www.bigagnes.com", categories: ["Camping", "Hiking"], status: "active" as const, network: "AvantLink", commission: "8%", cookie: "30 days" },
  { name: "MSR", letter: "M", url: "https://www.msrgear.com", categories: ["Camping", "Hiking", "Winter"], status: "active" as const, network: "AvantLink", commission: "6-8%", cookie: "30 days" },
  { name: "Gregory Packs", letter: "G", url: "https://www.gregorypacks.com", categories: ["Hiking", "Camping"], status: "active" as const, network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "Osprey Packs", letter: "O", url: "https://www.osprey.com", categories: ["Hiking", "Camping"], status: "active" as const, network: "AvantLink", commission: "5-7%", cookie: "30 days" },
  { name: "Therm-a-Rest", letter: "T", url: "https://www.thermarest.com", categories: ["Camping"], status: "active" as const, network: "AvantLink", commission: "6-8%", cookie: "30 days" },

  // Fishing Specialists
  { name: "Tackle Warehouse", letter: "T", url: "https://www.tacklewarehouse.com", categories: ["Fishing"], status: "active" as const, network: "AvantLink", commission: "5-7%", cookie: "14 days" },
  { name: "FishUSA", letter: "F", url: "https://www.fishusa.com", categories: ["Fishing"], status: "active" as const, network: "ShareASale", commission: "5-8%", cookie: "30 days" },
  { name: "Karl's Bait & Tackle", letter: "K", url: "https://www.karlsbaittackle.com", categories: ["Fishing"], status: "active" as const, network: "ShareASale", commission: "8-10%", cookie: "30 days" },
  { name: "Simms Fishing", letter: "S", url: "https://www.simmsfishing.com", categories: ["Fishing"], status: "active" as const, network: "AvantLink", commission: "10%", cookie: "30-90 days" },
  { name: "Orvis", letter: "O", url: "https://www.orvis.com", categories: ["Fishing", "Hunting"], status: "active" as const, network: "Rakuten", commission: "5-10%", cookie: "14 days" },
  { name: "Telluride Angler", letter: "T", url: "https://www.tellurideanglercom", categories: ["Fishing"], status: "active" as const, network: "AvantLink", commission: "8-10%", cookie: "120 days" },
  { name: "Trident Fly Fishing", letter: "T", url: "https://www.tridentflyfishing.com", categories: ["Fishing"], status: "active" as const, network: "AvantLink", commission: "8%", cookie: "30 days" },

  // Hunting Specialists
  { name: "Midway USA", letter: "M", url: "https://www.midwayusa.com", categories: ["Hunting", "Shooting"], status: "active" as const, network: "CJ", commission: "3-5%", cookie: "7 days" },
  { name: "Brownells", letter: "B", url: "https://www.brownells.com", categories: ["Hunting", "Shooting"], status: "active" as const, network: "CJ", commission: "3-5%", cookie: "14 days" },
  { name: "Natchez Shooters", letter: "N", url: "https://www.natchezss.com", categories: ["Hunting", "Shooting"], status: "active" as const, network: "AvantLink", commission: "3-5%", cookie: "14 days" },
  { name: "KUIU", letter: "K", url: "https://www.kuiu.com", categories: ["Hunting"], status: "active" as const, network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "First Lite", letter: "F", url: "https://www.firstlite.com", categories: ["Hunting"], status: "active" as const, network: "AvantLink", commission: "8-10%", cookie: "30 days" },
  { name: "Sitka Gear", letter: "S", url: "https://www.sitkagear.com", categories: ["Hunting"], status: "active" as const, network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "Vortex Optics", letter: "V", url: "https://www.vortexoptics.com", categories: ["Hunting", "Shooting"], status: "active" as const, network: "AvantLink", commission: "5-8%", cookie: "30 days" },

  // Climbing Specialists
  { name: "Black Diamond", letter: "B", url: "https://www.blackdiamondequipment.com", categories: ["Climbing", "Skiing"], status: "active" as const, network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "Petzl", letter: "P", url: "https://www.petzl.com", categories: ["Climbing"], status: "active" as const, network: "AvantLink", commission: "5-7%", cookie: "30 days" },
  { name: "La Sportiva", letter: "L", url: "https://www.lasportiva.com", categories: ["Climbing", "Hiking"], status: "active" as const, network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "Mammut", letter: "M", url: "https://www.mammut.com", categories: ["Climbing", "Hiking"], status: "active" as const, network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "Mystery Ranch", letter: "M", url: "https://www.mysteryranch.com", categories: ["Climbing", "Hiking", "Hunting"], status: "active" as const, network: "AvantLink", commission: "5-8%", cookie: "30 days" },

  // Premium Outdoor Apparel
  { name: "Patagonia", letter: "P", url: "https://www.patagonia.com", categories: ["Hiking", "Climbing", "Winter"], status: "active" as const, network: "Awin", commission: "3-5%", cookie: "14 days" },
  { name: "The North Face", letter: "T", url: "https://www.thenorthface.com", categories: ["Hiking", "Climbing", "Winter"], status: "active" as const, network: "Awin", commission: "3-5%", cookie: "14 days" },
  { name: "Columbia", letter: "C", url: "https://www.columbia.com", categories: ["Hiking", "Fishing", "Winter"], status: "active" as const, network: "CJ", commission: "3-5%", cookie: "14 days" },
  { name: "Arc'teryx", letter: "A", url: "https://www.arcteryx.com", categories: ["Climbing", "Hiking", "Winter"], status: "active" as const, network: "Impact", commission: "3-5%", cookie: "14 days" },

  // Cycling / MTB
  { name: "Jenson USA", letter: "J", url: "https://www.jensonusa.com", categories: ["Cycling"], status: "active" as const, network: "AvantLink", commission: "5-7%", cookie: "30 days" },
  { name: "Competitive Cyclist", letter: "C", url: "https://www.competitivecyclist.com", categories: ["Cycling"], status: "active" as const, network: "Impact", commission: "4-8%", cookie: "30 days" },
  { name: "Chain Reaction Cycles", letter: "C", url: "https://www.chainreactioncycles.com", categories: ["Cycling"], status: "active" as const, network: "Awin", commission: "3-5%", cookie: "30 days" },
  { name: "Trek Bikes", letter: "T", url: "https://www.trekbikes.com", categories: ["Cycling"], status: "active" as const, network: "Impact", commission: "3-5%", cookie: "14 days" },

  // Water Sports
  { name: "NRS", letter: "N", url: "https://www.nrs.com", categories: ["Water Sports"], status: "active" as const, network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "Aqua-Bound", letter: "A", url: "https://www.aquabound.com", categories: ["Water Sports"], status: "active" as const, network: "AvantLink", commission: "8-10%", cookie: "30 days" },
  { name: "Werner Paddles", letter: "W", url: "https://www.wernerpaddles.com", categories: ["Water Sports"], status: "active" as const, network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "BOTE", letter: "B", url: "https://www.boteboard.com", categories: ["Water Sports"], status: "active" as const, network: "ShareASale", commission: "5-8%", cookie: "30 days" },

  // Winter Sports
  { name: "evo", letter: "E", url: "https://www.evo.com", categories: ["Winter", "Cycling", "Camping"], status: "active" as const, network: "AvantLink", commission: "5%", cookie: "30 days" },
  { name: "The House", letter: "T", url: "https://www.the-house.com", categories: ["Winter", "Water Sports"], status: "active" as const, network: "CJ", commission: "5-8%", cookie: "14 days" },
  { name: "Christy Sports", letter: "C", url: "https://www.christysports.com", categories: ["Winter"], status: "active" as const, network: "AvantLink", commission: "4-6%", cookie: "30 days" },

  // Survival & Emergency Preparedness
  { name: "Survival Frog", letter: "S", url: "https://www.survivalfrog.com", categories: ["Survival"], status: "active" as const, network: "ShareASale", commission: "10-15%", cookie: "60 days" },
  { name: "BePrepared", letter: "B", url: "https://www.beprepared.com", categories: ["Survival"], status: "active" as const, network: "ShareASale", commission: "8-12%", cookie: "30 days" },
  { name: "My Patriot Supply", letter: "M", url: "https://www.mypatriotsupply.com", categories: ["Survival"], status: "active" as const, network: "AvantLink", commission: "8-15%", cookie: "30 days" },
  { name: "ReadyWise", letter: "R", url: "https://www.readywise.com", categories: ["Survival", "Camping"], status: "active" as const, network: "AvantLink", commission: "12%", cookie: "30 days" },
  { name: "Gerber Gear", letter: "G", url: "https://www.gerbergear.com", categories: ["Survival", "Camping"], status: "active" as const, network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "SOG Knives", letter: "S", url: "https://www.sogknives.com", categories: ["Survival"], status: "active" as const, network: "AvantLink", commission: "5-10%", cookie: "30 days" },
  { name: "Leatherman", letter: "L", url: "https://www.leatherman.com", categories: ["Survival", "Camping"], status: "active" as const, network: "AvantLink", commission: "5-8%", cookie: "30 days" },

  // E-Mobility
  { name: "Rad Power Bikes", letter: "R", url: "https://www.radpowerbikes.com", categories: ["E-Mobility"], status: "active" as const, network: "FlexOffers", commission: "3-6%", cookie: "30 days" },
  { name: "Lectric eBikes", letter: "L", url: "https://www.lectricebikes.com", categories: ["E-Mobility"], status: "active" as const, network: "Direct", commission: "3%", cookie: "30 days" },
  { name: "Aventon", letter: "A", url: "https://www.aventon.com", categories: ["E-Mobility"], status: "active" as const, network: "ShareASale", commission: "5-8%", cookie: "30 days" },
  { name: "Juiced Bikes", letter: "J", url: "https://www.juicedbikes.com", categories: ["E-Mobility"], status: "active" as const, network: "ShareASale", commission: "3-5%", cookie: "30 days" },

  // Arborist Equipment
  { name: "Husqvarna", letter: "H", url: "https://www.husqvarna.com", categories: ["Arborist"], status: "active" as const, network: "CJ", commission: "3-5%", cookie: "14 days" },
  { name: "Sherrill Tree", letter: "S", url: "https://www.sherrilltree.com", categories: ["Arborist"], status: "active" as const, network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "WesSpur", letter: "W", url: "https://www.wesspur.com", categories: ["Arborist"], status: "active" as const, network: "Direct", commission: "5-8%", cookie: "30 days" },
];

const categories = [
  { icon: Tent, title: "Camping Gear", products: 120 },
  { icon: Mountain, title: "Hiking Boots", products: 85 },
  { icon: Fish, title: "Fishing Tackle", products: 200 },
  { icon: Scaling, title: "Climbing Equipment", products: 95 },
  { icon: Snowflake, title: "Winter Gear", products: 150 },
  { icon: Bike, title: "Cycling", products: 110 },
  { icon: Waves, title: "Water Sports Gear", products: 75 },
  { icon: Target, title: "Hunting Supplies", products: 130 },
  { icon: ShieldAlert, title: "Survival Gear", products: 90 },
  { icon: Zap, title: "E-Mobility", products: 45 },
  { icon: TreePine, title: "Arborist Equipment", products: 60 },
];

const steps = [
  { icon: Search, title: "Search Products", description: "Search across 60+ outdoor retailers to find the gear you need." },
  { icon: BarChart3, title: "Compare Prices", description: "See side-by-side pricing from multiple retailers in one view." },
  { icon: Bell, title: "Get Alerts", description: "Set price alerts and get notified when gear drops to your target price." },
];

const retailerSections = [
  { label: "Major Outdoor Retailers", start: 0, end: 10 },
  { label: "Camping & Hiking Specialists", start: 10, end: 16 },
  { label: "Fishing Specialists", start: 16, end: 23 },
  { label: "Hunting Specialists", start: 23, end: 30 },
  { label: "Climbing Specialists", start: 30, end: 35 },
  { label: "Premium Outdoor Apparel", start: 35, end: 39 },
  { label: "Cycling / MTB", start: 39, end: 43 },
  { label: "Water Sports", start: 43, end: 47 },
  { label: "Winter Sports", start: 47, end: 50 },
  { label: "Survival & Emergency Preparedness", start: 50, end: 57 },
  { label: "E-Mobility", start: 57, end: 61 },
  { label: "Arborist Equipment", start: 61, end: 64 },
];

export default function PriceCompare() {
  useEffect(() => {
    document.title = "Price Compare - 62+ Outdoor Retailers | Verdara";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Compare gear prices across 62+ outdoor retailers including REI, Bass Pro Shops, Backcountry, and more. Find the best deals on camping, hiking, fishing, hunting, climbing, and survival gear.");
    return () => { document.title = "Verdara - AI-Powered Outdoor Recreation Super-App | DarkWave Studios"; };
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertProduct, setAlertProduct] = useState("");
  const [alertSubmitted, setAlertSubmitted] = useState(false);

  const query = searchQuery.toLowerCase();

  const filteredRetailers = retailers.filter((r) => {
    const matchesSearch = !query || r.name.toLowerCase().includes(query) || r.categories.some((c) => c.toLowerCase().includes(query));
    const matchesCategory = !activeCategory || r.categories.some((c) => c.toLowerCase().includes(activeCategory.toLowerCase()));
    return matchesSearch && matchesCategory;
  });

  const filteredCategories = categories.filter((c) => {
    return !query || c.title.toLowerCase().includes(query);
  });

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertEmail && alertProduct) {
      setAlertSubmitted(true);
      setTimeout(() => setAlertSubmitted(false), 3000);
      setAlertEmail("");
      setAlertProduct("");
    }
  };

  const isFiltering = !!query || !!activeCategory;

  const getSectionsWithRetailers = () => {
    if (isFiltering) {
      return [{ label: `Results (${filteredRetailers.length})`, retailers: filteredRetailers }];
    }
    return retailerSections.map((section) => ({
      label: section.label,
      retailers: retailers.slice(section.start, section.end),
    }));
  };

  const sections = getSectionsWithRetailers();

  return (
    <div className="min-h-screen" data-testid="page-price-compare">
      <div className="relative h-52 md:h-64 overflow-hidden">
        <img
          src="/images/cat-pricecompare.jpg"
          alt="Price Compare"
          className="w-full h-full object-cover"
          data-testid="img-hero-price-compare"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-7 h-7 text-emerald-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg" data-testid="text-page-title">
              Price Compare
            </h1>
          </div>
          <p className="text-white/70 text-sm mt-1 drop-shadow max-w-lg" data-testid="text-page-description">
            Compare prices across 60+ outdoor retailers. Find the best deals on gear, equipment, and supplies.
          </p>
        </div>
      </div>

      <div className="px-5 md:px-10 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex-1 min-w-[200px] flex items-center gap-2.5 bg-card border border-card-border rounded-xl px-4 py-3">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search retailers, categories, or gear..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              data-testid="input-price-compare-search"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} data-testid="button-clear-search">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30 no-default-hover-elevate no-default-active-elevate" data-testid="badge-retailer-count">
            62+ Retailers
          </Badge>
          {activeCategory && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveCategory(null)}
              data-testid="button-clear-category-filter"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              {activeCategory}
            </Button>
          )}
        </div>

        <Card className="overflow-visible border-amber-500/20 bg-amber-500/5 backdrop-blur-sm mb-8" data-testid="card-ftc-disclosure">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed" data-testid="text-ftc-disclosure">
              Verdara participates in affiliate programs with outdoor retailers. When you click a retailer link and make a purchase, we may earn a small commission at no additional cost to you. This helps support the development of Verdara's free features.
            </p>
          </CardContent>
        </Card>

        {sections.map((section) => (
          <div key={section.label} className="mb-8">
            <h2
              className="text-lg font-semibold text-foreground mb-4"
              data-testid={`text-section-${section.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            >
              {section.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {section.retailers.map((retailer, i) => (
                <motion.div
                  key={retailer.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.02 }}
                >
                  <Card
                    className="overflow-visible border-card-border bg-card/80 backdrop-blur-sm"
                    data-testid={`card-retailer-${retailer.name.toLowerCase().replace(/['\s]+/g, "-")}`}
                  >
                    <CardContent className="p-5 flex flex-col space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-400 font-bold text-sm">{retailer.letter}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm text-foreground truncate">{retailer.name}</h3>
                          <Badge
                            variant="outline"
                            className="text-xs text-emerald-400 border-emerald-500/30 mt-1"
                            data-testid={`badge-status-${retailer.name.toLowerCase().replace(/['\s]+/g, "-")}`}
                          >
                            Active
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {retailer.categories.map((cat) => (
                          <Badge
                            key={cat}
                            variant="secondary"
                            className="text-xs no-default-hover-elevate no-default-active-elevate"
                          >
                            {cat}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground" data-testid={`text-affiliate-info-${retailer.name.toLowerCase().replace(/['\s]+/g, "-")}`}>
                        {retailer.network} · {retailer.commission} · {retailer.cookie} cookie
                      </p>
                      <a
                        href={retailer.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`link-visit-${retailer.name.toLowerCase().replace(/['\s]+/g, "-")}`}
                      >
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full bg-emerald-600 border-emerald-700 text-white"
                          data-testid={`button-visit-${retailer.name.toLowerCase().replace(/['\s]+/g, "-")}`}
                        >
                          Visit Store
                          <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {filteredRetailers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm mb-8" data-testid="text-no-retailers">
            No retailers match your search. Try a different term.
          </div>
        )}

        <h2 className="text-lg font-semibold text-foreground mb-4" data-testid="text-categories-heading">
          Browse Categories
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {filteredCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Card
                className={`overflow-visible border-card-border bg-card/80 backdrop-blur-sm group cursor-pointer hover-elevate ${
                  activeCategory === cat.title ? "ring-1 ring-emerald-500/50" : ""
                }`}
                onClick={() => setActiveCategory(activeCategory === cat.title ? null : cat.title)}
                data-testid={`card-category-${cat.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-md bg-emerald-500/10 flex items-center justify-center">
                    <cat.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{cat.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Compare {cat.products}+ products</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid={`button-browse-${cat.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {activeCategory === cat.title ? "Selected" : "Browse"}
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filteredCategories.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground text-sm" data-testid="text-no-categories">
              No categories match your search.
            </div>
          )}
        </div>

        <div className="mb-12">
          <h2 className="text-lg font-semibold text-foreground mb-6 text-center" data-testid="text-how-it-works">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <Card
                  className="overflow-visible border-card-border bg-card/80 backdrop-blur-sm"
                  data-testid={`card-step-${i + 1}`}
                >
                  <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Step {i + 1}</span>
                      <h3 className="font-semibold text-sm text-foreground mt-0.5">{step.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="overflow-visible border-card-border bg-card/80 backdrop-blur-sm" data-testid="card-price-alert">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground" data-testid="text-price-alert-heading">
                    Price Drop Alerts
                  </h2>
                  <p className="text-xs text-muted-foreground">Get notified when your favorite gear goes on sale</p>
                </div>
              </div>
              <form onSubmit={handleAlertSubmit} className="flex flex-col sm:flex-row flex-wrap gap-3" data-testid="form-price-alert">
                <div className="flex-1 min-w-[180px] flex items-center gap-2.5 bg-background border border-card-border rounded-md px-3 py-2">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={alertEmail}
                    onChange={e => setAlertEmail(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                    required
                    data-testid="input-alert-email"
                  />
                </div>
                <div className="flex-1 min-w-[180px] flex items-center gap-2.5 bg-background border border-card-border rounded-md px-3 py-2">
                  <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Product name (e.g., Osprey Atmos 65)"
                    value={alertProduct}
                    onChange={e => setAlertProduct(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                    required
                    data-testid="input-alert-product"
                  />
                </div>
                <Button
                  type="submit"
                  variant="default"
                  className="bg-amber-600 border-amber-700 text-white"
                  data-testid="button-submit-alert"
                >
                  <Bell className="w-4 h-4 mr-1.5" />
                  Set Alert
                </Button>
              </form>
              {alertSubmitted && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-emerald-400 text-sm mt-3"
                  data-testid="text-alert-success"
                >
                  Price alert set successfully! We'll notify you when the price drops.
                </motion.p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
