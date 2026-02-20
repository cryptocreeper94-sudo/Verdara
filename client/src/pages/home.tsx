import { motion } from "framer-motion";
import { Search, ScanSearch, ChevronRight, Star, TrendingUp, Users, TreePine, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WeatherWidget } from "@/components/weather-widget";
import { activityCategories, featuredTrails } from "@/lib/mock-data";
import { useRef, useEffect, useState } from "react";
import { Link } from "wouter";

function AnimatedCounter({ target, label, suffix = "" }: { target: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 2000;
          const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-emerald-400">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs md:text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

const difficultyColors: Record<string, string> = {
  Easy: "bg-emerald-500/20 text-emerald-400",
  Moderate: "bg-amber-500/20 text-amber-400",
  Difficult: "bg-orange-500/20 text-orange-400",
  Expert: "bg-red-500/20 text-red-400",
};

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen">
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden" data-testid="hero-section">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/hero-landscape.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-background" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4 justify-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                <TreePine className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Verdara</h1>
            </div>
            <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto mb-8">
              AI-powered outdoor recreation. Identify species, discover trails, plan trips, and connect with nature.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-lg"
          >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3">
              <Search className="w-5 h-5 text-white/60 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search trails, species, or activities..."
                className="flex-1 bg-transparent text-white placeholder:text-white/50 outline-none text-sm"
                data-testid="input-hero-search"
              />
              <Link href="/identify">
                <Button className="bg-emerald-500 text-white gap-1.5" data-testid="button-ai-identify">
                  <ScanSearch className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Identify</span>
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-3 gap-8 md:gap-16 mt-10"
          >
            <AnimatedCounter target={284500} label="Active Users" suffix="+" />
            <AnimatedCounter target={12847} label="Trails Mapped" />
            <AnimatedCounter target={45230} label="Species Identified" />
          </motion.div>
        </div>
      </section>

      <section className="px-4 md:px-8 py-8 md:py-12" data-testid="activities-section">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Explore Activities</h2>
            <p className="text-sm text-muted-foreground mt-1">Discover your next outdoor adventure</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {activityCategories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`relative overflow-hidden rounded-2xl cursor-pointer group ${
                i === 0 ? "md:col-span-2 md:row-span-2" : ""
              } ${i === 5 ? "md:col-span-2" : ""}`}
              data-testid={`card-activity-${cat.id}`}
            >
              <div className={`relative ${i === 0 ? "h-48 md:h-full min-h-[200px]" : "h-40 md:h-48"}`}>
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} via-black/20 to-transparent`} />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <cat.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-white font-semibold text-sm md:text-base">{cat.title}</h3>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-4 md:px-8 py-8 md:py-12" data-testid="trails-section">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Featured Trails</h2>
            <p className="text-sm text-muted-foreground mt-1">Handpicked adventures near you</p>
          </div>
          <Link href="/trails">
            <Button variant="ghost" className="text-emerald-500 gap-1" data-testid="button-view-all-trails">
              View All <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {featuredTrails.map((trail, i) => (
            <motion.div
              key={trail.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="min-w-[280px] md:min-w-[320px] snap-start flex-shrink-0"
            >
              <div className="relative rounded-2xl overflow-hidden group cursor-pointer bg-card border border-card-border" data-testid={`card-trail-${trail.id}`}>
                <div className="relative h-44">
                  <img
                    src={trail.image}
                    alt={trail.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <Badge className={difficultyColors[trail.difficulty]}>{trail.difficulty}</Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-semibold text-sm leading-tight">{trail.name}</h3>
                    <p className="text-white/70 text-xs mt-1">{trail.location}</p>
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{trail.distance}</span>
                    <span className="text-border">|</span>
                    <span>{trail.elevation}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium text-foreground">{trail.rating}</span>
                    <span className="text-xs text-muted-foreground">({trail.reviews.toLocaleString()})</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-4 md:px-8 py-8 md:py-12" data-testid="stats-weather-section">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <WeatherWidget />

          <div className="rounded-2xl bg-card border border-card-border p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-semibold text-foreground">Trending This Week</h3>
            </div>
            <div className="space-y-3">
              {["Fall foliage hikes in New England", "Elk viewing season in Colorado", "Winter camping gear prep"].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-500">{i + 1}</span>
                  <span className="text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-card-border p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-semibold text-foreground">Conservation Impact</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trees planted this month</span>
                <span className="text-sm font-bold text-emerald-500">2,847</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Community donations</span>
                <span className="text-sm font-bold text-emerald-500">$48,320</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Acres preserved</span>
                <span className="text-sm font-bold text-emerald-500">1,205</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 py-8 md:py-12" data-testid="cta-section">
        <div className="relative rounded-3xl overflow-hidden">
          <img src="/images/trail_5.jpg" alt="Join Verdara" className="w-full h-48 md:h-64 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-900/70 to-transparent" />
          <div className="absolute inset-0 flex items-center px-6 md:px-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Ready for your next adventure?</h2>
              <p className="text-white/70 text-sm md:text-base mb-4 max-w-md">
                Join 284,500+ outdoor enthusiasts discovering trails, identifying species, and planning epic trips.
              </p>
              <Button className="bg-emerald-500 text-white" data-testid="button-get-started">
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
