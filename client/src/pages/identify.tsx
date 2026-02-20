import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Image, RotateCw, Crop, Share2, Bookmark, ChevronDown, ChevronRight, Loader2, TreePine, Fish, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { similarSpecies } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type ViewState = "upload" | "analyzing" | "results";

export default function Identify() {
  const [view, setView] = useState<ViewState>("upload");
  const [dragOver, setDragOver] = useState(false);

  const startAnalysis = () => {
    setView("analyzing");
    setTimeout(() => setView("results"), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">AI Species Identification</h1>
        <p className="text-muted-foreground text-sm mb-8">Upload a photo to identify trees, plants, fish, or wildlife instantly</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {view === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); startAnalysis(); }}
              className={cn(
                "border-2 border-dashed rounded-2xl p-12 md:p-16 text-center transition-all duration-300",
                dragOver
                  ? "border-emerald-500 bg-emerald-500/5"
                  : "border-border hover:border-emerald-500/50 hover:bg-card"
              )}
              data-testid="upload-zone"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Drop your photo here</h3>
              <p className="text-sm text-muted-foreground mb-6">or use the options below to capture or select an image</p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button onClick={startAnalysis} className="bg-emerald-500 text-white gap-2" data-testid="button-upload-file">
                  <Image className="w-4 h-4" /> Choose File
                </Button>
                <Button onClick={startAnalysis} variant="outline" className="gap-2" data-testid="button-take-photo">
                  <Camera className="w-4 h-4" /> Take Photo
                </Button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Trees & Plants", desc: "Bark, leaves, flowers, and overall form", icon: TreePine },
                { title: "Fish & Marine", desc: "Freshwater and saltwater species", icon: Fish },
                { title: "Wildlife", desc: "Mammals, birds, reptiles, amphibians", icon: Leaf },
              ].map((item, i) => (
                <div key={i} className="rounded-xl bg-card border border-card-border p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                    <item.icon className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {view === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-16"
          >
            <div className="relative w-48 h-48 mx-auto mb-8 rounded-2xl overflow-hidden">
              <img src="/images/species-pine.jpg" alt="Analyzing" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-emerald-500/20 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Analyzing your image...</h3>
            <p className="text-sm text-muted-foreground mb-6">Our AI is identifying the species</p>
            <div className="max-w-xs mx-auto">
              <Progress value={66} className="h-2" />
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>Processing</span>
                <span>66%</span>
              </div>
            </div>
          </motion.div>
        )}

        {view === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="/images/species-pine.jpg"
                  alt="Eastern White Pine"
                  className="w-full h-64 md:h-full object-cover"
                  data-testid="img-identified-species"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Button size="icon" variant="ghost" className="bg-black/30 backdrop-blur-md text-white hover:bg-black/50">
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="bg-black/30 backdrop-blur-md text-white hover:bg-black/50">
                    <Crop className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <div className="rounded-2xl bg-card border border-card-border p-5" data-testid="card-species-result">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Eastern White Pine</h2>
                      <p className="text-sm text-muted-foreground italic">Pinus strobus</p>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-500">Tree</Badge>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Confidence Score</span>
                      <span className="text-sm font-bold text-emerald-500">94%</span>
                    </div>
                    <div className="relative">
                      <Progress value={94} className="h-3" />
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="characteristics">
                      <AccordionTrigger className="text-sm font-medium">Characteristics</AccordionTrigger>
                      <AccordionContent>
                        <div className="text-sm text-muted-foreground space-y-2">
                          <p>The Eastern White Pine is the tallest tree in eastern North America, reaching heights of 150-200 feet. It features soft, blue-green needles in bundles of 5, each 2-5 inches long.</p>
                          <p>The bark is smooth and green-gray on young trees, becoming thick, dark, and deeply furrowed with age.</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="habitat">
                      <AccordionTrigger className="text-sm font-medium">Habitat & Range</AccordionTrigger>
                      <AccordionContent>
                        <div className="text-sm text-muted-foreground space-y-2">
                          <p>Found throughout eastern North America from Newfoundland to Georgia, west to Minnesota and Iowa. Thrives in well-drained soils at elevations up to 5,000 feet.</p>
                          <p>Prefers moist, sandy soils but adapts to various conditions. Common in mixed hardwood-conifer forests.</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="uses">
                      <AccordionTrigger className="text-sm font-medium">Uses & Significance</AccordionTrigger>
                      <AccordionContent>
                        <div className="text-sm text-muted-foreground space-y-2">
                          <p>Historically prized for ship masts during colonial era. Today valued for lumber, pulpwood, and ornamental plantings. The inner bark was used as food by Indigenous peoples.</p>
                          <p>State tree of Maine and Michigan. Important wildlife habitat providing cover and food for numerous bird and mammal species.</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border">
                    <Button className="flex-1 bg-emerald-500 text-white gap-2" data-testid="button-save-collection">
                      <Bookmark className="w-4 h-4" /> Save to Collection
                    </Button>
                    <Button variant="outline" size="icon" data-testid="button-share-result">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Similar Species</h3>
              <div
                className="flex gap-3 overflow-x-auto pb-4"
                style={{ scrollbarWidth: "none" }}
              >
                {similarSpecies.map((sp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="min-w-[140px] flex-shrink-0 cursor-pointer group"
                    data-testid={`card-similar-species-${i}`}
                  >
                    <div className="rounded-xl overflow-hidden border border-card-border bg-card">
                      <div className="relative h-24">
                        <img src={sp.image} alt={sp.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-foreground truncate">{sp.name}</p>
                        <p className="text-[10px] text-muted-foreground italic truncate">{sp.scientific}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button variant="outline" onClick={() => setView("upload")} className="gap-2" data-testid="button-identify-another">
                <Camera className="w-4 h-4" /> Identify Another
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
