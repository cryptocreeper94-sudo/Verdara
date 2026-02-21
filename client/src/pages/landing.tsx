import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  TreePine, ScanSearch, Mountain, Tent, Fish, Target, MapPinned,
  Zap, Snowflake, Waves, Bike, Axe, ShoppingBag, Anchor, ShieldAlert,
  Heart, DollarSign, Compass, ChevronRight, Star, Shield, ArrowRight,
  Leaf, Lock, Navigation, Flame, Eye, Users, Globe, Award,
  Shell, Sun, Droplets, Wheat, Sprout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import heroVideo1 from "../assets/videos/hero-flyover-1.mp4";
import heroVideo2 from "../assets/videos/hero-flyover-2.mp4";
import heroVideo3 from "../assets/videos/hero-flyover-3.mp4";
import heroVideo4 from "../assets/videos/hero-flyover-4.mp4";
import heroVideo5 from "../assets/videos/hero-flyover-5.mp4";
import heroVideo6 from "../assets/videos/hero-flyover-6.mp4";

const HERO_VIDEOS = [
  { src: heroVideo1, label: "Mountain Vista" },
  { src: heroVideo2, label: "Forest Canopy" },
  { src: heroVideo3, label: "River Valley" },
  { src: heroVideo4, label: "Sunset Ridge" },
  { src: heroVideo5, label: "Alpine Meadow" },
  { src: heroVideo6, label: "Wilderness Trail" },
];

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function AnimatedCounter({ target, label, suffix = "" }: { target: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 2000;
          const step = (ts: number) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
            if (p < 1) requestAnimationFrame(step);
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
      <div className="text-3xl md:text-4xl font-bold text-emerald-400">{count.toLocaleString()}{suffix}</div>
      <div className="text-xs md:text-sm text-white/60 mt-1">{label}</div>
    </div>
  );
}

const showcaseFeatures = [
  {
    icon: ScanSearch,
    title: "AI Species Identification",
    desc: "Point your camera at any tree, plant, fish, or wildlife. Get instant identification powered by AI with confidence scores and detailed species info.",
    image: "/images/landing-identify.jpg",
  },
  {
    icon: Mountain,
    title: "Trail Discovery & GPS Tracking",
    desc: "Discover trails, track your hikes in real-time, and explore our nationwide catalog of 170+ verified outdoor locations across 41 states.",
    image: "/images/landing-trails.jpg",
  },
  {
    icon: MapPinned,
    title: "Trip Planning & Booking",
    desc: "Build multi-day itineraries, manage gear checklists, check weather forecasts, and book campgrounds all in one place.",
    image: "/images/cat-tripplan.jpg",
  },
  {
    icon: ShoppingBag,
    title: "Wood Economy Marketplace",
    desc: "Buy and sell lumber with blockchain-verified trust scores, escrow protection, and vendor verification through TrustShield.",
    image: "/images/cat-woodmarket.jpg",
  },
];

const activityHighlights = [
  { icon: Mountain, label: "Hiking", image: "/images/cat-hiking.jpg" },
  { icon: Bike, label: "Mountain Biking", image: "/images/cat-mtb.jpg" },
  { icon: Fish, label: "Fishing", image: "/images/cat-fishing.jpg" },
  { icon: Target, label: "Hunting", image: "/images/cat-hunting.jpg" },
  { icon: Tent, label: "Camping", image: "/images/cat-camping.jpg" },
  { icon: Snowflake, label: "Winter Sports", image: "/images/cat-winter.jpg" },
  { icon: Waves, label: "Water Sports", image: "/images/cat-watersports.jpg" },
  { icon: Zap, label: "E-Mobility", image: "/images/cat-emobility.jpg" },
  { icon: Axe, label: "Arborist Pro", image: "/images/cat-arborist.jpg" },
  { icon: Anchor, label: "Charters", image: "/images/cat-charters.jpg" },
  { icon: Shell, label: "Coastal & Beach", image: "/images/cat-coastal.jpg" },
  { icon: Sun, label: "Desert & Canyon", image: "/images/cat-desert.jpg" },
  { icon: Droplets, label: "Wetlands", image: "/images/cat-wetlands.jpg" },
  { icon: Mountain, label: "Caves", image: "/images/cat-caves.jpg" },
  { icon: Wheat, label: "Prairie", image: "/images/cat-prairie.jpg" },
  { icon: Sprout, label: "Wild Edibles", image: "/images/cat-foraging.jpg" },
  { icon: ShieldAlert, label: "Survival", image: "/images/cat-survival.jpg" },
  { icon: Heart, label: "Conservation", image: "/images/cat-conservation.jpg" },
];

