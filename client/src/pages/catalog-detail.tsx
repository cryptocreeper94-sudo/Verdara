import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/glass-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { CatalogLocation } from "@shared/schema";
import {
  ArrowLeft, MapPin, Star, Globe, Phone, Shield, Calendar,
  ExternalLink, Share2, Mountain, TreePine, Fish, Target,
  Tent, Bike, Waves, Snowflake, Zap, Ship, Leaf, Map,
  DollarSign, Users, Loader2, CheckCircle, MessageSquare, type LucideIcon
} from "lucide-react";
import LeafletMap from "@/components/leaflet-map";

const TYPE_COLORS: Record<string, string> = {
  national_park: "bg-emerald-500/20 text-emerald-300",
  state_park: "bg-green-500/20 text-green-300",
  fishing: "bg-slate-500/20 text-slate-300",
  hunting: "bg-amber-500/20 text-amber-300",
  climbing: "bg-orange-500/20 text-orange-300",
  camping: "bg-emerald-600/20 text-emerald-300",
  mtb: "bg-amber-600/20 text-amber-300",
  watersports: "bg-slate-400/20 text-slate-300",
  winter: "bg-slate-300/20 text-slate-200",
  emobility: "bg-green-400/20 text-green-300",
  charter: "bg-amber-500/20 text-amber-300",
  public_lands: "bg-emerald-400/20 text-emerald-300",
  conservation: "bg-green-600/20 text-green-300",
};

const TYPE_LABELS: Record<string, string> = {
  national_park: "National Park",
  state_park: "State Park",
  fishing: "Fishing",
  hunting: "Hunting",
  climbing: "Climbing",
  camping: "Camping",
  mtb: "MTB",
  watersports: "Water Sports",
  winter: "Winter Sports",
  emobility: "E-Mobility",
  charter: "Charter",
  public_lands: "Public Lands",
  conservation: "Conservation",
};

const TYPE_ICONS: Record<string, LucideIcon> = {
  national_park: Mountain,
  state_park: TreePine,
  fishing: Fish,
  hunting: Target,
  climbing: Mountain,
  camping: Tent,
  mtb: Bike,
  watersports: Waves,
  winter: Snowflake,
  emobility: Zap,
  charter: Ship,
  public_lands: Map,
  conservation: Leaf,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-emerald-500/20 text-emerald-300",
  moderate: "bg-amber-500/20 text-amber-300",
  hard: "bg-orange-500/20 text-orange-300",
  expert: "bg-red-500/20 text-red-300",
};

function formatType(type: string) {
  return TYPE_LABELS[type] || type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function renderStars(rating: number | null) {
  const r = rating ?? 0;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "w-4 h-4",
            i < Math.round(r) ? "text-amber-400 fill-amber-400" : "text-slate-600"
          )}
        />
      ))}
    </div>
  );
}

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface ReviewData {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
}

interface ReviewsResponse {
  reviews: ReviewData[];
  stats: { average: number; count: number };
}

