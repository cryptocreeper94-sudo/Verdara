import { motion } from "framer-motion";
import { CalendarDays, GripVertical, Clock, MapPin, Plus, Share2, Sun, Cloud, CloudRain, CloudSun, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { tripWaypoints, gearCategories, campgrounds, weeklyForecast } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const weatherIcons: Record<string, typeof Sun> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  "cloud-rain": CloudRain,
  cloud: Cloud,
};

export default function Planner() {
  return (
    <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Trip Planner</h1>
          <p className="text-muted-foreground text-sm mt-1.5">Plan your 3-day Great Smoky Mountains adventure</p>
        </div>
        <Button variant="outline" className="gap-2" data-testid="button-share-trip">
          <Share2 className="w-4 h-4" /> Share Trip
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-card border border-card-border p-6"
            data-testid="route-builder"
          >
            <div className="flex items-center justify-between gap-3 mb-5">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-500" /> Route Builder
              </h2>
              <Button variant="outline" className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" /> Add Stop
              </Button>
            </div>

            <div className="space-y-0">
              {tripWaypoints.map((wp, i) => (
                <div key={wp.id} className="flex items-start gap-4 group" data-testid={`waypoint-${wp.id}`}>
                  <div className="flex flex-col items-center pt-2">
                    <div className={cn(
                      "w-3.5 h-3.5 rounded-full border-2 flex-shrink-0",
                      i === 0 ? "border-emerald-500 bg-emerald-500" :
                      i === tripWaypoints.length - 1 ? "border-red-400 bg-red-400" :
                      "border-emerald-500/50 bg-transparent"
                    )} />
                    {i < tripWaypoints.length - 1 && (
                      <div className="w-0.5 h-14 bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-5">
                    <div className="flex items-center gap-2 mb-1">
                      <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab invisible group-hover:visible" />
                      <h4 className="text-sm font-medium text-foreground">{wp.name}</h4>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground ml-6">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {wp.time}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {wp.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-card border border-card-border p-6"
            data-testid="gear-checklist"
          >
            <h2 className="text-lg font-semibold text-foreground mb-5">Gear Checklist</h2>
            <Accordion type="multiple" defaultValue={["Clothing", "Safety & Navigation"]} className="w-full">
              {gearCategories.map((cat) => (
                <AccordionItem key={cat.name} value={cat.name}>
                  <AccordionTrigger className="text-sm font-medium">
                    <div className="flex items-center gap-2.5">
                      {cat.name}
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {cat.items.filter(i => i.checked).length}/{cat.items.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2.5">
                      {cat.items.map(item => (
                        <label key={item.id} className="flex items-center gap-3 py-1.5 cursor-pointer" data-testid={`gear-item-${item.id}`}>
                          <Checkbox defaultChecked={item.checked} />
                          <span className={cn("text-sm", item.checked ? "text-muted-foreground line-through" : "text-foreground")}>
                            {item.name}
                          </span>
                        </label>
                      ))}
                      <Button variant="ghost" className="text-xs gap-1 text-muted-foreground mt-2">
                        <Plus className="w-3 h-3" /> Add custom item
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>

        <div className="space-y-6 lg:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-card border border-card-border p-6"
            data-testid="weather-forecast"
          >
            <h3 className="text-sm font-semibold text-foreground mb-5">7-Day Forecast</h3>
            <div className="space-y-4">
              {weeklyForecast.map((day, i) => {
                const Icon = weatherIcons[day.icon] || Sun;
                return (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground w-10">{day.day}</span>
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground w-20 text-center">{day.condition}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-foreground font-medium">{day.high}</span>
                      <span className="text-muted-foreground">{day.low}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            data-testid="campground-section"
          >
            <h3 className="text-sm font-semibold text-foreground mb-5">Available Campgrounds</h3>
            <div className="space-y-4">
              {campgrounds.map(cg => (
                <div key={cg.id} className="rounded-xl bg-card border border-card-border overflow-hidden" data-testid={`card-campground-${cg.id}`}>
                  <div className="relative h-32">
                    <img src={cg.image} alt={cg.name} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <h4 className="text-white text-sm font-semibold">{cg.name}</h4>
                      <p className="text-white/70 text-xs mt-0.5">{cg.location}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-medium text-foreground">{cg.rating}</span>
                      </div>
                      <span className="text-base font-bold text-emerald-500">${cg.price}<span className="text-xs text-muted-foreground font-normal">/night</span></span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {cg.amenities.slice(0, 3).map(a => (
                        <Badge key={a} variant="outline" className="text-[10px] px-1.5 py-0">{a}</Badge>
                      ))}
                      {cg.amenities.length > 3 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{cg.amenities.length - 3}</Badge>
                      )}
                    </div>
                    <Button className="w-full bg-emerald-500 text-white text-xs" data-testid={`button-reserve-${cg.id}`}>
                      Reserve Site
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
