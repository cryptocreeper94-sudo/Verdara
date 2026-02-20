import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Leaf, Search, MapPin, Star, Heart, X, Loader2, Calendar, Shield,
  ScanSearch, AlertTriangle, Sprout, Flower2, TreePine, Pill, BookOpen,
  ChevronDown, ChevronUp, ExternalLink, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import type { ActivityLocation } from "@shared/schema";

const seasonColors: Record<string, string> = {
  "Year-round": "bg-emerald-500/15 text-emerald-400",
  "Spring": "bg-green-500/15 text-green-400",
  "Summer": "bg-amber-500/15 text-amber-400",
  "Fall": "bg-orange-500/15 text-orange-400",
  "Winter": "bg-slate-500/15 text-slate-300",
  "Spring-Fall": "bg-teal-500/15 text-teal-400",
  "Spring-Summer": "bg-lime-500/15 text-lime-400",
};

function getSeasonColor(season: string | null) {
  if (!season) return "bg-slate-500/15 text-slate-400";
  for (const key of Object.keys(seasonColors)) {
    if (season.toLowerCase().includes(key.toLowerCase())) return seasonColors[key];
  }
  return "bg-slate-500/15 text-slate-400";
}

function renderStars(rating: number | null) {
  const r = rating ?? 0;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "w-3.5 h-3.5",
            i < Math.round(r) ? "text-amber-400 fill-amber-400" : "text-slate-600"
          )}
        />
      ))}
    </div>
  );
}

interface WildPlant {
  name: string;
  scientificName: string;
  category: "edible" | "medicinal" | "both";
  parts: string;
  season: string;
  habitat: string;
  description: string;
  historicalUse: string;
  caution: string;
  regions: string[];
}

