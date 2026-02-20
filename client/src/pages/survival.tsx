import { motion } from "framer-motion";
import {
  Flame, Mountain, Droplets, Leaf, Compass, Heart,
  Package, Car, Check, ShieldAlert, Tent, Thermometer,
  Sun, Star, TreePine, Zap, Battery, Eye, Flashlight,
  Utensils, Bandage, Bone, Droplet, Wind, Map,
  AlertTriangle, Backpack, Shirt, Wrench, Radio,
  Scissors, Pill, Fuel, Cable, TriangleAlert,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { LivingCatalogBanner } from "@/components/living-catalog-banner";

const skillSections = [
  {
    id: "fire",
    title: "Fire Starting",
    icon: Flame,
    color: "text-amber-400",
    bgColor: "bg-amber-500/15",
    items: [
      { name: "Friction (Bow Drill)", description: "Use a bow to spin a spindle against a fireboard, creating an ember through friction. Requires dry hardwood and practice." },
      { name: "Flint & Steel", description: "Strike a steel striker against flint or quartz to produce sparks onto char cloth or dry tinder bundle." },
      { name: "Magnifying Glass", description: "Focus sunlight through a convex lens onto dark-colored tinder. Works best at midday with direct sunlight." },
      { name: "Battery + Steel Wool", description: "Touch both terminals of a 9V battery to fine steel wool. The wool ignites instantly — have tinder ready." },
      { name: "Fire Plow", description: "Rub a hardwood shaft back and forth along a groove in a softer wood base to generate friction heat and embers." },
    ],
  },
  {
    id: "shelter",
    title: "Shelter Building",
    icon: Tent,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/15",
    items: [
      { name: "Lean-To", description: "Prop a ridgepole against a tree or rock, then layer branches and debris on one side to block wind and rain." },
      { name: "Debris Hut", description: "Build a small A-frame structure covered with thick layers of leaves and forest debris for insulation in cold weather." },
      { name: "Snow Cave", description: "Dig into a firm snowbank to create an insulated chamber. Keep the entrance lower than the sleeping platform for warmth." },
      { name: "Tarp Shelter", description: "Use a tarp and paracord to create quick A-frame, lean-to, or diamond configurations. Lightweight and versatile." },
      { name: "Wickiup", description: "Arrange long poles in a cone shape and cover with brush, bark, or grass. Effective for semi-permanent camps." },
    ],
  },
  {
    id: "water",
    title: "Water Purification",
    icon: Droplets,
    color: "text-blue-400",
    bgColor: "bg-blue-500/15",
    items: [
      { name: "Boiling", description: "Bring water to a rolling boil for at least 1 minute (3 minutes above 6,500 ft). The most reliable method." },
      { name: "Chemical Treatment", description: "Use iodine tablets or chlorine dioxide drops. Follow dosing instructions and wait 30 minutes before drinking." },
      { name: "Portable Filtration", description: "Pump or gravity filters with 0.2 micron pores remove bacteria and protozoa. Carry a backup filter element." },
      { name: "UV Purification", description: "SteriPEN or similar devices use ultraviolet light to neutralize pathogens in clear water within 90 seconds." },
      { name: "Solar Disinfection (SODIS)", description: "Fill clear PET bottles and expose to direct sunlight for 6+ hours. UV rays and heat kill most pathogens." },
    ],
  },
  {
    id: "foraging",
    title: "Food Foraging",
    icon: Leaf,
    color: "text-green-400",
    bgColor: "bg-green-500/15",
    items: [
      { name: "Dandelion", description: "Entire plant is edible — leaves for salads, roots can be roasted for tea, flowers eaten raw. Found in fields and lawns." },
      { name: "Cattail", description: "Shoots, roots, and pollen heads are edible. Found near water. Roots can be dried and ground into flour." },
      { name: "Acorns", description: "Shell and leach in water to remove tannins, then roast or grind into meal. Oak trees are widespread across North America." },
      { name: "Berry Identification", description: "Learn the Universal Edibility Test. Avoid white/yellow berries. Blackberries and blueberries are generally safe; always cross-reference." },
      { name: "Safety Rules", description: "Never eat anything you can't positively identify. Avoid plants near roads or treated areas. When in doubt, don't eat it." },
    ],
  },
  {
    id: "navigation",
    title: "Navigation",
    icon: Compass,
    color: "text-slate-300",
    bgColor: "bg-slate-500/15",
    items: [
      { name: "Sun Position", description: "The sun rises in the east and sets in the west. At midday in the Northern Hemisphere, it's due south. Use a stick shadow to find east-west." },
      { name: "Star Navigation", description: "Locate the North Star (Polaris) using the Big Dipper's pointer stars. Polaris indicates true north in the Northern Hemisphere." },
      { name: "Moss Growth", description: "Moss tends to grow on the north side of trees in the Northern Hemisphere due to less sun exposure. Use as a rough guide only." },
      { name: "Terrain Association", description: "Match visible landmarks (ridges, rivers, peaks) to your topographic map. Follow drainages downhill to find water and civilization." },
      { name: "Watch Compass", description: "Point the hour hand at the sun. The midpoint between the hour hand and 12 o'clock indicates south (Northern Hemisphere)." },
    ],
  },
  {
    id: "firstaid",
    title: "First Aid",
    icon: Heart,
    color: "text-red-400",
    bgColor: "bg-red-500/15",
    items: [
      { name: "Snake Bites", description: "Keep calm and immobilize the affected limb below heart level. Do NOT cut, suck, or tourniquet. Evacuate immediately." },
      { name: "Hypothermia", description: "Remove wet clothing, insulate from the ground, and warm gradually with body heat or warm fluids. Avoid rapid rewarming." },
      { name: "Broken Bones", description: "Splint the injury using rigid materials (sticks, trekking poles) and padding. Immobilize joints above and below the fracture." },
      { name: "Wound Care", description: "Clean wounds with clean water, apply pressure to stop bleeding, and cover with sterile dressing. Watch for infection signs." },
      { name: "Dehydration", description: "Drink small sips frequently. Look for dark urine, dizziness, and confusion. Add electrolytes when possible." },
    ],
  },
];

const bugOutBagItems = [
  { name: "Water (3L minimum)", icon: Droplets },
  { name: "Water purification tablets", icon: Droplet },
  { name: "Energy bars / MREs (3 days)", icon: Utensils },
  { name: "First aid kit", icon: Bandage },
  { name: "Fire starter kit", icon: Flame },
  { name: "Emergency blanket", icon: Thermometer },
  { name: "Headlamp + batteries", icon: Flashlight },
  { name: "Multi-tool / knife", icon: Wrench },
  { name: "Paracord (50 ft)", icon: Cable },
  { name: "Tarp or emergency shelter", icon: Tent },
  { name: "Change of clothes", icon: Shirt },
  { name: "Hand-crank radio", icon: Radio },
  { name: "Compass + local map", icon: Compass },
  { name: "Whistle", icon: Wind },
  { name: "Duct tape (small roll)", icon: Package },
  { name: "Cash (small bills)", icon: Package },
  { name: "Copies of important docs", icon: Package },
  { name: "Prescription medications", icon: Pill },
  { name: "Sunscreen + insect repellent", icon: Sun },
  { name: "Backpack (35-45L)", icon: Backpack },
];

const carKitItems = [
  { name: "Jumper cables", icon: Zap },
  { name: "Tire repair kit + inflator", icon: Wrench },
  { name: "Flashlight + batteries", icon: Flashlight },
  { name: "First aid kit", icon: Bandage },
  { name: "Emergency blanket", icon: Thermometer },
  { name: "Reflective triangles", icon: TriangleAlert },
  { name: "Fire extinguisher", icon: Flame },
  { name: "Basic tool set", icon: Wrench },
  { name: "Tow strap", icon: Cable },
  { name: "Water bottles (2L)", icon: Droplets },
  { name: "Non-perishable snacks", icon: Utensils },
  { name: "Phone charger (car adapter)", icon: Battery },
  { name: "Rain poncho", icon: Droplet },
  { name: "Duct tape", icon: Package },
  { name: "Scissors / seatbelt cutter", icon: Scissors },
];

function ChecklistCard({
  title,
  icon: Icon,
  items,
  color,
  testId,
}: {
  title: string;
  icon: typeof Package;
  items: { name: string; icon: typeof Package }[];
  color: string;
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color === "amber" ? "bg-amber-500/15" : "bg-emerald-500/15")}>
            <Icon className={cn("w-5 h-5", color === "amber" ? "text-amber-400" : "text-emerald-400")} />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{items.length} essential items</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 py-2 px-3 rounded-lg bg-muted/50"
              data-testid={`checklist-item-${testId}-${i}`}
            >
              <div className="w-5 h-5 rounded-md border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-emerald-500" />
              </div>
              <item.icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Survival() {
  return (
    <div className="min-h-screen" data-testid="page-survival">
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src="/images/cat-survival.jpg"
          alt="Survival Hub"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-400" data-testid="badge-survival-hub">Wilderness Preparedness</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2" data-testid="heading-survival-hub">
              Survival Hub
            </h1>
            <p className="text-white/70 text-sm md:text-base max-w-lg" data-testid="text-survival-tagline">
              Master essential wilderness skills. From fire craft to first aid — be prepared for anything nature throws your way.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-5 md:px-10 py-8 space-y-10 max-w-4xl mx-auto">
        <LivingCatalogBanner />
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <TreePine className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold" data-testid="heading-skills-library">Skills Library</h2>
              <p className="text-xs text-muted-foreground">{skillSections.length} categories, {skillSections.reduce((s, sec) => s + sec.items.length, 0)} techniques</p>
            </div>
          </div>

          <Accordion type="multiple" className="space-y-2" data-testid="accordion-skills">
            {skillSections.map((section, si) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border rounded-lg px-4 border-card-border"
                data-testid={`accordion-item-${section.id}`}
              >
                <AccordionTrigger className="hover:no-underline gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", section.bgColor)}>
                      <section.icon className={cn("w-4 h-4", section.color)} />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-sm">{section.title}</span>
                      <span className="text-xs text-muted-foreground ml-2">({section.items.length} techniques)</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-1">
                    {section.items.map((item, ii) => (
                      <div
                        key={ii}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/40"
                        data-testid={`skill-item-${section.id}-${ii}`}
                      >
                        <ChevronRight className={cn("w-4 h-4 mt-0.5 flex-shrink-0", section.color)} />
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-5"
        >
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold" data-testid="heading-emergency-checklists">Emergency Checklists</h2>
              <p className="text-xs text-muted-foreground">Pre-packed kits for any scenario</p>
            </div>
          </div>

          <ChecklistCard
            title="72-Hour Bug Out Bag"
            icon={Backpack}
            items={bugOutBagItems}
            color="emerald"
            testId="card-bugout-bag"
          />

          <ChecklistCard
            title="Car Emergency Kit"
            icon={Car}
            items={carKitItems}
            color="amber"
            testId="card-car-kit"
          />
        </motion.div>
      </div>
    </div>
  );
}
