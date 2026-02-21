import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, Search, X, Tent, Mountain, Fish, Snowflake, Bike, Waves,
  Target, ArrowRight, Bell, BarChart3, ExternalLink, Mail, Shield,
  Zap, TreePine, Sword, Crosshair, ChevronDown, ChevronUp, SlidersHorizontal,
  Package, Shirt, ShieldAlert, Scaling
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Retailer {
  name: string;
  url: string;
  categories: string[];
  status: "active";
  network: string;
  commission: string;
  cookie: string;
}

const retailers: Retailer[] = [
  { name: "REI", url: "https://www.rei.com", categories: ["Camping", "Hiking", "Climbing", "Cycling", "Water Sports", "Winter"], status: "active", network: "Impact", commission: "5%", cookie: "15 days" },
  { name: "Bass Pro Shops", url: "https://www.basspro.com", categories: ["Fishing", "Hunting", "Camping", "Boating", "Firearms & Ammo"], status: "active", network: "Impact", commission: "1-5%", cookie: "14 days" },
  { name: "Cabela's", url: "https://www.cabelas.com", categories: ["Hunting", "Fishing", "Camping", "Shooting", "Firearms & Ammo"], status: "active", network: "Impact", commission: "1-5%", cookie: "14 days" },
  { name: "Backcountry", url: "https://www.backcountry.com", categories: ["Skiing", "Climbing", "Hiking", "Cycling"], status: "active", network: "Impact", commission: "4-12%", cookie: "30 days" },
  { name: "Moosejaw", url: "https://www.moosejaw.com", categories: ["Hiking", "Camping", "Climbing", "Winter"], status: "active", network: "Awin", commission: "6-8%", cookie: "10 days" },
  { name: "Sierra Trading Post", url: "https://www.sierra.com", categories: ["Hiking", "Running", "Camping", "Cycling"], status: "active", network: "ShareASale", commission: "5-7%", cookie: "14 days" },
  { name: "Sportsman's Warehouse", url: "https://www.sportsmans.com", categories: ["Hunting", "Fishing", "Camping", "Shooting", "Firearms & Ammo", "Knives & Blades"], status: "active", network: "AvantLink", commission: "3-5%", cookie: "14 days" },
  { name: "Academy Sports", url: "https://www.academy.com", categories: ["Camping", "Fishing", "Hunting", "Cycling"], status: "active", network: "CJ", commission: "4%", cookie: "7 days" },
  { name: "Dick's Sporting Goods", url: "https://www.dickssportinggoods.com", categories: ["Camping", "Hiking", "Cycling", "Water Sports"], status: "active", network: "Impact", commission: "2-5%", cookie: "3-14 days" },
  { name: "Amazon Outdoors", url: "https://www.amazon.com", categories: ["Camping", "Hiking", "Fishing", "Hunting", "Knives & Blades", "Firearms & Ammo"], status: "active", network: "Direct", commission: "3%", cookie: "24 hours" },

  { name: "Kelty", url: "https://www.kelty.com", categories: ["Camping", "Hiking"], status: "active", network: "AvantLink", commission: "8-10%", cookie: "30 days" },
  { name: "Big Agnes", url: "https://www.bigagnes.com", categories: ["Camping", "Hiking"], status: "active", network: "AvantLink", commission: "8%", cookie: "30 days" },
  { name: "MSR", url: "https://www.msrgear.com", categories: ["Camping", "Hiking", "Winter"], status: "active", network: "AvantLink", commission: "6-8%", cookie: "30 days" },
  { name: "Gregory Packs", url: "https://www.gregorypacks.com", categories: ["Hiking", "Camping"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "Osprey Packs", url: "https://www.osprey.com", categories: ["Hiking", "Camping"], status: "active", network: "AvantLink", commission: "5-7%", cookie: "30 days" },
  { name: "Therm-a-Rest", url: "https://www.thermarest.com", categories: ["Camping"], status: "active", network: "AvantLink", commission: "6-8%", cookie: "30 days" },

  { name: "Tackle Warehouse", url: "https://www.tacklewarehouse.com", categories: ["Fishing"], status: "active", network: "AvantLink", commission: "5-7%", cookie: "14 days" },
  { name: "FishUSA", url: "https://www.fishusa.com", categories: ["Fishing"], status: "active", network: "ShareASale", commission: "5-8%", cookie: "30 days" },
  { name: "Karl's Bait & Tackle", url: "https://www.karlsbaittackle.com", categories: ["Fishing"], status: "active", network: "ShareASale", commission: "8-10%", cookie: "30 days" },
  { name: "Simms Fishing", url: "https://www.simmsfishing.com", categories: ["Fishing"], status: "active", network: "AvantLink", commission: "10%", cookie: "30-90 days" },
  { name: "Orvis", url: "https://www.orvis.com", categories: ["Fishing", "Hunting"], status: "active", network: "Rakuten", commission: "5-10%", cookie: "14 days" },
  { name: "Telluride Angler", url: "https://www.tellurideanglercom", categories: ["Fishing"], status: "active", network: "AvantLink", commission: "8-10%", cookie: "120 days" },
  { name: "Trident Fly Fishing", url: "https://www.tridentflyfishing.com", categories: ["Fishing"], status: "active", network: "AvantLink", commission: "8%", cookie: "30 days" },

  { name: "Midway USA", url: "https://www.midwayusa.com", categories: ["Hunting", "Shooting", "Firearms & Ammo"], status: "active", network: "CJ", commission: "3-5%", cookie: "7 days" },
  { name: "Brownells", url: "https://www.brownells.com", categories: ["Hunting", "Shooting", "Firearms & Ammo", "Knives & Blades"], status: "active", network: "CJ", commission: "3-5%", cookie: "14 days" },
  { name: "Natchez Shooters", url: "https://www.natchezss.com", categories: ["Hunting", "Shooting", "Firearms & Ammo"], status: "active", network: "AvantLink", commission: "3-5%", cookie: "14 days" },
  { name: "KUIU", url: "https://www.kuiu.com", categories: ["Hunting"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "First Lite", url: "https://www.firstlite.com", categories: ["Hunting"], status: "active", network: "AvantLink", commission: "8-10%", cookie: "30 days" },
  { name: "Sitka Gear", url: "https://www.sitkagear.com", categories: ["Hunting"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "Vortex Optics", url: "https://www.vortexoptics.com", categories: ["Hunting", "Shooting", "Firearms & Ammo"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },

  { name: "Black Diamond", url: "https://www.blackdiamondequipment.com", categories: ["Climbing", "Skiing"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "Petzl", url: "https://www.petzl.com", categories: ["Climbing"], status: "active", network: "AvantLink", commission: "5-7%", cookie: "30 days" },
  { name: "La Sportiva", url: "https://www.lasportiva.com", categories: ["Climbing", "Hiking"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "Mammut", url: "https://www.mammut.com", categories: ["Climbing", "Hiking"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "Mystery Ranch", url: "https://www.mysteryranch.com", categories: ["Climbing", "Hiking", "Hunting"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },

  { name: "Patagonia", url: "https://www.patagonia.com", categories: ["Hiking", "Climbing", "Winter", "Apparel"], status: "active", network: "Awin", commission: "3-5%", cookie: "14 days" },
  { name: "The North Face", url: "https://www.thenorthface.com", categories: ["Hiking", "Climbing", "Winter", "Apparel"], status: "active", network: "Awin", commission: "3-5%", cookie: "14 days" },
  { name: "Columbia", url: "https://www.columbia.com", categories: ["Hiking", "Fishing", "Winter", "Apparel"], status: "active", network: "CJ", commission: "3-5%", cookie: "14 days" },
  { name: "Arc'teryx", url: "https://www.arcteryx.com", categories: ["Climbing", "Hiking", "Winter", "Apparel"], status: "active", network: "Impact", commission: "3-5%", cookie: "14 days" },

  { name: "Jenson USA", url: "https://www.jensonusa.com", categories: ["Cycling"], status: "active", network: "AvantLink", commission: "5-7%", cookie: "30 days" },
  { name: "Competitive Cyclist", url: "https://www.competitivecyclist.com", categories: ["Cycling"], status: "active", network: "Impact", commission: "4-8%", cookie: "30 days" },
  { name: "Chain Reaction Cycles", url: "https://www.chainreactioncycles.com", categories: ["Cycling"], status: "active", network: "Awin", commission: "3-5%", cookie: "30 days" },
  { name: "Trek Bikes", url: "https://www.trekbikes.com", categories: ["Cycling"], status: "active", network: "Impact", commission: "3-5%", cookie: "14 days" },

  { name: "NRS", url: "https://www.nrs.com", categories: ["Water Sports"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "Aqua-Bound", url: "https://www.aquabound.com", categories: ["Water Sports"], status: "active", network: "AvantLink", commission: "8-10%", cookie: "30 days" },
  { name: "Werner Paddles", url: "https://www.wernerpaddles.com", categories: ["Water Sports"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "BOTE", url: "https://www.boteboard.com", categories: ["Water Sports"], status: "active", network: "ShareASale", commission: "5-8%", cookie: "30 days" },

  { name: "evo", url: "https://www.evo.com", categories: ["Winter", "Cycling", "Camping"], status: "active", network: "AvantLink", commission: "5%", cookie: "30 days" },
  { name: "The House", url: "https://www.the-house.com", categories: ["Winter", "Water Sports"], status: "active", network: "CJ", commission: "5-8%", cookie: "14 days" },
  { name: "Christy Sports", url: "https://www.christysports.com", categories: ["Winter"], status: "active", network: "AvantLink", commission: "4-6%", cookie: "30 days" },

  { name: "Survival Frog", url: "https://www.survivalfrog.com", categories: ["Survival"], status: "active", network: "ShareASale", commission: "10-15%", cookie: "60 days" },
  { name: "BePrepared", url: "https://www.beprepared.com", categories: ["Survival"], status: "active", network: "ShareASale", commission: "8-12%", cookie: "30 days" },
  { name: "My Patriot Supply", url: "https://www.mypatriotsupply.com", categories: ["Survival"], status: "active", network: "AvantLink", commission: "8-15%", cookie: "30 days" },
  { name: "ReadyWise", url: "https://www.readywise.com", categories: ["Survival", "Camping"], status: "active", network: "AvantLink", commission: "12%", cookie: "30 days" },

  { name: "Rad Power Bikes", url: "https://www.radpowerbikes.com", categories: ["E-Mobility"], status: "active", network: "FlexOffers", commission: "3-6%", cookie: "30 days" },
  { name: "Lectric eBikes", url: "https://www.lectricebikes.com", categories: ["E-Mobility"], status: "active", network: "Direct", commission: "3%", cookie: "30 days" },
  { name: "Aventon", url: "https://www.aventon.com", categories: ["E-Mobility"], status: "active", network: "ShareASale", commission: "5-8%", cookie: "30 days" },
  { name: "Juiced Bikes", url: "https://www.juicedbikes.com", categories: ["E-Mobility"], status: "active", network: "ShareASale", commission: "3-5%", cookie: "30 days" },

  { name: "Husqvarna", url: "https://www.husqvarna.com", categories: ["Arborist"], status: "active", network: "CJ", commission: "3-5%", cookie: "14 days" },
  { name: "Sherrill Tree", url: "https://www.sherrilltree.com", categories: ["Arborist"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "WesSpur", url: "https://www.wesspur.com", categories: ["Arborist"], status: "active", network: "Direct", commission: "5-8%", cookie: "30 days" },

  { name: "BladeHQ", url: "https://www.bladehq.com", categories: ["Knives & Blades", "Survival"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "KnifeCenter", url: "https://www.knifecenter.com", categories: ["Knives & Blades"], status: "active", network: "ShareASale", commission: "5-8%", cookie: "30 days" },
  { name: "SMKW", url: "https://www.smkw.com", categories: ["Knives & Blades"], status: "active", network: "ShareASale", commission: "5-7%", cookie: "30 days" },
  { name: "Benchmade", url: "https://www.benchmade.com", categories: ["Knives & Blades", "Survival"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "Spyderco", url: "https://www.spyderco.com", categories: ["Knives & Blades"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "CRKT", url: "https://www.crkt.com", categories: ["Knives & Blades", "Camping"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "Buck Knives", url: "https://www.buckknives.com", categories: ["Knives & Blades", "Hunting"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "Ka-Bar", url: "https://www.kabar.com", categories: ["Knives & Blades", "Survival"], status: "active", network: "Direct", commission: "5-8%", cookie: "30 days" },
  { name: "Cold Steel", url: "https://www.coldsteel.com", categories: ["Knives & Blades", "Survival"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "Kershaw", url: "https://www.kershawknives.com", categories: ["Knives & Blades"], status: "active", network: "Direct", commission: "5-7%", cookie: "30 days" },
  { name: "Zero Tolerance", url: "https://www.ztknives.com", categories: ["Knives & Blades"], status: "active", network: "Direct", commission: "5-8%", cookie: "30 days" },
  { name: "Helle Knives", url: "https://www.helle.com", categories: ["Knives & Blades"], status: "active", network: "Direct", commission: "5-8%", cookie: "30 days" },
  { name: "Gerber Gear", url: "https://www.gerbergear.com", categories: ["Knives & Blades", "Survival", "Camping"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "SOG Knives", url: "https://www.sogknives.com", categories: ["Knives & Blades", "Survival"], status: "active", network: "AvantLink", commission: "5-10%", cookie: "30 days" },
  { name: "Leatherman", url: "https://www.leatherman.com", categories: ["Knives & Blades", "Survival", "Camping"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },
  { name: "We Knife Co", url: "https://www.weknife.com", categories: ["Knives & Blades"], status: "active", network: "Direct", commission: "8-12%", cookie: "30 days" },
  { name: "Civivi", url: "https://www.civivi.com", categories: ["Knives & Blades"], status: "active", network: "Direct", commission: "8-12%", cookie: "30 days" },

  { name: "Palmetto State Armory", url: "https://palmettostatearmory.com", categories: ["Firearms & Ammo", "Shooting"], status: "active", network: "AvantLink", commission: "3-5%", cookie: "14 days" },
  { name: "Primary Arms", url: "https://www.primaryarms.com", categories: ["Firearms & Ammo", "Shooting", "Hunting"], status: "active", network: "AvantLink", commission: "3-5%", cookie: "30 days" },
  { name: "OpticsPlanet", url: "https://www.opticsplanet.com", categories: ["Firearms & Ammo", "Shooting", "Hunting"], status: "active", network: "CJ", commission: "3-5%", cookie: "30 days" },
  { name: "Guns.com", url: "https://www.guns.com", categories: ["Firearms & Ammo"], status: "active", network: "Direct", commission: "2-4%", cookie: "14 days" },
  { name: "Buds Gun Shop", url: "https://www.budsgunshop.com", categories: ["Firearms & Ammo", "Shooting"], status: "active", network: "ShareASale", commission: "2-4%", cookie: "14 days" },
  { name: "Cheaper Than Dirt", url: "https://www.cheaperthandirt.com", categories: ["Firearms & Ammo", "Shooting", "Survival"], status: "active", network: "ShareASale", commission: "3-5%", cookie: "14 days" },
  { name: "EuroOptic", url: "https://www.eurooptic.com", categories: ["Firearms & Ammo", "Shooting", "Hunting"], status: "active", network: "AvantLink", commission: "3-5%", cookie: "30 days" },
  { name: "Bereli", url: "https://www.bereli.com", categories: ["Firearms & Ammo", "Shooting"], status: "active", network: "ShareASale", commission: "5-8%", cookie: "30 days" },
  { name: "Lucky Gunner", url: "https://www.luckygunner.com", categories: ["Firearms & Ammo"], status: "active", network: "AvantLink", commission: "3-5%", cookie: "30 days" },
  { name: "Grabagun", url: "https://grabagun.com", categories: ["Firearms & Ammo", "Shooting"], status: "active", network: "AvantLink", commission: "2-4%", cookie: "14 days" },
  { name: "Rainier Arms", url: "https://www.rainierarms.com", categories: ["Firearms & Ammo", "Shooting"], status: "active", network: "AvantLink", commission: "3-5%", cookie: "30 days" },
  { name: "Aero Precision", url: "https://www.aeroprecisionusa.com", categories: ["Firearms & Ammo"], status: "active", network: "AvantLink", commission: "5-8%", cookie: "30 days" },
];

const categoryConfig: Record<string, { icon: typeof Tent; products: number; color: string }> = {
  "Camping": { icon: Tent, products: 120, color: "emerald" },
  "Hiking": { icon: Mountain, products: 85, color: "emerald" },
  "Fishing": { icon: Fish, products: 200, color: "emerald" },
  "Climbing": { icon: Scaling, products: 95, color: "emerald" },
  "Winter": { icon: Snowflake, products: 150, color: "emerald" },
  "Cycling": { icon: Bike, products: 110, color: "emerald" },
  "Water Sports": { icon: Waves, products: 75, color: "emerald" },
  "Hunting": { icon: Target, products: 130, color: "emerald" },
  "Shooting": { icon: Crosshair, products: 100, color: "emerald" },
  "Survival": { icon: ShieldAlert, products: 90, color: "amber" },
  "E-Mobility": { icon: Zap, products: 45, color: "emerald" },
  "Arborist": { icon: TreePine, products: 60, color: "emerald" },
  "Apparel": { icon: Shirt, products: 180, color: "emerald" },
  "Knives & Blades": { icon: Sword, products: 250, color: "amber" },
  "Firearms & Ammo": { icon: Crosshair, products: 350, color: "amber" },
  "Skiing": { icon: Snowflake, products: 80, color: "emerald" },
  "Running": { icon: Mountain, products: 60, color: "emerald" },
  "Boating": { icon: Waves, products: 40, color: "emerald" },
};

const defaultCategoryConfig = { icon: Package, products: 50, color: "emerald" };

const steps = [
  { icon: Search, title: "Search Products", description: "Search across 90+ outdoor retailers to find the gear you need." },
  { icon: BarChart3, title: "Compare Prices", description: "See side-by-side pricing from multiple retailers in one view." },
  { icon: Bell, title: "Get Alerts", description: "Set price alerts and get notified when gear drops to your target price." },
];

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function PriceCompare() {
  useEffect(() => {
    document.title = "Price Compare - 90+ Outdoor Retailers | Verdara";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Compare gear prices across 90+ outdoor retailers including REI, Bass Pro Shops, Backcountry, BladeHQ, Palmetto State Armory, and more. Find the best deals on camping, hiking, fishing, hunting, climbing, knives, firearms, and survival gear.");
    return () => { document.title = "Verdara - AI-Powered Outdoor Recreation Super-App | DarkWave Studios"; };
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertProduct, setAlertProduct] = useState("");
  const [alertSubmitted, setAlertSubmitted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => new Set(["Camping", "Knives & Blades", "Firearms & Ammo"]));

  const query = searchQuery.toLowerCase();

  const allCategories = useMemo(() => {
    const catSet = new Set<string>();
    retailers.forEach((r) => r.categories.forEach((c) => catSet.add(c)));
    const primaryOrder = [
      "Camping", "Hiking", "Fishing", "Climbing", "Hunting", "Shooting",
      "Knives & Blades", "Firearms & Ammo", "Winter", "Cycling", "Water Sports",
      "Survival", "E-Mobility", "Arborist", "Apparel",
    ];
    const sorted = primaryOrder.filter((c) => catSet.has(c));
    catSet.forEach((c) => { if (!sorted.includes(c)) sorted.push(c); });
    return sorted;
  }, []);

  const filteredRetailers = useMemo(() => {
    return retailers.filter((r) => {
      const matchesSearch = !query || r.name.toLowerCase().includes(query) || r.categories.some((c) => c.toLowerCase().includes(query));
      const matchesCategory = !activeCategory || r.categories.includes(activeCategory);
      return matchesSearch && matchesCategory;
    });
  }, [query, activeCategory]);

  const filteredCategories = useMemo(() => {
    return allCategories.filter((c) => !query || c.toLowerCase().includes(query));
  }, [allCategories, query]);

  const retailersByCategory = useMemo(() => {
    if (activeCategory) {
      return [{ label: activeCategory, retailers: filteredRetailers }];
    }
    if (query) {
      return [{ label: `Search Results (${filteredRetailers.length})`, retailers: filteredRetailers }];
    }
    return allCategories.map((cat) => ({
      label: cat,
      retailers: retailers.filter((r) => r.categories.includes(cat)),
    })).filter((g) => g.retailers.length > 0);
  }, [filteredRetailers, activeCategory, query, allCategories]);

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertEmail && alertProduct) {
      setAlertSubmitted(true);
      setTimeout(() => setAlertSubmitted(false), 3000);
      setAlertEmail("");
      setAlertProduct("");
    }
  };

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const getCategoryConfig = (cat: string) => categoryConfig[cat] || defaultCategoryConfig;

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
            Compare prices across {retailers.length}+ outdoor retailers. Gear, knives, firearms, and more — all in one place.
          </p>
        </div>
      </div>

      <div className="px-5 md:px-10 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex-1 min-w-[200px] flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-3">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search retailers, categories, or gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              data-testid="input-price-search"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} data-testid="button-clear-search">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30" data-testid="badge-retailer-count">
            {retailers.length}+ Retailers
          </Badge>
          <Badge variant="outline" className="text-xs text-amber-400 border-amber-500/30" data-testid="badge-category-count">
            {allCategories.length} Categories
          </Badge>
          {activeCategory && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveCategory(null)}
              className="gap-1.5"
              data-testid="button-clear-category-filter"
            >
              <X className="w-3.5 h-3.5" />
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
              Verdara participates in affiliate programs with outdoor retailers. When you click a retailer link and make a purchase, we may earn a small commission at no additional cost to you. This helps support the development of Verdara's free features. Verdara does not sell firearms directly — we connect you to licensed retailers for comparison shopping only.
            </p>
          </CardContent>
        </Card>

        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.h2
            className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"
            variants={fadeUp}
            data-testid="text-categories-heading"
          >
            <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            Browse by Category
          </motion.h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-10">
            {filteredCategories.map((cat) => {
              const config = getCategoryConfig(cat);
              const CatIcon = config.icon;
              const isActive = activeCategory === cat;
              const retailerCount = retailers.filter((r) => r.categories.includes(cat)).length;

              return (
                <motion.div key={cat} variants={fadeUp}>
                  <button
                    onClick={() => setActiveCategory(isActive ? null : cat)}
                    className={`w-full text-left rounded-xl border p-4 transition-all duration-200 hover-elevate ${
                      isActive
                        ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                        : "border-white/10 bg-white/5 backdrop-blur-xl"
                    }`}
                    data-testid={`button-category-${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive ? "bg-emerald-500/20" : "bg-emerald-500/10"
                      }`}>
                        <CatIcon className={`w-4 h-4 ${isActive ? "text-emerald-300" : "text-emerald-400"}`} />
                      </div>
                      <span className="text-xs font-semibold text-foreground truncate">{cat}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{retailerCount} retailers</span>
                      <span className="text-[10px] text-muted-foreground">{config.products}+ items</span>
                    </div>
                  </button>
                </motion.div>
              );
            })}
            {filteredCategories.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground text-sm" data-testid="text-no-categories">
                No categories match your search.
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={stagger}>
          {retailersByCategory.map((section) => {
            const config = getCategoryConfig(section.label);
            const SectionIcon = config.icon;
            const isCollapsible = !query && !activeCategory;
            const shouldShow = !isCollapsible || expandedSections.has(section.label);

            return (
              <motion.div key={section.label} className="mb-6" variants={fadeUp}>
                <button
                  onClick={() => isCollapsible && toggleSection(section.label)}
                  className={`w-full flex items-center justify-between gap-3 mb-3 group ${isCollapsible ? "cursor-pointer" : ""}`}
                  data-testid={`button-section-${section.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <SectionIcon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h2 className="text-base font-semibold text-foreground" data-testid={`text-section-${section.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                      {section.label}
                    </h2>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground border-white/10">
                      {section.retailers.length}
                    </Badge>
                  </div>
                  {isCollapsible && (
                    <div className="text-muted-foreground">
                      {shouldShow ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {shouldShow && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {section.retailers.map((retailer) => (
                          <a
                            key={`${section.label}-${retailer.name}`}
                            href={retailer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover-elevate cursor-pointer"
                            data-testid={`card-retailer-${retailer.name.toLowerCase().replace(/['\s]+/g, "-")}`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-emerald-400 font-bold text-sm">{retailer.name.charAt(0)}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-sm text-foreground truncate" data-testid={`text-retailer-name-${retailer.name.toLowerCase().replace(/['\s]+/g, "-")}`}>
                                  {retailer.name}
                                </h3>
                                <span className="text-[10px] text-emerald-400">Active</span>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {retailer.categories.slice(0, 3).map((cat) => (
                                <Badge key={cat} variant="secondary" className="text-[10px]">
                                  {cat}
                                </Badge>
                              ))}
                              {retailer.categories.length > 3 && (
                                <Badge variant="secondary" className="text-[10px]">
                                  +{retailer.categories.length - 3}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mb-1" data-testid={`text-affiliate-info-${retailer.name.toLowerCase().replace(/['\s]+/g, "-")}`}>
                              {retailer.network} · {retailer.commission} · {retailer.cookie} cookie
                            </p>
                            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1" data-testid={`link-visit-${retailer.name.toLowerCase().replace(/['\s]+/g, "-")}`}>
                              Visit Store <ExternalLink className="w-3 h-3" />
                            </span>
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredRetailers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm mb-8" data-testid="text-no-retailers">
            No retailers match your search. Try a different term.
          </div>
        )}

        <div className="mb-12">
          <h2 className="text-lg font-semibold text-foreground mb-6 text-center flex items-center justify-center gap-2" data-testid="text-how-it-works">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <div
                  className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 flex flex-col items-center text-center space-y-3"
                  data-testid={`card-step-${i + 1}`}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Step {i + 1}</span>
                    <h3 className="font-semibold text-sm text-foreground mt-0.5">{step.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{step.description}</p>
                  </div>
                </div>
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
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8" data-testid="card-price-alert">
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
              <div className="flex-1 min-w-[180px] flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type="email"
                  placeholder="Your email address"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  required
                  data-testid="input-alert-email"
                />
              </div>
              <div className="flex-1 min-w-[180px] flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Product name (e.g., Benchmade Bugout)"
                  value={alertProduct}
                  onChange={(e) => setAlertProduct(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  required
                  data-testid="input-alert-product"
                />
              </div>
              <Button type="submit" variant="default" data-testid="button-submit-alert">
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
          </div>
        </motion.div>

        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 mb-8" data-testid="card-template-notice">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Package className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1" data-testid="text-template-title">Universal Comparison Engine</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Verdara's price comparison system is template-driven — new categories and retailers auto-populate across the entire platform. Whether it's knives, firearms, camping gear, or anything else, the comparison engine adapts instantly. Categories grow as new retailers are added.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
