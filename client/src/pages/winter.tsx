import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Snowflake, Search, MapPin, Star, Heart, X, ChevronDown, Loader2, Calendar, Shield, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

export default function Winter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const queryKey = searchQuery
    ? ["/api/activities", `?type=winter&q=${encodeURIComponent(searchQuery)}`]
    : ["/api/activities", "?type=winter"];

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
    <div className="min-h-screen" data-testid="page-winter">
      <div className="relative h-52 md:h-64 overflow-hidden">
        <img
          src="/images/cat-winter.jpg"
          alt="Winter Sports"
          className="w-full h-full object-cover"
          data-testid="img-hero-winter"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="flex items-center gap-3 mb-2">
            <Snowflake className="w-7 h-7 text-emerald-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg" data-testid="text-page-title">
              Winter Sports
            </h1>
          </div>
          <p className="text-white/70 text-sm mt-1 drop-shadow max-w-lg" data-testid="text-page-description">
            Find ski resorts, backcountry zones, snowshoeing trails, and winter recreation areas. Check conditions and plan your winter adventure.
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
              placeholder="Search winter sports areas by name or location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              data-testid="input-winter-search"
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
          {filteredSpots.length} winter sport{filteredSpots.length !== 1 ? "s" : ""} area{filteredSpots.length !== 1 ? "s" : ""} found
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSpots.map((spot, i) => {
            const meta = spot.metadata as Record<string, any> | null;
            return (
              <motion.div
                key={spot.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Card
                  className="overflow-visible border-card-border bg-card/80 backdrop-blur-sm group cursor-pointer hover-elevate"
                  data-testid={`card-winter-${spot.id}`}
                >
                  <div className="relative h-48 overflow-hidden rounded-t-md">
                    <img
                      src={spot.image || "/images/activity-skiing.jpg"}
                      alt={spot.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {spot.season && (
                      <div className="absolute top-3 left-3">
                        <Badge className={getSeasonColor(spot.season)} data-testid={`badge-season-${spot.id}`}>
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
                      <h3 className="text-white font-semibold text-sm leading-tight" data-testid={`text-name-${spot.id}`}>
                        {spot.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <MapPin className="w-3 h-3 text-white/60" />
                        <span className="text-white/70 text-xs" data-testid={`text-location-${spot.id}`}>
                          {spot.location}{spot.state ? `, ${spot.state}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        {renderStars(spot.rating)}
                        <span className="text-xs font-medium text-foreground ml-1" data-testid={`text-rating-${spot.id}`}>
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

                    {meta?.vertical_drop && (
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-xs text-amber-400 border-amber-500/30">
                          <Mountain className="w-3 h-3 mr-1" />
                          {meta.vertical_drop} ft Vertical
                        </Badge>
                        {meta?.annual_snowfall && (
                          <Badge variant="outline" className="text-xs text-slate-400 border-slate-600/30">
                            <Snowflake className="w-3 h-3 mr-1" />
                            {meta.annual_snowfall}
                          </Badge>
                        )}
                      </div>
                    )}

                    {spot.species && spot.species.length > 0 && (
                      <div data-testid={`species-list-${spot.id}`}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Snowflake className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-xs font-medium text-muted-foreground">Activities</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {spot.species.map(sp => (
                            <Badge
                              key={sp}
                              variant="secondary"
                              className="text-xs"
                              data-testid={`badge-species-${spot.id}-${sp.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              {sp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {spot.tags && spot.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5" data-testid={`tags-list-${spot.id}`}>
                        {spot.tags.map(tag => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs text-slate-400 border-slate-600/30"
                            data-testid={`badge-tag-${spot.id}-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {spot.regulations && (
                      <div className="flex items-start gap-2 text-xs text-muted-foreground" data-testid={`text-regulations-${spot.id}`}>
                        <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
                        <span className="line-clamp-2">{spot.regulations}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredSpots.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Snowflake className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1" data-testid="text-no-results">No winter sports areas found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}