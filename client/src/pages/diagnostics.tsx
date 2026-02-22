import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, RefreshCw, Trash2, Bug, AlertTriangle, Info,
  Monitor, Smartphone, Wifi, Shield, ChevronDown, ChevronUp,
  Filter, Home
} from "lucide-react";
import { Link } from "wouter";

interface ErrorLog {
  id: number;
  level: string;
  message: string;
  stack: string | null;
  source: string;
  url: string | null;
  userAgent: string | null;
  userId: number | null;
  deviceInfo: Record<string, any> | null;
  metadata: Record<string, any> | null;
  sessionId: string | null;
  createdAt: string;
}

const levelColors: Record<string, string> = {
  error: "bg-red-500/10 text-red-400 border-red-500/20",
  warn: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  debug: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const sourceIcons: Record<string, any> = {
  frontend: Monitor,
  backend: Shield,
  auth: Shield,
  network: Wifi,
};

function DeviceTag({ info }: { info: Record<string, any> }) {
  const isMobile = info.touchSupport || (info.screenWidth && info.screenWidth < 768);
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
      {isMobile ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
      {info.screenWidth}x{info.screenHeight}
      {info.connection && info.connection !== "unknown" && ` | ${info.connection}`}
    </span>
  );
}

function LogEntry({ log }: { log: ErrorLog }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = sourceIcons[log.source] || Bug;
  const time = new Date(log.createdAt);
  const isMobile = log.deviceInfo?.touchSupport || (log.deviceInfo?.screenWidth && log.deviceInfo.screenWidth < 768);

  const userAgentShort = log.userAgent
    ? log.userAgent.includes("iPhone") ? "iPhone"
    : log.userAgent.includes("Android") ? "Android"
    : log.userAgent.includes("Chrome") ? "Chrome"
    : log.userAgent.includes("Safari") ? "Safari"
    : log.userAgent.includes("Firefox") ? "Firefox"
    : "Browser"
    : "Unknown";

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors cursor-pointer",
        log.level === "error" ? "border-red-500/20 bg-red-500/5" :
        log.level === "warn" ? "border-amber-500/20 bg-amber-500/5" :
        "border-border bg-card"
      )}
      onClick={() => setExpanded(!expanded)}
      data-testid={`log-entry-${log.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <Icon className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn("text-[10px] px-1.5 py-0 border", levelColors[log.level] || levelColors.debug)}>
                {log.level.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {log.source}
              </Badge>
              {isMobile && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-purple-500/30 text-purple-400">
                  Mobile
                </Badge>
              )}
              <span className="text-[10px] text-muted-foreground">{userAgentShort}</span>
            </div>
            <p className="text-sm text-foreground mt-1 break-words">{log.message}</p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-[10px] text-muted-foreground">
                {time.toLocaleDateString()} {time.toLocaleTimeString()}
              </span>
              {log.url && (
                <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                  {log.url.replace(/https?:\/\/[^/]+/, "")}
                </span>
              )}
              {log.deviceInfo && <DeviceTag info={log.deviceInfo} />}
            </div>
          </div>
        </div>
        <div className="shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          {log.stack && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-1">Stack Trace</p>
              <pre className="text-[10px] text-muted-foreground bg-background rounded p-2 overflow-x-auto whitespace-pre-wrap break-all max-h-40">
                {log.stack}
              </pre>
            </div>
          )}
          {log.userAgent && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-1">User Agent</p>
              <p className="text-[10px] text-muted-foreground break-all">{log.userAgent}</p>
            </div>
          )}
          {log.deviceInfo && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-1">Device Info</p>
              <pre className="text-[10px] text-muted-foreground bg-background rounded p-2 overflow-x-auto">
                {JSON.stringify(log.deviceInfo, null, 2)}
              </pre>
            </div>
          )}
          {log.metadata && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-1">Extra Details</p>
              <pre className="text-[10px] text-muted-foreground bg-background rounded p-2 overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            {log.userId && <span>User ID: {log.userId}</span>}
            {log.sessionId && <span>Session: {log.sessionId}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Diagnostics() {
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const { data, isLoading, refetch } = useQuery<{ logs: ErrorLog[]; total: number }>({
    queryKey: ["/api/diagnostics/logs", levelFilter, sourceFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (levelFilter !== "all") params.set("level", levelFilter);
      if (sourceFilter !== "all") params.set("source", sourceFilter);
      params.set("limit", "200");
      const res = await fetch(`/api/diagnostics/logs?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 15000,
  });

  const clearLogs = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/diagnostics/logs");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diagnostics/logs"] });
    },
  });

  const logs = data?.logs || [];
  const total = data?.total || 0;

  const errorCount = logs.filter(l => l.level === "error").length;
  const warnCount = logs.filter(l => l.level === "warn").length;
  const authCount = logs.filter(l => l.source === "auth").length;
  const mobileCount = logs.filter(l => l.deviceInfo?.touchSupport).length;

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button size="icon" variant="ghost" data-testid="button-back-diagnostics">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Bug className="w-5 h-5 text-red-400" />
                Diagnostics
              </h1>
              <p className="text-[11px] text-muted-foreground">{total} events captured</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-xs"
              onClick={() => refetch()}
              data-testid="button-refresh-logs"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-xs text-red-400 border-red-500/20"
              onClick={() => clearLogs.mutate()}
              disabled={clearLogs.isPending}
              data-testid="button-clear-logs"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-center">
            <div className="text-2xl font-bold text-red-400" data-testid="stat-errors">{errorCount}</div>
            <div className="text-[11px] text-muted-foreground">Errors</div>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-center">
            <div className="text-2xl font-bold text-amber-400" data-testid="stat-warnings">{warnCount}</div>
            <div className="text-[11px] text-muted-foreground">Warnings</div>
          </div>
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-center">
            <div className="text-2xl font-bold text-blue-400" data-testid="stat-auth-events">{authCount}</div>
            <div className="text-[11px] text-muted-foreground">Auth Events</div>
          </div>
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 text-center">
            <div className="text-2xl font-bold text-purple-400" data-testid="stat-mobile">{mobileCount}</div>
            <div className="text-[11px] text-muted-foreground">Mobile</div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {["all", "error", "warn", "info"].map((level) => (
            <Button
              key={level}
              size="sm"
              variant={levelFilter === level ? "default" : "outline"}
              className={cn("text-xs h-7 px-2.5", levelFilter === level && "bg-emerald-600 text-white")}
              onClick={() => setLevelFilter(level)}
              data-testid={`filter-level-${level}`}
            >
              {level === "all" ? "All Levels" : level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
          <span className="text-muted-foreground">|</span>
          {["all", "frontend", "auth", "network", "backend"].map((source) => (
            <Button
              key={source}
              size="sm"
              variant={sourceFilter === source ? "default" : "outline"}
              className={cn("text-xs h-7 px-2.5", sourceFilter === source && "bg-emerald-600 text-white")}
              onClick={() => setSourceFilter(source)}
              data-testid={`filter-source-${source}`}
            >
              {source === "all" ? "All Sources" : source.charAt(0).toUpperCase() + source.slice(1)}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" />
            <p className="text-sm text-muted-foreground">Loading diagnostics...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <Bug className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No events captured yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Errors, warnings, and auth events will appear here automatically
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <LogEntry key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
