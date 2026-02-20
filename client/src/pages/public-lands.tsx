import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Trees, Search, MapPin, Star, Heart, X, Loader2, Shield, Mountain, Tent, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { LivingCatalogBanner } from "@/components/living-catalog-banner";
import type { ActivityLocation } from "@shared/schema";

const seasonColors: Record<string, string> = {
  "Year-round": "bg-emerald-500/15 text-emerald-400",
  "Spring": "bg-green-500/15 text-green-400",
  "Summer": "bg-amber-500/15 text-amber-400",
  "Fall": "bg-orange-500/15 text-orange-400",
  "Winter": "bg-sky-500/15 text-sky-400",
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

export default function PublicLands() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const queryKey = searchQuery
    ? ["/api/activities", `?type=public_lands&q=${encodeURIComponent(searchQuery)}`]
    : ["/api/activities", "?type=public_lands"];

  const { data, isLoading } = useQuery<ActivityLocation[]>({
    queryKey,
  });

  const allLands = data || [];

  const availableStates = useMemo(() => {
    const states = new Set<string>();
    allLands.forEach(s => {
      if (s.state) states.add(s.state);
    });
    return Array.from(states).sort();
  }, [allLands]);

  const filteredLands = useMemo(() => {
    return allLands.filter(land => {
      if (stateFilter !== "all" && land.state !== stateFilter) return false;
      return true;
    });
  }, [allLands, stateFilter]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="page-public-lands">
      <div className="relative h-52 md:h-64 overflow-hidden">
        <img
          src="/images/cat-publiclands.jpg"
          alt="Public Lands"
          className="w-full h-full object-cover"
          data-testid="img-hero-public-lands"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="flex items-center gap-3 mb-2">
            <Trees className="w-7 h-7 text-emerald-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg" data-testid="text-page-title">
              Public Lands Directory
            </h1>
          </div>
          <p className="text-white/70 text-sm mt-1 drop-shadow max-w-lg" data-testid="text-page-description">
            Explore national parks, state parks, BLM lands, and national forests. Find public lands for hiking, camping, fishing, and outdoor recreation across the country.
          </p>
        </div>
      </div>

      <div className="px-5 md:px-10 py-6">
        <LivingCatalogBanner />
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex-1 min-w-[200px] flex items-center gap-2.5 bg-card border border-card-border rounded-xl px-4 py-3">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search public lands by name or location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              data-testid="input-publiclands-search"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} data-testid="button-clear-search">
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

        <p className="text-sm text-muted-foreground mb-5" data-testid="text-results-count">
          {filteredLands.length} public land{filteredLands.length !== 1 ? "s" : ""} found
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLands.map((land, i) => (
            <motion.div
              key={land.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Card
                className="overflow-visible border-card-border bg-card/80 backdrop-blur-sm group cursor-pointer"
                data-testid={`card-public-land-${land.id}`}
              >
                <div className="relative h-48 overflow-hidden rounded-t-md">
                  <img
                    src={land.image || "/images/cat-publiclands.jpg"}
                    alt={land.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {land.season && (
                    <div className="absolute top-3 left-3">
                      <Badge className={getSeasonColor(land.season)} data-testid={`badge-season-${land.id}`}>
                        <Compass className="w-3 h-3 mr-1" />
                        {land.season}
                      </Badge>
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(land.id); }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center transition-colors"
                    data-testid={`button-favorite-${land.id}`}
                  >
                    <Heart className={cn("w-4 h-4", favorites.has(land.id) ? "text-red-400 fill-red-400" : "text-white")} />
                  </button>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-white font-semibold text-sm leading-tight" data-testid={`text-name-${land.id}`}>
                      {land.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <MapPin className="w-3 h-3 text-white/60" />
                      <span className="text-white/70 text-xs" data-testid={`text-location-${land.id}`}>
                        {land.location}{land.state ? `, ${land.state}` : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      {renderStars(land.rating)}
                      <span className="text-xs font-medium text-foreground ml-1" data-testid={`text-rating-${land.id}`}>
                        {land.rating?.toFixed(1) ?? "N/A"}
                      </span>
                      {land.reviews != null && (
                        <span className="text-xs text-muted-foreground">({land.reviews.toLocaleString()})</span>
                      )}
                    </div>
                    {land.isFeatured && (
                      <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>

                  {land.amenities && land.amenities.length > 0 && (
                    <div data-testid={`amenities-list-${land.id}`}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Tent className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-medium text-muted-foreground">Amenities</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {land.amenities.map(amenity => (
                          <Badge
                            key={amenity}
                            variant="secondary"
                            className="text-xs"
                            data-testid={`badge-amenity-${land.id}-${amenity.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {land.tags && land.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5" data-testid={`tags-list-${land.id}`}>
                      {land.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs text-slate-400 border-slate-600/30"
                          data-testid={`badge-tag-${land.id}-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {land.description && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground" data-testid={`text-description-${land.id}`}>
                      <Mountain className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
                      <span className="line-clamp-2">{land.description}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredLands.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Trees className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1" data-testid="text-no-results">No public lands found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
