import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Star, Heart, MapPin, ArrowUpDown, X, ChevronDown, Navigation, Loader2 } from "lucide-react";
import LeafletMap from "@/components/leaflet-map";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const TRAIL_COORDS: Record<string, [number, number]> = {
  "Salem, VA": [37.2936, -80.0548],
  "Zion National Park, UT": [37.2982, -112.9488],
  "Grand Teton, WY": [43.7904, -110.6818],
  "Rocky Mountain NP, CO": [40.3428, -105.6836],
  "Yosemite, CA": [37.7490, -119.5885],
  "Grand Canyon, AZ": [36.0544, -112.1401],
  "Mt. Rainier, WA": [46.8523, -121.7603],
  "Acadia NP, ME": [44.3386, -68.2733],
  "Sedona, AZ": [34.8697, -111.7610],
  "Kauai, HI": [22.1649, -159.6502],
  "Glacier NP, MT": [48.7596, -113.7870],
  "Hudson Valley, NY": [41.4310, -73.9712],
  "Leavenworth, WA": [47.5962, -120.6615],
  "Glenwood Springs, CO": [39.5505, -107.3248],
};

const difficulties = ["Easy", "Moderate", "Difficult", "Expert"];
const features = ["Dog-Friendly", "Camping", "Waterfalls", "Lake Views", "Summit", "Wildflowers"];

const difficultyColors: Record<string, string> = {
  Easy: "bg-emerald-500/15 text-emerald-400",
  Moderate: "bg-amber-500/15 text-amber-400",
  Difficult: "bg-orange-500/15 text-orange-400",
  Expert: "bg-red-500/15 text-red-400",
};

export default function Trails() {
  const { data, isLoading } = useQuery({ queryKey: ['/api/trails'] });
  const allTrails = (data || []) as any[];
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [distanceRange, setDistanceRange] = useState([20]);
  const [sortBy, setSortBy] = useState("popularity");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const toggleDifficulty = (d: string) => {
    setSelectedDifficulties(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const trailMarkers = useMemo(() => {
    return allTrails
      .filter((t: any) => TRAIL_COORDS[t.location])
      .map((t: any) => {
        const [lat, lng] = TRAIL_COORDS[t.location];
        return { lat, lng, title: t.name, popup: `<b>${t.name}</b><br/>${t.location}` };
      });
  }, [allTrails]);

  const filteredTrails = allTrails
    .filter(t => {
      if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase()) && !t.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(t.difficulty)) return false;
      const dist = parseFloat(t.distance);
      if (dist > distanceRange[0]) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "distance") return parseFloat(a.distance) - parseFloat(b.distance);
      if (sortBy === "difficulty") {
        const order = { Easy: 0, Moderate: 1, Difficult: 2, Expert: 3 };
        return (order[a.difficulty as keyof typeof order] || 0) - (order[b.difficulty as keyof typeof order] || 0);
      }
      return b.reviews - a.reviews;
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="relative h-52 md:h-60 overflow-hidden">
        <LeafletMap
          center={[39.8283, -98.5795]}
          zoom={4}
          markers={trailMarkers}
          className="w-full h-full"
          style={{ minHeight: "100%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none z-[400]" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 pointer-events-none z-[401]">
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg" data-testid="text-trail-discovery-heading">Trail Discovery</h1>
          <p className="text-white/70 text-sm mt-1.5 drop-shadow" data-testid="text-trail-count">Find your perfect trail from {allTrails.length} options</p>
        </div>
      </div>

      <div className="px-5 md:px-10 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex-1 min-w-[200px] flex items-center gap-2.5 bg-card border border-card-border rounded-xl px-4 py-3">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search trails by name or location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              data-testid="input-trail-search"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} data-testid="button-clear-search">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn("gap-2", showFilters && "bg-emerald-500/10 border-emerald-500/30 text-emerald-500")}
            data-testid="button-toggle-filters"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </Button>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]" data-testid="select-sort">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="difficulty">Difficulty</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 rounded-xl bg-card border border-card-border p-6"
            data-testid="filters-panel"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Difficulty</h4>
                <div className="space-y-3">
                  {difficulties.map(d => (
                    <label key={d} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={selectedDifficulties.includes(d)}
                        onCheckedChange={() => toggleDifficulty(d)}
                        data-testid={`checkbox-difficulty-${d.toLowerCase()}`}
                      />
                      <span className="text-sm text-foreground">{d}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Max Distance</h4>
                <Slider
                  value={distanceRange}
                  onValueChange={setDistanceRange}
                  max={25}
                  min={1}
                  step={0.5}
                  className="mb-2"
                  data-testid="slider-distance"
                />
                <p className="text-xs text-muted-foreground">Up to {distanceRange[0]} miles</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {features.map(f => (
                    <Badge key={f} variant="outline" className="cursor-pointer text-xs" data-testid={`badge-feature-${f.toLowerCase()}`}>
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <p className="text-sm text-muted-foreground mb-5">{filteredTrails.length} trails found</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrails.map((trail, i) => (
            <motion.div
              key={trail.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <div className="rounded-2xl overflow-hidden bg-card border border-card-border group cursor-pointer" data-testid={`card-trail-${trail.id}`}>
                <div className="relative h-48">
                  <img
                    src={trail.image}
                    alt={trail.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge className={difficultyColors[trail.difficulty]}>{trail.difficulty}</Badge>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(trail.id); }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center transition-colors"
                    data-testid={`button-favorite-${trail.id}`}
                  >
                    <Heart className={cn("w-4 h-4", favorites.has(trail.id) ? "text-red-400 fill-red-400" : "text-white")} />
                  </button>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-white font-semibold text-sm leading-tight">{trail.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <MapPin className="w-3 h-3 text-white/60" />
                      <span className="text-white/70 text-xs">{trail.location}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{trail.distance}</span>
                      <span className="text-border">|</span>
                      <span>{trail.elevation}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium text-foreground">{trail.rating}</span>
                      <span className="text-xs text-muted-foreground">({trail.reviews.toLocaleString()})</span>
                    </div>
                  </div>
                  <Link href={`/track/${trail.id}`}>
                    <Button className="w-full bg-emerald-500 text-white gap-2 text-xs" data-testid={`button-track-${trail.id}`}>
                      <Navigation className="w-3.5 h-3.5" /> Start GPS Tracking
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
