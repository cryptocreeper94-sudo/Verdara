import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, BookOpen, Clock, User, Calendar, Tag, ChevronRight, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@shared/schema";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
  "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
  "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800",
];

const CATEGORIES = [
  "All", "Lumberjack Sports", "Wilderness Skills", "Trail Guides", "Gear Reviews",
  "Conservation", "Wild Edibles", "Forestry", "Outdoor Education", "Safety",
  "Wildlife", "Fishing", "Camping", "Climbing", "Water Sports", "Winter Sports",
];

const POSTS_PER_PAGE = 20;

const stagger = {
  container: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  },
};

function getCoverImage(post: BlogPost, index: number): string {
  return post.coverImage || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function BlogCard({ post, index, featured = false }: { post: BlogPost; index: number; featured?: boolean }) {
  return (
    <motion.div variants={stagger.item}>
      <Link href={`/blog/${post.slug}`}>
        <div
          className={cn(
            "group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black/10",
            featured && "md:col-span-1"
          )}
          data-testid={`card-blog-post-${post.id}`}
        >
          <div className="relative" style={{ aspectRatio: "16/9" }}>
            <img
              src={getCoverImage(post, index)}
              alt={post.title}
              className="w-full h-full object-cover"
              loading="lazy"
              data-testid={`img-blog-cover-${post.id}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {post.category && (
              <Badge
                className="absolute top-3 left-3 bg-emerald-500/80 text-white text-xs no-default-hover-elevate no-default-active-elevate"
                data-testid={`badge-category-${post.id}`}
              >
                {post.category}
              </Badge>
            )}
            {post.readingTime && (
              <div
                className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-md px-2 py-1"
                data-testid={`text-reading-time-${post.id}`}
              >
                <Clock className="w-3 h-3 text-white/80" />
                <span className="text-xs text-white/80">{post.readingTime} min</span>
              </div>
            )}
          </div>
          <div className="p-4 space-y-2">
            <h3
              className="font-semibold text-foreground line-clamp-2 group-hover:text-emerald-400 transition-colors"
              data-testid={`text-blog-title-${post.id}`}
            >
              {post.title}
            </h3>
            {post.excerpt && (
              <p
                className="text-sm text-muted-foreground line-clamp-2"
                data-testid={`text-blog-excerpt-${post.id}`}
              >
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
              <div className="flex items-center gap-2">
                {post.authorName && (
                  <div className="flex items-center gap-1" data-testid={`text-blog-author-${post.id}`}>
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{post.authorName}</span>
                  </div>
                )}
              </div>
              {post.publishedAt && (
                <div className="flex items-center gap-1" data-testid={`text-blog-date-${post.id}`}>
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</span>
                </div>
              )}
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap pt-1" data-testid={`tags-blog-${post.id}`}>
                <Tag className="w-3 h-3 text-muted-foreground" />
                {post.tags.slice(0, 3).map((tag) => (
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
        </div>
      </Link>
    </motion.div>
  );
}

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [offset, setOffset] = useState(0);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    document.title = "Verdara Journal — Outdoor Knowledge & Adventure Stories";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Explore expert articles on wilderness skills, trail guides, gear reviews, conservation, and outdoor education from the Verdara community.");
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = "Explore expert articles on wilderness skills, trail guides, gear reviews, conservation, and outdoor education from the Verdara community.";
      document.head.appendChild(newMeta);
    }
  }, []);

  const queryString = `/api/blog?status=published${selectedCategory !== "All" ? `&category=${selectedCategory}` : ""}${searchQuery ? `&q=${searchQuery}` : ""}&limit=${POSTS_PER_PAGE}&offset=${offset}`;

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: [queryString],
  });

  const { data: featuredPosts } = useQuery<BlogPost[]>({
    queryKey: [`/api/blog?status=published&featured=true`],
  });

  useEffect(() => {
    if (posts) {
      if (offset === 0) {
        setAllPosts(posts);
      } else {
        setAllPosts((prev) => [...prev, ...posts]);
      }
    }
  }, [posts, offset]);

  useEffect(() => {
    setOffset(0);
    setAllPosts([]);
  }, [selectedCategory, searchQuery]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSearchInput("");
    setSearchQuery("");
  };

  const hasMore = posts && posts.length === POSTS_PER_PAGE;
  const displayFeatured = featuredPosts && featuredPosts.length > 0 && selectedCategory === "All" && !searchQuery;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <div className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200"
          alt="Verdara Journal"
          className="w-full h-72 md:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <BookOpen className="w-6 h-6 text-emerald-400" />
              <Badge className="bg-emerald-500/20 text-emerald-400 no-default-hover-elevate no-default-active-elevate">Journal</Badge>
            </div>
            <h1
              className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-3"
              data-testid="text-blog-hero-title"
            >
              Verdara Journal
            </h1>
            <p
              className="text-white/70 text-sm md:text-base max-w-lg mb-6"
              data-testid="text-blog-hero-subtitle"
            >
              Expert knowledge, trail stories, and outdoor wisdom from the Verdara community
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-md flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/40"
                data-testid="input-blog-search"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-emerald-500 text-white"
              data-testid="button-blog-search"
            >
              Search
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="px-5 md:px-10 py-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0"
          data-testid="container-category-filters"
        >
          <div className="flex items-center gap-2 min-w-max">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className={cn(
                  "text-xs whitespace-nowrap",
                  selectedCategory === cat
                    ? "bg-emerald-500 text-white"
                    : "border-white/20 text-muted-foreground"
                )}
                onClick={() => handleCategoryChange(cat)}
                data-testid={`button-category-${cat.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </motion.div>

        {displayFeatured && (
          <section data-testid="section-featured-posts">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-amber-500 rounded-full" />
              <h2 className="text-xl font-bold text-foreground" data-testid="text-featured-heading">
                Featured Stories
              </h2>
            </div>
            <motion.div
              variants={stagger.container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {featuredPosts.map((post, i) => (
                <BlogCard key={post.id} post={post} index={i} featured />
              ))}
            </motion.div>
          </section>
        )}

        <section data-testid="section-all-posts">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-emerald-500 rounded-full" />
            <h2 className="text-xl font-bold text-foreground" data-testid="text-all-posts-heading">
              {selectedCategory === "All" ? "All Articles" : selectedCategory}
              {searchQuery && ` — "${searchQuery}"`}
            </h2>
          </div>

          {isLoading && offset === 0 ? (
            <div className="flex items-center justify-center py-20" data-testid="loading-posts">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          ) : allPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
              data-testid="empty-state-posts"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No articles found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different search term.`
                  : "No articles available in this category yet. Check back soon!"}
              </p>
              {(searchQuery || selectedCategory !== "All") && (
                <Button
                  variant="outline"
                  className="mt-4 border-white/20 text-muted-foreground"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchInput("");
                    setSearchQuery("");
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </motion.div>
          ) : (
            <>
              <motion.div
                variants={stagger.container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {allPosts.map((post, i) => (
                  <BlogCard key={post.id} post={post} index={i} />
                ))}
              </motion.div>

              {hasMore && (
                <div className="flex justify-center pt-8">
                  <Button
                    variant="outline"
                    className="border-white/20 text-muted-foreground gap-2"
                    onClick={() => setOffset((prev) => prev + POSTS_PER_PAGE)}
                    disabled={isLoading}
                    data-testid="button-load-more"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    Load More Articles
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </motion.div>
  );
}