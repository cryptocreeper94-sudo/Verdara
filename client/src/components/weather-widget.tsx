import { Cloud, Sun, Wind, Droplets, Eye } from "lucide-react";

export function WeatherWidget() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-sky-400/20 to-emerald-400/10 backdrop-blur-xl border border-white/20 p-4" data-testid="weather-widget">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground/80">DarkWave Weather</h3>
        <span className="text-xs text-muted-foreground">Asheville, NC</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Sun className="w-10 h-10 text-amber-400" />
          <Cloud className="w-7 h-7 text-slate-400 absolute -bottom-1 -right-2" />
        </div>
        <div>
          <div className="text-3xl font-bold text-foreground">72°F</div>
          <div className="text-sm text-muted-foreground">Partly Cloudy</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">8 mph</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">45%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">10 mi</span>
        </div>
      </div>
    </div>
  );
}
