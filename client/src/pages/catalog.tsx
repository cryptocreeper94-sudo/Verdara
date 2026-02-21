import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassCard } from "@/components/glass-card";
import { cn } from "@/lib/utils";
import type { CatalogLocation } from "@shared/schema";
import {
  Compass, Search, MapPin, Star, Heart, X, Loader2,
  Mountain, Trees, Filter, Navigation, CheckCircle, RefreshCw
} from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  national_park: "bg-emerald-500/20 text-emerald-300",
  state_park: "bg-green-500/20 text-green-300",
  fishing: "bg-slate-500/20 text-slate-300",
  hunting: "bg-amber-500/20 text-amber-300",
  climbing: "bg-orange-500/20 text-orange-300",
  camping: "bg-emerald-600/20 text-emerald-300",
  mtb: "bg-amber-600/20 text-amber-300",
  watersports: "bg-slate-400/20 text-slate-300",
  winter: "bg-slate-300/20 text-slate-200",
  emobility: "bg-green-400/20 text-green-300",
  charter: "bg-amber-500/20 text-amber-300",
  public_lands: "bg-emerald-400/20 text-emerald-300",
  conservation: "bg-green-600/20 text-green-300",
};

const TYPE_LABELS: Record<string, string> = {
  all: "All",
  national_park: "National Parks",
  state_park: "State Parks",
  fishing: "Fishing",
  hunting: "Hunting",
  climbing: "Climbing",
  camping: "Camping",
  mtb: "MTB",
  watersports: "Water Sports",
  winter: "Winter Sports",
  emobility: "E-Mobility",
  charter: "Charters",
  public_lands: "Public Lands",
  conservation: "Conservation",
};

const DIFFICULTY_OPTIONS = ["all", "Easy", "Moderate", "Hard", "Expert"];
const RADIUS_OPTIONS = [10, 25, 50, 100, 250];