const wildPlantsDatabase: WildPlant[] = [
  {
    name: "Dandelion",
    scientificName: "Taraxacum officinale",
    category: "both",
    parts: "Leaves, roots, flowers",
    season: "Spring-Fall",
    habitat: "Fields, lawns, roadsides, disturbed soil",
    description: "One of the most recognizable and widespread wild edibles. Leaves are rich in vitamins A, C, and K. Roots can be roasted as a coffee substitute.",
    historicalUse: "Used for centuries in Traditional Chinese Medicine and European herbalism as a liver tonic and digestive aid. Native Americans used root tea for kidney and stomach complaints.",
    caution: "Avoid plants from chemically treated lawns. May cause allergic reactions in people sensitive to ragweed or chrysanthemums.",
    regions: ["All US States"],
  },
  {
    name: "Cattail",
    scientificName: "Typha latifolia",
    category: "edible",
    parts: "Shoots, roots, pollen heads, immature flower spikes",
    season: "Spring-Summer",
    habitat: "Marshes, pond edges, wetlands, ditches",
    description: "Often called the 'supermarket of the swamp.' Shoots taste like cucumber, roots can be dried and ground into flour, and pollen can be used as a protein-rich flour supplement.",
    historicalUse: "Native Americans used cattails as a primary food source for thousands of years. Roots were ground into flour, leaves woven into mats, and seed fluff used for insulation and wound dressings.",
    caution: "Can be confused with toxic iris species when young. Always positively identify before consuming. Avoid cattails from polluted water sources.",
    regions: ["All US States"],
  },
  {
    name: "Elderberry",
    scientificName: "Sambucus nigra",
    category: "both",
    parts: "Berries (cooked), flowers",
    season: "Summer-Fall",
    habitat: "Forest edges, stream banks, roadsides, fence rows",
    description: "Dark purple berries are packed with antioxidants and vitamin C. Flowers make excellent fritters, cordials, and teas. Berries must be cooked before eating.",
    historicalUse: "Hippocrates called the elder tree his 'medicine chest.' European folk medicine used elderberry syrup for colds and flu for centuries. Native Americans used bark tea for fevers.",
    caution: "Raw berries, leaves, bark, and stems contain cyanogenic glycosides and are toxic. Always cook berries before consuming. Red elderberry species are more toxic.",
    regions: ["Eastern US", "Pacific Northwest", "Midwest"],
  },
  {
    name: "Stinging Nettle",
    scientificName: "Urtica dioica",
    category: "both",
    parts: "Young leaves and stems (cooked)",
    season: "Spring",
    habitat: "Rich soils, forest edges, stream banks, meadows",
    description: "Despite its sting, nettle is one of the most nutritious wild greens — high in iron, calcium, and protein. Cooking or drying neutralizes the stinging hairs completely.",
    historicalUse: "Used medicinally for over 2,000 years. Ancient Greeks used it for arthritis. Medieval Europeans made nettle cloth. Native Americans used leaf tea for pregnancy support and as a general tonic.",
    caution: "Wear gloves when harvesting — fresh plants cause painful stinging. Only harvest young spring shoots. Older plants develop gritty particles that can irritate kidneys.",
    regions: ["All US States"],
  },
  {
    name: "Plantain",
    scientificName: "Plantago major",
    category: "both",
    parts: "Leaves, seeds",
    season: "Spring-Fall",
    habitat: "Lawns, trails, disturbed areas, compacted soil",
    description: "Not the banana relative — this common 'weed' has broad ribbed leaves. Young leaves are edible in salads or cooked. Seeds (psyllium) are a well-known fiber source.",
    historicalUse: "Anglo-Saxons listed it as one of nine sacred herbs. Known as 'white man's footprint' by Native Americans because it followed European settlers. Traditionally used as a poultice for insect bites, stings, and minor wounds.",
    caution: "Generally very safe. Avoid harvesting from chemically treated areas. Can accumulate heavy metals from contaminated soil.",
    regions: ["All US States"],
  },
  {
    name: "Yarrow",
    scientificName: "Achillea millefolium",
    category: "medicinal",
    parts: "Leaves, flowers",
    season: "Summer",
    habitat: "Meadows, roadsides, open woods, prairies",
    description: "A feathery-leaved perennial with flat-topped white flower clusters. One of the oldest known medicinal plants, with uses spanning thousands of years across virtually every culture.",
    historicalUse: "Named after Achilles, who legend says used it to treat soldiers' wounds in the Trojan War. Native Americans used it for toothaches, headaches, and fever. Traditionally called 'nosebleed plant' for its ability to stop bleeding.",
    caution: "Can cause skin sensitivity in some people. Avoid during pregnancy. May interact with blood-thinning medications. Can be confused with poison hemlock when not in flower.",
    regions: ["All US States"],
  },
  {
    name: "Wild Garlic (Ramps)",
    scientificName: "Allium tricoccum",
    category: "edible",
    parts: "Leaves, bulbs",
    season: "Spring",
    habitat: "Rich deciduous forests, moist slopes, stream valleys",
    description: "A wild leek prized by foragers and chefs alike. Broad, smooth leaves emerge in early spring with a potent garlic-onion flavor. One of the first wild foods available each year.",
    historicalUse: "Cherokee and Iroquois nations used ramps as a spring tonic after long winters. The city of Chicago gets its name from 'shikaakwa,' the Miami-Illinois word for ramps.",
    caution: "Leaves can be confused with toxic lily of the valley or false hellebore. Always crush a leaf to verify the garlic smell. Overharvesting is a serious concern — take only what you need.",
    regions: ["Appalachian Mountains", "Great Lakes", "Northeast", "Southeast"],
  },
  {
    name: "Echinacea",
    scientificName: "Echinacea purpurea",
    category: "medicinal",
    parts: "Roots, flowers, leaves",
    season: "Summer-Fall",
    habitat: "Prairies, open woods, meadows, roadsides",
    description: "The iconic purple coneflower native to the Great Plains. One of the most widely used herbal supplements in the world, traditionally used to support immune function.",
    historicalUse: "Plains Indians used echinacea more than any other plant for medicinal purposes — for everything from snake bites to toothaches. It became a mainstream herbal remedy in the late 1800s through early American eclectic medicine.",
    caution: "May cause allergic reactions in people sensitive to plants in the daisy family. Not recommended for prolonged daily use. May interact with immunosuppressant medications.",
    regions: ["Great Plains", "Midwest", "Southeast"],
  },
  {
    name: "Chickweed",
    scientificName: "Stellaria media",
    category: "both",
    parts: "Leaves, stems, flowers",
    season: "Spring-Fall",
    habitat: "Gardens, lawns, shaded areas, forest edges",
    description: "A delicate, low-growing plant with small white star-shaped flowers. Mild, pleasant flavor similar to corn silk. Excellent raw in salads or as a cooked green.",
    historicalUse: "Used in European folk medicine for centuries as a poultice for skin irritations, eczema, and minor burns. Traditional herbalists considered it a cooling remedy for inflammation.",
    caution: "Generally very safe. Can be confused with toxic spurge, which has milky sap — chickweed has clear sap. Avoid from chemically treated areas.",
    regions: ["All US States"],
  },
  {
    name: "Willow Bark",
    scientificName: "Salix spp.",
    category: "medicinal",
    parts: "Inner bark",
    season: "Spring",
    habitat: "Stream banks, lakeshores, wetlands, moist areas",
    description: "The original source of aspirin. Willow bark contains salicin, which the body converts to salicylic acid. Multiple willow species grow throughout the US near water.",
    historicalUse: "Hippocrates prescribed willow bark for pain and fever in 400 BC. Native Americans across the continent used willow bark tea for headaches, fevers, and inflammation. Led to the synthesis of aspirin in 1897.",
    caution: "Contains the same active compounds as aspirin — do not use if allergic to aspirin. Not recommended for children under 18 (Reye's syndrome risk). Can interact with blood thinners and other medications.",
    regions: ["All US States"],
  },
  {
    name: "Morel Mushroom",
    scientificName: "Morchella spp.",
    category: "edible",
    parts: "Fruiting body (whole mushroom)",
    season: "Spring",
    habitat: "Deciduous forests, old orchards, burn areas, elm/ash/tulip poplar stands",
    description: "The most prized wild mushroom in North America. Honeycomb-patterned cap with a hollow interior. Exceptional nutty, earthy flavor that commands premium prices.",
    historicalUse: "Harvested by Native Americans and early settlers as a spring delicacy. Morel hunting has become a beloved American tradition with festivals and competitions across the Midwest.",
    caution: "Must be cooked — raw morels are mildly toxic. False morels (Gyromitra) are dangerously toxic. True morels are completely hollow inside when sliced. Never eat any mushroom you cannot positively identify.",
    regions: ["Midwest", "Appalachian Mountains", "Pacific Northwest", "Great Lakes"],
  },
  {
    name: "Pawpaw",
    scientificName: "Asimina triloba",
    category: "edible",
    parts: "Ripe fruit",
    season: "Fall",
    habitat: "Rich bottomland forests, stream valleys, understory shade",
    description: "Americas largest native fruit, tasting like a tropical blend of banana, mango, and vanilla. Grows wild in understory groves throughout the Eastern US.",
    historicalUse: "Thomas Jefferson grew pawpaws at Monticello. Lewis and Clark's expedition survived on pawpaws when other food ran low. Native Americans cultivated pawpaw groves and used bark fiber for cordage.",
    caution: "Some people experience digestive upset when eating pawpaws for the first time — start with small amounts. Seeds are toxic and should not be eaten. Fruit must be fully ripe.",
    regions: ["Eastern US", "Midwest", "Appalachian Mountains", "Southeast"],
  },
  {
    name: "Mullein",
    scientificName: "Verbascum thapsus",
    category: "medicinal",
    parts: "Leaves, flowers",
    season: "Summer",
    habitat: "Roadsides, disturbed areas, dry meadows, rocky slopes",
    description: "A tall biennial with velvety soft leaves and a distinctive yellow flower spike. The large fuzzy leaves are unmistakable once you know what to look for.",
    historicalUse: "Roman soldiers dipped the tall stalks in tallow as torches. Traditional herbalists across Europe and the Americas used mullein leaf tea for respiratory support. Flower oil was historically used for earaches.",
    caution: "Leaf hairs can irritate the throat — always strain tea through fine cloth or a coffee filter. Seeds are mildly toxic and should not be consumed.",
    regions: ["All US States"],
  },
  {
    name: "Wood Sorrel",
    scientificName: "Oxalis spp.",
    category: "edible",
    parts: "Leaves, flowers, seed pods",
    season: "Spring-Summer",
    habitat: "Forests, shaded areas, gardens, moist woodlands",
    description: "Heart-shaped clover-like leaves with a bright, lemony flavor. Excellent trail nibble or salad addition. Found in shady spots throughout North American forests.",
    historicalUse: "Native Americans and early settlers used wood sorrel as a refreshing trailside snack and scurvy preventive due to its vitamin C content. Used in European cuisine as a sour seasoning before lemons became widely available.",
    caution: "Contains oxalic acid — consume in moderation. Not recommended for people with kidney stones or gout. Avoid large quantities.",
    regions: ["All US States"],
  },
  {
    name: "Sassafras",
    scientificName: "Sassafras albidum",
    category: "both",
    parts: "Leaves (dried, powdered), root bark (small amounts)",
    season: "Spring-Summer",
    habitat: "Forest edges, old fields, fence rows, open woods",
    description: "A distinctive tree with three different leaf shapes on the same plant. Dried ground leaves (file powder) are essential in Cajun gumbo. Root bark was the original flavoring for root beer.",
    historicalUse: "One of the first North American exports to Europe, marketed as a cure-all in the 1500s. Choctaw people developed file powder for gumbo. Root bark tea was a traditional spring tonic across the Eastern US.",
    caution: "FDA banned safrole (found in root bark oil) as a food additive due to cancer concerns in lab animals. Dried leaf powder (file) is considered safe in culinary amounts. Use root bark tea sparingly if at all.",
    regions: ["Eastern US", "Southeast", "Midwest"],
  },
];

