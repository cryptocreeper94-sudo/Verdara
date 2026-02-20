import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image, Video, Music, FileText, Upload, Search, Filter,
  Grid3X3, List, Star, Tag, ChevronLeft, ChevronRight, Loader2,
  ExternalLink, Pencil, Trash2, FolderOpen, Sparkles, Film,
  CloudUpload, X, Eye, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { FeatureInfoBubble } from "@/components/subscription-banner";

interface MediaItem {
  id: number;
  title: string;
  category: "image" | "video" | "audio" | "document";
  contentType: string;
  size: number;
  url: string;
  thumbnailUrl: string;
  isFavorite: boolean;
  tags: string[];
  description?: string;
  createdAt: string;
}

interface MediaListResponse {
  items: MediaItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const categoryIcons: Record<string, typeof Image> = {
  image: Image,
  video: Video,
  audio: Music,
  document: FileText,
};

const categoryColors: Record<string, string> = {
  image: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  video: "text-purple-400 bg-purple-500/15 border-purple-500/30",
  audio: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  document: "text-slate-400 bg-slate-500/15 border-slate-500/30",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Vault() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [editorUrl, setEditorUrl] = useState<string | null>(null);

  const { data: statusData } = useQuery({
    queryKey: ["/api/trustvault/status"],
  });
  const vaultStatus = statusData as { connected: boolean; user?: { trustLayerId: string }; capabilities?: string[] } | undefined;

  const { data: mediaData, isLoading } = useQuery({
    queryKey: ["/api/trustvault/media", activeCategory, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeCategory !== "all") params.set("category", activeCategory);
      params.set("page", String(page));
      params.set("limit", "20");
      const res = await fetch(`/api/trustvault/media?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load media");
      return res.json() as Promise<MediaListResponse>;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const uploadRes = await apiRequest("POST", "/api/trustvault/media/upload", {
        name: file.name,
        contentType: file.type,
        size: file.size,
      });
      const { uploadURL, objectPath } = await uploadRes.json();

      await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const confirmRes = await apiRequest("POST", "/api/trustvault/media/confirm", {
        title: file.name.replace(/\.[^.]+$/, ""),
        url: objectPath,
        filename: file.name,
        contentType: file.type,
        size: file.size,
        tags: ["verdara"],
      });
      return confirmRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trustvault/media"] });
    },
  });

  const embedEditorMutation = useMutation({
    mutationFn: async ({ editorType, mediaId }: { editorType: string; mediaId?: number }) => {
      const res = await apiRequest("POST", "/api/trustvault/editor/embed-token", {
        editorType,
        mediaId,
        returnUrl: window.location.href,
      });
      return res.json();
    },
    onSuccess: (data: { embedUrl: string }) => {
      setEditorUrl(data.embedUrl);
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async ({ title, type }: { title: string; type: string }) => {
      const res = await apiRequest("POST", "/api/trustvault/projects/create", {
        title,
        type,
        description: `Created from Verdara on ${new Date().toLocaleDateString()}`,
      });
      return res.json();
    },
  });

  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Create a free account to upload media to TrustVault." });
      return;
    }
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  const mediaItems = mediaData?.items || [];
  const pagination = mediaData?.pagination;
  const categories = ["all", "image", "video", "audio", "document"];

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" data-testid="text-vault-title">
            <Shield className="w-6 h-6 text-emerald-500" />
            TrustVault Media Gallery
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your secure media vault — store, browse, and edit photos, videos & documents
          </p>
        </div>

        <div className="flex items-center gap-2">
          {vaultStatus?.connected && (
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30" variant="outline">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Connected
            </Badge>
          )}
          <input
            type="file"
            id="vault-upload"
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            data-testid="input-vault-upload"
          />
          <Button
            variant="outline"
            size="sm"
            className="border-emerald-500/30 text-emerald-400"
            onClick={() => document.getElementById("vault-upload")?.click()}
            disabled={uploadMutation.isPending}
            data-testid="button-vault-upload"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CloudUpload className="w-4 h-4 mr-2" />
            )}
            Upload
          </Button>
        </div>
      </motion.div>

      {!user && (
        <FeatureInfoBubble
          title="TrustVault Media Storage"
          description="Upload and manage your media files. Included with Outdoor Explorer ($19.99/yr) and above."
          tier="Outdoor Explorer+"
        />
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-card-border bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Image className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Photos</p>
              <p className="text-lg font-semibold text-foreground" data-testid="text-vault-photo-count">
                {pagination?.total || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-card-border bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <Film className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Projects</p>
              <p className="text-lg font-semibold text-foreground">-</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-card-border bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">AI Edits</p>
              <p className="text-lg font-semibold text-foreground">-</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-card-border bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-500/15 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Storage</p>
              <p className="text-lg font-semibold text-foreground">500 MB</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const Icon = cat === "all" ? Grid3X3 : categoryIcons[cat];
            return (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                className={cn(
                  "text-xs capitalize",
                  activeCategory === cat
                    ? "bg-emerald-500 text-white"
                    : "border-card-border text-muted-foreground"
                )}
                onClick={() => { setActiveCategory(cat); setPage(1); }}
                data-testid={`button-filter-${cat}`}
              >
                <Icon className="w-3.5 h-3.5 mr-1.5" />
                {cat}
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm w-48 bg-card/80 border-card-border"
              data-testid="input-vault-search"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-card-border"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            data-testid="button-view-toggle"
          >
            {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="border-emerald-500/30 text-emerald-400 text-xs"
          onClick={() => embedEditorMutation.mutate({ editorType: "image" })}
          disabled={embedEditorMutation.isPending}
          data-testid="button-open-image-editor"
        >
          <Pencil className="w-3.5 h-3.5 mr-1.5" />
          Image Editor
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-purple-500/30 text-purple-400 text-xs"
          onClick={() => embedEditorMutation.mutate({ editorType: "video" })}
          disabled={embedEditorMutation.isPending}
          data-testid="button-open-video-editor"
        >
          <Video className="w-3.5 h-3.5 mr-1.5" />
          Video Editor
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-amber-500/30 text-amber-400 text-xs"
          onClick={() =>
            createProjectMutation.mutate({
              title: "Verdara Trail Highlight Reel",
              type: "video",
            })
          }
          disabled={createProjectMutation.isPending}
          data-testid="button-create-project"
        >
          <Film className="w-3.5 h-3.5 mr-1.5" />
          {createProjectMutation.isPending ? "Creating..." : "New Highlight Reel"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : mediaItems.length > 0 ? (
        <>
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                : "space-y-2"
            )}
          >
            {mediaItems
              .filter((m) =>
                searchQuery ? m.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
              )
              .map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                >
                  {viewMode === "grid" ? (
                    <Card
                      className="overflow-hidden border-card-border bg-card/80 backdrop-blur-sm cursor-pointer hover-elevate group"
                      onClick={() => setSelectedMedia(item)}
                      data-testid={`card-media-${item.id}`}
                    >
                      <div className="relative aspect-square overflow-hidden">
                        {item.category === "image" ? (
                          <img
                            src={item.thumbnailUrl || item.url}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800/50">
                            {(() => {
                              const Icon = categoryIcons[item.category] || FileText;
                              return <Icon className="w-12 h-12 text-muted-foreground/40" />;
                            })()}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        {item.isFavorite && (
                          <Star className="absolute top-2 right-2 w-4 h-4 text-amber-400 fill-amber-400" />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-white/80" data-testid={`button-view-media-${item.id}`}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-white/80"
                              onClick={(e) => {
                                e.stopPropagation();
                                embedEditorMutation.mutate({ editorType: item.category, mediaId: item.id });
                              }}
                              data-testid={`button-edit-media-grid-${item.id}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-2.5">
                        <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <Badge className={cn("text-[10px] py-0", categoryColors[item.category])} variant="outline">
                            {item.category}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{formatFileSize(item.size)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card
                      className="border-card-border bg-card/80 backdrop-blur-sm cursor-pointer hover-elevate"
                      onClick={() => setSelectedMedia(item)}
                      data-testid={`card-media-list-${item.id}`}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          {item.category === "image" ? (
                            <img
                              src={item.thumbnailUrl || item.url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800/50">
                              {(() => {
                                const Icon = categoryIcons[item.category] || FileText;
                                return <Icon className="w-5 h-5 text-muted-foreground/40" />;
                              })()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge className={cn("text-[10px] py-0", categoryColors[item.category])} variant="outline">
                              {item.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{formatFileSize(item.size)}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {item.tags.length > 0 && (
                          <div className="hidden md:flex gap-1">
                            {item.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-[10px] py-0 border-card-border text-muted-foreground">
                                <Tag className="w-2.5 h-2.5 mr-0.5" />{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="border-card-border"
                data-testid="button-prev-page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="border-card-border"
                data-testid="button-next-page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Your Vault is Empty</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Upload nature photos, trail videos, and species identification images to your secure TrustVault storage.
          </p>
          <Button
            className="bg-emerald-500 text-white"
            onClick={() => document.getElementById("vault-upload")?.click()}
            data-testid="button-vault-upload-empty"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Your First File
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-card-border rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMedia.category === "image" && (
                <div className="relative">
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.title}
                    className="w-full max-h-[50vh] object-contain rounded-t-2xl bg-black"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-3 right-3 text-white/80 bg-black/40 rounded-full"
                    onClick={() => setSelectedMedia(null)}
                    data-testid="button-close-detail"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground" data-testid="text-media-title">
                      {selectedMedia.title}
                    </h3>
                    {selectedMedia.description && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedMedia.description}</p>
                    )}
                  </div>
                  <Badge className={cn(categoryColors[selectedMedia.category])} variant="outline">
                    {selectedMedia.category}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedMedia.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs border-card-border text-muted-foreground">
                      <Tag className="w-3 h-3 mr-1" />{tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{formatFileSize(selectedMedia.size)}</span>
                  <span>{selectedMedia.contentType}</span>
                  <span>{new Date(selectedMedia.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-500/30 text-emerald-400"
                    onClick={() => {
                      embedEditorMutation.mutate({ editorType: selectedMedia.category, mediaId: selectedMedia.id });
                      setSelectedMedia(null);
                    }}
                    data-testid="button-edit-media"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    Edit in Studio
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-card-border text-muted-foreground"
                    onClick={() => window.open(selectedMedia.url, "_blank")}
                    data-testid="button-open-media"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    Open Original
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editorUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col"
          >
            <div className="flex items-center justify-between p-3 bg-card border-b border-card-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-foreground">TrustVault Studio</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditorUrl(null);
                  queryClient.invalidateQueries({ queryKey: ["/api/trustvault/media"] });
                }}
                data-testid="button-close-editor"
              >
                <X className="w-4 h-4" />
                Close Editor
              </Button>
            </div>
            <iframe
              src={editorUrl}
              className="flex-1 w-full border-0"
              allow="camera;microphone"
              title="TrustVault Studio Editor"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {createProjectMutation.isSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40"
        >
          <Card className="border-emerald-500/30 bg-card/95 backdrop-blur-sm shadow-lg">
            <CardContent className="p-3 flex items-center gap-3">
              <Film className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-foreground">Project created</p>
                <p className="text-xs text-muted-foreground">
                  ID: {(createProjectMutation.data as any)?.projectId} — Check status in your vault
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