function ReviewsSection({ locationId }: { locationId: number }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery<ReviewsResponse>({
    queryKey: [`/api/reviews/catalog/${locationId}`],
    enabled: !!locationId,
  });

  const submitReview = useMutation({
    mutationFn: async (data: { targetType: string; targetId: number; rating: number; title: string; content: string }) => {
      const res = await apiRequest("POST", "/api/reviews", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/reviews/catalog/${locationId}`] });
      setReviewRating(0);
      setReviewTitle("");
      setReviewContent("");
      toast({ title: "Review submitted", description: "Your review has been posted successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit review. Please try again.", variant: "destructive" });
    },
  });

  const handleSubmitReview = () => {
    if (reviewRating === 0 || !reviewTitle.trim() || !reviewContent.trim()) return;
    submitReview.mutate({
      targetType: "catalog",
      targetId: locationId,
      rating: reviewRating,
      title: reviewTitle.trim(),
      content: reviewContent.trim(),
    });
  };

  return (
    <motion.div variants={fadeUp}>
      <GlassCard className="p-5" data-testid="section-reviews">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-foreground" data-testid="text-reviews-heading">Reviews</h2>
        </div>

        {reviewsLoading ? (
          <div className="flex items-center justify-center py-8" data-testid="reviews-loading">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <>
            {reviewsData && (
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10" data-testid="reviews-stats">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-5 h-5",
                        i < Math.round(reviewsData.stats.average) ? "text-amber-400 fill-amber-400" : "text-slate-600"
                      )}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-foreground" data-testid="text-average-rating">
                  {reviewsData.stats.average.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground" data-testid="text-review-count">
                  ({reviewsData.stats.count} {reviewsData.stats.count === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}

            {reviewsData?.reviews && reviewsData.reviews.length > 0 && (
              <div className="space-y-4 mb-5" data-testid="reviews-list">
                {reviewsData.reviews.map((review) => (
                  <div key={review.id} className="border-b border-white/10 pb-4 last:border-b-0" data-testid={`review-item-${review.id}`}>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground" data-testid={`text-reviewer-name-${review.id}`}>
                        {review.userName}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-3.5 h-3.5",
                              i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground" data-testid={`text-review-date-${review.id}`}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground mb-1" data-testid={`text-review-title-${review.id}`}>
                      {review.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-review-content-${review.id}`}>
                      {review.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {reviewsData?.reviews && reviewsData.reviews.length === 0 && (
              <p className="text-sm text-muted-foreground mb-5" data-testid="text-no-reviews">
                No reviews yet. Be the first to leave a review!
              </p>
            )}

            {user && (
              <div className="border-t border-white/10 pt-4" data-testid="review-form">
                <h3 className="text-sm font-semibold text-foreground mb-3" data-testid="text-write-review-heading">Write a Review</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-1" data-testid="rating-selector">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-6 h-6 cursor-pointer transition-colors",
                          i < (hoverRating || reviewRating) ? "text-amber-400 fill-amber-400" : "text-slate-600"
                        )}
                        onClick={() => setReviewRating(i + 1)}
                        onMouseEnter={() => setHoverRating(i + 1)}
                        onMouseLeave={() => setHoverRating(0)}
                        data-testid={`star-selector-${i + 1}`}
                      />
                    ))}
                  </div>
                  <Input
                    placeholder="Review title"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="bg-white/5 border-white/20"
                    data-testid="input-review-title"
                  />
                  <Textarea
                    placeholder="Write your review..."
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    rows={3}
                    className="bg-white/5 border-white/20 resize-none"
                    data-testid="textarea-review-content"
                  />
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitReview.isPending || reviewRating === 0 || !reviewTitle.trim() || !reviewContent.trim()}
                    data-testid="button-submit-review"
                  >
                    {submitReview.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Submit Review
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </GlassCard>
    </motion.div>
  );
}

