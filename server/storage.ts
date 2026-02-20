import {
  type User, type InsertUser,
  type Trail, type InsertTrail,
  type Identification, type InsertIdentification,
  type MarketplaceListing, type InsertMarketplaceListing,
  type TripPlan, type InsertTripPlan,
  type Campground, type InsertCampground,
  type ActivityLog, type InsertActivityLog,
  type Session,
  users, trails, identifications, marketplaceListings,
  tripPlans, campgrounds, activityLog, sessions
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or, lt } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
