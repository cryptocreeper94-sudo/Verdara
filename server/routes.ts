import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { registerAuthRoutes, requireAuth } from "./auth";
import { insertTripPlanSchema, insertMarketplaceListingSchema, insertActivityLogSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  registerAuthRoutes(app);

  app.get("/api/trails", async (req, res) => {
    try {
      const { difficulty, activityType } = req.query;
      if (difficulty || activityType) {
        const trails = await storage.filterTrails(
          difficulty as string | undefined,
          activityType as string | undefined
        );
        return res.json(trails);
      }
      const trails = await storage.getTrails();
      res.json(trails);
    } catch (error) {
      console.error("Error fetching trails:", error);
      res.status(500).json({ message: "Failed to fetch trails" });
    }
  });

  app.get("/api/trails/featured", async (_req, res) => {
    try {
      const trails = await storage.getFeaturedTrails();
      res.json(trails);
    } catch (error) {
      console.error("Error fetching featured trails:", error);
      res.status(500).json({ message: "Failed to fetch featured trails" });
    }
  });

  app.get("/api/trails/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) return res.json([]);
      const trails = await storage.searchTrails(query);
      res.json(trails);
    } catch (error) {
      console.error("Error searching trails:", error);
      res.status(500).json({ message: "Failed to search trails" });
    }
  });

  app.get("/api/trails/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid trail ID" });
      const trail = await storage.getTrail(id);
      if (!trail) return res.status(404).json({ message: "Trail not found" });
      res.json(trail);
    } catch (error) {
      console.error("Error fetching trail:", error);
      res.status(500).json({ message: "Failed to fetch trail" });
    }
  });

  app.get("/api/marketplace", async (req, res) => {
    try {
      const { q } = req.query;
      if (q && typeof q === "string") {
        const listings = await storage.searchMarketplaceListings(q);
        return res.json(listings);
      }
      const listings = await storage.getMarketplaceListings();
      res.json(listings);
    } catch (error) {
      console.error("Error fetching marketplace:", error);
      res.status(500).json({ message: "Failed to fetch marketplace listings" });
    }
  });

  app.get("/api/marketplace/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid listing ID" });
      const listing = await storage.getMarketplaceListing(id);
      if (!listing) return res.status(404).json({ message: "Listing not found" });
      res.json(listing);
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ message: "Failed to fetch listing" });
    }
  });

  app.post("/api/marketplace", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) return res.status(404).json({ message: "User not found" });

      const listingData = {
        ...req.body,
        sellerId: req.userId!,
        sellerName: `${user.firstName} ${user.lastName}`,
        trustLevel: 1,
        trustScore: 500,
      };

      const listing = await storage.createMarketplaceListing(listingData);

      await storage.createActivityLog({
        userId: req.userId!,
        type: "marketplace",
        title: `Listed ${listing.species} for sale`,
        date: new Date().toLocaleDateString(),
      });

      res.status(201).json(listing);
    } catch (error) {
      console.error("Error creating listing:", error);
      res.status(500).json({ message: "Failed to create listing" });
    }
  });

  app.delete("/api/marketplace/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid listing ID" });
      const deleted = await storage.deleteMarketplaceListing(id, req.userId!);
      if (!deleted) return res.status(404).json({ message: "Listing not found or unauthorized" });
      res.json({ message: "Listing deleted" });
    } catch (error) {
      console.error("Error deleting listing:", error);
      res.status(500).json({ message: "Failed to delete listing" });
    }
  });

  app.get("/api/user/listings", requireAuth, async (req, res) => {
    try {
      const listings = await storage.getUserMarketplaceListings(req.userId!);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching user listings:", error);
      res.status(500).json({ message: "Failed to fetch your listings" });
    }
  });

  app.get("/api/campgrounds", async (_req, res) => {
    try {
      const campgrounds = await storage.getCampgrounds();
      res.json(campgrounds);
    } catch (error) {
      console.error("Error fetching campgrounds:", error);
      res.status(500).json({ message: "Failed to fetch campgrounds" });
    }
  });

  app.get("/api/user/identifications", requireAuth, async (req, res) => {
    try {
      const identifications = await storage.getIdentifications(req.userId!);
      res.json(identifications);
    } catch (error) {
      console.error("Error fetching identifications:", error);
      res.status(500).json({ message: "Failed to fetch identifications" });
    }
  });

  app.get("/api/user/trips", requireAuth, async (req, res) => {
    try {
      const trips = await storage.getTripPlans(req.userId!);
      res.json(trips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      res.status(500).json({ message: "Failed to fetch trips" });
    }
  });

  app.post("/api/user/trips", requireAuth, async (req, res) => {
    try {
      const planData = {
        ...req.body,
        userId: req.userId!,
      };
      const plan = await storage.createTripPlan(planData);

      await storage.createActivityLog({
        userId: req.userId!,
        type: "trail",
        title: `Created trip plan: ${plan.title}`,
        date: new Date().toLocaleDateString(),
      });

      res.status(201).json(plan);
    } catch (error) {
      console.error("Error creating trip:", error);
      res.status(500).json({ message: "Failed to create trip plan" });
    }
  });

  app.patch("/api/user/trips/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid trip ID" });
      const existing = await storage.getTripPlan(id);
      if (!existing || existing.userId !== req.userId!) {
        return res.status(404).json({ message: "Trip not found or unauthorized" });
      }
      const updated = await storage.updateTripPlan(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating trip:", error);
      res.status(500).json({ message: "Failed to update trip plan" });
    }
  });

  app.delete("/api/user/trips/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid trip ID" });
      const deleted = await storage.deleteTripPlan(id, req.userId!);
      if (!deleted) return res.status(404).json({ message: "Trip not found or unauthorized" });
      res.json({ message: "Trip deleted" });
    } catch (error) {
      console.error("Error deleting trip:", error);
      res.status(500).json({ message: "Failed to delete trip plan" });
    }
  });

  app.get("/api/user/activity", requireAuth, async (req, res) => {
    try {
      const activity = await storage.getActivityLog(req.userId!);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  app.post("/api/user/activity", requireAuth, async (req, res) => {
    try {
      const entry = await storage.createActivityLog({
        ...req.body,
        userId: req.userId!,
        date: req.body.date || new Date().toLocaleDateString(),
      });
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ message: "Failed to log activity" });
    }
  });

  app.get("/api/user/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.userId!);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  return httpServer;
}