export default function CatalogDetail() {
  const [, params] = useRoute("/catalog/:slug");
  const slug = params?.slug;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: location, isLoading } = useQuery<CatalogLocation>({
    queryKey: ["/api/catalog/slug", slug],
    enabled: !!slug,
  });

  const { data: relatedRaw } = useQuery<CatalogLocation[]>({
    queryKey: ["/api/catalog", `?type=${location?.type}&limit=4`],
    enabled: !!location?.type,
  });

  const relatedLocations = useMemo(() => {
    if (!relatedRaw || !location) return [];
    return relatedRaw.filter(l => l.id !== location.id).slice(0, 3);
  }, [relatedRaw, location]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied", description: "Location URL copied to clipboard" });
    } catch {
      toast({ title: "Failed to copy", description: "Could not copy link to clipboard", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-state">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" data-testid="not-found-state">
        <Mountain className="w-16 h-16 text-slate-600" />
        <h2 className="text-xl font-bold text-foreground">Location not found</h2>
        <p className="text-sm text-muted-foreground">The location you're looking for doesn't exist or has been removed.</p>
        <Link href="/catalog" data-testid="link-back-catalog-404">
          <Button variant="outline" data-testid="button-back-catalog-404">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const TypeIcon = TYPE_ICONS[location.type] || Mountain;

  return (
    <div className="min-h-screen pb-12" data-testid="page-catalog-detail">
      <div className="px-5 md:px-10 pt-4 max-w-7xl mx-auto">
        <Link href="/catalog" data-testid="link-back-catalog">
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </span>
        </Link>
      </div>

      <div className="relative h-[300px] md:h-[400px] mt-3 overflow-hidden">
        <img
          src={location.imageUrl || "/images/hero-landscape.jpg"}
          alt={location.name}
          className="w-full h-full object-cover"
          data-testid="img-hero"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className={cn("text-xs", TYPE_COLORS[location.type] || "bg-slate-500/20 text-slate-300")} data-testid="badge-type">
                <TypeIcon className="w-3 h-3 mr-1" />
                {formatType(location.type)}
              </Badge>
              {location.isFeatured && (
                <Badge className="bg-amber-500/80 text-white text-xs" data-testid="badge-featured">
                  <Star className="w-3 h-3 mr-1 fill-white" />
                  Featured
                </Badge>
              )}
              {location.isVerified && (
                <Badge className="bg-emerald-500/80 text-white text-xs" data-testid="badge-verified">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2" data-testid="text-location-name">
              {location.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                {renderStars(location.rating)}
                <span className="text-sm font-medium text-white ml-1" data-testid="text-rating">
                  {location.rating?.toFixed(1) ?? "N/A"}
                </span>
                {location.reviews != null && location.reviews > 0 && (
                  <span className="text-sm text-white/70" data-testid="text-reviews">
                    ({location.reviews.toLocaleString()} reviews)
                  </span>
                )}
              </div>
              {(location.city || location.state) && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-white/70" />
                  <span className="text-sm text-white/90" data-testid="text-city-state">
                    {[location.city, location.state].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {(location.difficulty || location.priceRange || location.providerType || location.jurisdiction || (location.seasons && location.seasons.length > 0)) && (
        <div className="px-5 md:px-10 -mt-4 relative z-10 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <GlassCard className="p-4">
              <div className="flex flex-wrap items-center gap-3" data-testid="quick-info-bar">
                {location.difficulty && (
                  <Badge className={cn("text-xs", DIFFICULTY_COLORS[location.difficulty.toLowerCase()] || "bg-slate-500/20 text-slate-300")} data-testid="badge-difficulty">
                    {location.difficulty}
                  </Badge>
                )}
                {location.priceRange && (
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span data-testid="text-price-range">{location.priceRange}</span>
                  </div>
                )}
                {location.providerType && (
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span data-testid="text-provider-type">{location.providerType}</span>
                  </div>
                )}
                {location.jurisdiction && (
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span data-testid="text-jurisdiction">{location.jurisdiction}</span>
                  </div>
                )}
                {location.seasons && location.seasons.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    {location.seasons.map(season => (
                      <Badge key={season} variant="secondary" className="text-xs" data-testid={`badge-season-${season.toLowerCase()}`}>
                        {season}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="px-5 md:px-10 mt-6 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {(location.description || location.editorialSummary) && (
              <motion.div variants={fadeUp}>
                <GlassCard className="p-5" data-testid="section-description">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Description</h2>
                  {location.editorialSummary && (
                    <p className="text-sm text-emerald-300/90 italic mb-3" data-testid="text-editorial-summary">
                      {location.editorialSummary}
                    </p>
                  )}
                  {location.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-description">
                      {location.description}
                    </p>
                  )}
                </GlassCard>
              </motion.div>
            )}

            {location.activities && location.activities.length > 0 && (
              <motion.div variants={fadeUp}>
                <GlassCard className="p-5" data-testid="section-activities">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Activities</h2>
                  <div className="flex flex-wrap gap-2">
                    {location.activities.map(activity => (
                      <Badge
                        key={activity}
                        variant="secondary"
                        className="text-xs"
                        data-testid={`badge-activity-${activity.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {location.species && location.species.length > 0 && (
              <motion.div variants={fadeUp}>
                <GlassCard className="p-5" data-testid="section-species">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Species</h2>
                  <div className="flex flex-wrap gap-2">
                    {location.species.map(sp => (
                      <Badge
                        key={sp}
                        className="bg-emerald-500/15 text-emerald-300 text-xs"
                        data-testid={`badge-species-${sp.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <Fish className="w-3 h-3 mr-1" />
                        {sp}
                      </Badge>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {location.gameTypes && location.gameTypes.length > 0 && (
              <motion.div variants={fadeUp}>
                <GlassCard className="p-5" data-testid="section-game-types">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Game Types</h2>
                  <div className="flex flex-wrap gap-2">
                    {location.gameTypes.map(game => (
                      <Badge
                        key={game}
                        className="bg-amber-500/15 text-amber-300 text-xs"
                        data-testid={`badge-game-${game.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <Target className="w-3 h-3 mr-1" />
                        {game}
                      </Badge>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {location.amenities && location.amenities.length > 0 && (
              <motion.div variants={fadeUp}>
                <GlassCard className="p-5" data-testid="section-amenities">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {location.amenities.map(amenity => (
                      <Badge
                        key={amenity}
                        variant="secondary"
                        className="text-xs"
                        data-testid={`badge-amenity-${amenity.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {location.regulations && (
              <motion.div variants={fadeUp}>
                <GlassCard className="p-5 border-amber-500/30 bg-amber-500/5" data-testid="section-regulations">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h2 className="text-lg font-semibold text-foreground mb-2">Regulations</h2>
                      <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-regulations">
                        {location.regulations}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {location.tags && location.tags.length > 0 && (
              <motion.div variants={fadeUp}>
                <GlassCard className="p-5" data-testid="section-tags">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {location.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs"
                        data-testid={`badge-tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            <ReviewsSection locationId={location.id} />
          </div>

          <div className="space-y-6">
            <motion.div variants={fadeUp}>
              <GlassCard className="p-5" data-testid="section-contact">
                <h2 className="text-lg font-semibold text-foreground mb-3">Contact Info</h2>
                <div className="space-y-3">
                  {location.address && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground" data-testid="text-address">
                        {location.address}
                        {location.city && `, ${location.city}`}
                        {location.state && `, ${location.state}`}
                        {location.zipCode && ` ${location.zipCode}`}
                      </span>
                    </div>
                  )}
                  {location.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <a href={`tel:${location.phone}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-phone">
                        {location.phone}
                      </a>
                    </div>
                  )}
                  {location.website && (
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <a
                        href={location.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors truncate"
                        data-testid="link-website"
                      >
                        {location.website.replace(/^https?:\/\/(www\.)?/, "")}
                        <ExternalLink className="w-3 h-3 inline ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={fadeUp}>
              <GlassCard className="p-5" data-testid="section-actions">
                <h2 className="text-lg font-semibold text-foreground mb-3">Actions</h2>
                <div className="space-y-2.5">
                  {location.bookingUrl && (
                    <a href={location.bookingUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full" data-testid="button-book-now">
                        Book Now
                        <ExternalLink className="w-3.5 h-3.5 ml-2" />
                      </Button>
                    </a>
                  )}
                  {location.permitUrl && (
                    <a href={location.permitUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="outline" className="w-full" data-testid="button-get-permit">
                        Get Permit
                        <ExternalLink className="w-3.5 h-3.5 ml-2" />
                      </Button>
                    </a>
                  )}
                  {location.website && (
                    <a href={location.website} target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="outline" className="w-full" data-testid="button-visit-website">
                        Visit Website
                        <ExternalLink className="w-3.5 h-3.5 ml-2" />
                      </Button>
                    </a>
                  )}
                  <Button variant="ghost" className="w-full" onClick={handleShare} data-testid="button-share">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Location
                  </Button>
                </div>
              </GlassCard>
            </motion.div>

            {location.lat && location.lng && (
              <motion.div variants={fadeUp}>
                <GlassCard className="p-5" data-testid="section-map">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Location</h2>
                  <div className="rounded-md overflow-hidden mb-3">
                    <LeafletMap
                      center={[location.lat, location.lng]}
                      zoom={12}
                      markers={[{ lat: location.lat, lng: location.lng, title: location.name }]}
                      style={{ minHeight: 200 }}
                    />
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full" data-testid="button-view-map">
                      <MapPin className="w-4 h-4 mr-2" />
                      View on Google Maps
                      <ExternalLink className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </a>
                </GlassCard>
              </motion.div>
            )}

            {location.photos && location.photos.length > 0 && (
              <motion.div variants={fadeUp}>
                <GlassCard className="p-5" data-testid="section-photos">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Photos</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {location.photos.map((photo, i) => (
                      <div key={i} className="relative aspect-square rounded-md overflow-hidden">
                        <img
                          src={photo}
                          alt={`${location.name} photo ${i + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          data-testid={`img-photo-${i}`}
                        />
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {relatedLocations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="px-5 md:px-10 mt-10 max-w-7xl mx-auto"
        >
          <h2 className="text-xl font-bold text-foreground mb-4" data-testid="text-related-heading">
            Related Locations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedLocations.map((loc, i) => (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <GlassCard
                  hover
                  onClick={() => setLocation(`/catalog/${loc.slug}`)}
                  className="overflow-visible cursor-pointer group"
                  data-testid={`card-related-${loc.id}`}
                >
                  <div className="relative h-[160px] overflow-hidden rounded-t-2xl">
                    <img
                      src={loc.imageUrl || "/images/hero-landscape.jpg"}
                      alt={loc.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-sm text-foreground leading-tight" data-testid={`text-related-name-${loc.id}`}>
                      {loc.name}
                    </h3>
                    <Badge className={cn("text-xs", TYPE_COLORS[loc.type] || "bg-slate-500/20 text-slate-300")}>
                      {formatType(loc.type)}
                    </Badge>
                    {(loc.city || loc.state) && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          {[loc.city, loc.state].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, si) => (
                        <Star
                          key={si}
                          className={cn(
                            "w-3 h-3",
                            si < Math.round(loc.rating ?? 0) ? "text-amber-400 fill-amber-400" : "text-slate-600"
                          )}
                        />
                      ))}
                      <span className="text-xs font-medium text-foreground ml-0.5">
                        {loc.rating?.toFixed(1) ?? "N/A"}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
