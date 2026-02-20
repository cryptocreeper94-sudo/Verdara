import { Cloud, Sun, Wind, Droplets, Eye } from "lucide-react";

export function WeatherWidget() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 to-amber-400/10 backdrop-blur-xl border border-white/20 p-6" data-testid="weather-widget">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground/80">DarkWave Weather</h3>
        <span className="text-xs text-muted-foreground">Asheville, NC</span>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative">
          <Sun className="w-12 h-12 text-amber-400" />
          <Cloud className="w-8 h-8 text-slate-400 absolute -bottom-1 -right-2" />
        </div>
        <div>
          <div className="text-3xl font-bold text-foreground">72°F</div>
          <div className="text-sm text-muted-foreground mt-0.5">Partly Cloudy</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">8 mph</span>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">45%</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">10 mi</span>
        </div>
      </div>
    </div>
  );
}
