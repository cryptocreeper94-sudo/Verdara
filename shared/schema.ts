import { sql } from "drizzle-orm";
import {
  pgTable, text, varchar, integer, real, boolean,
  timestamp, serial, jsonb
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  emailVerified: boolean("email_verified").default(false),
  verificationToken: text("verification_token"),
  verificationExpires: timestamp("verification_expires"),
  tier: text("tier").default("Free Explorer"),
  trailsCompleted: integer("trails_completed").default(0),
  speciesIdentified: integer("species_identified").default(0),
  conservationDonated: real("conservation_donated").default(0),
  equipmentTracked: integer("equipment_tracked").default(0),
  memberSince: timestamp("member_since").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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

export const activityLocations = pgTable("activity_locations", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  state: text("state"),
  description: text("description"),
  image: text("image"),
  rating: real("rating").default(0),
  reviews: integer("reviews").default(0),
  difficulty: text("difficulty"),
  season: text("season"),
  regulations: text("regulations"),
  species: text("species").array(),
  amenities: text("amenities").array(),
  tags: text("tags").array(),
  coordinates: jsonb("coordinates").$type<{ lat: number; lng: number }>(),
  metadata: jsonb("metadata").$type<Record<string, string>>(),
  isFeatured: boolean("is_featured").default(false),
});

export const arboristClients = pgTable("arborist_clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const arboristJobs = pgTable("arborist_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  clientId: integer("client_id").references(() => arboristClients.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("scheduled"),
  scheduledDate: text("scheduled_date"),
  completedDate: text("completed_date"),
  crew: text("crew").array(),
  estimatedCost: real("estimated_cost"),
  actualCost: real("actual_cost"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const arboristInvoices = pgTable("arborist_invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  clientId: integer("client_id").references(() => arboristClients.id),
  jobId: integer("job_id").references(() => arboristJobs.id),
  invoiceNumber: text("invoice_number").notNull(),
  status: text("status").default("draft"),
  items: jsonb("items").$type<{ description: string; quantity: number; unitPrice: number }[]>(),
  subtotal: real("subtotal").default(0),
  tax: real("tax").default(0),
  total: real("total").default(0),
  dueDate: text("due_date"),
  paidDate: text("paid_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campgroundBookings = pgTable("campground_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  campgroundId: integer("campground_id").references(() => campgrounds.id),
  checkIn: text("check_in").notNull(),
  checkOut: text("check_out").notNull(),
  guests: integer("guests").default(1),
  siteType: text("site_type").default("tent"),
  status: text("status").default("confirmed"),
  totalPrice: real("total_price"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least 1 capital letter")
  .regex(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/, "Password must contain at least 1 special character");

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, memberSince: true });
export const insertTrailSchema = createInsertSchema(trails).omit({ id: true });
export const insertIdentificationSchema = createInsertSchema(identifications).omit({ id: true, createdAt: true });
export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).omit({ id: true, createdAt: true });
export const insertTripPlanSchema = createInsertSchema(tripPlans).omit({ id: true, createdAt: true });
export const insertCampgroundSchema = createInsertSchema(campgrounds).omit({ id: true });
export const insertActivityLogSchema = createInsertSchema(activityLog).omit({ id: true, createdAt: true });
export const insertActivityLocationSchema = createInsertSchema(activityLocations).omit({ id: true });
export const insertArboristClientSchema = createInsertSchema(arboristClients).omit({ id: true, createdAt: true });
export const insertArboristJobSchema = createInsertSchema(arboristJobs).omit({ id: true, createdAt: true });
export const insertArboristInvoiceSchema = createInsertSchema(arboristInvoices).omit({ id: true, createdAt: true });
export const insertCampgroundBookingSchema = createInsertSchema(campgroundBookings).omit({ id: true, createdAt: true });

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
export type Session = typeof sessions.$inferSelect;
export type InsertActivityLocation = z.infer<typeof insertActivityLocationSchema>;
export type ActivityLocation = typeof activityLocations.$inferSelect;
export type InsertArboristClient = z.infer<typeof insertArboristClientSchema>;
export type ArboristClient = typeof arboristClients.$inferSelect;
export type InsertArboristJob = z.infer<typeof insertArboristJobSchema>;
export type ArboristJob = typeof arboristJobs.$inferSelect;
export type InsertArboristInvoice = z.infer<typeof insertArboristInvoiceSchema>;
export type ArboristInvoice = typeof arboristInvoices.$inferSelect;
export type InsertCampgroundBooking = z.infer<typeof insertCampgroundBookingSchema>;
export type CampgroundBooking = typeof campgroundBookings.$inferSelect;
