import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Image, RotateCw, Crop, Share2, Bookmark, ChevronDown, ChevronRight, Loader2, TreePine, Fish, Leaf, ArrowLeft, Home, AlertCircle, LogIn, Award, Shield, Crown, Mic, MicOff, Square, Play, Pause, Volume2, Radio } from "lucide-react";
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
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionBanner, FeatureInfoBubble } from "@/components/subscription-banner";

type ViewState = "upload" | "analyzing" | "results";
type IdentifyMode = "photo" | "sound";

interface IdentifyResult {
  commonName: string;
  scientificName: string;
  confidence: number;
  category: string;
  description: string;
  habitat: string;
  conservationStatus: string;
  funFact: string;
  soundDescription?: string;
}

function AudioWaveform({ analyser, isRecording }: { analyser: AnalyserNode | null; isRecording: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!analyser || !canvasRef.current || !isRecording) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#10b981";
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();

    return () => cancelAnimationFrame(animRef.current);
  }, [analyser, isRecording]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={100}
      className="w-full h-[100px] rounded-xl"
      data-testid="canvas-audio-waveform"
    />
  );
}

export default function Identify() {
  const [identifyMode, setIdentifyMode] = useState<IdentifyMode>("photo");
  const [view, setView] = useState<ViewState>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stampResult, setStampResult] = useState<{ id: string; timestamp: string } | null>(null);
  const [vaultSaved, setVaultSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { user, isLoading: authLoading } = useAuth();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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

  const vaultSaveMutation = useMutation({
    mutationFn: async () => {
      if (!imagePreview || !result) throw new Error("No image to save");
      const blob = await (await fetch(imagePreview)).blob();
      const contentType = blob.type || "image/jpeg";
      const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
      const fileName = `${result.commonName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.${ext}`;
      const uploadRes = await apiRequest("POST", "/api/trustvault/media/upload", {
        name: fileName,
        contentType,
        size: blob.size,
      });
      const { uploadURL, objectPath } = await uploadRes.json();
      await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": contentType }, body: blob });
      const confirmRes = await apiRequest("POST", "/api/trustvault/media/confirm", {
        title: `${result.commonName} (${result.scientificName})`,
        url: objectPath,
        filename: fileName,
        contentType,
        size: blob.size,
        tags: ["verdara", "species-id", result.category, result.commonName.toLowerCase()],
        description: `AI-identified ${result.category}: ${result.commonName}. Confidence: ${result.confidence}%. Habitat: ${result.habitat}`,
      });
      return confirmRes.json();
    },
    onSuccess: () => {
      setVaultSaved(true);
    },
  });

  const audioIdentifyMutation = useMutation({
    mutationFn: async ({ audioBase64, mimeType }: { audioBase64: string; mimeType: string }) => {
      const res = await apiRequest("POST", "/api/identify/audio", { audioBase64, mimeType });
      return res.json() as Promise<IdentifyResult>;
    },
    onSuccess: (data) => {
      setResult(data);
      setError(null);
      setView("results");
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to identify species from audio. Please try again.");
      setView("upload");
    },
  });

  const { toast } = useToast();
  const [, navigate] = useLocation();

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setError("Audio recording is not supported in this browser. Please try Chrome, Firefox, or Safari.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      setAnalyserNode(analyser);

      let chosenMime = "";
      for (const mime of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"]) {
        if (MediaRecorder.isTypeSupported(mime)) { chosenMime = mime; break; }
      }

      const recorderOptions: MediaRecorderOptions = chosenMime ? { mimeType: chosenMime } : {};
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      const actualMime = mediaRecorder.mimeType || chosenMime || "audio/webm";
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: actualMime });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setAnalyserNode(null);
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingTime(0);
      setAudioBlob(null);
      setAudioUrl(null);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setError("Microphone access denied. Please allow microphone permissions to record sounds.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const cleanupAllAudio = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    setAnalyserNode(null);
    setIsRecording(false);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      cleanupAllAudio();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  const submitAudioForIdentification = useCallback(() => {
    if (!audioBlob) return;
    if (!user) {
      toast({
        title: "Sign in to identify",
        description: "Create a free account to use AI species identification. Free tier includes 3 IDs per month.",
      });
      navigate("/auth");
      return;
    }
    setView("analyzing");
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      audioIdentifyMutation.mutate({ audioBase64: base64, mimeType: audioBlob.type });
    };
    reader.readAsDataURL(audioBlob);
  }, [audioBlob, user, toast, navigate, audioIdentifyMutation]);

  const togglePlayback = useCallback(() => {
    if (!audioUrl) return;
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl, isPlaying]);

  const resetAudio = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordingTime(0);
  }, [audioUrl]);

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

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
      if (!user) {
        setView("upload");
        toast({
          title: "Sign in to identify",
          description: "Create a free account to use AI species identification. Free tier includes 3 IDs per month.",
        });
        navigate("/auth");
        return;
      }
      setView("analyzing");
      identifyMutation.mutate(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [identifyMutation, user, toast, navigate]);

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
    setVaultSaved(false);
    cleanupAllAudio();
    resetAudio();
  };


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
        <p className="text-muted-foreground text-sm mb-6">
          {identifyMode === "photo"
            ? "Upload a photo to identify trees, plants, fish, or wildlife instantly"
            : "Record animal sounds — bird calls, frog croaks, insect buzzes — and let AI identify them"}
        </p>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-card border border-card-border mb-8 w-fit" data-testid="mode-toggle">
          <Button
            variant={identifyMode === "photo" ? "default" : "ghost"}
            size="sm"
            className={cn("gap-2 rounded-lg", identifyMode === "photo" && "bg-emerald-500 text-white")}
            onClick={() => { setIdentifyMode("photo"); if (view === "upload") resetToUpload(); }}
            data-testid="button-mode-photo"
          >
            <Camera className="w-4 h-4" /> Photo
          </Button>
          <Button
            variant={identifyMode === "sound" ? "default" : "ghost"}
            size="sm"
            className={cn("gap-2 rounded-lg", identifyMode === "sound" && "bg-emerald-500 text-white")}
            onClick={() => { setIdentifyMode("sound"); if (view === "upload") resetToUpload(); }}
            data-testid="button-mode-sound"
          >
            <Mic className="w-4 h-4" /> Sound
          </Button>
        </div>
      </motion.div>

      {!user && view === "upload" && (
        <FeatureInfoBubble
          title="AI Species Identification"
          description="Free accounts get 3 identifications per month. Upgrade to Outdoor Explorer ($19.99/yr) for unlimited identifications."
          tier="Free: 3/month"
          className="mb-6"
        />
      )}

      <AnimatePresence mode="wait">
        {view === "upload" && identifyMode === "photo" && (
          <motion.div
            key="upload-photo"
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

        {view === "upload" && identifyMode === "sound" && (
          <motion.div
            key="upload-sound"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {error && (
              <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3" data-testid="error-message-audio">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-500">{error}</p>
                </div>
              </div>
            )}

            <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-8 md:p-14 text-center" data-testid="audio-record-zone">
              {!isRecording && !audioBlob && (
                <>
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                    <Mic className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Record a Sound</h3>
                  <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                    Tap the button below to start recording. Hold your device near the animal sound — bird calls, frog croaks, insect buzzes all work great.
                  </p>
                  <Button
                    onClick={startRecording}
                    className="bg-emerald-500 text-white gap-2 text-base px-8 py-5"
                    data-testid="button-start-recording"
                  >
                    <Mic className="w-5 h-5" /> Start Recording
                  </Button>
                </>
              )}

              {isRecording && (
                <>
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                    <div className="relative w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center">
                      <Radio className="w-10 h-10 text-red-500 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Recording...</h3>
                  <p className="text-2xl font-mono font-bold text-emerald-500 mb-4" data-testid="text-recording-time">
                    {formatRecordingTime(recordingTime)}
                  </p>
                  <div className="max-w-sm mx-auto mb-6 rounded-xl overflow-hidden bg-black/20 border border-white/5 p-2">
                    <AudioWaveform analyser={analyserNode} isRecording={isRecording} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-6">Hold your device near the sound source for best results</p>
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    className="gap-2 text-base px-8 py-5"
                    data-testid="button-stop-recording"
                  >
                    <Square className="w-4 h-4" /> Stop Recording
                  </Button>
                </>
              )}

              {!isRecording && audioBlob && (
                <>
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                    <Volume2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Recording Complete</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {formatRecordingTime(recordingTime)} captured
                  </p>

                  <div className="flex items-center justify-center gap-3 mb-6">
                    <Button
                      onClick={togglePlayback}
                      variant="outline"
                      className="gap-2"
                      data-testid="button-playback-audio"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isPlaying ? "Pause" : "Play Back"}
                    </Button>
                    <Button
                      onClick={resetAudio}
                      variant="outline"
                      className="gap-2"
                      data-testid="button-rerecord"
                    >
                      <RotateCw className="w-4 h-4" /> Re-record
                    </Button>
                  </div>

                  <Button
                    onClick={submitAudioForIdentification}
                    className="bg-emerald-500 text-white gap-2 text-base px-8 py-5"
                    data-testid="button-identify-audio"
                  >
                    <Mic className="w-5 h-5" /> Identify This Sound
                  </Button>
                </>
              )}
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: "Bird Calls", desc: "Songs, chirps, trills, and alarm calls", icon: Leaf },
                { title: "Frogs & Insects", desc: "Croaks, chirps, buzzes, and clicks", icon: Volume2 },
                { title: "Mammals", desc: "Howls, barks, growls, and vocalizations", icon: Radio },
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
            {identifyMode === "photo" ? (
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
            ) : (
              <div className="relative w-48 h-48 mx-auto mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
                <div className="relative flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 backdrop-blur-md flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  </div>
                  <Volume2 className="w-6 h-6 text-emerald-400/60" />
                </div>
              </div>
            )}
            <h3 className="text-xl font-bold text-foreground mb-2">
              {identifyMode === "photo" ? "Analyzing your image..." : "Analyzing your recording..."}
            </h3>
            <p className="text-sm text-muted-foreground mb-8">
              {identifyMode === "photo" ? "Our AI is identifying the species" : "Our AI is analyzing the sound patterns"}
            </p>
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
              {identifyMode === "photo" ? (
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
                    <Button size="icon" variant="ghost" className="bg-black/30 backdrop-blur-md text-white" data-testid="button-rotate-image">
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="bg-black/30 backdrop-blur-md text-white" data-testid="button-crop-image">
                      <Crop className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-gradient-to-br from-emerald-900/30 to-emerald-800/10 border border-emerald-500/20 p-8 flex flex-col items-center justify-center min-h-[250px]" data-testid="audio-result-panel">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/15 flex items-center justify-center mb-6">
                    <Volume2 className="w-12 h-12 text-emerald-400" />
                  </div>
                  <Badge className="bg-emerald-500/15 text-emerald-400 mb-4">
                    <Mic className="w-3 h-3 mr-1" /> Sound Identification
                  </Badge>
                  {audioUrl && (
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={togglePlayback}
                        variant="outline"
                        className="gap-2 border-emerald-500/30"
                        data-testid="button-playback-result"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {isPlaying ? "Pause" : "Play Recording"}
                      </Button>
                    </div>
                  )}
                  {result.soundDescription && (
                    <p className="text-sm text-muted-foreground mt-4 text-center max-w-xs italic" data-testid="text-sound-description">
                      "{result.soundDescription}"
                    </p>
                  )}
                </div>
              )}

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
                    {result.soundDescription && (
                      <AccordionItem value="sound">
                        <AccordionTrigger className="text-sm font-medium" data-testid="trigger-sound-description">
                          <span className="flex items-center gap-2"><Volume2 className="w-3.5 h-3.5 text-emerald-500" /> What It Sounds Like</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed" data-testid="text-sound-accordion">
                            <p>{result.soundDescription}</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
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

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-card-border">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">Save to TrustVault</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Store this photo in your secure media vault</p>
                      </div>
                      {vaultSaved ? (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30" variant="outline">
                          <Shield className="w-3 h-3 mr-1" /> Saved
                        </Badge>
                      ) : (
                        <Button
                          onClick={() => vaultSaveMutation.mutate()}
                          disabled={vaultSaveMutation.isPending}
                          className="bg-purple-600 text-white gap-2 flex-shrink-0"
                          data-testid="button-save-trustvault"
                        >
                          {vaultSaveMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                          {vaultSaveMutation.isPending ? "Saving..." : "Save to Vault"}
                        </Button>
                      )}
                    </div>
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