const plantCategoryColors = {
  edible: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  medicinal: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  both: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const plantCategoryLabels = {
  edible: "Edible",
  medicinal: "Medicinal",
  both: "Edible & Medicinal",
};

export default function Foraging() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [plantFilter, setPlantFilter] = useState<"all" | "edible" | "medicinal" | "both">("all");
  const [expandedPlants, setExpandedPlants] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("guide");

  const queryKey = searchQuery
    ? ["/api/activities", `?type=foraging&q=${encodeURIComponent(searchQuery)}`]
    : ["/api/activities", "?type=foraging"];

  const { data, isLoading } = useQuery<ActivityLocation[]>({
    queryKey,
  });

  const allSpots = data || [];

  const availableStates = useMemo(() => {
    const states = new Set<string>();
    allSpots.forEach(s => {
      if (s.state) states.add(s.state);
    });
    return Array.from(states).sort();
  }, [allSpots]);

  const filteredSpots = useMemo(() => {
    return allSpots.filter(spot => {
      if (stateFilter !== "all" && spot.state !== stateFilter) return false;
      return true;
    });
  }, [allSpots, stateFilter]);

  const filteredPlants = useMemo(() => {
    let plants = wildPlantsDatabase;
    if (plantFilter !== "all") {
      plants = plants.filter(p => p.category === plantFilter || (plantFilter !== "both" && p.category === "both"));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      plants = plants.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.scientificName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.habitat.toLowerCase().includes(q)
      );
    }
    return plants;
  }, [plantFilter, searchQuery]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const togglePlant = (name: string) => {
    setExpandedPlants(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  return (
    <div className="min-h-screen" data-testid="page-foraging">
      <div className="relative h-52 md:h-64 overflow-hidden">
        <img
          src="/images/cat-foraging.jpg"
          alt="Wild Edibles & Natural Medicine"
          className="w-full h-full object-cover"
          data-testid="img-hero-foraging"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="flex items-center gap-3 mb-2">
            <Leaf className="w-7 h-7 text-emerald-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg" data-testid="text-page-title">
              Wild Edibles & Natural Medicine
            </h1>
          </div>
          <p className="text-white/70 text-sm mt-1 drop-shadow max-w-lg" data-testid="text-page-description">
            Discover wild foods, natural remedies, and the historical wisdom of plants used for centuries by indigenous peoples and herbalists.
          </p>
        </div>
      </div>

      <div className="px-5 md:px-10 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 mb-5"
          data-testid="disclaimer-banner"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-400">Educational & Historical Information Only</p>
              <p className="text-xs text-amber-400/70 mt-1">
                This content is for educational and entertainment purposes only. It is not medical advice, diagnosis, or treatment.
                Never consume any wild plant you cannot positively identify. Always consult a qualified healthcare professional
                before using any plant medicinally. Some plants have dangerous look-alikes.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 mb-5"
          data-testid="living-catalog-banner"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-400">Living Catalog</p>
              <p className="text-xs text-emerald-400/70 mt-1">
                This is a living catalog that grows every day. We are building the most comprehensive outdoor reference in the country,
                covering thousands of locations, species, and wild plants. New entries are added daily.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-6"
          data-testid="ai-integration-links"
        >
          <Link href="/identify">
            <Button variant="outline" className="border-emerald-500/30 text-emerald-400" data-testid="button-ai-identify">
              <ScanSearch className="w-4 h-4 mr-2" />
              AI Plant Identifier
            </Button>
          </Link>
          <a href="https://vedasolus.io" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-purple-500/30 text-purple-400" data-testid="button-vedasolus">
              <Pill className="w-4 h-4 mr-2" />
              VedaSolus Wellness Hub
              <ExternalLink className="w-3 h-3 ml-1.5" />
            </Button>
          </a>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-card border border-card-border" data-testid="tabs-foraging">
            <TabsTrigger value="guide" data-testid="tab-guide">
              <BookOpen className="w-4 h-4 mr-1.5" />
              Plant Guide ({filteredPlants.length})
            </TabsTrigger>
            <TabsTrigger value="locations" data-testid="tab-locations">
              <MapPin className="w-4 h-4 mr-1.5" />
              Foraging Locations ({allSpots.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guide" className="mt-5">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex-1 min-w-[200px] flex items-center gap-2.5 bg-card border border-card-border rounded-xl px-4 py-3">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search plants by name, habitat, or use..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  data-testid="input-plant-search"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} data-testid="button-clear-search">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              <Select value={plantFilter} onValueChange={(v) => setPlantFilter(v as any)}>
                <SelectTrigger className="w-[180px]" data-testid="select-plant-filter">
                  <Leaf className="w-3.5 h-3.5 mr-1.5" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plants</SelectItem>
                  <SelectItem value="edible">Edible Only</SelectItem>
                  <SelectItem value="medicinal">Medicinal Only</SelectItem>
                  <SelectItem value="both">Edible & Medicinal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-sm text-muted-foreground mb-5" data-testid="text-plant-count">
              {filteredPlants.length} plant{filteredPlants.length !== 1 ? "s" : ""} in database
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlants.map((plant, i) => {
                const isExpanded = expandedPlants.has(plant.name);
                return (
                  <motion.div
                    key={plant.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                  >
                    <Card
                      className="overflow-visible border-card-border bg-card/80 backdrop-blur-sm cursor-pointer hover-elevate"
                      data-testid={`card-plant-${plant.name.toLowerCase().replace(/\s+/g, "-")}`}
                      onClick={() => togglePlant(plant.name)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">{plant.name}</h3>
                              <Badge className={plantCategoryColors[plant.category]} variant="outline">
                                {plant.category === "edible" && <Sprout className="w-3 h-3 mr-1" />}
                                {plant.category === "medicinal" && <Pill className="w-3 h-3 mr-1" />}
                                {plant.category === "both" && <Flower2 className="w-3 h-3 mr-1" />}
                                {plantCategoryLabels[plant.category]}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground italic">{plant.scientificName}</p>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{plant.description}</p>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30">
                            <Calendar className="w-3 h-3 mr-1" />
                            {plant.season}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-slate-400 border-slate-500/30">
                            <TreePine className="w-3 h-3 mr-1" />
                            {plant.habitat.split(",")[0]}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-amber-400 border-amber-500/30">
                            <Leaf className="w-3 h-3 mr-1" />
                            {plant.parts}
                          </Badge>
                        </div>

                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 pt-3 border-t border-card-border"
                          >
                            <div>
                              <p className="text-xs font-semibold text-purple-400 mb-1 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" />
                                Historical & Traditional Uses
                              </p>
                              <p className="text-sm text-muted-foreground">{plant.historicalUse}</p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Safety & Cautions
                              </p>
                              <p className="text-sm text-muted-foreground">{plant.caution}</p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-slate-300 mb-1">Found In</p>
                              <div className="flex flex-wrap gap-1.5">
                                {plant.regions.map(r => (
                                  <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="locations" className="mt-5">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex-1 min-w-[200px] flex items-center gap-2.5 bg-card border border-card-border rounded-xl px-4 py-3">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search foraging locations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  data-testid="input-foraging-search"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} data-testid="button-clear-location-search">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-state-filter">
                  <MapPin className="w-3.5 h-3.5 mr-1.5" />
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {availableStates.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center min-h-[30vh]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-5" data-testid="text-results-count">
                  {filteredSpots.length} foraging location{filteredSpots.length !== 1 ? "s" : ""} found
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredSpots.map((spot, i) => (
                    <motion.div
                      key={spot.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                    >
                      <Card
                        className="overflow-visible border-card-border bg-card/80 backdrop-blur-sm group cursor-pointer hover-elevate"
                        data-testid={`card-foraging-${spot.id}`}
                      >
                        <div className="relative h-48 overflow-hidden rounded-t-md">
                          <img
                            src={spot.image || "/images/cat-foraging.jpg"}
                            alt={spot.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          {spot.season && (
                            <div className="absolute top-3 left-3">
                              <Badge className={getSeasonColor(spot.season)}>
                                <Calendar className="w-3 h-3 mr-1" />
                                {spot.season}
                              </Badge>
                            </div>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(spot.id); }}
                            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center transition-colors"
                            data-testid={`button-favorite-${spot.id}`}
                          >
                            <Heart className={cn("w-4 h-4", favorites.has(spot.id) ? "text-red-400 fill-red-400" : "text-white")} />
                          </button>
                          <div className="absolute bottom-3 left-4 right-4">
                            <h3 className="text-white font-semibold text-sm leading-tight">{spot.name}</h3>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <MapPin className="w-3 h-3 text-white/60" />
                              <span className="text-white/70 text-xs">
                                {spot.location}{spot.state ? `, ${spot.state}` : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5">
                              {renderStars(spot.rating)}
                              <span className="text-xs font-medium text-foreground ml-1">
                                {spot.rating?.toFixed(1) ?? "N/A"}
                              </span>
                              {spot.reviews != null && (
                                <span className="text-xs text-muted-foreground">({spot.reviews.toLocaleString()})</span>
                              )}
                            </div>
                            {spot.isFeatured && (
                              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>

                          {spot.species && spot.species.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-xs font-medium text-muted-foreground">Wild Plants</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {spot.species.map(sp => (
                                  <Badge key={sp} variant="secondary" className="text-xs">{sp}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {spot.regulations && (
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
                              <span className="line-clamp-2">{spot.regulations}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {filteredSpots.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <Leaf className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-1" data-testid="text-no-results">No foraging locations found</h3>
                    <p className="text-sm text-muted-foreground">Try adjusting your search or filters. More locations are added daily.</p>
                  </motion.div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
