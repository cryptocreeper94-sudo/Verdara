import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { registerAuthRoutes, requireAuth } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  registerAuthRoutes(app);

  app.get("/api/trails", async (_req, res) => {
    try {
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

  app.get("/api/marketplace", async (_req, res) => {
    try {
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

  app.get("/api/user/activity", requireAuth, async (req, res) => {
    try {
      const activity = await storage.getActivityLog(req.userId!);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  return httpServer;
}
