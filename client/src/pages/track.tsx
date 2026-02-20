import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Navigation, MapPin, Mountain, Clock, TrendingUp, Zap, Thermometer, Droplets, Signal, Pause, Play, Flag, ChevronUp, ChevronDown, AlertTriangle, Share2, ShieldCheck, MapPinned, Locate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Link, useParams } from "wouter";
import { allTrails } from "@/lib/mock-data";

type PermissionState = "prompt" | "requesting" | "granted" | "denied";

function PermissionGate({ trailName, trailImage, onGranted, onSkip }: {
  trailName: string;
  trailImage: string;
  onGranted: () => void;
  onSkip: () => void;
}) {
  const [permState, setPermState] = useState<PermissionState>("prompt");

  const requestLocationPermission = useCallback(async () => {
    setPermState("requesting");
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          () => {
            setPermState("granted");
            setTimeout(onGranted, 800);
          },
          (err) => {
            if (err.code === err.PERMISSION_DENIED) {
              setPermState("denied");
            } else {
              setPermState("granted");
              setTimeout(onGranted, 800);
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setPermState("denied");
      }
    } catch {
      setPermState("denied");
    }
  }, [onGranted]);

  const permissions = [
    {
      icon: MapPinned,
      title: "Location Access",
      description: "Track your real-time position on the trail",
      required: true,
    },
    {
      icon: Locate,
      title: "Background Location",
      description: "Keep tracking even when your screen is off",
      required: false,
    },
    {
      icon: Signal,
      title: "Motion & Activity",
      description: "Detect pace, elevation changes, and activity type",
      required: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative h-48 md:h-56 overflow-hidden">
        <img src={trailImage} alt={trailName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background" />
        <div className="absolute top-4 left-4">
          <Link href="/trails">
            <Button size="icon" variant="ghost" className="bg-black/30 backdrop-blur-md text-white" data-testid="button-back-trails-perm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>
        <div className="absolute bottom-4 left-5 right-5">
          <h1 className="text-xl font-bold text-white drop-shadow-lg">{trailName}</h1>
          <p className="text-white/70 text-sm mt-1">GPS Trail Tracking</p>
        </div>
      </div>

      <div className="flex-1 px-5 md:px-10 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-card-border p-6"
          data-testid="permissions-card"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Permissions Required</h2>
              <p className="text-xs text-muted-foreground">Verdara needs access to track your hike</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {permissions.map((perm, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="flex items-start gap-4"
              >
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                  perm.required ? "bg-emerald-500/15" : "bg-muted"
                )}>
                  <perm.icon className={cn("w-4 h-4", perm.required ? "text-emerald-500" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-medium text-foreground">{perm.title}</h3>
                    {perm.required && (
                      <Badge className="bg-emerald-500/15 text-emerald-500 text-[10px]">Required</Badge>
                    )}
                    {!perm.required && (
                      <Badge variant="outline" className="text-[10px]">Optional</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{perm.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {permState === "prompt" && (
              <motion.div
                key="prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <Button
                  className="w-full bg-emerald-500 text-white gap-2"
                  onClick={requestLocationPermission}
                  data-testid="button-grant-location"
                >
                  <MapPinned className="w-4 h-4" /> Enable Location Access
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={onSkip}
                  data-testid="button-skip-permissions"
                >
                  Continue with simulated GPS
                </Button>
              </motion.div>
            )}

            {permState === "requesting" && (
              <motion.div
                key="requesting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-4 gap-3"
              >
                <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                <p className="text-sm text-muted-foreground">Waiting for permission...</p>
                <p className="text-xs text-muted-foreground">Check your browser for a location prompt</p>
              </motion.div>
            )}

            {permState === "granted" && (
              <motion.div
                key="granted"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-4 gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-emerald-500">Location access granted</p>
                <p className="text-xs text-muted-foreground">Starting GPS tracking...</p>
              </motion.div>
            )}

            {permState === "denied" && (
              <motion.div
                key="denied"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Location access denied</p>
                      <p className="text-xs text-muted-foreground">
                        You can still use GPS tracking with simulated data. To enable real tracking, allow location access in your browser settings.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={requestLocationPermission}
                    data-testid="button-retry-permission"
                  >
                    Try Again
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-500 text-white gap-2"
                    onClick={onSkip}
                    data-testid="button-continue-simulated"
                  >
                    Use Simulated GPS
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-card border border-card-border p-5"
          data-testid="privacy-info-card"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Your privacy matters</h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">&#8226;</span>
                  Location data stays on your device unless you choose to share it
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">&#8226;</span>
                  You can revoke permissions at any time in your browser settings
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">&#8226;</span>
                  GPS tracking stops immediately when you end your session
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const trailWaypoints = [
  { name: "Trailhead Parking", distFromStart: 0, elevation: 6720, type: "trailhead" as const },
  { name: "Creek Crossing", distFromStart: 0.8, elevation: 6890, type: "waypoint" as const },
  { name: "Pine Ridge Junction", distFromStart: 1.9, elevation: 7340, type: "junction" as const },
  { name: "Waterfall Overlook", distFromStart: 2.7, elevation: 7680, type: "poi" as const },
  { name: "Summit Approach", distFromStart: 3.6, elevation: 8120, type: "waypoint" as const },
  { name: "McAfee Knob Summit", distFromStart: 4.4, elevation: 8560, type: "summit" as const },
];

const elevationProfile = [
  6720, 6780, 6850, 6890, 6920, 7000, 7100, 7200, 7340, 7400,
  7500, 7580, 7680, 7750, 7820, 7900, 8000, 8120, 8250, 8400, 8560,
];

const waypointIcons: Record<string, typeof MapPin> = {
  trailhead: Flag,
  waypoint: MapPin,
  junction: Navigation,
  poi: Mountain,
  summit: TrendingUp,
};

function TrackingView({ trail }: { trail: typeof allTrails[0] }) {
  const totalDistance = 4.4;
  const [currentDistance, setCurrentDistance] = useState(1.2);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(47);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentDistance(prev => {
        const next = prev + 0.005;
        return next >= totalDistance ? totalDistance : next;
      });
      setElapsedMinutes(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const progressPercent = (currentDistance / totalDistance) * 100;
  const distanceToEnd = totalDistance - currentDistance;

  const currentElevationIndex = Math.floor((currentDistance / totalDistance) * (elevationProfile.length - 1));
  const currentElevation = elevationProfile[Math.min(currentElevationIndex, elevationProfile.length - 1)];

  const nextWaypoint = trailWaypoints.find(wp => wp.distFromStart > currentDistance);

  const pace = elapsedMinutes / currentDistance;
  const paceMin = Math.floor(pace);
  const paceSec = Math.round((pace - paceMin) * 60);

  const hours = Math.floor(elapsedMinutes / 60);
  const mins = elapsedMinutes % 60;

  const etaMinutes = Math.round(distanceToEnd * pace);
  const etaHours = Math.floor(etaMinutes / 60);
  const etaMins = etaMinutes % 60;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative h-56 md:h-72 overflow-hidden">
        <img
          src={trail.image}
          alt={trail.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background" />

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3">
          <Link href="/trails">
            <Button size="icon" variant="ghost" className="bg-black/30 backdrop-blur-md text-white" data-testid="button-back-trails">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-400 gap-1.5">
              <Signal className="w-3 h-3" /> GPS Active
            </Badge>
            <Button size="icon" variant="ghost" className="bg-black/30 backdrop-blur-md text-white" data-testid="button-share-track">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="absolute bottom-4 left-5 right-5">
          <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">{trail.name}</h1>
          <p className="text-white/70 text-sm mt-1">{trail.location}</p>
        </div>
      </div>

      <div className="flex-1 px-5 md:px-10 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-card-border p-6"
          data-testid="gps-position-card"
        >
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold text-foreground">Live Tracking</span>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsPaused(!isPaused)}
              data-testid="button-pause-resume"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
          </div>

          <div className="text-center mb-6">
            <div className="text-4xl md:text-5xl font-bold text-emerald-500 tracking-tight" data-testid="text-current-distance">
              {currentDistance.toFixed(1)} <span className="text-lg text-muted-foreground font-normal">mi</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">of {totalDistance} miles completed</p>
          </div>

          <div className="relative mb-6">
            <Progress value={progressPercent} className="h-3" />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
              style={{ left: `${progressPercent}%` }}
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-background shadow-lg flex items-center justify-center">
                <Navigation className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5" data-testid="text-from-trailhead">
                <Flag className="w-3 h-3" />
                <span>{currentDistance.toFixed(1)} mi from trailhead</span>
              </div>
              <div className="flex items-center gap-1.5" data-testid="text-to-end">
                <MapPin className="w-3 h-3" />
                <span>{distanceToEnd.toFixed(1)} mi to trail end</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-background/50 p-3 text-center" data-testid="stat-elevation">
              <Mountain className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
              <div className="text-sm font-bold text-foreground">{currentElevation.toLocaleString()} ft</div>
              <div className="text-[11px] text-muted-foreground">Elevation</div>
            </div>
            <div className="rounded-xl bg-background/50 p-3 text-center" data-testid="stat-time">
              <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
              <div className="text-sm font-bold text-foreground">{hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}</div>
              <div className="text-[11px] text-muted-foreground">Elapsed</div>
            </div>
            <div className="rounded-xl bg-background/50 p-3 text-center" data-testid="stat-pace">
              <Zap className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
              <div className="text-sm font-bold text-foreground">{paceMin}:{paceSec.toString().padStart(2, "0")}</div>
              <div className="text-[11px] text-muted-foreground">min/mi Pace</div>
            </div>
            <div className="rounded-xl bg-background/50 p-3 text-center" data-testid="stat-eta">
              <TrendingUp className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
              <div className="text-sm font-bold text-foreground">{etaHours > 0 ? `${etaHours}h ${etaMins}m` : `${etaMins}m`}</div>
              <div className="text-[11px] text-muted-foreground">ETA to End</div>
            </div>
          </div>
        </motion.div>

        {nextWaypoint && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5"
            data-testid="next-waypoint-card"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Navigation className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-emerald-500 font-medium mb-0.5">Next Waypoint</p>
                <p className="text-sm font-semibold text-foreground">{nextWaypoint.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {(nextWaypoint.distFromStart - currentDistance).toFixed(1)} mi ahead
                  {" | "}Elev. {nextWaypoint.elevation.toLocaleString()} ft
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-emerald-500">
                  {(nextWaypoint.distFromStart - currentDistance).toFixed(1)}
                </div>
                <div className="text-[11px] text-muted-foreground">mi away</div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-card border border-card-border p-6"
          data-testid="elevation-profile-card"
        >
          <h3 className="text-sm font-semibold text-foreground mb-5">Elevation Profile</h3>
          <div className="relative h-28">
            <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="elGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {(() => {
                const minE = Math.min(...elevationProfile);
                const maxE = Math.max(...elevationProfile);
                const range = maxE - minE || 1;
                const points = elevationProfile.map((e, i) => {
                  const x = (i / (elevationProfile.length - 1)) * 200;
                  const y = 75 - ((e - minE) / range) * 65;
                  return `${x},${y}`;
                }).join(" ");
                const fillPoints = `0,75 ${points} 200,75`;
                const progressX = (progressPercent / 100) * 200;
                const progressY = 75 - ((currentElevation - minE) / range) * 65;
                return (
                  <>
                    <polygon points={fillPoints} fill="url(#elGrad)" />
                    <polyline points={points} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1={progressX} y1={0} x2={progressX} y2={75} stroke="#10b981" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
                    <circle cx={progressX} cy={progressY} r="4" fill="#10b981" stroke="var(--background)" strokeWidth="2" />
                  </>
                );
              })()}
            </svg>
            <div className="absolute left-0 top-0 text-[10px] text-muted-foreground">
              {Math.max(...elevationProfile).toLocaleString()} ft
            </div>
            <div className="absolute left-0 bottom-0 text-[10px] text-muted-foreground">
              {Math.min(...elevationProfile).toLocaleString()} ft
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-card border border-card-border overflow-hidden"
          data-testid="trail-waypoints-card"
        >
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between gap-3 p-6"
            data-testid="button-toggle-waypoints"
          >
            <h3 className="text-sm font-semibold text-foreground">Trail Waypoints</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {trailWaypoints.filter(wp => wp.distFromStart <= currentDistance).length}/{trailWaypoints.length}
              </Badge>
              {showDetails ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </button>

          {showDetails && (
            <div className="px-6 pb-6 space-y-0">
              {trailWaypoints.map((wp, i) => {
                const passed = wp.distFromStart <= currentDistance;
                const isNext = nextWaypoint?.name === wp.name;
                const WpIcon = waypointIcons[wp.type] || MapPin;
                return (
                  <div key={i} className="flex items-start gap-4" data-testid={`waypoint-item-${i}`}>
                    <div className="flex flex-col items-center pt-1.5">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2",
                        passed
                          ? "bg-emerald-500 border-emerald-500"
                          : isNext
                          ? "bg-emerald-500/20 border-emerald-500"
                          : "bg-muted border-border"
                      )}>
                        <WpIcon className={cn("w-3.5 h-3.5", passed ? "text-white" : isNext ? "text-emerald-500" : "text-muted-foreground")} />
                      </div>
                      {i < trailWaypoints.length - 1 && (
                        <div className={cn(
                          "w-0.5 h-10 mt-1",
                          passed ? "bg-emerald-500" : "bg-border"
                        )} />
                      )}
                    </div>
                    <div className="flex-1 pb-5 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={cn(
                          "text-sm font-medium",
                          passed ? "text-foreground" : "text-muted-foreground"
                        )}>{wp.name}</h4>
                        {isNext && <Badge className="bg-emerald-500/15 text-emerald-500 text-[10px]">Next</Badge>}
                        {passed && wp.type !== "trailhead" && <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">Passed</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Mile {wp.distFromStart.toFixed(1)}</span>
                        <span className="text-border">|</span>
                        <span>Elev. {wp.elevation.toLocaleString()} ft</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl bg-card border border-card-border p-6"
          data-testid="conditions-card"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Trail Conditions</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Thermometer className="w-5 h-5 text-amber-500" />
              <div>
                <div className="text-sm font-medium text-foreground">68°F</div>
                <div className="text-[11px] text-muted-foreground">Temperature</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Droplets className="w-5 h-5 text-slate-500" />
              <div>
                <div className="text-sm font-medium text-foreground">42%</div>
                <div className="text-[11px] text-muted-foreground">Humidity</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="text-sm font-medium text-foreground">Good</div>
                <div className="text-[11px] text-muted-foreground">Trail Surface</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Signal className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="text-sm font-medium text-foreground">Strong</div>
                <div className="text-[11px] text-muted-foreground">GPS Signal</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Track() {
  const params = useParams<{ id: string }>();
  const trailId = parseInt(params.id || "1");
  const trail = allTrails.find(t => t.id === trailId) || allTrails[0];

  const [permissionGranted, setPermissionGranted] = useState(false);

  if (!permissionGranted) {
    return (
      <PermissionGate
        trailName={trail.name}
        trailImage={trail.image}
        onGranted={() => setPermissionGranted(true)}
        onSkip={() => setPermissionGranted(true)}
      />
    );
  }

  return <TrackingView trail={trail} />;
}
