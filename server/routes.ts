import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { registerAuthRoutes, requireAuth } from "./auth";
import { insertTripPlanSchema, insertMarketplaceListingSchema, insertActivityLogSchema, insertArboristClientSchema, insertArboristJobSchema, insertArboristInvoiceSchema, insertCampgroundBookingSchema, insertCatalogLocationSchema, insertLocationSubmissionSchema } from "@shared/schema";
import Stripe from "stripe";

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

  app.get("/api/stats", async (req, res) => {
    try {
      const [trails, campgrounds, listings, activities] = await Promise.all([
        storage.getTrails(),
        storage.getCampgrounds(),
        storage.getMarketplaceListings(),
        storage.getActivityLocations(),
      ]);
      res.json({
        trails: trails.length,
        campgrounds: campgrounds.length,
        listings: listings.length,
        activityLocations: activities.length,
        totalFeatures: 138,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
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

      const { species, grade, dimensions, pricePerBf, location, description, image } = req.body;
      if (!species || !grade || !dimensions || !pricePerBf || typeof pricePerBf !== "number" || pricePerBf <= 0) {
        return res.status(400).json({ message: "Species, grade, dimensions, and a positive price are required" });
      }

      const listingData = {
        species,
        grade,
        dimensions,
        pricePerBf,
        location: location || null,
        description: description || null,
        image: image || null,
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
      const id = parseInt(req.params.id as string);
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
      const id = parseInt(req.params.id as string);
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
      const id = parseInt(req.params.id as string);
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

  // Activity Locations routes
  app.get("/api/activities", async (req, res) => {
    try {
      const { type, q } = req.query;
      if (q && typeof q === "string") {
        const locations = await storage.searchActivityLocations(q, type as string | undefined);
        return res.json(locations);
      }
      const locations = await storage.getActivityLocations(type as string | undefined);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching activity locations:", error);
      res.status(500).json({ message: "Failed to fetch activity locations" });
    }
  });

  app.get("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid location ID" });
      const location = await storage.getActivityLocation(id);
      if (!location) return res.status(404).json({ message: "Location not found" });
      res.json(location);
    } catch (error) {
      console.error("Error fetching activity location:", error);
      res.status(500).json({ message: "Failed to fetch activity location" });
    }
  });

  // Arborist Client routes
  app.get("/api/arborist/clients", requireAuth, async (req, res) => {
    try {
      const clients = await storage.getArboristClients(req.userId!);
      res.json(clients);
    } catch (error) {
      console.error("Error fetching arborist clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.post("/api/arborist/clients", requireAuth, async (req, res) => {
    try {
      const parsed = insertArboristClientSchema.safeParse({ ...req.body, userId: req.userId! });
      if (!parsed.success) return res.status(400).json({ message: "Invalid client data", errors: parsed.error.flatten().fieldErrors });
      const client = await storage.createArboristClient(parsed.data);
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating arborist client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.patch("/api/arborist/clients/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid client ID" });
      const existing = await storage.getArboristClient(id);
      if (!existing || existing.userId !== req.userId!) return res.status(404).json({ message: "Client not found" });
      const { name, email, phone, address, notes } = req.body;
      const updated = await storage.updateArboristClient(id, { name, email, phone, address, notes });
      res.json(updated);
    } catch (error) {
      console.error("Error updating arborist client:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/arborist/clients/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid client ID" });
      const deleted = await storage.deleteArboristClient(id, req.userId!);
      if (!deleted) return res.status(404).json({ message: "Client not found or unauthorized" });
      res.json({ message: "Client deleted" });
    } catch (error) {
      console.error("Error deleting arborist client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Arborist Job routes
  app.get("/api/arborist/jobs", requireAuth, async (req, res) => {
    try {
      const jobs = await storage.getArboristJobs(req.userId!);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching arborist jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post("/api/arborist/jobs", requireAuth, async (req, res) => {
    try {
      const parsed = insertArboristJobSchema.safeParse({ ...req.body, userId: req.userId!, status: "scheduled" });
      if (!parsed.success) return res.status(400).json({ message: "Invalid job data", errors: parsed.error.flatten().fieldErrors });
      const job = await storage.createArboristJob(parsed.data);
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating arborist job:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.patch("/api/arborist/jobs/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid job ID" });
      const existing = await storage.getArboristJob(id);
      if (!existing || existing.userId !== req.userId!) return res.status(404).json({ message: "Job not found" });
      const { title, clientId, description, status, scheduledDate, completedDate, crew, estimatedCost, actualCost, notes } = req.body;
      const updated = await storage.updateArboristJob(id, { title, clientId, description, status, scheduledDate, completedDate, crew, estimatedCost, actualCost, notes });
      res.json(updated);
    } catch (error) {
      console.error("Error updating arborist job:", error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  app.delete("/api/arborist/jobs/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid job ID" });
      const deleted = await storage.deleteArboristJob(id, req.userId!);
      if (!deleted) return res.status(404).json({ message: "Job not found or unauthorized" });
      res.json({ message: "Job deleted" });
    } catch (error) {
      console.error("Error deleting arborist job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Arborist Invoice routes
  app.get("/api/arborist/invoices", requireAuth, async (req, res) => {
    try {
      const invoices = await storage.getArboristInvoices(req.userId!);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching arborist invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/arborist/invoices", requireAuth, async (req, res) => {
    try {
      const { clientId, jobId, items, dueDate, notes, tax } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "At least one invoice item is required" });
      }
      for (const item of items) {
        if (!item.description || typeof item.quantity !== "number" || typeof item.unitPrice !== "number") {
          return res.status(400).json({ message: "Each item must have description, quantity (number), and unitPrice (number)" });
        }
      }
      const subtotal = items.reduce((sum: number, item: { quantity: number; unitPrice: number }) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = typeof tax === "number" ? tax : 0;
      const total = subtotal + taxAmount;
      const invoiceCount = (await storage.getArboristInvoices(req.userId!)).length;
      const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, "0")}`;

      const parsed = insertArboristInvoiceSchema.safeParse({
        userId: req.userId!,
        clientId: clientId || null,
        jobId: jobId || null,
        invoiceNumber,
        status: "draft",
        items,
        subtotal,
        tax: taxAmount,
        total,
        dueDate: dueDate || null,
        paidDate: null,
        notes: notes || null,
      });
      if (!parsed.success) return res.status(400).json({ message: "Invalid invoice data", errors: parsed.error.flatten().fieldErrors });
      const invoice = await storage.createArboristInvoice(parsed.data);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating arborist invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.patch("/api/arborist/invoices/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid invoice ID" });
      const existing = await storage.getArboristInvoice(id);
      if (!existing || existing.userId !== req.userId!) return res.status(404).json({ message: "Invoice not found" });
      const { status, dueDate, paidDate, notes } = req.body;
      const updated = await storage.updateArboristInvoice(id, { status, dueDate, paidDate, notes });
      res.json(updated);
    } catch (error) {
      console.error("Error updating arborist invoice:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.delete("/api/arborist/invoices/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid invoice ID" });
      const deleted = await storage.deleteArboristInvoice(id, req.userId!);
      if (!deleted) return res.status(404).json({ message: "Invoice not found or unauthorized" });
      res.json({ message: "Invoice deleted" });
    } catch (error) {
      console.error("Error deleting arborist invoice:", error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Campground Booking routes
  app.get("/api/bookings", requireAuth, async (req, res) => {
    try {
      const bookings = await storage.getCampgroundBookings(req.userId!);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", requireAuth, async (req, res) => {
    try {
      const parsed = insertCampgroundBookingSchema.safeParse({ ...req.body, userId: req.userId! });
      if (!parsed.success) return res.status(400).json({ message: "Invalid booking data", errors: parsed.error.flatten().fieldErrors });
      const booking = await storage.createCampgroundBooking(parsed.data);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid booking ID" });
      const bookings = await storage.getCampgroundBookings(req.userId!);
      const existing = bookings.find(b => b.id === id);
      if (!existing) return res.status(404).json({ message: "Booking not found" });
      const updated = await storage.updateCampgroundBooking(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  app.delete("/api/bookings/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid booking ID" });
      const deleted = await storage.deleteCampgroundBooking(id, req.userId!);
      if (!deleted) return res.status(404).json({ message: "Booking not found or unauthorized" });
      res.json({ message: "Booking deleted" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  // Catalog Locations routes
  app.get("/api/catalog", async (req, res) => {
    try {
      const { type, state, activity, species, featured, limit, offset, q } = req.query;
      if (q && typeof q === "string") {
        const locations = await storage.searchCatalogLocations(q, type as string | undefined, state as string | undefined);
        return res.json(locations);
      }
      const locations = await storage.getCatalogLocations({
        type: type as string | undefined,
        state: state as string | undefined,
        activity: activity as string | undefined,
        species: species as string | undefined,
        featured: featured === "true",
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(locations);
    } catch (error) {
      console.error("Error fetching catalog locations:", error);
      res.status(500).json({ message: "Failed to fetch catalog locations" });
    }
  });

  app.get("/api/catalog/count", async (req, res) => {
    try {
      const { type } = req.query;
      const count = await storage.getCatalogLocationCount(type as string | undefined);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching catalog count:", error);
      res.status(500).json({ message: "Failed to fetch count" });
    }
  });

  app.get("/api/catalog/nearby", async (req, res) => {
    try {
      const { lat, lng, radius, type, limit } = req.query;
      if (!lat || !lng) return res.status(400).json({ message: "lat and lng are required" });
      const latNum = parseFloat(lat as string);
      const lngNum = parseFloat(lng as string);
      const radiusNum = Math.min(Math.max(radius ? parseFloat(radius as string) : 50, 1), 500);
      const limitNum = Math.min(Math.max(limit ? parseInt(limit as string) : 50, 1), 100);
      if (isNaN(latNum) || isNaN(lngNum)) return res.status(400).json({ message: "Invalid coordinates" });
      if (isNaN(radiusNum) || isNaN(limitNum)) return res.status(400).json({ message: "Invalid radius or limit" });
      const locations = await storage.searchCatalogByProximity(latNum, lngNum, radiusNum, type as string | undefined, limitNum);
      res.json(locations);
    } catch (error) {
      console.error("Error searching nearby locations:", error);
      res.status(500).json({ message: "Failed to search nearby locations" });
    }
  });

  app.get("/api/catalog/slug/:slug", async (req, res) => {
    try {
      const location = await storage.getCatalogLocationBySlug(req.params.slug);
      if (!location) return res.status(404).json({ message: "Location not found" });
      res.json(location);
    } catch (error) {
      console.error("Error fetching catalog location:", error);
      res.status(500).json({ message: "Failed to fetch location" });
    }
  });

  app.get("/api/catalog/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid location ID" });
      const location = await storage.getCatalogLocation(id);
      if (!location) return res.status(404).json({ message: "Location not found" });
      res.json(location);
    } catch (error) {
      console.error("Error fetching catalog location:", error);
      res.status(500).json({ message: "Failed to fetch location" });
    }
  });

  app.post("/api/catalog", requireAuth, async (req, res) => {
    try {
      const parsed = insertCatalogLocationSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid location data", errors: parsed.error.flatten().fieldErrors });
      const location = await storage.createCatalogLocation(parsed.data);
      res.status(201).json(location);
    } catch (error) {
      console.error("Error creating catalog location:", error);
      res.status(500).json({ message: "Failed to create location" });
    }
  });

  app.patch("/api/catalog/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid location ID" });
      const updated = await storage.updateCatalogLocation(id, req.body);
      if (!updated) return res.status(404).json({ message: "Location not found" });
      res.json(updated);
    } catch (error) {
      console.error("Error updating catalog location:", error);
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  app.delete("/api/catalog/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid location ID" });
      const deleted = await storage.deleteCatalogLocation(id);
      if (!deleted) return res.status(404).json({ message: "Location not found" });
      res.json({ message: "Location deleted" });
    } catch (error) {
      console.error("Error deleting catalog location:", error);
      res.status(500).json({ message: "Failed to delete location" });
    }
  });

  // Location Submissions routes
  app.get("/api/submissions", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const submissions = await storage.getLocationSubmissions(status as string | undefined);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.post("/api/submissions", requireAuth, async (req, res) => {
    try {
      const parsed = insertLocationSubmissionSchema.safeParse({ ...req.body, userId: req.userId! });
      if (!parsed.success) return res.status(400).json({ message: "Invalid submission data", errors: parsed.error.flatten().fieldErrors });
      const submission = await storage.createLocationSubmission(parsed.data);
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  app.patch("/api/submissions/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid submission ID" });
      const updated = await storage.updateLocationSubmission(id, req.body);
      if (!updated) return res.status(404).json({ message: "Submission not found" });
      res.json(updated);
    } catch (error) {
      console.error("Error updating submission:", error);
      res.status(500).json({ message: "Failed to update submission" });
    }
  });

  // Stripe subscription route
  app.post("/api/subscriptions/create-checkout", requireAuth, async (req, res) => {
    try {
      if (!stripe) return res.status(503).json({ message: "Payment processing is not configured" });
      const { tier } = req.body;
      const tierConfig: Record<string, { name: string; priceInCents: number; interval: "month" | "year" }> = {
        "outdoor_explorer": { name: "Outdoor Explorer", priceInCents: 1999, interval: "year" },
        "craftsman_pro": { name: "Craftsman Pro", priceInCents: 2999, interval: "year" },
        "arborist_starter": { name: "Arborist Pro - Starter", priceInCents: 4900, interval: "month" },
        "arborist_business": { name: "Arborist Pro - Business", priceInCents: 9900, interval: "month" },
        "arborist_enterprise": { name: "Arborist Pro - Enterprise", priceInCents: 19900, interval: "month" },
      };
      const config = tierConfig[tier];
      if (!config) return res.status(400).json({ message: "Invalid subscription tier" });

      const host = req.headers.host || "localhost:5000";
      const protocol = req.headers["x-forwarded-proto"] === "https" ? "https" : (host.includes("localhost") ? "http" : "https");
      const baseUrl = `${protocol}://${host}`;

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: { name: `Verdara ${config.name}` },
            unit_amount: config.priceInCents,
            recurring: { interval: config.interval },
          },
          quantity: 1,
        }],
        metadata: { userId: req.userId!.toString(), tier: config.name },
        success_url: `${baseUrl}/dashboard?subscription=success`,
        cancel_url: `${baseUrl}/dashboard?subscription=cancelled`,
      });
      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating subscription checkout:", error);
      res.status(500).json({ message: "Failed to create subscription checkout" });
    }
  });

  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("STRIPE_SECRET_KEY not set - Stripe checkout disabled");
  }

  const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

  // Stripe webhook endpoint - no auth middleware since Stripe sends directly
  app.post("/api/webhooks/stripe", async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Stripe is not configured" });
    }

    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    try {
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(
          req.rawBody as Buffer,
          sig,
          webhookSecret
        );
      } else {
        // TODO: Configure STRIPE_WEBHOOK_SECRET for production signature verification
        event = req.body as Stripe.Event;
      }
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          const tier = session.metadata?.tier;
          if (userId && tier) {
            await storage.updateUserTier(parseInt(userId), tier);
            console.log(`Updated user ${userId} tier to ${tier}`);
          }
          break;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const customerIdDel = subscription.customer as string;
          if (customerIdDel) {
            const sessions = await stripe.checkout.sessions.list({
              customer: customerIdDel,
              limit: 1,
            });
            const lastSession = sessions.data[0];
            const userId = lastSession?.metadata?.userId;
            if (userId) {
              await storage.updateUserTier(parseInt(userId), "Free Explorer");
              console.log(`Reset user ${userId} tier to Free Explorer (subscription deleted)`);
            }
          }
          break;
        }
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          const customerIdUpd = subscription.customer as string;
          if (customerIdUpd) {
            const sessions = await stripe.checkout.sessions.list({
              customer: customerIdUpd,
              limit: 1,
            });
            const lastSession = sessions.data[0];
            const userId = lastSession?.metadata?.userId;
            const tier = lastSession?.metadata?.tier;
            if (userId && tier) {
              await storage.updateUserTier(parseInt(userId), tier);
              console.log(`Updated user ${userId} tier to ${tier} (subscription updated)`);
            }
          }
          break;
        }
        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook event:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  app.post("/api/checkout/create-session", requireAuth, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment processing is not configured" });
      }

      const { listingId, quantity } = req.body;
      if (!listingId || !quantity || quantity < 1) {
        return res.status(400).json({ message: "Listing ID and quantity are required" });
      }

      const listing = await storage.getMarketplaceListing(listingId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      const unitAmountCents = Math.round(listing.pricePerBf * 100);
      if (unitAmountCents < 50) {
        return res.status(400).json({ message: "Price too low for payment processing (minimum $0.50)" });
      }
      const host = req.headers.host || "localhost:5000";
      const protocol = req.headers["x-forwarded-proto"] === "https" ? "https" : (host.includes("localhost") ? "http" : "https");
      const baseUrl = `${protocol}://${host}`;

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${listing.species} - ${listing.grade} Grade`,
                description: `${listing.dimensions} | Seller: ${listing.sellerName}${listing.location ? ` | ${listing.location}` : ""}`,
              },
              unit_amount: unitAmountCents,
            },
            quantity,
          },
        ],
        metadata: {
          listingId: listing.id.toString(),
          buyerId: req.userId!.toString(),
          sellerId: (listing.sellerId ?? "").toString(),
        },
        success_url: `${baseUrl}/marketplace?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/marketplace?checkout=cancelled`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.get("/api/checkout/session/:sessionId", requireAuth, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment processing is not configured" });
      }

      const session = await stripe.checkout.sessions.retrieve(req.params.sessionId as string);
      res.json({
        status: session.payment_status,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total,
        currency: session.currency,
        listingId: session.metadata?.listingId,
      });
    } catch (error) {
      console.error("Error retrieving checkout session:", error);
      res.status(500).json({ message: "Failed to retrieve checkout session" });
    }
  });

  return httpServer;
}