interface LandingProps {
  onGetStarted: () => void;
  onBrowse?: () => void;
}

export default function Landing({ onGetStarted, onBrowse }: LandingProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [nextVideoIndex, setNextVideoIndex] = useState(1);
  const [isVideoTransitioning, setIsVideoTransitioning] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const currentVideoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    document.title = "Verdara - Your Complete Outdoor Recreation Platform | DarkWave Studios";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Verdara is the ultimate outdoor recreation super-app. Identify species, discover trails, plan trips, and shop a blockchain-verified marketplace across 24 activity categories.");
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = "Verdara is the ultimate outdoor recreation super-app. Identify species, discover trails, plan trips, and shop a blockchain-verified marketplace across 24 activity categories.";
      document.head.appendChild(newMeta);
    }
    return () => {
      document.title = "Verdara";
    };
  }, []);

  useEffect(() => {
    const handleVideoEnd = () => {
      setIsVideoTransitioning(true);
      setTimeout(() => {
        setCurrentVideoIndex(nextVideoIndex);
        setNextVideoIndex((nextVideoIndex + 1) % HERO_VIDEOS.length);
        setIsVideoTransitioning(false);
      }, 400);
    };
    const video = currentVideoRef.current;
    if (video) {
      video.addEventListener('ended', handleVideoEnd);
      return () => video.removeEventListener('ended', handleVideoEnd);
    }
  }, [nextVideoIndex, videoMuted]);

  useEffect(() => {
    if (nextVideoRef.current) {
      nextVideoRef.current.load();
    }
  }, [nextVideoIndex]);

  useEffect(() => {
    if (currentVideoRef.current && !isVideoTransitioning) {
      const video = currentVideoRef.current;
      video.volume = 0;
      video.play().catch(() => {});
    }
  }, [currentVideoIndex, isVideoTransitioning, videoMuted]);

  return (
    <div className="min-h-screen bg-slate-950 dark" data-testid="page-landing">
      <nav className="fixed top-0 left-0 right-0 z-50 px-5 md:px-10 py-4 bg-black/20 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Verdara</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-white/80 text-sm"
              onClick={onGetStarted}
              data-testid="button-landing-login"
            >
              Log In
            </Button>
            <Button
              className="bg-emerald-500 text-white text-sm gap-2"
              onClick={onGetStarted}
              data-testid="button-landing-signup"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <section ref={heroRef} className="relative h-screen overflow-hidden" data-testid="landing-hero">
        <div className="absolute inset-0 bg-black">
          <video
            ref={currentVideoRef}
            key={`current-${currentVideoIndex}`}
            autoPlay
            muted={videoMuted}
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isVideoTransitioning ? 'opacity-0' : 'opacity-100'}`}
          >
            <source src={HERO_VIDEOS[currentVideoIndex].src} type="video/mp4" />
          </video>

          <video
            ref={nextVideoRef}
            key={`next-${nextVideoIndex}`}
            muted={videoMuted}
            playsInline
            preload="auto"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isVideoTransitioning ? 'opacity-100' : 'opacity-0'}`}
          >
            <source src={HERO_VIDEOS[nextVideoIndex].src} type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {HERO_VIDEOS.map((v, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (idx !== currentVideoIndex) {
                  setNextVideoIndex(idx);
                  setIsVideoTransitioning(true);
                  setTimeout(() => {
                    setCurrentVideoIndex(idx);
                    setNextVideoIndex((idx + 1) % HERO_VIDEOS.length);
                    setIsVideoTransitioning(false);
                  }, 700);
                }
              }}
              className={currentVideoIndex === idx
                ? 'w-8 h-2 bg-white rounded-full transition-all duration-300'
                : 'w-2 h-2 bg-white/40 rounded-full hover:bg-white/60 transition-all duration-300'}
              data-testid={`dot-hero-${idx}`}
            />
          ))}
        </div>

        <motion.div
          className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Badge className="bg-emerald-500/20 text-emerald-400 mb-6">
              <Leaf className="w-3 h-3 mr-1.5" /> DarkWave Studios
            </Badge>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-6">
              Verdara
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-white/80 max-w-2xl mx-auto mb-4 leading-relaxed">
              Your Complete Outdoor Recreation Platform
            </p>
            <p className="text-sm md:text-base text-white/60 max-w-xl mx-auto mb-10">
              Identify species. Discover trails. Plan trips. Track adventures. All in one place.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Button
              className="bg-emerald-500 text-white gap-2 text-base px-8"
              onClick={onGetStarted}
              data-testid="button-hero-get-started"
            >
              Start Your Adventure <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="text-white border-white/30 backdrop-blur-sm bg-white/5 gap-2 text-base px-8"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              data-testid="button-hero-learn-more"
            >
              <Compass className="w-5 h-5" /> Explore Features
            </Button>
          </motion.div>

          {onBrowse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mt-6"
            >
              <Button
                variant="link"
                onClick={onBrowse}
                className="text-sm text-white/50 underline underline-offset-4 decoration-white/20"
                data-testid="button-hero-browse"
              >
                or browse the app first
              </Button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex items-center justify-center gap-8 sm:gap-14 mt-16"
          >
            <AnimatedCounter target={138} label="Features" />
            <AnimatedCounter target={18} label="Categories" />
            <AnimatedCounter target={125} label="Locations" suffix="+" />
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronRight className="w-6 h-6 text-white/40 rotate-90" />
        </motion.div>
      </section>

      <section id="features" className="py-20 md:py-28 px-5 md:px-10 bg-slate-950" data-testid="landing-features">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="bg-emerald-500/20 text-emerald-400 mb-4">Core Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need Outdoors
            </h2>
            <p className="text-white/60 max-w-lg mx-auto">
              From AI-powered species identification to blockchain-verified marketplace transactions.
            </p>
          </motion.div>

          <div className="space-y-20">
            {showcaseFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className={`flex flex-col ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-8 md:gap-12 items-center`}
              >
                <div className="flex-1 relative rounded-2xl overflow-hidden group">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-64 md:h-80 object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/30 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <feature.icon className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed text-base">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-5 md:px-10 bg-slate-900/50" data-testid="landing-activities">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <Badge className="bg-amber-500/20 text-amber-400 mb-4">18 Activity Categories</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your Outdoor World
            </h2>
            <p className="text-white/60 max-w-lg mx-auto">
              From hiking and fishing to arborist tools and survival training. Every outdoor pursuit, one platform.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {activityHighlights.map((act, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="relative rounded-2xl overflow-hidden group cursor-pointer aspect-[3/4]"
                data-testid={`card-landing-activity-${i}`}
              >
                <img
                  src={act.image}
                  alt={act.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <act.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-white text-xs font-semibold">{act.label}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-5 md:px-10 bg-slate-950" data-testid="landing-ecosystem">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <Badge className="bg-slate-500/20 text-slate-400 mb-4">Trust Layer Ecosystem</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Built on Blockchain Trust
            </h2>
            <p className="text-white/60 max-w-lg mx-auto">
              Part of the DarkWave Trust Layer ecosystem. 27+ interconnected apps with verified identity, blockchain security, and Signal wallet integration.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: "TrustShield Verified", desc: "Every marketplace transaction backed by blockchain-verified trust scores and 4-tier vendor verification." },
              { icon: Award, title: "DW-STAMP Certified", desc: "Earn blockchain-certified stamps for trail completions, species identifications, and professional certifications." },
              { icon: Lock, title: "Ecosystem SSO", desc: "One account across 27+ apps. Your identity is portable, verified, and secure across the entire ecosystem." },
              { icon: Globe, title: "Signal Wallet", desc: "Native Signal (SIG) cryptocurrency for marketplace transactions alongside traditional payment methods." },
              { icon: Zap, title: "GarageBot Integration", desc: "Track maintenance on motorized equipment - chainsaws, ATVs, e-bikes, boats - all connected through the ecosystem." },
              { icon: Eye, title: "Guardian Security", desc: "AI-powered security monitoring across the ecosystem. Your data and transactions are protected by Guardian." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6"
                data-testid={`card-landing-ecosystem-${i}`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-5 md:px-10 bg-slate-950" data-testid="landing-cta">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <img src="/images/hero-landscape.jpg" alt="Join Verdara" className="w-full h-72 md:h-96 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
            <div className="absolute inset-0 flex items-center justify-center text-center px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Your Adventure Starts Here
                </h2>
                <p className="text-white/70 max-w-lg mx-auto mb-8">
                  Join Verdara and unlock 184 features across 24 outdoor recreation categories. Free to get started.
                </p>
                <Button
                  className="bg-emerald-500 text-white gap-2 text-base px-10"
                  onClick={onGetStarted}
                  data-testid="button-cta-get-started"
                >
                  Create Free Account <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 px-5 md:px-10" data-testid="landing-footer">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <TreePine className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Verdara</span>
            <span className="text-xs text-white/50">by DarkWave Studios</span>
          </div>
          <div className="text-xs text-white/50">
            Part of the DarkWave Trust Layer Ecosystem
          </div>
        </div>
      </footer>
    </div>
  );
}
