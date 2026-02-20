import { motion } from "framer-motion";
import {
  Trees, Droplets, Bird, Fish, Mountain, Leaf, Heart, Globe,
  ExternalLink, Users, Shield, Compass, Footprints,
  PawPrint, Waves, TreePine
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion";

const organizations = [
  {
    id: "rmef",
    name: "Rocky Mountain Elk Foundation",
    abbrev: "RMEF",
    focus: "Elk Habitat",
    description: "Dedicated to ensuring the future of elk, other wildlife, their habitat, and our hunting heritage. Has conserved over 8 million acres across North America.",
    url: "https://www.rmef.org",
    icon: Mountain,
  },
  {
    id: "ducks-unlimited",
    name: "Ducks Unlimited",
    abbrev: "DU",
    focus: "Wetland & Waterfowl",
    description: "The world's leader in wetlands and waterfowl conservation. Has conserved more than 15 million acres of habitat across North America since 1937.",
    url: "https://www.ducks.org",
    icon: Bird,
  },
  {
    id: "trout-unlimited",
    name: "Trout Unlimited",
    abbrev: "TU",
    focus: "Coldwater Fisheries",
    description: "Conserves, protects, and restores North America's coldwater fisheries and their watersheds. Over 300,000 members and supporters nationwide.",
    url: "https://www.tu.org",
    icon: Fish,
  },
  {
    id: "nwtf",
    name: "National Wild Turkey Federation",
    abbrev: "NWTF",
    focus: "Wild Turkey Conservation",
    description: "Dedicated to the conservation of the wild turkey and preservation of the hunting tradition. Has conserved over 4 million acres of habitat.",
    url: "https://www.nwtf.org",
    icon: TreePine,
  },
  {
    id: "pheasants-forever",
    name: "Pheasants Forever",
    abbrev: "PF",
    focus: "Upland Habitat",
    description: "Dedicated to the conservation of pheasants, quail, and other wildlife through habitat improvements, public access, education, and advocacy.",
    url: "https://www.pheasantsforever.org",
    icon: Leaf,
  },
  {
    id: "nature-conservancy",
    name: "The Nature Conservancy",
    abbrev: "TNC",
    focus: "Global Conservation",
    description: "A global environmental nonprofit working to create a world where people and nature can thrive. Operates in 79 countries and territories.",
    url: "https://www.nature.org",
    icon: Globe,
  },
  {
    id: "sierra-club",
    name: "Sierra Club",
    abbrev: "SC",
    focus: "Wilderness Protection",
    description: "America's largest and most influential grassroots environmental organization. Founded in 1892, with millions of members and supporters.",
    url: "https://www.sierraclub.org",
    icon: Mountain,
  },
  {
    id: "bha",
    name: "Backcountry Hunters & Anglers",
    abbrev: "BHA",
    focus: "Public Lands Access",
    description: "Ensures North America's outdoor heritage of hunting and fishing in a wild setting by protecting and promoting public lands, waters, and wildlife habitat for sustainable use.",
    url: "https://www.backcountryhunters.org",
    icon: Compass,
  },
];

const educationalTopics = [
  {
    id: "habitat",
    title: "Habitat Management",
    icon: Trees,
    content: [
      {
        subtitle: "Forest Management",
        text: "Sustainable forestry practices balance timber production with wildlife habitat preservation. Selective logging, reforestation, and maintaining old-growth corridors are key strategies.",
      },
      {
        subtitle: "Prescribed Burns",
        text: "Controlled fire is a vital land management tool that reduces wildfire risk, recycles nutrients, and promotes new growth. Many ecosystems depend on periodic fire for regeneration.",
      },
      {
        subtitle: "Invasive Species Control",
        text: "Non-native invasive species threaten biodiversity by outcompeting native plants and animals. Early detection, removal, and prevention programs are essential for ecosystem health.",
      },
    ],
  },
  {
    id: "species",
    title: "Species Conservation",
    icon: PawPrint,
    content: [
      {
        subtitle: "Endangered Species Recovery",
        text: "The Endangered Species Act has helped recover iconic species like the bald eagle, gray wolf, and American alligator through habitat protection and captive breeding programs.",
      },
      {
        subtitle: "Migration Corridors",
        text: "Wildlife corridors connect fragmented habitats, allowing animals to move safely between areas for feeding, breeding, and seasonal migration. Protecting these pathways is critical.",
      },
      {
        subtitle: "Breeding Programs",
        text: "Captive breeding and reintroduction programs help restore populations of critically endangered species. Success stories include the California condor and black-footed ferret.",
      },
    ],
  },
  {
    id: "water",
    title: "Water Conservation",
    icon: Droplets,
    content: [
      {
        subtitle: "Watershed Protection",
        text: "Healthy watersheds filter water, reduce flooding, and support diverse aquatic ecosystems. Protecting riparian buffers and reducing runoff pollution are essential practices.",
      },
      {
        subtitle: "Wetland Restoration",
        text: "Wetlands act as natural water filtration systems and provide critical habitat for waterfowl and fish. Restoration efforts focus on removing drainage tiles and restoring natural hydrology.",
      },
      {
        subtitle: "Clean Water Initiatives",
        text: "Clean water is fundamental to all life. Monitoring water quality, reducing agricultural runoff, and preventing industrial pollution protect both wildlife and human communities.",
      },
    ],
  },
  {
    id: "lnt",
    title: "Leave No Trace",
    icon: Footprints,
    content: [
      {
        subtitle: "The 7 Principles",
        text: "Plan ahead and prepare. Travel and camp on durable surfaces. Dispose of waste properly. Leave what you find. Minimize campfire impacts. Respect wildlife. Be considerate of other visitors.",
      },
      {
        subtitle: "Why It Matters",
        text: "As outdoor recreation grows in popularity, Leave No Trace principles help minimize human impact on natural areas, preserving them for future generations of adventurers and wildlife alike.",
      },
    ],
  },
];

const impactStats = [
  { label: "Acres Conserved", value: "27M+", icon: Trees },
  { label: "Species Protected", value: "1,200+", icon: PawPrint },
  { label: "Waterways Restored", value: "5,000+", icon: Waves },
  { label: "Volunteers Active", value: "500K+", icon: Users },
];

export default function Conservation() {
  return (
    <div className="min-h-screen">
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src="/images/cat-conservation.jpg"
          alt="Conservation"
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
              <Heart className="w-6 h-6 text-emerald-400" />
              <Badge className="bg-emerald-500/20 text-emerald-400" data-testid="badge-hero">
                Conservation Education
              </Badge>
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2"
              data-testid="text-hero-title"
            >
              Conservation
            </h1>
            <p
              className="text-white/70 text-sm md:text-base max-w-lg"
              data-testid="text-hero-tagline"
            >
              Protecting wild spaces, preserving wildlife, and empowering the next generation of conservation stewards.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-5 md:px-10 py-8 space-y-12 max-w-6xl mx-auto">
        <section data-testid="section-organizations">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold text-foreground mb-1">Featured Organizations</h2>
            <p className="text-sm text-muted-foreground">
              Leading conservation organizations making a difference across North America and beyond.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {organizations.map((org, i) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
              >
                <Card className="h-full" data-testid={`card-org-${org.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                        <org.icon className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm leading-tight">{org.name}</CardTitle>
                      </div>
                    </div>
                    <Badge
                      className="bg-amber-500/15 text-amber-500 w-fit mt-2"
                      data-testid={`badge-focus-${org.id}`}
                    >
                      {org.focus}
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed" data-testid={`text-desc-${org.id}`}>
                      {org.description}
                    </p>
                    <a href={org.url} target="_blank" rel="noopener noreferrer">
                      <Button
                        variant="outline"
                        className="w-full gap-2 text-xs"
                        data-testid={`button-visit-${org.id}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Visit {org.abbrev}
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section data-testid="section-education">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold text-foreground mb-1">Educational Content</h2>
            <p className="text-sm text-muted-foreground">
              Learn about key conservation topics and how you can contribute to protecting our natural world.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Card>
              <CardContent className="p-4 md:p-6">
                <Accordion type="single" collapsible className="w-full">
                  {educationalTopics.map((topic) => (
                    <AccordionItem key={topic.id} value={topic.id} data-testid={`accordion-${topic.id}`}>
                      <AccordionTrigger className="hover:no-underline" data-testid={`accordion-trigger-${topic.id}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                            <topic.icon className="w-4 h-4 text-emerald-500" />
                          </div>
                          <span className="text-sm font-semibold text-foreground">{topic.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pl-11">
                          {topic.content.map((item, idx) => (
                            <div key={idx} data-testid={`content-${topic.id}-${idx}`}>
                              <h4 className="text-sm font-medium text-foreground mb-1">{item.subtitle}</h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section data-testid="section-impact">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold text-foreground mb-1">Conservation Impact</h2>
            <p className="text-sm text-muted-foreground">
              The collective impact of conservation organizations and their supporters.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {impactStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.35 + i * 0.05 }}
              >
                <Card data-testid={`card-stat-${i}`}>
                  <CardContent className="p-4 text-center">
                    <stat.icon className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                    <div className="text-xl font-bold text-foreground" data-testid={`text-stat-value-${i}`}>
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section data-testid="section-get-involved">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold text-foreground mb-1">Get Involved</h2>
            <p className="text-sm text-muted-foreground">
              Find ways to contribute to conservation efforts in your community and beyond.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
            >
              <Card className="h-full" data-testid="card-volunteer">
                <CardHeader>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
                      <Users className="w-5 h-5 text-amber-500" />
                    </div>
                    <CardTitle className="text-base">Volunteer Opportunities</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Join local conservation projects like trail maintenance, habitat restoration, stream cleanups, and wildlife monitoring. Most organizations welcome volunteers year-round and provide training.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-emerald-500/15 text-emerald-500">Trail Work</Badge>
                    <Badge className="bg-emerald-500/15 text-emerald-500">Habitat Restoration</Badge>
                    <Badge className="bg-emerald-500/15 text-emerald-500">Wildlife Surveys</Badge>
                    <Badge className="bg-emerald-500/15 text-emerald-500">Stream Cleanups</Badge>
                    <Badge className="bg-emerald-500/15 text-emerald-500">Tree Planting</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card className="h-full" data-testid="card-impact-tracking">
                <CardHeader>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-emerald-500" />
                    </div>
                    <CardTitle className="text-base">Impact Tracking</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Track your conservation contributions over time. Log volunteer hours, donations, and habitat improvements. See your collective impact alongside the Verdara community.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
                      <div className="text-lg font-bold text-emerald-500">0</div>
                      <div className="text-[10px] text-muted-foreground">Hours Logged</div>
                    </div>
                    <div className="rounded-lg bg-amber-500/10 p-3 text-center">
                      <div className="text-lg font-bold text-amber-500">0</div>
                      <div className="text-[10px] text-muted-foreground">Projects Joined</div>
                    </div>
                    <div className="rounded-lg bg-slate-500/10 p-3 text-center">
                      <div className="text-lg font-bold text-slate-400">0</div>
                      <div className="text-[10px] text-muted-foreground">Trees Planted</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
