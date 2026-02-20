import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Search, X, Tent, Mountain, Fish, Scaling, Snowflake, Bike, Waves, Target, ArrowRight, Bell, BarChart3, ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const retailers = [
  { name: "REI", letter: "R", url: "https://www.rei.com", categories: ["Camping", "Hiking", "Climbing", "Cycling"], status: "active" as const },
  { name: "Bass Pro Shops", letter: "B", url: "https://www.basspro.com", categories: ["Fishing", "Hunting", "Camping", "Boating"], status: "active" as const },
  { name: "Cabela's", letter: "C", url: "https://www.cabelas.com", categories: ["Hunting", "Fishing", "Camping", "Shooting"], status: "active" as const },
  { name: "Backcountry", letter: "B", url: "https://www.backcountry.com", categories: ["Skiing", "Climbing", "Hiking", "Cycling"], status: "active" as const },
  { name: "Moosejaw", letter: "M", url: "https://www.moosejaw.com", categories: ["Hiking", "Camping", "Climbing", "Winter"], status: "coming-soon" as const },
  { name: "Sierra Trading Post", letter: "S", url: "https://www.sierra.com", categories: ["Hiking", "Running", "Camping", "Cycling"], status: "active" as const },
  { name: "Sportsman's Warehouse", letter: "S", url: "https://www.sportsmans.com", categories: ["Hunting", "Fishing", "Camping", "Shooting"], status: "coming-soon" as const },
  { name: "Academy Sports", letter: "A", url: "https://www.academy.com", categories: ["Camping", "Fishing", "Hunting", "Cycling"], status: "active" as const },
  { name: "Dick's Sporting Goods", letter: "D", url: "https://www.dickssportinggoods.com", categories: ["Camping", "Hiking", "Cycling", "Water Sports"], status: "coming-soon" as const },
  { name: "Amazon Outdoors", letter: "A", url: "https://www.amazon.com", categories: ["Camping", "Hiking", "Fishing", "Hunting"], status: "active" as const },
];

const categories = [
  { icon: Tent, title: "Camping Gear", products: 120 },
  { icon: Mountain, title: "Hiking Boots", products: 85 },
  { icon: Fish, title: "Fishing Tackle", products: 200 },
  { icon: Scaling, title: "Climbing Equipment", products: 95 },
  { icon: Snowflake, title: "Winter Gear", products: 150 },
  { icon: Bike, title: "Cycling", products: 110 },
  { icon: Waves, title: "Water Sports Gear", products: 75 },
  { icon: Target, title: "Hunting Supplies", products: 130 },
];

const steps = [
  { icon: Search, title: "Search Products", description: "Search across 50+ outdoor retailers to find the gear you need." },
  { icon: BarChart3, title: "Compare Prices", description: "See side-by-side pricing from multiple retailers in one view." },
  { icon: Bell, title: "Get Alerts", description: "Set price alerts and get notified when gear drops to your target price." },
];

