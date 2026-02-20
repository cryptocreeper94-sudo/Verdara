import { sql } from "drizzle-orm";
import {
  pgTable, text, varchar, integer, real, boolean,
  timestamp, serial, jsonb
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  replitId: text("replit_id").unique(),
  username: text("username").notNull().unique(),
  displayName: text("display_name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  tier: text("tier").default("Free Explorer"),
  trailsCompleted: integer("trails_completed").default(0),
  speciesIdentified: integer("species_identified").default(0),
  conservationDonated: real("conservation_donated").default(0),
  equipmentTracked: integer("equipment_tracked").default(0),
  memberSince: timestamp("member_since").defaultNow(),
});

export const trails = pgTable("trails", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  distance: text("distance").notNull(),
  elevation: text("elevation").notNull(),
  difficulty: text("difficulty").notNull(),
  rating: real("rating").default(0),
  reviews: integer("reviews").default(0),
  image: text("image"),
  description: text("description"),
  activityType: text("activity_type").default("hiking"),
  features: text("features").array(),
  isFeatured: boolean("is_featured").default(false),
  lat: real("lat"),
  lng: real("lng"),
});

export const identifications = pgTable("identifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  commonName: text("common_name").notNull(),
  scientificName: text("scientific_name"),
  category: text("category").notNull(),
  confidence: real("confidence"),
  description: text("description"),
  habitat: text("habitat"),
  characteristics: text("characteristics"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketplaceListings = pgTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").references(() => users.id),
  species: text("species").notNull(),
  grade: text("grade").notNull(),
  dimensions: text("dimensions").notNull(),
  pricePerBf: real("price_per_bf").notNull(),
  sellerName: text("seller_name").notNull(),
  trustLevel: integer("trust_level").default(1),
  trustScore: integer("trust_score").default(500),
  location: text("location"),
  image: text("image"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tripPlans = pgTable("trip_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  waypoints: jsonb("waypoints").$type<{ id: number; name: string; time: string; duration: string }[]>(),
  gearChecklist: jsonb("gear_checklist").$type<{ name: string; items: { id: number; name: string; checked: boolean }[] }[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campgrounds = pgTable("campgrounds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  price: real("price").notNull(),
  rating: real("rating").default(0),
  sites: integer("sites").default(0),
  amenities: text("amenities").array(),
  image: text("image"),
  description: text("description"),
});

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  date: text("date"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, memberSince: true });
export const insertTrailSchema = createInsertSchema(trails).omit({ id: true });
export const insertIdentificationSchema = createInsertSchema(identifications).omit({ id: true, createdAt: true });
export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).omit({ id: true, createdAt: true });
export const insertTripPlanSchema = createInsertSchema(tripPlans).omit({ id: true, createdAt: true });
export const insertCampgroundSchema = createInsertSchema(campgrounds).omit({ id: true });
export const insertActivityLogSchema = createInsertSchema(activityLog).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTrail = z.infer<typeof insertTrailSchema>;
export type Trail = typeof trails.$inferSelect;
export type InsertIdentification = z.infer<typeof insertIdentificationSchema>;
export type Identification = typeof identifications.$inferSelect;
export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type InsertTripPlan = z.infer<typeof insertTripPlanSchema>;
export type TripPlan = typeof tripPlans.$inferSelect;
export type InsertCampground = z.infer<typeof insertCampgroundSchema>;
export type Campground = typeof campgrounds.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLog.$inferSelect;