function formatType(type: string) {
  return TYPE_LABELS[type] || type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
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

type CatalogLocationWithDistance = CatalogLocation & { distance?: number };

export default function Catalog() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const [activeZip, setActiveZip] = useState("");
  const [radius, setRadius] = useState("50");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [visibleCount, setVisibleCount] = useState(24);

  const isNearbySearch = activeZip.length === 5;

  const regularParams = useMemo(() => {
    const parts: string[] = [];
    if (searchQuery) parts.push(`q=${encodeURIComponent(searchQuery)}`);
    if (typeFilter !== "all") parts.push(`type=${typeFilter}`);
    if (stateFilter !== "all") parts.push(`state=${stateFilter}`);
    if (difficultyFilter !== "all") parts.push(`difficulty=${difficultyFilter}`);
    if (featuredOnly) parts.push("featured=true");
    return parts.length > 0 ? `?${parts.join("&")}` : "";
  }, [searchQuery, typeFilter, stateFilter, difficultyFilter, featuredOnly]);

  const nearbyQueryKey = isNearbySearch
    ? ["/api/catalog/nearby", `?zip=${activeZip}&radius=${radius}`]
    : null;

  const regularQueryKey = ["/api/catalog", regularParams];

  const { data: regularData, isLoading: regularLoading } = useQuery<CatalogLocationWithDistance[]>({
    queryKey: regularQueryKey,
    enabled: !isNearbySearch,
  });

  const { data: nearbyData, isLoading: nearbyLoading } = useQuery<CatalogLocationWithDistance[]>({
    queryKey: nearbyQueryKey ?? ["/api/catalog/nearby", "?zip=00000&radius=0"],
    enabled: isNearbySearch,
  });

  const allLocations = isNearbySearch ? (nearbyData || []) : (regularData || []);
  const isLoading = isNearbySearch ? nearbyLoading : regularLoading;

  const filteredLocations = useMemo(() => {
    if (!isNearbySearch) return allLocations;
    return allLocations.filter(loc => {
      if (typeFilter !== "all" && loc.type !== typeFilter) return false;
      if (stateFilter !== "all" && loc.state !== stateFilter) return false;
      if (difficultyFilter !== "all" && loc.difficulty !== difficultyFilter) return false;
      if (featuredOnly && !loc.isFeatured) return false;
      if (searchQuery && !loc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [allLocations, isNearbySearch, typeFilter, stateFilter, difficultyFilter, featuredOnly, searchQuery]);

  const displayedLocations = filteredLocations.slice(0, visibleCount);

  const availableStates = useMemo(() => {
    const states = new Set<string>();
    allLocations.forEach(l => { if (l.state) states.add(l.state); });
    return Array.from(states).sort();
  }, [allLocations]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    allLocations.forEach(l => { if (l.type) types.add(l.type); });
    return types;
  }, [allLocations]);

  const totalStates = availableStates.length;

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleNearbySearch = () => {
    if (zipCode.length === 5 && /^\d{5}$/.test(zipCode)) {
      setActiveZip(zipCode);
      setVisibleCount(24);
    }
  };

  const clearNearbySearch = () => {
    setActiveZip("");
    setZipCode("");
  };

  const clearFilters = () => {
    setTypeFilter("all");
    setStateFilter("all");
    setDifficultyFilter("all");
    setFeaturedOnly(false);
    setSearchQuery("");
    clearNearbySearch();
    setVisibleCount(24);
  };

  const hasActiveFilters = typeFilter !== "all" || stateFilter !== "all" || difficultyFilter !== "all" || featuredOnly || searchQuery || isNearbySearch;

  return (
    <div className="min-h-screen" data-testid="page-catalog">
      <div className="relative overflow-hidden py-10 px-5 md:px-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-transparent to-amber-900/20" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Compass className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-page-title">
              Explore the Outdoors
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4" data-testid="text-page-subtitle">
            170+ verified locations across 41 states
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="text-xs" data-testid="badge-total-locations">
              <Mountain className="w-3 h-3 mr-1" />
              {allLocations.length || "170+"} Locations
            </Badge>
            <Badge variant="secondary" className="text-xs" data-testid="badge-states-covered">
              <MapPin className="w-3 h-3 mr-1" />
              {totalStates || 41} States
            </Badge>
            <Badge variant="secondary" className="text-xs" data-testid="badge-activity-types">
              <Trees className="w-3 h-3 mr-1" />
              {uniqueTypes.size || 13} Activity Types
            </Badge>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20" data-testid="banner-living-catalog">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-emerald-300/90">
              <span className="font-semibold">Living Catalog</span> — Continuously updated with new locations across all categories. Our goal: the most complete outdoor recreation guide in the country.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-10 py-4 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-end gap-3 mb-4" data-testid="search-bar">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 bg-card border border-card-border rounded-md px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search locations by name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                data-testid="input-catalog-search"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} data-testid="button-clear-search">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-end gap-2">
            <Input
              type="text"
              placeholder="Zip code"
              value={zipCode}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 5);
                setZipCode(val);
              }}
              className="w-[110px]"
              data-testid="input-zip"
            />
            <Select value={radius} onValueChange={setRadius}>
              <SelectTrigger className="w-[100px]" data-testid="select-radius">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RADIUS_OPTIONS.map(r => (
                  <SelectItem key={r} value={String(r)}>{r} mi</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleNearbySearch}
              disabled={zipCode.length !== 5}
              data-testid="button-search-nearby"
            >
              <Navigation className="w-4 h-4 mr-1.5" />
              Search Nearby
            </Button>
            {isNearbySearch && (
              <Button variant="ghost" size="icon" onClick={clearNearbySearch} data-testid="button-clear-nearby">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4" data-testid="filter-bar">
          <div className="flex overflow-x-auto gap-1.5 pb-1 flex-wrap">
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <Badge
                key={key}
                className={cn(
                  "cursor-pointer whitespace-nowrap text-xs transition-colors",
                  typeFilter === key
                    ? "bg-emerald-500/30 text-emerald-300"
                    : "bg-card text-muted-foreground"
                )}
                onClick={() => { setTypeFilter(key); setVisibleCount(24); }}
                data-testid={`filter-type-${key}`}
              >
                {label}
              </Badge>
            ))}
          </div>

          <Select value={stateFilter} onValueChange={v => { setStateFilter(v); setVisibleCount(24); }}>
            <SelectTrigger className="w-[150px]" data-testid="select-state-filter">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {availableStates.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={v => { setDifficultyFilter(v); setVisibleCount(24); }}>
            <SelectTrigger className="w-[140px]" data-testid="select-difficulty-filter">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map(d => (
                <SelectItem key={d} value={d}>{d === "all" ? "All Difficulties" : d}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge
            className={cn(
              "cursor-pointer whitespace-nowrap text-xs transition-colors",
              featuredOnly
                ? "bg-amber-500/30 text-amber-300"
                : "bg-card text-muted-foreground"
            )}
            onClick={() => { setFeaturedOnly(!featuredOnly); setVisibleCount(24); }}
            data-testid="filter-featured"
          >
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
              <X className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {isNearbySearch && (
          <div className="mb-4 flex items-center gap-2">
            <Badge className="bg-amber-500/20 text-amber-300 text-xs" data-testid="badge-nearby-active">
              <Navigation className="w-3 h-3 mr-1" />
              Showing results near {activeZip} within {radius} mi
            </Badge>
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-4" data-testid="text-results-count">
          {filteredLocations.length} location{filteredLocations.length !== 1 ? "s" : ""} found
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="overflow-visible">
                <div className="h-[200px] bg-muted animate-pulse rounded-t-md" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayedLocations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedLocations.map((loc, i) => (
                <motion.div
                  key={loc.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.5) }}
                >
                  <GlassCard
                    hover
                    onClick={() => setLocation(`/catalog/${loc.slug}`)}
                    className="overflow-visible cursor-pointer group"
                  >
                    <div className="relative h-[200px] overflow-hidden rounded-t-2xl">
                      <img
                        src={loc.imageUrl || "/images/hero-landscape.jpg"}
                        alt={loc.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {loc.isFeatured && (
                          <Badge className="bg-amber-500/80 text-white text-xs" data-testid={`badge-featured-${loc.id}`}>
                            <Star className="w-3 h-3 mr-1 fill-white" />
                            Featured
                          </Badge>
                        )}
                        {loc.isVerified && (
                          <Badge className="bg-emerald-500/80 text-white text-xs" data-testid={`badge-verified-${loc.id}`}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(loc.id); }}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center transition-colors"
                        data-testid={`button-favorite-${loc.id}`}
                      >
                        <Heart className={cn("w-4 h-4", favorites.has(loc.id) ? "text-red-400 fill-red-400" : "text-white")} />
                      </button>
                    </div>

                    <div className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-foreground leading-tight" data-testid={`text-name-${loc.id}`}>
                          {loc.name}
                        </h3>
                        {isNearbySearch && loc.distance != null && (
                          <Badge className="bg-amber-500/20 text-amber-300 text-xs flex-shrink-0" data-testid={`badge-distance-${loc.id}`}>
                            {loc.distance.toFixed(1)} mi
                          </Badge>
                        )}
                      </div>

                      <Badge className={cn("text-xs", TYPE_COLORS[loc.type] || "bg-slate-500/20 text-slate-300")} data-testid={`badge-type-${loc.id}`}>
                        {formatType(loc.type)}
                      </Badge>

                      {(loc.city || loc.state) && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs text-muted-foreground" data-testid={`text-location-${loc.id}`}>
                            {[loc.city, loc.state].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        {renderStars(loc.rating)}
                        <span className="text-xs font-medium text-foreground ml-0.5" data-testid={`text-rating-${loc.id}`}>
                          {loc.rating?.toFixed(1) ?? "N/A"}
                        </span>
                        {loc.reviews != null && loc.reviews > 0 && (
                          <span className="text-xs text-muted-foreground">({loc.reviews.toLocaleString()})</span>
                        )}
                      </div>

                      {loc.activities && loc.activities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {loc.activities.slice(0, 3).map(act => (
                            <Badge
                              key={act}
                              variant="secondary"
                              className="text-xs"
                              data-testid={`badge-activity-${loc.id}-${act.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              {act}
                            </Badge>
                          ))}
                          {loc.activities.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{loc.activities.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {visibleCount < filteredLocations.length && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount(prev => prev + 24)}
                  data-testid="button-load-more"
                >
                  <Loader2 className="w-4 h-4 mr-1.5" />
                  Load More ({filteredLocations.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Compass className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1" data-testid="text-no-results">
              No locations found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or filters to discover more places
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={clearFilters} data-testid="button-reset-filters">
                Clear all filters
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
