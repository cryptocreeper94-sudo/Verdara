import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Search, X, Tent, Mountain, Fish, Scaling, Snowflake, Bike, Waves, Target, ArrowRight, Bell, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
              placeholder="Search for outdoor gear..."
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
        </div>

        <h2 className="text-lg font-semibold text-foreground mb-4" data-testid="text-categories-heading">
          Browse Categories
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Card
                className="overflow-visible border-card-border bg-card/80 backdrop-blur-sm group cursor-pointer hover-elevate"
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
                  <Badge variant="outline" className="text-xs text-amber-400 border-amber-500/30">
                    Coming Soon
                  </Badge>
                  <Button variant="outline" size="sm" data-testid={`button-browse-${cat.title.toLowerCase().replace(/\s+/g, "-")}`}>
                    Browse
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mb-8">
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
      </div>
    </div>
  );
}