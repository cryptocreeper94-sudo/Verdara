import { useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Clock, User, Calendar, Tag, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@shared/schema";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200";

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function parseMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="text-xl font-semibold text-white mt-6 mb-3">
          {renderInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="text-2xl font-bold text-white mt-8 mb-4">
          {renderInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    if (/^\d+\.\s/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={key++} className="list-decimal list-inside space-y-2 my-4 text-white/80 text-lg leading-relaxed pl-4">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.trim().startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-2 my-4 text-white/80 text-lg leading-relaxed pl-4">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("## ") && !lines[i].startsWith("### ") && !lines[i].trim().startsWith("- ") && !/^\d+\.\s/.test(lines[i].trim())) {
      paragraphLines.push(lines[i]);
      i++;
    }
    if (paragraphLines.length > 0) {
      elements.push(
        <p key={key++} className="text-lg leading-relaxed text-white/80 my-4">
          {renderInline(paragraphLines.join(" "))}
        </p>
      );
    }
  }

  return elements;
}

function renderInline(text: string): (string | JSX.Element)[] {
  const result: (string | JSX.Element)[] = [];
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      result.push(<strong key={key++} className="font-bold text-white">{match[2]}</strong>);
    } else if (match[3]) {
      result.push(
        <code key={key++} className="bg-white/10 text-emerald-400 px-1.5 py-0.5 rounded text-sm font-mono">
          {match[3]}
        </code>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

export default function BlogDetail() {
  const [match, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading, isError } = useQuery<BlogPost>({
    queryKey: ["/api/blog", slug],
    enabled: !!slug,
  });

  const { data: relatedPosts } = useQuery<BlogPost[]>({
    queryKey: [`/api/blog?status=published&category=${post?.category}&limit=3`],
    enabled: !!post?.category,
  });

  const filteredRelated = relatedPosts?.filter((p) => p.id !== post?.id).slice(0, 3);

  useEffect(() => {
    if (!post) return;
    document.title = post.seoTitle || post.title;
    const meta = document.querySelector('meta[name="description"]');
    const desc = post.seoDescription || post.excerpt || "";
    if (meta) {
      meta.setAttribute("content", desc);
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = desc;
      document.head.appendChild(newMeta);
    }

    const existingLd = document.querySelector('script[type="application/ld+json"][data-blog-detail]');
    if (existingLd) existingLd.remove();
    const ldScript = document.createElement("script");
    ldScript.type = "application/ld+json";
    ldScript.setAttribute("data-blog-detail", "true");
    ldScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      author: { "@type": "Person", name: post.authorName },
      datePublished: post.publishedAt,
      publisher: { "@type": "Organization", name: "Verdara by DarkWave Studios" },
    });
    document.head.appendChild(ldScript);

    return () => {
      const el = document.querySelector('script[type="application/ld+json"][data-blog-detail]');
      if (el) el.remove();
    };
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen" data-testid="loading-blog-detail">
        <div className="w-full h-[400px] bg-white/5 animate-pulse" />
        <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
          <div className="h-10 w-3/4 bg-white/10 rounded-xl animate-pulse" />
          <div className="h-6 w-1/2 bg-white/10 rounded-lg animate-pulse" />
          <div className="space-y-4 mt-8">
            <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
        data-testid="error-blog-detail"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-not-found-title">
          Post not found
        </h2>
        <p className="text-muted-foreground mb-6">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/blog">
          <Button variant="outline" className="border-white/20 gap-2" data-testid="link-back-to-blog-error">
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </Button>
        </Link>
      </motion.div>
    );
  }

  const coverImage = post.coverImage || FALLBACK_COVER;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
      data-testid="page-blog-detail"
    >
      <div className="relative w-full h-[400px]" data-testid="container-hero">
        <img
          src={coverImage}
          alt={post.title}
          className="w-full h-full object-cover"
          data-testid="img-hero-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        <div className="absolute top-5 left-5 z-10">
          <Link href="/blog">
            <Button
              variant="outline"
              className="border-white/20 backdrop-blur-sm bg-black/30 text-white gap-2"
              data-testid="link-back-to-blog"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-5 md:px-10 pb-8">
          <div className="max-w-3xl mx-auto space-y-3">
            {post.category && (
              <Badge
                className="bg-emerald-500/80 text-white no-default-hover-elevate no-default-active-elevate"
                data-testid="badge-post-category"
              >
                {post.category}
              </Badge>
            )}
            <h1
              className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg"
              data-testid="text-post-title"
            >
              {post.title}
            </h1>
            <div className="flex items-center gap-4 flex-wrap text-white/70 text-sm">
              {post.authorName && (
                <div className="flex items-center gap-1.5" data-testid="text-post-author">
                  <User className="w-4 h-4" />
                  <span>{post.authorName}</span>
                </div>
              )}
              {post.publishedAt && (
                <div className="flex items-center gap-1.5" data-testid="text-post-date">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
              )}
              {post.readingTime && (
                <div className="flex items-center gap-1.5" data-testid="text-post-reading-time">
                  <Clock className="w-4 h-4" />
                  <span>{post.readingTime} min read</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-10 py-10">
        <div className="max-w-3xl mx-auto space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-10"
            data-testid="container-article-body"
          >
            <article data-testid="article-content">
              {parseMarkdown(post.content)}
            </article>
          </motion.div>

          {post.tags && post.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex items-center gap-2 flex-wrap"
              data-testid="container-tags"
            >
              <Tag className="w-4 h-4 text-muted-foreground" />
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-white/20 text-muted-foreground no-default-hover-elevate no-default-active-elevate"
                  data-testid={`badge-tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {tag}
                </Badge>
              ))}
            </motion.div>
          )}

          {post.seoKeywords && post.seoKeywords.length > 0 && (
            <div className="text-xs text-white/30 flex items-center gap-2 flex-wrap" data-testid="container-seo-keywords">
              <span>Keywords:</span>
              {post.seoKeywords.map((kw) => (
                <span key={kw}>{kw}</span>
              ))}
            </div>
          )}

          {filteredRelated && filteredRelated.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              data-testid="section-related-posts"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-amber-500 rounded-full" />
                <h2 className="text-xl font-bold text-foreground" data-testid="text-related-heading">
                  Related Articles
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredRelated.map((related) => (
                  <Link key={related.id} href={`/blog/${related.slug}`}>
                    <div
                      className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl cursor-pointer transition-all duration-300"
                      data-testid={`card-related-post-${related.id}`}
                    >
                      <div className="relative" style={{ aspectRatio: "16/9" }}>
                        <img
                          src={related.coverImage || FALLBACK_COVER}
                          alt={related.title}
                          className="w-full h-full object-cover rounded-t-2xl"
                          loading="lazy"
                          data-testid={`img-related-cover-${related.id}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-2xl" />
                      </div>
                      <div className="p-4 space-y-2">
                        <h3
                          className="font-semibold text-foreground line-clamp-2 group-hover:text-emerald-400 transition-colors"
                          data-testid={`text-related-title-${related.id}`}
                        >
                          {related.title}
                        </h3>
                        {related.excerpt && (
                          <p
                            className="text-sm text-muted-foreground line-clamp-2"
                            data-testid={`text-related-excerpt-${related.id}`}
                          >
                            {related.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </motion.div>
  );
}