export default function PriceCompare() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertProduct, setAlertProduct] = useState("");
  const [alertSubmitted, setAlertSubmitted] = useState(false);

  const query = searchQuery.toLowerCase();

  const filteredRetailers = retailers.filter((r) => {
    const matchesSearch = !query || r.name.toLowerCase().includes(query) || r.categories.some((c) => c.toLowerCase().includes(query));
    const matchesCategory = !activeCategory || r.categories.some((c) => c.toLowerCase().includes(activeCategory.toLowerCase()));
    return matchesSearch && matchesCategory;
  });

  const filteredCategories = categories.filter((c) => {
    return !query || c.title.toLowerCase().includes(query);
  });

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertEmail && alertProduct) {
      setAlertSubmitted(true);
      setTimeout(() => setAlertSubmitted(false), 3000);
      setAlertEmail("");
      setAlertProduct("");
    }
  };

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
            Compare prices across 50+ outdoor retailers. Find the best deals on gear, equipment, and supplies.
          </p>
        </div>
      </div>

      <div className="px-5 md:px-10 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex-1 min-w-[200px] flex items-center gap-2.5 bg-card border border-card-border rounded-xl px-4 py-3">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search retailers, categories, or gear..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              data-testid="input-price-compare-search"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} data-testid="button-clear-search">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          {activeCategory && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveCategory(null)}
              data-testid="button-clear-category-filter"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              {activeCategory}
            </Button>
          )}
        </div>

        <h2 className="text-lg font-semibold text-foreground mb-4" data-testid="text-retailers-heading">
          Featured Retailers
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
          {filteredRetailers.map((retailer, i) => (
            <motion.div
              key={retailer.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Card
                className="overflow-visible border-card-border bg-card/80 backdrop-blur-sm"
                data-testid={`card-retailer-${retailer.name.toLowerCase().replace(/['\s]+/g, "-")}`}
              >
                <CardContent className="p-5 flex flex-col space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-400 font-bold text-sm">{retailer.letter}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-foreground truncate">{retailer.name}</h3>
                      <Badge
                        variant="outline"
                        className={
                          retailer.status === "active"
                            ? "text-xs text-emerald-400 border-emerald-500/30 mt-1"
                            : "text-xs text-amber-400 border-amber-500/30 mt-1"
                        }
                        data-testid={`badge-status-${retailer.name.toLowerCase().replace(/['\s]+/g, "-")}`}
                      >
                        {retailer.status === "active" ? "Active" : "Coming Soon"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {retailer.categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant="secondary"
                        className="text-xs no-default-hover-elevate no-default-active-elevate"
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  <a
                    href={retailer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`link-visit-${retailer.name.toLowerCase().replace(/['\s]+/g, "-")}`}
                  >
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-emerald-600 border-emerald-700 text-white"
                      data-testid={`button-visit-${retailer.name.toLowerCase().replace(/['\s]+/g, "-")}`}
                    >
                      Visit Store
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filteredRetailers.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground text-sm" data-testid="text-no-retailers">
              No retailers match your search. Try a different term.
            </div>
          )}
        </div>

        <h2 className="text-lg font-semibold text-foreground mb-4" data-testid="text-categories-heading">
          Browse Categories
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {filteredCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Card
                className={`overflow-visible border-card-border bg-card/80 backdrop-blur-sm group cursor-pointer hover-elevate ${
                  activeCategory === cat.title ? "ring-1 ring-emerald-500/50" : ""
                }`}
                onClick={() => setActiveCategory(activeCategory === cat.title ? null : cat.title)}
                data-testid={`card-category-${cat.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-md bg-emerald-500/10 flex items-center justify-center">
                    <cat.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{cat.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Compare {cat.products}+ products</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid={`button-browse-${cat.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {activeCategory === cat.title ? "Selected" : "Browse"}
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filteredCategories.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground text-sm" data-testid="text-no-categories">
              No categories match your search.
            </div>
          )}
        </div>

        <div className="mb-12">
          <h2 className="text-lg font-semibold text-foreground mb-6 text-center" data-testid="text-how-it-works">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <Card
                  className="overflow-visible border-card-border bg-card/80 backdrop-blur-sm"
                  data-testid={`card-step-${i + 1}`}
                >
                  <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Step {i + 1}</span>
                      <h3 className="font-semibold text-sm text-foreground mt-0.5">{step.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
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
          <Card className="overflow-visible border-card-border bg-card/80 backdrop-blur-sm" data-testid="card-price-alert">
            <CardContent className="p-6 md:p-8">
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
                <div className="flex-1 min-w-[180px] flex items-center gap-2.5 bg-background border border-card-border rounded-md px-3 py-2">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={alertEmail}
                    onChange={e => setAlertEmail(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                    required
                    data-testid="input-alert-email"
                  />
                </div>
                <div className="flex-1 min-w-[180px] flex items-center gap-2.5 bg-background border border-card-border rounded-md px-3 py-2">
                  <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Product name (e.g., Osprey Atmos 65)"
                    value={alertProduct}
                    onChange={e => setAlertProduct(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                    required
                    data-testid="input-alert-product"
                  />
                </div>
                <Button
                  type="submit"
                  variant="default"
                  className="bg-amber-600 border-amber-700 text-white"
                  data-testid="button-submit-alert"
                >
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
