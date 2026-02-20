import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Sparkles, Save, Eye, Trash2, Plus, Loader2, ArrowLeft, PenLine, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BlogPost } from "@shared/schema";

const CATEGORIES = [
  "Lumberjack Sports", "Wilderness Skills", "Trail Guides", "Gear Reviews",
  "Conservation", "Wild Edibles", "Forestry", "Outdoor Education", "Safety",
  "Wildlife", "Fishing", "Camping", "Climbing", "Water Sports", "Winter Sports", "General",
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function calcReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  status: string;
  category: string;
  tags: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

const emptyForm: PostForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  status: "draft",
  category: "",
  tags: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
};

export default function BlogAdmin() {
  const { toast } = useToast();
  const [view, setView] = useState<"list" | "editor">("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiTone, setAiTone] = useState("informative");

  const { data: publishedPosts, isLoading: loadingPublished } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog?status=published&limit=100"],
  });

  const { data: draftPosts, isLoading: loadingDrafts } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog?status=draft&limit=100"],
  });

  const allPosts = [...(publishedPosts || []), ...(draftPosts || [])];
  const isLoading = loadingPublished || loadingDrafts;
  const publishedCount = (publishedPosts || []).length;
  const draftCount = (draftPosts || []).length;

  const createPost = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/blog", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog?status=published&limit=100"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog?status=draft&limit=100"] });
      toast({ title: "Post created successfully" });
      setView("list");
      setForm(emptyForm);
      setEditingId(null);
    },
    onError: (err: Error) => {
      toast({ title: "Error creating post", description: err.message, variant: "destructive" });
    },
  });

  const updatePost = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/blog/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog?status=published&limit=100"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog?status=draft&limit=100"] });
      toast({ title: "Post updated successfully" });
      setView("list");
      setForm(emptyForm);
      setEditingId(null);
    },
    onError: (err: Error) => {
      toast({ title: "Error updating post", description: err.message, variant: "destructive" });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/blog/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog?status=published&limit=100"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog?status=draft&limit=100"] });
      toast({ title: "Post deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error deleting post", description: err.message, variant: "destructive" });
    },
  });

  const aiGenerate = useMutation({
    mutationFn: async (data: { topic: string; keywords: string; tone: string }) => {
      const res = await apiRequest("POST", "/api/blog/ai-generate", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      setForm({
        title: data.title || "",
        slug: generateSlug(data.title || ""),
        excerpt: data.excerpt || "",
        content: data.content || "",
        coverImage: data.coverImage || "",
        status: "draft",
        category: data.category || "",
        tags: (data.tags || []).join(", "),
        seoTitle: data.seoTitle || data.title || "",
        seoDescription: data.seoDescription || data.excerpt || "",
        seoKeywords: (data.seoKeywords || []).join(", "),
      });
      setAiOpen(false);
      setAiTopic("");
      setAiKeywords("");
      setAiTone("informative");
      toast({ title: "Content generated!", description: "Review and edit before publishing." });
    },
    onError: (err: Error) => {
      toast({ title: "AI generation failed", description: err.message, variant: "destructive" });
    },
  });

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: generateSlug(value),
    }));
  };

  const handleSave = (status: string) => {
    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content: form.content,
      coverImage: form.coverImage || null,
      status,
      category: form.category || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
      seoKeywords: form.seoKeywords ? form.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
      readingTime: calcReadingTime(form.content),
      publishedAt: status === "published" ? new Date().toISOString() : null,
    };

    if (editingId) {
      updatePost.mutate({ id: editingId, data: payload });
    } else {
      createPost.mutate(payload);
    }
  };

  const startEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      coverImage: post.coverImage || "",
      status: post.status || "draft",
      category: post.category || "",
      tags: (post.tags || []).join(", "),
      seoTitle: post.seoTitle || "",
      seoDescription: post.seoDescription || "",
      seoKeywords: (post.seoKeywords || []).join(", "),
    });
    setView("editor");
  };

  const startNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setView("editor");
  };

  const isSaving = createPost.isPending || updatePost.isPending;
  const readingTime = calcReadingTime(form.content);
  const tagsArray = form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  useEffect(() => {
    document.title = "Blog Manager — Verdara Admin";
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen p-4 md:p-8 space-y-6"
      data-testid="page-blog-admin"
    >
      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div key="list" {...fadeIn} className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-page-title">
                  Blog Manager
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Create, edit, and manage blog content</p>
              </div>
              <Button
                onClick={startNew}
                className="bg-emerald-500 text-white gap-2"
                data-testid="button-new-post"
              >
                <Plus className="w-4 h-4" />
                New Post
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4"
                data-testid="stat-total-posts"
              >
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold text-foreground">{allPosts.length}</p>
              </div>
              <div
                className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4"
                data-testid="stat-published-posts"
              >
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold text-emerald-400">{publishedCount}</p>
              </div>
              <div
                className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4"
                data-testid="stat-draft-posts"
              >
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold text-amber-400">{draftCount}</p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20" data-testid="loading-posts">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            ) : allPosts.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-20 text-center"
                data-testid="empty-state"
              >
                <PenLine className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first blog post to get started</p>
                <Button
                  onClick={startNew}
                  className="bg-emerald-500 text-white gap-2"
                  data-testid="button-empty-new-post"
                >
                  <Plus className="w-4 h-4" />
                  Create Post
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {allPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 flex items-center justify-between gap-4 flex-wrap"
                    data-testid={`row-post-${post.id}`}
                  >
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => startEdit(post)}
                      data-testid={`link-edit-post-${post.id}`}
                    >
                      <h3 className="font-semibold text-foreground truncate" data-testid={`text-post-title-${post.id}`}>
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge
                          className={
                            post.status === "published"
                              ? "bg-emerald-500/20 text-emerald-400 no-default-hover-elevate no-default-active-elevate"
                              : "bg-amber-500/20 text-amber-400 no-default-hover-elevate no-default-active-elevate"
                          }
                          data-testid={`badge-status-${post.id}`}
                        >
                          {post.status}
                        </Badge>
                        {post.category && (
                          <span className="text-xs text-muted-foreground" data-testid={`text-category-${post.id}`}>
                            {post.category}
                          </span>
                        )}
                        {post.publishedAt && (
                          <span className="text-xs text-muted-foreground" data-testid={`text-date-${post.id}`}>
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(post)}
                        data-testid={`button-edit-${post.id}`}
                      >
                        <PenLine className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("Delete this post?")) {
                            deletePost.mutate(post.id);
                          }
                        }}
                        data-testid={`button-delete-${post.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="editor" {...fadeIn} className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <Button
                variant="ghost"
                onClick={() => {
                  setView("list");
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="gap-2"
                data-testid="button-back-to-list"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Posts
              </Button>

              <Dialog open={aiOpen} onOpenChange={setAiOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white gap-2"
                    data-testid="button-ai-generate"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI Generate
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background border border-white/20" data-testid="dialog-ai-generate">
                  <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      AI Content Generator
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Topic *</label>
                      <Input
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        placeholder="e.g., Best hiking trails in the Pacific Northwest"
                        className="bg-white/5 border-white/20"
                        data-testid="input-ai-topic"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Keywords (optional)</label>
                      <Input
                        value={aiKeywords}
                        onChange={(e) => setAiKeywords(e.target.value)}
                        placeholder="e.g., hiking, trails, nature, adventure"
                        className="bg-white/5 border-white/20"
                        data-testid="input-ai-keywords"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Tone</label>
                      <Select value={aiTone} onValueChange={setAiTone}>
                        <SelectTrigger className="bg-white/5 border-white/20" data-testid="select-ai-tone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="informative">Informative</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => aiGenerate.mutate({ topic: aiTopic, keywords: aiKeywords, tone: aiTone })}
                      disabled={!aiTopic.trim() || aiGenerate.isPending}
                      className="w-full bg-emerald-500 text-white gap-2"
                      data-testid="button-generate"
                    >
                      {aiGenerate.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {aiGenerate.isPending ? "Generating..." : "Generate Content"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <h2 className="text-xl font-bold text-foreground" data-testid="text-editor-title">
              {editingId ? "Edit Post" : "New Post"}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Title</label>
                  <Input
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Post title"
                    className="bg-white/5 border-white/20"
                    data-testid="input-title"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Slug</label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="post-url-slug"
                    className="bg-white/5 border-white/20"
                    data-testid="input-slug"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Excerpt</label>
                  <Textarea
                    value={form.excerpt}
                    onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief excerpt..."
                    rows={2}
                    className="bg-white/5 border-white/20 resize-none"
                    data-testid="input-excerpt"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Content</label>
                  <Textarea
                    value={form.content}
                    onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your post content here..."
                    rows={20}
                    className="bg-white/5 border-white/20 font-mono text-sm resize-none"
                    data-testid="input-content"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Cover Image URL</label>
                  <Input
                    value={form.coverImage}
                    onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))}
                    placeholder="https://..."
                    className="bg-white/5 border-white/20"
                    data-testid="input-cover-image"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Status</label>
                  <Select
                    value={form.status}
                    onValueChange={(val) => setForm((prev) => ({ ...prev, status: val }))}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20" data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                  <Select
                    value={form.category}
                    onValueChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20" data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Tags (comma-separated)</label>
                  <Input
                    value={form.tags}
                    onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                    placeholder="hiking, nature, tips"
                    className="bg-white/5 border-white/20"
                    data-testid="input-tags"
                  />
                  {tagsArray.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap mt-2" data-testid="display-tags">
                      {tagsArray.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs border-white/20 text-muted-foreground no-default-hover-elevate no-default-active-elevate"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">SEO Title</label>
                  <Input
                    value={form.seoTitle}
                    onChange={(e) => setForm((prev) => ({ ...prev, seoTitle: e.target.value }))}
                    placeholder="SEO optimized title"
                    className="bg-white/5 border-white/20"
                    data-testid="input-seo-title"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">SEO Description</label>
                  <Textarea
                    value={form.seoDescription}
                    onChange={(e) => setForm((prev) => ({ ...prev, seoDescription: e.target.value }))}
                    placeholder="Meta description for search engines"
                    rows={2}
                    className="bg-white/5 border-white/20 resize-none"
                    data-testid="input-seo-description"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">SEO Keywords (comma-separated)</label>
                  <Input
                    value={form.seoKeywords}
                    onChange={(e) => setForm((prev) => ({ ...prev, seoKeywords: e.target.value }))}
                    placeholder="keyword1, keyword2"
                    className="bg-white/5 border-white/20"
                    data-testid="input-seo-keywords"
                  />
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3" data-testid="display-reading-time">
                  <p className="text-sm text-muted-foreground">Reading Time</p>
                  <p className="text-lg font-bold text-foreground">{readingTime} min</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => handleSave("draft")}
                  disabled={!form.title.trim() || !form.content.trim() || isSaving}
                  className="border-white/20 gap-2"
                  data-testid="button-save-draft"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save as Draft
                </Button>
                <Button
                  onClick={() => handleSave("published")}
                  disabled={!form.title.trim() || !form.content.trim() || isSaving}
                  className="bg-emerald-500 text-white gap-2"
                  data-testid="button-publish"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Publish
                </Button>
              </div>
              {form.slug && (
                <Link href={`/blog/${form.slug}`}>
                  <Button variant="ghost" className="gap-2" data-testid="button-preview">
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
