import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Image, RotateCw, Crop, Share2, Bookmark, ChevronDown, ChevronRight, Loader2, TreePine, Fish, Leaf, ArrowLeft, Home, AlertCircle, LogIn, Award, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { similarSpecies } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

type ViewState = "upload" | "analyzing" | "results";

interface IdentifyResult {
  commonName: string;
  scientificName: string;
  confidence: number;
  category: string;
  description: string;
  habitat: string;
  conservationStatus: string;
  funFact: string;
}

export default function Identify() {
  const [view, setView] = useState<ViewState>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stampResult, setStampResult] = useState<{ id: string; timestamp: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { user, isLoading: authLoading } = useAuth();

  const identifyMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      const res = await apiRequest("POST", "/api/identify", { imageBase64 });
      return res.json() as Promise<IdentifyResult>;
    },
    onSuccess: (data) => {
      setResult(data);
      setError(null);
      setView("results");
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to identify species. Please try again.");
      setView("upload");
    },
  });

  const stampMutation = useMutation({
    mutationFn: async (identifyData: IdentifyResult) => {
      const res = await apiRequest("POST", "/api/ecosystem/stamp", {
        data: identifyData.commonName + " - " + identifyData.scientificName,
        category: "species_identification",
        metadata: {
          commonName: identifyData.commonName,
          scientificName: identifyData.scientificName,
          confidence: identifyData.confidence,
          category: identifyData.category,
          habitat: identifyData.habitat,
          conservationStatus: identifyData.conservationStatus,
        },
        chains: ["darkwave"],
      });
      return res.json() as Promise<{ id: string; timestamp: string }>;
    },
    onSuccess: (data) => {
      setStampResult(data);
    },
  });

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setView("analyzing");
      identifyMutation.mutate(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [identifyMutation]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const resetToUpload = () => {
    setView("upload");
    setImagePreview(null);
    setResult(null);
    setError(null);
    setStampResult(null);
  };

  if (!authLoading && !user) {
    return (
      <div className="max-w-4xl mx-auto px-5 md:px-10 py-8 md:py-12">
        <div className="lg:hidden flex items-center gap-2 mb-6">
          <Link href="/explore">
            <Button size="icon" variant="ghost" data-testid="button-back-identify">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/">
            <Button size="icon" variant="ghost" data-testid="button-home-identify">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">AI Species Identification</h1>
          <p className="text-muted-foreground text-sm mb-10">Upload a photo to identify trees, plants, fish, or wildlife instantly</p>
        </motion.div>
        <div className="rounded-2xl bg-card border border-card-border p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Sign in to Identify Species</h3>
          <p className="text-sm text-muted-foreground mb-6">You need to be logged in to use the AI species identification feature.</p>
          <Link href="/auth">
            <Button className="bg-emerald-500 text-white gap-2" data-testid="button-login-prompt">
              <LogIn className="w-4 h-4" /> Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-10 py-8 md:py-12">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        data-testid="input-file-upload"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        data-testid="input-camera-capture"
      />

      <div className="lg:hidden flex items-center gap-2 mb-6">
        <Link href="/explore">
          <Button size="icon" variant="ghost" data-testid="button-back-identify">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <Link href="/">
          <Button size="icon" variant="ghost" data-testid="button-home-identify">
            <Home className="w-5 h-5" />
          </Button>
        </Link>
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">AI Species Identification</h1>
        <p className="text-muted-foreground text-sm mb-10">Upload a photo to identify trees, plants, fish, or wildlife instantly</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {view === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {error && (
              <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3" data-testid="error-message">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-500">{error}</p>
                </div>
              </div>
            )}

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-2xl p-14 md:p-20 text-center transition-all duration-300",
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
              <p className="text-sm text-muted-foreground mb-8">or use the options below to capture or select an image</p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button onClick={() => fileInputRef.current?.click()} className="bg-emerald-500 text-white gap-2" data-testid="button-upload-file">
                  <Image className="w-4 h-4" /> Choose File
                </Button>
                <Button onClick={() => cameraInputRef.current?.click()} variant="outline" className="gap-2" data-testid="button-take-photo">
                  <Camera className="w-4 h-4" /> Take Photo
                </Button>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: "Trees & Plants", desc: "Bark, leaves, flowers, and overall form", icon: TreePine },
                { title: "Fish & Marine", desc: "Freshwater and saltwater species", icon: Fish },
                { title: "Wildlife", desc: "Mammals, birds, reptiles, amphibians", icon: Leaf },
              ].map((item, i) => (
                <div key={i} className="rounded-xl bg-card border border-card-border p-5 text-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1.5">{item.desc}</p>
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
            className="text-center py-20"
          >
            <div className="relative w-48 h-48 mx-auto mb-8 rounded-2xl overflow-hidden">
              {imagePreview && (
                <img src={imagePreview} alt="Analyzing" className="w-full h-full object-cover" data-testid="img-analyzing-preview" />
              )}
              <div className="absolute inset-0 bg-emerald-500/20 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Analyzing your image...</h3>
            <p className="text-sm text-muted-foreground mb-8">Our AI is identifying the species</p>
            <div className="max-w-xs mx-auto">
              <Progress value={66} className="h-2" />
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>Processing</span>
                <span>66%</span>
              </div>
            </div>
          </motion.div>
        )}

        {view === "results" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative rounded-2xl overflow-hidden">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt={result.commonName}
                    className="w-full h-64 md:h-full object-cover"
                    data-testid="img-identified-species"
                  />
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="icon" variant="ghost" className="bg-black/30 backdrop-blur-md text-white">
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="bg-black/30 backdrop-blur-md text-white">
                    <Crop className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <div className="rounded-2xl bg-card border border-card-border p-6" data-testid="card-species-result">
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      <h2 className="text-xl font-bold text-foreground" data-testid="text-common-name">{result.commonName}</h2>
                      <p className="text-sm text-muted-foreground italic mt-1" data-testid="text-scientific-name">{result.scientificName}</p>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-500" data-testid="badge-category">{result.category}</Badge>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-sm font-medium text-foreground">Confidence Score</span>
                      <span className="text-sm font-bold text-emerald-500" data-testid="text-confidence">{Math.round(result.confidence)}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={result.confidence} className="h-3" data-testid="progress-confidence" />
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="description">
                      <AccordionTrigger className="text-sm font-medium" data-testid="trigger-description">Description</AccordionTrigger>
                      <AccordionContent>
                        <div className="text-sm text-muted-foreground space-y-3 leading-relaxed" data-testid="text-description">
                          <p>{result.description}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="habitat">
                      <AccordionTrigger className="text-sm font-medium" data-testid="trigger-habitat">Habitat & Range</AccordionTrigger>
                      <AccordionContent>
                        <div className="text-sm text-muted-foreground space-y-3 leading-relaxed" data-testid="text-habitat">
                          <p>{result.habitat}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="conservation">
                      <AccordionTrigger className="text-sm font-medium" data-testid="trigger-conservation">Conservation Status</AccordionTrigger>
                      <AccordionContent>
                        <div className="text-sm text-muted-foreground space-y-3 leading-relaxed" data-testid="text-conservation">
                          <p>{result.conservationStatus}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="funfact">
                      <AccordionTrigger className="text-sm font-medium" data-testid="trigger-funfact">Fun Fact</AccordionTrigger>
                      <AccordionContent>
                        <div className="text-sm text-muted-foreground space-y-3 leading-relaxed" data-testid="text-funfact">
                          <p>{result.funFact}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="flex items-center gap-3 mt-6 pt-5 border-t border-border">
                    <Button className="flex-1 bg-emerald-500 text-white gap-2" data-testid="button-save-collection">
                      <Bookmark className="w-4 h-4" /> Save to Collection
                    </Button>
                    <Button variant="outline" size="icon" data-testid="button-share-result">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {user && (
                  <div className="mt-5 rounded-xl bg-card border border-card-border p-5" data-testid="card-blockchain-certification">
                    {stampResult ? (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <Shield className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">Blockchain Certified</span>
                            <Badge className="bg-emerald-500/15 text-emerald-500" data-testid="badge-verified">
                              <Shield className="w-3 h-3 mr-1" /> Verified
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5" data-testid="text-stamp-id">
                            Stamp ID: {stampResult.id}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5" data-testid="text-stamp-timestamp">
                            Certified: {new Date(stampResult.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <Award className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">DW-STAMP Certification</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Record this identification on the DarkWave blockchain</p>
                        </div>
                        <Button
                          onClick={() => stampMutation.mutate(result)}
                          disabled={stampMutation.isPending}
                          className="bg-emerald-500 text-white gap-2 flex-shrink-0"
                          data-testid="button-certify-blockchain"
                        >
                          {stampMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Award className="w-4 h-4" />
                          )}
                          {stampMutation.isPending ? "Certifying..." : "Certify on Blockchain"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-semibold text-foreground mb-5">Similar Species</h3>
              <div
                className="flex gap-4 overflow-x-auto pb-4"
                style={{ scrollbarWidth: "none" }}
              >
                {similarSpecies.map((sp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="min-w-[150px] flex-shrink-0 cursor-pointer group"
                    data-testid={`card-similar-species-${i}`}
                  >
                    <div className="rounded-xl overflow-hidden border border-card-border bg-card">
                      <div className="relative h-28">
                        <img src={sp.image} alt={sp.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-semibold text-foreground truncate">{sp.name}</p>
                        <p className="text-[10px] text-muted-foreground italic truncate mt-0.5">{sp.scientific}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button variant="outline" onClick={resetToUpload} className="gap-2" data-testid="button-identify-another">
                <Camera className="w-4 h-4" /> Identify Another
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
