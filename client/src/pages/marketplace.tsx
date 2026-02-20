import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, MessageSquare, HandCoins, ShieldCheck, X, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrustBadge, TrustScore } from "@/components/trust-badge";
import { woodListings } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [speciesFilter, setSpeciesFilter] = useState("all");

  const species = [...new Set(woodListings.map(l => l.species))];

  const filtered = woodListings
    .filter(l => {
      if (searchQuery && !l.species.toLowerCase().includes(searchQuery.toLowerCase()) && !l.seller.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (speciesFilter !== "all" && l.species !== speciesFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.pricePerBf - b.pricePerBf;
      if (sortBy === "price-high") return b.pricePerBf - a.pricePerBf;
      if (sortBy === "trust") return b.trustScore - a.trustScore;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Wood Marketplace</h1>
          <Badge className="bg-emerald-500/10 text-emerald-500 gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> TrustShield Protected
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm mb-6">Browse premium hardwoods from verified sellers across the country</p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-card border border-card-border rounded-xl px-3 py-2.5">
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

      <p className="text-sm text-muted-foreground mb-4">{filtered.length} listings found</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((listing, i) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <div className="rounded-2xl overflow-hidden bg-card border border-card-border group" data-testid={`card-wood-${listing.id}`}>
              <div className="relative h-48">
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
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-white font-bold text-base">{listing.species}</h3>
                  <p className="text-white/70 text-xs">{listing.grade} Grade</p>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-lg font-bold text-emerald-500">${listing.pricePerBf.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground"> /bd ft</span>
                  </div>
                  <TrustScore score={listing.trustScore} />
                </div>

                <div className="text-xs text-muted-foreground space-y-1.5 mb-4">
                  <div className="flex justify-between">
                    <span>Dimensions</span>
                    <span className="text-foreground font-medium">{listing.dimensions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seller</span>
                    <span className="text-foreground font-medium">{listing.seller}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location</span>
                    <span className="text-foreground font-medium">{listing.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" className="flex-1 gap-1.5 text-xs" data-testid={`button-message-${listing.id}`}>
                    <MessageSquare className="w-3.5 h-3.5" /> Message
                  </Button>
                  <Button className="flex-1 bg-emerald-500 text-white gap-1.5 text-xs" data-testid={`button-offer-${listing.id}`}>
                    <HandCoins className="w-3.5 h-3.5" /> Make Offer
                  </Button>
                </div>

                <div className="mt-3 pt-3 border-t border-border flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
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
