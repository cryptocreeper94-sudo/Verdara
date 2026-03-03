import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, TreePine, Leaf, DollarSign, Wrench, TrendingUp, Heart, ScanSearch, Store, ChevronRight, MapPin, Package, Coins, Wallet, Globe, Search, Shield, X, ExternalLink, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

const activityIcons: Record<string, typeof ScanSearch> = {
  identification: ScanSearch,
  trail: TreePine,
  marketplace: Store,
  conservation: Leaf,
};

const activityColors: Record<string, string> = {
  identification: "text-emerald-500 bg-emerald-500/10",
  trail: "text-amber-500 bg-amber-500/10",
  marketplace: "text-slate-500 bg-slate-500/10",
  conservation: "text-green-500 bg-green-500/10",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [genesisModalOpen, setGenesisModalOpen] = useState(false);

  const { data: genesisRaw } = useQuery({
    queryKey: ['/api/hallmark/genesis'],
  });
  const genesis = (genesisRaw as any)?.hallmark as {
    thId: string;
    appId: string;
    appName: string;
    productName: string;
    releaseType: string;
    metadata: Record<string, any>;
    dataHash: string;
    txHash: string;
    blockHeight: string;
    createdAt: string;
  } | undefined;

  const { data: trailsData } = useQuery({ queryKey: ['/api/trails/featured'] });
  const featuredTrails = (trailsData || []) as any[];
  const { data: activityData } = useQuery({ queryKey: ['/api/user/activity'] });
  const activities = (activityData || []) as any[];
  const { data: statsData } = useQuery({ queryKey: ['/api/user/stats'] });
  const stats = statsData as { tripsCount: number; identificationsCount: number; activitiesCount: number; listingsCount: number } | undefined;
  const { data: tripsData } = useQuery({ queryKey: ['/api/user/trips'] });
  const trips = (tripsData || []) as any[];
  const { data: myListingsData } = useQuery({ queryKey: ['/api/user/listings'] });
  const myListings = (myListingsData || []) as any[];

  const { data: sigBalance, isLoading: sigLoading } = useQuery({
    queryKey: ['/api/ecosystem/vault/balance'],
    enabled: !!user,
  });
  const sigData = sigBalance as { balance: number; balanceFormatted: string } | undefined;

  const { data: sigStats } = useQuery({
    queryKey: ['/api/ecosystem/sig/stats'],
    enabled: !!user,
  });
  const presaleStats = sigStats as { totalRaisedUsd: number; currentPrice: number } | undefined;

  const { data: creditsBalance, isLoading: creditsLoading } = useQuery({
    queryKey: ['/api/ecosystem/credits/balance'],
    enabled: !!user,
  });
  const creditsData = creditsBalance as { balance: number; bonusCredits: number; dailyUsage: number } | undefined;

  const [tlidSearch, setTlidSearch] = useState("");
  const { data: tlidResult, isFetching: tlidSearching } = useQuery({
    queryKey: ['/api/ecosystem/tlid/search', tlidSearch],
    queryFn: () => fetch(`/api/ecosystem/tlid/search/${encodeURIComponent(tlidSearch)}`).then(r => r.json()),
    enabled: tlidSearch.length >= 2,
  });
  const tlidData = tlidResult as { available: boolean; owner?: string; name?: string } | undefined;

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Guest";
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "G";

  const speciesData = [
    { name: "Trips", value: stats?.tripsCount || 0, color: "#10b981" },
    { name: "Identifications", value: stats?.identificationsCount || 0, color: "#f59e0b" },
    { name: "Activities", value: stats?.activitiesCount || 0, color: "#64748b" },
    { name: "Listings", value: stats?.listingsCount || 0, color: "#065f46" },
  ];

  const totalStats = speciesData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-card-border p-6 md:p-8 mb-8"
        data-testid="profile-header"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <Avatar className="w-16 h-16 border-2 border-emerald-500/30">
              <AvatarFallback className="bg-emerald-500/20 text-emerald-500 text-lg font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-foreground" data-testid="text-user-name">{fullName}</h1>
              <div className="flex items-center gap-2.5 mt-1.5">
                <Badge className="bg-emerald-500/15 text-emerald-500">{user?.tier || "Explorer"}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="icon" data-testid="button-settings">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
        {[
          { label: "Trip Plans", value: stats?.tripsCount || 0, icon: MapPin, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Identifications", value: stats?.identificationsCount || 0, icon: ScanSearch, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Activities Logged", value: stats?.activitiesCount || 0, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Marketplace Listings", value: stats?.listingsCount || 0, icon: Package, color: "text-slate-500", bg: "bg-slate-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl bg-card border border-card-border p-5"
            data-testid={`stat-card-${i}`}
          >
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={cn("w-4.5 h-4.5", stat.color)} />
            </div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-card border border-card-border p-5"
          data-testid="sig-balance-card"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", "bg-emerald-500/10")}>
              <Coins className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-500">SIG</Badge>
          </div>
          <div className="text-2xl font-bold text-foreground" data-testid="text-sig-balance">
            {sigLoading ? "--" : (sigData?.balanceFormatted || "0")}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Signal Token Balance</div>
          {presaleStats && (
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span>Raised: ${presaleStats.totalRaisedUsd?.toLocaleString() || "0"}</span>
              <span>Price: ${presaleStats.currentPrice?.toFixed(4) || "0"}</span>
            </div>
          )}
          <Button variant="outline" size="sm" className="w-full mt-4" data-testid="button-buy-sig">
            <Wallet className="w-3.5 h-3.5 mr-1.5" />
            Buy SIG
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl bg-card border border-card-border p-5"
          data-testid="credits-balance-card"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", "bg-amber-500/10")}>
              <DollarSign className="w-4.5 h-4.5 text-amber-500" />
            </div>
            <Badge className="bg-amber-500/15 text-amber-500">Credits</Badge>
          </div>
          <div className="text-2xl font-bold text-foreground" data-testid="text-credits-balance">
            {creditsLoading ? "--" : (creditsData?.balance?.toLocaleString() || "0")}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Trust Layer Credits</div>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span>Bonus: {creditsData?.bonusCredits?.toLocaleString() || "0"}</span>
            <span>Daily: {creditsData?.dailyUsage?.toLocaleString() || "0"}</span>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4" data-testid="button-top-up-credits">
            <Coins className="w-3.5 h-3.5 mr-1.5" />
            Top Up
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-card border border-card-border p-5"
          data-testid="tlid-domain-card"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", "bg-emerald-500/10")}>
              <Globe className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-500">TLID</Badge>
          </div>
          {(user as any)?.trustLayerId && (
            <div className="text-sm font-medium text-foreground mb-3" data-testid="text-user-tlid">
              {(user as any).trustLayerId}.tlid
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search .tlid domain"
              value={tlidSearch}
              onChange={(e) => setTlidSearch(e.target.value)}
              className="text-sm"
              data-testid="input-dashboard-search"
            />
            <Button variant="outline" size="icon" disabled={tlidSearch.length < 2} data-testid="button-tlid-search">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          {tlidSearching && (
            <p className="text-xs text-muted-foreground mt-2">Searching...</p>
          )}
          {tlidData && !tlidSearching && (
            <div className="mt-2">
              {tlidData.available ? (
                <Badge className="bg-emerald-500/15 text-emerald-500">Available</Badge>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Owned by {tlidData.owner || "another user"}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl bg-card border border-card-border p-6"
          data-testid="stats-chart"
        >
          <h3 className="text-sm font-semibold text-foreground mb-5">Activity Breakdown</h3>
          {totalStats > 0 ? (
            <div className="flex items-center gap-8">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={speciesData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={4} dataKey="value">
                      {speciesData.filter(d => d.value > 0).map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4 flex-1">
                {speciesData.map(d => (
                  <div key={d.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-sm text-foreground">{d.name}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Start creating trips and listings to see your activity breakdown</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-card border border-card-border p-6"
          data-testid="recent-trips"
        >
          <h3 className="text-sm font-semibold text-foreground mb-5">Recent Trip Plans</h3>
          {trips.length > 0 ? (
            <div className="space-y-4">
              {trips.slice(0, 5).map((trip: any) => (
                <div key={trip.id} className="flex items-center gap-3 py-1.5" data-testid={`trip-item-${trip.id}`}>
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{trip.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {trip.startDate || "No date set"} | {(trip.waypoints || []).length} stops
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No trip plans yet</p>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl bg-card border border-card-border p-6"
          data-testid="activity-feed"
        >
          <h3 className="text-sm font-semibold text-foreground mb-5">Recent Activity</h3>
          {activities.length > 0 ? (
            <div className="space-y-5">
              {activities.slice(0, 8).map((activity: any) => {
                const Icon = activityIcons[activity.type] || TrendingUp;
                const colorClass = activityColors[activity.type] || "text-emerald-500 bg-emerald-500/10";
                return (
                  <div key={activity.id} className="flex items-start gap-4" data-testid={`activity-item-${activity.id}`}>
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", colorClass.split(" ")[1])}>
                      <Icon className={cn("w-4 h-4", colorClass.split(" ")[0])} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{activity.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No activity logged yet. Create trips and listings to see your activity here.</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-card border border-card-border p-6"
          data-testid="saved-collections"
        >
          <h3 className="text-sm font-semibold text-foreground mb-5">Saved Collections</h3>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="trails">
              <AccordionTrigger className="text-sm font-medium" data-testid="accordion-favorite-trails">
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-red-400" />
                  Favorite Trails
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{featuredTrails.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {featuredTrails.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center gap-3 py-1.5">
                      <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{t.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.distance} | {t.difficulty}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="listings">
              <AccordionTrigger className="text-sm font-medium" data-testid="accordion-marketplace-listings">
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-slate-500" />
                  My Marketplace Listings
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{myListings.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {myListings.length > 0 ? (
                  <div className="space-y-3">
                    {myListings.slice(0, 5).map((listing: any) => (
                      <div key={listing.id} className="flex items-center gap-3 py-1.5">
                        <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={listing.image || "/images/wood_1.jpg"} alt={listing.species} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{listing.species}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">${listing.pricePerBf?.toFixed(2)}/bd ft | {listing.grade}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No marketplace listings yet.</p>
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="trips">
              <AccordionTrigger className="text-sm font-medium" data-testid="accordion-trip-plans">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  Trip Plans
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{trips.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {trips.length > 0 ? (
                  <div className="space-y-3">
                    {trips.slice(0, 5).map((trip: any) => (
                      <div key={trip.id} className="flex items-center gap-3 py-1.5">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{trip.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{(trip.waypoints || []).length} stops</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No trip plans yet.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </div>

      {genesis && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-8 pt-6 border-t border-card-border"
        >
          <button
            onClick={() => setGenesisModalOpen(true)}
            className="flex items-center gap-2.5 mx-auto px-4 py-2.5 rounded-lg bg-emerald-500/10 hover-elevate cursor-pointer"
            data-testid="button-genesis-hallmark"
          >
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-500">Genesis Hallmark</span>
            <Badge className="bg-emerald-500/15 text-emerald-500 text-[10px]">{genesis.thId}</Badge>
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {genesisModalOpen && genesis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setGenesisModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-card-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
              data-testid="modal-genesis-detail"
            >
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">Genesis Hallmark</h2>
                    <p className="text-xs text-muted-foreground">{genesis.thId}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setGenesisModalOpen(false)} data-testid="button-close-genesis-modal">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Application Info</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 py-1.5">
                      <span className="text-xs text-muted-foreground">App Name</span>
                      <span className="text-xs font-medium text-foreground" data-testid="text-genesis-app-name">{genesis.appName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-1.5">
                      <span className="text-xs text-muted-foreground">Product</span>
                      <span className="text-xs font-medium text-foreground">{genesis.productName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-1.5">
                      <span className="text-xs text-muted-foreground">Release Type</span>
                      <Badge className="bg-emerald-500/15 text-emerald-500 text-[10px]">{genesis.releaseType}</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-1.5">
                      <span className="text-xs text-muted-foreground">Created</span>
                      <span className="text-xs font-medium text-foreground">{new Date(genesis.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-card-border pt-5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Blockchain Record</h3>
                  <div className="space-y-2">
                    <div className="py-1.5">
                      <span className="text-xs text-muted-foreground block mb-1">Data Hash</span>
                      <code className="text-[10px] font-mono text-foreground break-all bg-muted/50 px-2 py-1 rounded" data-testid="text-genesis-data-hash">{genesis.dataHash}</code>
                    </div>
                    <div className="py-1.5">
                      <span className="text-xs text-muted-foreground block mb-1">Transaction Hash</span>
                      <code className="text-[10px] font-mono text-foreground break-all bg-muted/50 px-2 py-1 rounded" data-testid="text-genesis-tx-hash">{genesis.txHash}</code>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-1.5">
                      <span className="text-xs text-muted-foreground">Block Height</span>
                      <span className="text-xs font-medium text-foreground" data-testid="text-genesis-block-height">{genesis.blockHeight}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-card-border pt-5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ecosystem Details</h3>
                  <div className="space-y-2">
                    {genesis.metadata && Object.entries(genesis.metadata).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between gap-3 py-1.5">
                        <span className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-xs font-medium text-foreground text-right max-w-[60%] truncate">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {genesis.metadata?.parentGenesis && (
                  <div className="border-t border-card-border pt-5">
                    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                      <Link2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">Parent Genesis</p>
                        <p className="text-[10px] text-muted-foreground">Trust Layer Hub — {String(genesis.metadata.parentGenesis)}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
