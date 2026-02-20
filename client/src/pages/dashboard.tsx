import { motion } from "framer-motion";
import { Settings, TreePine, Leaf, DollarSign, Wrench, TrendingUp, Heart, ScanSearch, Store, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { userProfile, userActivities, featuredTrails } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

const speciesData = [
  { name: "Trees", value: 18, color: "#10b981" },
  { name: "Plants", value: 12, color: "#f59e0b" },
  { name: "Birds", value: 8, color: "#64748b" },
  { name: "Fish", value: 5, color: "#06b6d4" },
];

const trailHistory = [
  { month: "Jul", trails: 8 },
  { month: "Aug", trails: 15 },
  { month: "Sep", trails: 22 },
  { month: "Oct", trails: 18 },
  { month: "Nov", trails: 12 },
  { month: "Dec", trails: 9 },
  { month: "Jan", trails: 14 },
  { month: "Feb", trails: 29 },
];

const activityIcons: Record<string, typeof ScanSearch> = {
  identification: ScanSearch,
  trail: TreePine,
  marketplace: Store,
  conservation: Leaf,
};

const activityColors: Record<string, string> = {
  identification: "text-emerald-500 bg-emerald-500/10",
  trail: "text-amber-500 bg-amber-500/10",
  marketplace: "text-blue-500 bg-blue-500/10",
  conservation: "text-green-500 bg-green-500/10",
};

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-card-border p-5 md:p-6 mb-6"
        data-testid="profile-header"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-emerald-500/30">
              <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
              <AvatarFallback className="bg-emerald-500/20 text-emerald-500 text-lg font-bold">AT</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-foreground">{userProfile.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-emerald-500/15 text-emerald-500">{userProfile.tier}</Badge>
                <span className="text-xs text-muted-foreground">{userProfile.tierPrice}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Member since {userProfile.memberSince}</p>
            </div>
          </div>
          <Button variant="outline" size="icon" data-testid="button-settings">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { label: "Trails Completed", value: userProfile.trailsCompleted, icon: TreePine, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Species Identified", value: userProfile.speciesIdentified, icon: ScanSearch, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Conservation", value: `$${userProfile.conservationDonated}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Equipment Tracked", value: userProfile.equipmentTracked, icon: Wrench, color: "text-slate-500", bg: "bg-slate-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl bg-card border border-card-border p-4"
            data-testid={`stat-card-${i}`}
          >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", stat.bg)}>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
            </div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-card border border-card-border p-5"
          data-testid="trails-chart"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Trail Activity
            </h3>
            <Badge variant="outline" className="text-[10px]">Last 8 months</Badge>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trailHistory}>
                <defs>
                  <linearGradient id="trailGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="trails" stroke="#10b981" strokeWidth={2} fill="url(#trailGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl bg-card border border-card-border p-5"
          data-testid="species-chart"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Species Identified by Category</h3>
          <div className="flex items-center gap-6">
            <div className="w-36 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={speciesData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={4} dataKey="value">
                    {speciesData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 flex-1">
              {speciesData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-sm text-foreground">{d.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-card border border-card-border p-5"
          data-testid="activity-feed"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {userActivities.map((activity, i) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];
              return (
                <div key={activity.id} className="flex items-start gap-3" data-testid={`activity-item-${activity.id}`}>
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", colorClass.split(" ")[1])}>
                    <Icon className={cn("w-4 h-4", colorClass.split(" ")[0])} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-tight">{activity.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.date}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={activity.image} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl bg-card border border-card-border p-5"
          data-testid="saved-collections"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Saved Collections</h3>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="trails">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  Favorite Trails
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">5</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {featuredTrails.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center gap-3 py-1.5">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.distance} | {t.difficulty}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="species">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-500" />
                  Identified Species
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">43</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-4 gap-2">
                  {["/images/species-pine.jpg", "/images/species-oak.jpg", "/images/species-maple.jpg", "/images/species-birch.jpg", "/images/species-cedar.jpg", "/images/species-spruce.jpg"].map((img, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden">
                      <img src={img} alt="Species" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground font-medium">+37</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="products">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-blue-500" />
                  Saved Products
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">12</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">12 wood listings saved from the marketplace.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </div>
    </div>
  );
}
