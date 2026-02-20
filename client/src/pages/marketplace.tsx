import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, MessageSquare, HandCoins, ShieldCheck, X, ArrowUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrustBadge, TrustScore } from "@/components/trust-badge";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function Marketplace() {
  const { data, isLoading } = useQuery({ queryKey: ['/api/marketplace'] });
  const woodListings = (data || []) as any[];
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [speciesFilter, setSpeciesFilter] = useState("all");

  const species = Array.from(new Set(woodListings.map((l: any) => l.species)));

  const filtered = woodListings
    .filter(l => {
      if (searchQuery && !l.species.toLowerCase().includes(searchQuery.toLowerCase()) && !l.sellerName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (speciesFilter !== "all" && l.species !== speciesFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.pricePerBf - b.pricePerBf;
      if (sortBy === "price-high") return b.pricePerBf - a.pricePerBf;
      if (sortBy === "trust") return b.trustScore - a.trustScore;
      return 0;
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Wood Marketplace</h1>
          <Badge className="bg-emerald-500/10 text-emerald-500 gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> TrustShield Protected
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm mb-8">Browse premium hardwoods from verified sellers across the country</p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="flex-1 min-w-[200px] flex items-center gap-2.5 bg-card border border-card-border rounded-xl px-4 py-3">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search species, sellers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
            data-testid="input-marketplace-search"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
          <SelectTrigger className="w-[160px]" data-testid="select-species-filter">
            <SelectValue placeholder="Species" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Species</SelectItem>
            {species.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]" data-testid="select-sort">
            <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="trust">Trust Score</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground mb-5">{filtered.length} listings found</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((listing, i) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <div className="rounded-2xl overflow-hidden bg-card border border-card-border group" data-testid={`card-wood-${listing.id}`}>
              <div className="relative h-52">
                <img
                  src={listing.image}
                  alt={listing.species}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 right-3">
                  <TrustBadge level={listing.trustLevel} />
                </div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-bold text-base">{listing.species}</h3>
                  <p className="text-white/70 text-xs mt-0.5">{listing.grade} Grade</p>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-lg font-bold text-emerald-500">${listing.pricePerBf.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground"> /bd ft</span>
                  </div>
                  <TrustScore score={listing.trustScore} />
                </div>

                <div className="text-xs text-muted-foreground space-y-2 mb-5">
                  <div className="flex justify-between gap-3">
                    <span>Dimensions</span>
                    <span className="text-foreground font-medium">{listing.dimensions}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Seller</span>
                    <span className="text-foreground font-medium">{listing.sellerName}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Location</span>
                    <span className="text-foreground font-medium">{listing.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="outline" className="flex-1 gap-1.5 text-xs" data-testid={`button-message-${listing.id}`}>
                    <MessageSquare className="w-3.5 h-3.5" /> Message
                  </Button>
                  <Button className="flex-1 bg-emerald-500 text-white gap-1.5 text-xs" data-testid={`button-offer-${listing.id}`}>
                    <HandCoins className="w-3.5 h-3.5" /> Make Offer
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Protected by TrustShield Escrow
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
