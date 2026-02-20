import {
  type User, type InsertUser,
  type Trail, type InsertTrail,
  type Identification, type InsertIdentification,
  type MarketplaceListing, type InsertMarketplaceListing,
  type TripPlan, type InsertTripPlan,
  type Campground, type InsertCampground,
  type ActivityLog, type InsertActivityLog,
  type ActivityLocation, type InsertActivityLocation,
  type ArboristClient, type InsertArboristClient,
  type ArboristJob, type InsertArboristJob,
  type ArboristInvoice, type InsertArboristInvoice,
  type CampgroundBooking, type InsertCampgroundBooking,
  type Session,
  users, trails, identifications, marketplaceListings,
  tripPlans, campgrounds, activityLog, sessions,
  activityLocations, arboristClients, arboristJobs, arboristInvoices,
  campgroundBookings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or, lt, and, count, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;

  createSession(userId: number, token: string, expiresAt: Date): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;

  getTrails(): Promise<Trail[]>;
  getTrail(id: number): Promise<Trail | undefined>;
  getFeaturedTrails(): Promise<Trail[]>;
  createTrail(trail: InsertTrail): Promise<Trail>;
  searchTrails(query: string): Promise<Trail[]>;

  getIdentifications(userId?: number): Promise<Identification[]>;
  getIdentification(id: number): Promise<Identification | undefined>;
  createIdentification(identification: InsertIdentification): Promise<Identification>;

  getMarketplaceListings(): Promise<MarketplaceListing[]>;
  getMarketplaceListing(id: number): Promise<MarketplaceListing | undefined>;
  createMarketplaceListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing>;

  getTripPlans(userId?: number): Promise<TripPlan[]>;
  getTripPlan(id: number): Promise<TripPlan | undefined>;
  createTripPlan(plan: InsertTripPlan): Promise<TripPlan>;
  updateTripPlan(id: number, data: Partial<InsertTripPlan>): Promise<TripPlan | undefined>;

  getCampgrounds(): Promise<Campground[]>;
  getCampground(id: number): Promise<Campground | undefined>;
  createCampground(campground: InsertCampground): Promise<Campground>;

  getActivityLog(userId: number): Promise<ActivityLog[]>;
  createActivityLog(entry: InsertActivityLog): Promise<ActivityLog>;

  deleteTripPlan(id: number, userId: number): Promise<boolean>;
  deleteMarketplaceListing(id: number, userId: number): Promise<boolean>;
  updateMarketplaceListing(id: number, data: Partial<InsertMarketplaceListing>): Promise<MarketplaceListing | undefined>;
  getUserMarketplaceListings(userId: number): Promise<MarketplaceListing[]>;
  getUserStats(userId: number): Promise<{ tripsCount: number; identificationsCount: number; activitiesCount: number; listingsCount: number }>;
  searchMarketplaceListings(query: string): Promise<MarketplaceListing[]>;
  filterTrails(difficulty?: string, activityType?: string): Promise<Trail[]>;

  getActivityLocations(type?: string): Promise<ActivityLocation[]>;
  getActivityLocation(id: number): Promise<ActivityLocation | undefined>;
  searchActivityLocations(query: string, type?: string): Promise<ActivityLocation[]>;
  createActivityLocation(location: InsertActivityLocation): Promise<ActivityLocation>;

  getArboristClients(userId: number): Promise<ArboristClient[]>;
  getArboristClient(id: number): Promise<ArboristClient | undefined>;
  createArboristClient(client: InsertArboristClient): Promise<ArboristClient>;
  updateArboristClient(id: number, data: Partial<InsertArboristClient>): Promise<ArboristClient | undefined>;
  deleteArboristClient(id: number, userId: number): Promise<boolean>;

  getArboristJobs(userId: number): Promise<ArboristJob[]>;
  getArboristJob(id: number): Promise<ArboristJob | undefined>;
  createArboristJob(job: InsertArboristJob): Promise<ArboristJob>;
  updateArboristJob(id: number, data: Partial<InsertArboristJob>): Promise<ArboristJob | undefined>;
  deleteArboristJob(id: number, userId: number): Promise<boolean>;

  getArboristInvoices(userId: number): Promise<ArboristInvoice[]>;
  getArboristInvoice(id: number): Promise<ArboristInvoice | undefined>;
  createArboristInvoice(invoice: InsertArboristInvoice): Promise<ArboristInvoice>;
  updateArboristInvoice(id: number, data: Partial<InsertArboristInvoice>): Promise<ArboristInvoice | undefined>;
  deleteArboristInvoice(id: number, userId: number): Promise<boolean>;

  updateUserTier(userId: number, tier: string): Promise<User | undefined>;

  getCampgroundBookings(userId: number): Promise<CampgroundBooking[]>;
  createCampgroundBooking(data: InsertCampgroundBooking): Promise<CampgroundBooking>;
  updateCampgroundBooking(id: number, data: Partial<InsertCampgroundBooking>): Promise<CampgroundBooking | undefined>;
  deleteCampgroundBooking(id: number, userId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      email: insertUser.email.toLowerCase(),
    }).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async createSession(userId: number, token: string, expiresAt: Date): Promise<Session> {
    const [session] = await db.insert(sessions).values({ userId, token, expiresAt }).returning();
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.token, token));
    return session;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  }

  async getTrails(): Promise<Trail[]> {
    return db.select().from(trails);
  }

  async getTrail(id: number): Promise<Trail | undefined> {
    const [trail] = await db.select().from(trails).where(eq(trails.id, id));
    return trail;
  }

  async getFeaturedTrails(): Promise<Trail[]> {
    return db.select().from(trails).where(eq(trails.isFeatured, true));
  }

  async createTrail(trail: InsertTrail): Promise<Trail> {
    const [created] = await db.insert(trails).values(trail).returning();
    return created;
  }

  async searchTrails(query: string): Promise<Trail[]> {
    return db.select().from(trails).where(
      or(
        ilike(trails.name, `%${query}%`),
        ilike(trails.location, `%${query}%`)
      )
    );
  }

  async getIdentifications(userId?: number): Promise<Identification[]> {
    if (userId) {
      return db.select().from(identifications)
        .where(eq(identifications.userId, userId))
        .orderBy(desc(identifications.createdAt));
    }
    return db.select().from(identifications).orderBy(desc(identifications.createdAt));
  }

  async getIdentification(id: number): Promise<Identification | undefined> {
    const [ident] = await db.select().from(identifications).where(eq(identifications.id, id));
    return ident;
  }

  async createIdentification(identification: InsertIdentification): Promise<Identification> {
    const [created] = await db.insert(identifications).values(identification).returning();
    return created;
  }

  async getMarketplaceListings(): Promise<MarketplaceListing[]> {
    return db.select().from(marketplaceListings).where(eq(marketplaceListings.isActive, true));
  }

  async getMarketplaceListing(id: number): Promise<MarketplaceListing | undefined> {
    const [listing] = await db.select().from(marketplaceListings).where(eq(marketplaceListings.id, id));
    return listing;
  }

  async createMarketplaceListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing> {
    const [created] = await db.insert(marketplaceListings).values(listing).returning();
    return created;
  }

  async getTripPlans(userId?: number): Promise<TripPlan[]> {
    if (userId) {
      return db.select().from(tripPlans)
        .where(eq(tripPlans.userId, userId))
        .orderBy(desc(tripPlans.createdAt));
    }
    return db.select().from(tripPlans).orderBy(desc(tripPlans.createdAt));
  }

  async getTripPlan(id: number): Promise<TripPlan | undefined> {
    const [plan] = await db.select().from(tripPlans).where(eq(tripPlans.id, id));
    return plan;
  }

  async createTripPlan(plan: InsertTripPlan): Promise<TripPlan> {
    const [created] = await db.insert(tripPlans).values(plan as any).returning();
    return created;
  }

  async updateTripPlan(id: number, data: Partial<InsertTripPlan>): Promise<TripPlan | undefined> {
    const [updated] = await db.update(tripPlans).set(data as any).where(eq(tripPlans.id, id)).returning();
    return updated;
  }

  async getCampgrounds(): Promise<Campground[]> {
    return db.select().from(campgrounds);
  }

  async getCampground(id: number): Promise<Campground | undefined> {
    const [cg] = await db.select().from(campgrounds).where(eq(campgrounds.id, id));
    return cg;
  }

  async createCampground(campground: InsertCampground): Promise<Campground> {
    const [created] = await db.insert(campgrounds).values(campground).returning();
    return created;
  }

  async getActivityLog(userId: number): Promise<ActivityLog[]> {
    return db.select().from(activityLog)
      .where(eq(activityLog.userId, userId))
      .orderBy(desc(activityLog.createdAt));
  }

  async createActivityLog(entry: InsertActivityLog): Promise<ActivityLog> {
    const [created] = await db.insert(activityLog).values(entry).returning();
    return created;
  }

  async deleteTripPlan(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(tripPlans).where(and(eq(tripPlans.id, id), eq(tripPlans.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteMarketplaceListing(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(marketplaceListings).where(and(eq(marketplaceListings.id, id), eq(marketplaceListings.sellerId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async updateMarketplaceListing(id: number, data: Partial<InsertMarketplaceListing>): Promise<MarketplaceListing | undefined> {
    const [updated] = await db.update(marketplaceListings).set(data as any).where(eq(marketplaceListings.id, id)).returning();
    return updated;
  }

  async getUserMarketplaceListings(userId: number): Promise<MarketplaceListing[]> {
    return db.select().from(marketplaceListings).where(eq(marketplaceListings.sellerId, userId)).orderBy(desc(marketplaceListings.createdAt));
  }

  async getUserStats(userId: number): Promise<{ tripsCount: number; identificationsCount: number; activitiesCount: number; listingsCount: number }> {
    const [trips] = await db.select({ count: count() }).from(tripPlans).where(eq(tripPlans.userId, userId));
    const [idents] = await db.select({ count: count() }).from(identifications).where(eq(identifications.userId, userId));
    const [activities] = await db.select({ count: count() }).from(activityLog).where(eq(activityLog.userId, userId));
    const [listings] = await db.select({ count: count() }).from(marketplaceListings).where(eq(marketplaceListings.sellerId, userId));
    return {
      tripsCount: trips?.count ?? 0,
      identificationsCount: idents?.count ?? 0,
      activitiesCount: activities?.count ?? 0,
      listingsCount: listings?.count ?? 0,
    };
  }

  async searchMarketplaceListings(query: string): Promise<MarketplaceListing[]> {
    return db.select().from(marketplaceListings).where(
      and(
        eq(marketplaceListings.isActive, true),
        or(
          ilike(marketplaceListings.species, `%${query}%`),
          ilike(marketplaceListings.sellerName, `%${query}%`),
          ilike(marketplaceListings.location, `%${query}%`)
        )
      )
    );
  }

  async filterTrails(difficulty?: string, activityType?: string): Promise<Trail[]> {
    const conditions = [];
    if (difficulty) conditions.push(eq(trails.difficulty, difficulty));
    if (activityType) conditions.push(eq(trails.activityType, activityType));
    if (conditions.length === 0) return this.getTrails();
    return db.select().from(trails).where(and(...conditions));
  }

  async getActivityLocations(type?: string): Promise<ActivityLocation[]> {
    if (type) {
      return db.select().from(activityLocations).where(eq(activityLocations.type, type));
    }
    return db.select().from(activityLocations);
  }

  async getActivityLocation(id: number): Promise<ActivityLocation | undefined> {
    const [loc] = await db.select().from(activityLocations).where(eq(activityLocations.id, id));
    return loc;
  }

  async searchActivityLocations(query: string, type?: string): Promise<ActivityLocation[]> {
    const searchConditions = or(
      ilike(activityLocations.name, `%${query}%`),
      ilike(activityLocations.location, `%${query}%`),
      ilike(activityLocations.state, `%${query}%`)
    );
    if (type) {
      return db.select().from(activityLocations).where(and(eq(activityLocations.type, type), searchConditions));
    }
    return db.select().from(activityLocations).where(searchConditions!);
  }

  async createActivityLocation(location: InsertActivityLocation): Promise<ActivityLocation> {
    const [created] = await db.insert(activityLocations).values(location as any).returning();
    return created;
  }

  async getArboristClients(userId: number): Promise<ArboristClient[]> {
    return db.select().from(arboristClients).where(eq(arboristClients.userId, userId)).orderBy(desc(arboristClients.createdAt));
  }

  async getArboristClient(id: number): Promise<ArboristClient | undefined> {
    const [client] = await db.select().from(arboristClients).where(eq(arboristClients.id, id));
    return client;
  }

  async createArboristClient(client: InsertArboristClient): Promise<ArboristClient> {
    const [created] = await db.insert(arboristClients).values(client).returning();
    return created;
  }

  async updateArboristClient(id: number, data: Partial<InsertArboristClient>): Promise<ArboristClient | undefined> {
    const [updated] = await db.update(arboristClients).set(data as any).where(eq(arboristClients.id, id)).returning();
    return updated;
  }

  async deleteArboristClient(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(arboristClients).where(and(eq(arboristClients.id, id), eq(arboristClients.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getArboristJobs(userId: number): Promise<ArboristJob[]> {
    return db.select().from(arboristJobs).where(eq(arboristJobs.userId, userId)).orderBy(desc(arboristJobs.createdAt));
  }

  async getArboristJob(id: number): Promise<ArboristJob | undefined> {
    const [job] = await db.select().from(arboristJobs).where(eq(arboristJobs.id, id));
    return job;
  }

  async createArboristJob(job: InsertArboristJob): Promise<ArboristJob> {
    const [created] = await db.insert(arboristJobs).values(job as any).returning();
    return created;
  }

  async updateArboristJob(id: number, data: Partial<InsertArboristJob>): Promise<ArboristJob | undefined> {
    const [updated] = await db.update(arboristJobs).set(data as any).where(eq(arboristJobs.id, id)).returning();
    return updated;
  }

  async deleteArboristJob(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(arboristJobs).where(and(eq(arboristJobs.id, id), eq(arboristJobs.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getArboristInvoices(userId: number): Promise<ArboristInvoice[]> {
    return db.select().from(arboristInvoices).where(eq(arboristInvoices.userId, userId)).orderBy(desc(arboristInvoices.createdAt));
  }

  async getArboristInvoice(id: number): Promise<ArboristInvoice | undefined> {
    const [invoice] = await db.select().from(arboristInvoices).where(eq(arboristInvoices.id, id));
    return invoice;
  }

  async createArboristInvoice(invoice: InsertArboristInvoice): Promise<ArboristInvoice> {
    const [created] = await db.insert(arboristInvoices).values(invoice as any).returning();
    return created;
  }

  async updateArboristInvoice(id: number, data: Partial<InsertArboristInvoice>): Promise<ArboristInvoice | undefined> {
    const [updated] = await db.update(arboristInvoices).set(data as any).where(eq(arboristInvoices.id, id)).returning();
    return updated;
  }

  async deleteArboristInvoice(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(arboristInvoices).where(and(eq(arboristInvoices.id, id), eq(arboristInvoices.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async updateUserTier(userId: number, tier: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ tier }).where(eq(users.id, userId)).returning();
    return user;
  }

  async getCampgroundBookings(userId: number): Promise<CampgroundBooking[]> {
    return db.select().from(campgroundBookings).where(eq(campgroundBookings.userId, userId)).orderBy(desc(campgroundBookings.createdAt));
  }

  async createCampgroundBooking(data: InsertCampgroundBooking): Promise<CampgroundBooking> {
    const [created] = await db.insert(campgroundBookings).values(data as any).returning();
    return created;
  }

  async updateCampgroundBooking(id: number, data: Partial<InsertCampgroundBooking>): Promise<CampgroundBooking | undefined> {
    const [updated] = await db.update(campgroundBookings).set(data as any).where(eq(campgroundBookings.id, id)).returning();
    return updated;
  }

  async deleteCampgroundBooking(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(campgroundBookings).where(and(eq(campgroundBookings.id, id), eq(campgroundBookings.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
