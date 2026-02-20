import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MessageSquare, HandCoins, ShieldCheck, X, ArrowUpDown, Loader2, Plus, Trash2, Package, CreditCard, CheckCircle2, XCircle, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrustBadge, TrustScore } from "@/components/trust-badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useSearch } from "wouter";

export default function Marketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['/api/marketplace'] });
  const woodListings = (data || []) as any[];
  const { data: myListingsData } = useQuery({ queryKey: ['/api/user/listings'] });
  const myListings = (myListingsData || []) as any[];
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState<"browse" | "my-listings">("browse");

  const [buyingListingId, setBuyingListingId] = useState<number | null>(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [checkoutBanner, setCheckoutBanner] = useState<"success" | "cancelled" | null>(null);

  const searchString = useSearch();
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const checkoutStatus = params.get("checkout");
    if (checkoutStatus === "success") {
      setCheckoutBanner("success");
      toast({ title: "Payment successful", description: "Your order has been placed. The seller will be notified." });
    } else if (checkoutStatus === "cancelled") {
      setCheckoutBanner("cancelled");
    }
  }, []);

  const [newSpecies, setNewSpecies] = useState("");
  const [newGrade, setNewGrade] = useState("");
  const [newDimensions, setNewDimensions] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newDescription, setNewDescription] = useState("");

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

  const createListing = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/marketplace", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/activity'] });
      setShowCreateForm(false);
      resetForm();
      toast({ title: "Listing created", description: "Your wood listing is now live on the marketplace." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create listing.", variant: "destructive" });
    },
  });

  const deleteListing = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/marketplace/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/listings'] });
      toast({ title: "Listing removed", description: "Your listing has been deleted." });
    },
  });

  const startCheckout = useMutation({
    mutationFn: async ({ listingId, quantity }: { listingId: number; quantity: number }) => {
      const res = await apiRequest("POST", "/api/checkout/create-session", { listingId, quantity });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to start checkout. Please try again.", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setNewSpecies("");
    setNewGrade("");
    setNewDimensions("");
    setNewPrice("");
    setNewLocation("");
    setNewDescription("");
  };

  const handleCreate = () => {
    if (!newSpecies.trim() || !newGrade.trim() || !newDimensions.trim() || !newPrice.trim()) return;
    createListing.mutate({
      species: newSpecies,
      grade: newGrade,
      dimensions: newDimensions,
      pricePerBf: parseFloat(newPrice),
      location: newLocation || null,
      description: newDescription || null,
      image: "/images/wood_1.jpg",
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
    <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-12">
      <AnimatePresence>
        {checkoutBanner === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 mb-6 flex items-center gap-3"
            data-testid="banner-checkout-success"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Payment successful</p>
              <p className="text-xs text-muted-foreground">Your order has been placed. The seller will be notified and your purchase is protected by TrustShield Escrow.</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setCheckoutBanner(null)}>
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
        {checkoutBanner === "cancelled" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 mb-6 flex items-center gap-3"
            data-testid="banner-checkout-cancelled"
          >
            <XCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Checkout cancelled</p>
              <p className="text-xs text-muted-foreground">No payment was processed. You can try again anytime.</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setCheckoutBanner(null)}>
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Wood Marketplace</h1>
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500/10 text-emerald-500 gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> TrustShield Protected
            </Badge>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-6">Browse premium hardwoods from verified sellers across the country</p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button
          variant={viewMode === "browse" ? "default" : "outline"}
          className={cn("text-xs gap-1.5", viewMode === "browse" && "bg-emerald-500 text-white")}
          onClick={() => setViewMode("browse")}
          data-testid="button-browse-listings"
        >
          <Search className="w-3.5 h-3.5" /> Browse
        </Button>
        <Button
          variant={viewMode === "my-listings" ? "default" : "outline"}
          className={cn("text-xs gap-1.5", viewMode === "my-listings" && "bg-emerald-500 text-white")}
          onClick={() => setViewMode("my-listings")}
          data-testid="button-my-listings"
        >
          <Package className="w-3.5 h-3.5" /> My Listings ({myListings.length})
        </Button>
        {!showCreateForm && (
          <Button className="bg-emerald-500 text-white text-xs gap-1.5 ml-auto" onClick={() => setShowCreateForm(true)} data-testid="button-new-listing">
            <Plus className="w-3.5 h-3.5" /> Sell Wood
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showCreateForm && (
          <motion.div
            key="create-listing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="rounded-2xl bg-card border border-card-border p-6 mb-8"
          >
            <div className="flex items-center justify-between gap-3 mb-5">
              <h2 className="text-lg font-semibold text-foreground">Create New Listing</h2>
              <Button size="icon" variant="ghost" onClick={() => { setShowCreateForm(false); resetForm(); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Wood Species</label>
                <input
                  type="text"
                  value={newSpecies}
                  onChange={e => setNewSpecies(e.target.value)}
                  placeholder="e.g., Black Walnut"
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500"
                  data-testid="input-listing-species"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Grade</label>
                <input
                  type="text"
                  value={newGrade}
                  onChange={e => setNewGrade(e.target.value)}
                  placeholder="e.g., FAS, Select, No. 1 Common"
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500"
                  data-testid="input-listing-grade"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Dimensions</label>
                <input
                  type="text"
                  value={newDimensions}
                  onChange={e => setNewDimensions(e.target.value)}
                  placeholder={`e.g., 4/4 x 6" x 8'`}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500"
                  data-testid="input-listing-dimensions"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Price per Board Foot ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  placeholder="e.g., 12.50"
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500"
                  data-testid="input-listing-price"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  placeholder="e.g., Asheville, NC"
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500"
                  data-testid="input-listing-location"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Brief description..."
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500"
                  data-testid="input-listing-description"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <Button
                className="bg-emerald-500 text-white gap-2"
                onClick={handleCreate}
                disabled={createListing.isPending || !newSpecies.trim() || !newGrade.trim() || !newDimensions.trim() || !newPrice.trim()}
                data-testid="button-submit-listing"
              >
                {createListing.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                List for Sale
              </Button>
              <Button variant="outline" onClick={() => { setShowCreateForm(false); resetForm(); }}>Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {viewMode === "my-listings" ? (
        <div>
          {myListings.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No listings yet</h3>
              <p className="text-sm text-muted-foreground mb-6">Start selling your wood products on the marketplace</p>
              <Button className="bg-emerald-500 text-white gap-2" onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4" /> Create Listing
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myListings.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div className="rounded-2xl overflow-hidden bg-card border border-card-border" data-testid={`card-my-listing-${listing.id}`}>
                    <div className="relative h-40">
                      <img src={listing.image || "/images/wood_1.jpg"} alt={listing.species} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <h3 className="text-white font-bold text-base">{listing.species}</h3>
                        <p className="text-white/70 text-xs mt-0.5">{listing.grade} Grade</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-lg font-bold text-emerald-500">${listing.pricePerBf?.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground"> /bd ft</span>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{listing.isActive ? "Active" : "Inactive"}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1.5 mb-4">
                        <div className="flex justify-between gap-3">
                          <span>Dimensions</span>
                          <span className="text-foreground font-medium">{listing.dimensions}</span>
                        </div>
                        {listing.location && (
                          <div className="flex justify-between gap-3">
                            <span>Location</span>
                            <span className="text-foreground font-medium">{listing.location}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full text-xs gap-1.5 text-red-500 border-red-500/30"
                        onClick={() => deleteListing.mutate(listing.id)}
                        disabled={deleteListing.isPending}
                        data-testid={`button-delete-listing-${listing.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Listing
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
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
                        <span className="text-lg font-bold text-emerald-500">${listing.pricePerBf?.toFixed(2)}</span>
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

                    {buyingListingId === listing.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">Board feet:</span>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" onClick={() => setBuyQuantity(q => Math.max(1, q - 1))} data-testid={`button-qty-minus-${listing.id}`}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium text-foreground w-8 text-center" data-testid={`text-qty-${listing.id}`}>{buyQuantity}</span>
                            <Button size="icon" variant="outline" onClick={() => setBuyQuantity(q => q + 1)} data-testid={`button-qty-plus-${listing.id}`}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="text-xs font-semibold text-foreground ml-auto">${(listing.pricePerBf * buyQuantity).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button variant="outline" className="flex-1 text-xs" onClick={() => { setBuyingListingId(null); setBuyQuantity(1); }}>
                            Cancel
                          </Button>
                          <Button
                            className="flex-1 bg-emerald-500 text-white gap-1.5 text-xs"
                            onClick={() => startCheckout.mutate({ listingId: listing.id, quantity: buyQuantity })}
                            disabled={startCheckout.isPending}
                            data-testid={`button-checkout-${listing.id}`}
                          >
                            {startCheckout.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                            Pay Now
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Button variant="outline" className="flex-1 gap-1.5 text-xs" data-testid={`button-message-${listing.id}`}>
                          <MessageSquare className="w-3.5 h-3.5" /> Message
                        </Button>
                        <Button
                          className="flex-1 bg-emerald-500 text-white gap-1.5 text-xs"
                          onClick={() => { setBuyingListingId(listing.id); setBuyQuantity(1); }}
                          data-testid={`button-buy-${listing.id}`}
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Buy Now
                        </Button>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      Protected by TrustShield Escrow
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
