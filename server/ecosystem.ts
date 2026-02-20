import type { Express, Request, Response } from "express";
import { requireAuth } from "./auth";
import { signToken, generateTrustLayerIdPublic } from "./trustlayer-sso";
import { storage } from "./storage";
import crypto from "crypto";

const DWSC_BASE = "https://dwsc.io";

async function getOrCreateTrustLayerId(userId: number): Promise<{ trustLayerId: string; jwt: string }> {
  const user = await storage.getUser(userId);
  if (!user) throw new Error("User not found");

  let trustLayerId = user.trustLayerId;
  if (!trustLayerId) {
    trustLayerId = generateTrustLayerIdPublic();
    await storage.updateUserTrustLayerId(userId, trustLayerId);
  }

  const jwt = signToken(String(userId), trustLayerId);
  return { trustLayerId, jwt };
}

async function dwscFetch(path: string, options: { jwt?: string; apiKey?: string; method?: string; body?: any } = {}): Promise<any> {
  const url = `${DWSC_BASE}${path}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (options.jwt) headers["Authorization"] = `Bearer ${options.jwt}`;
  if (options.apiKey) headers["x-api-key"] = options.apiKey;

  const fetchOpts: RequestInit = { method: options.method || "GET", headers };
  if (options.body && (options.method === "POST" || options.method === "PATCH")) {
    fetchOpts.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOpts);
  const data = await res.json().catch(() => ({ error: "Invalid response" }));

  if (!res.ok) throw { status: res.status, data };
  return data;
}

function hmacHeaders(body: any = ""): Record<string, string> {
  const apiKey = process.env.TRUSTLAYER_API_KEY;
  const apiSecret = process.env.TRUSTLAYER_API_SECRET;
  if (!apiKey || !apiSecret) throw new Error("Trust Layer API keys not configured");

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyStr = typeof body === "string" ? body : JSON.stringify(body);
  const signature = crypto.createHmac("sha256", apiSecret).update(apiKey + timestamp + bodyStr).digest("hex");

  return {
    "x-blockchain-key": apiKey,
    "x-blockchain-signature": signature,
    "x-blockchain-timestamp": timestamp,
    "Content-Type": "application/json",
  };
}

export function registerEcosystemRoutes(app: Express) {

  // ─── TrustShield (Vendor Verification) ───────────────────────
  app.get("/api/ecosystem/trustshield/score/:projectId", async (req: Request, res: Response) => {
    try {
      const data = await dwscFetch(`/api/guardian/security-scores/${req.params.projectId}`);
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "TrustShield unavailable" });
    }
  });

  app.get("/api/ecosystem/trustshield/tiers", async (_req: Request, res: Response) => {
    try {
      const data = await dwscFetch("/api/guardian/tiers");
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "TrustShield unavailable" });
    }
  });

  app.get("/api/ecosystem/trustshield/certifications", requireAuth, async (req: Request, res: Response) => {
    try {
      const { jwt } = await getOrCreateTrustLayerId(req.userId!);
      const data = await dwscFetch("/api/guardian/certifications", { jwt });
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "TrustShield unavailable" });
    }
  });

  app.post("/api/ecosystem/trustshield/certifications", requireAuth, async (req: Request, res: Response) => {
    try {
      const { jwt } = await getOrCreateTrustLayerId(req.userId!);
      const data = await dwscFetch("/api/guardian/certifications", { jwt, method: "POST", body: req.body });
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "TrustShield unavailable" });
    }
  });

  // ─── Signal (SIG) Payments ───────────────────────────────────
  app.get("/api/ecosystem/sig/tiers", async (_req: Request, res: Response) => {
    try {
      const data = await dwscFetch("/api/presale/tiers");
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "SIG service unavailable" });
    }
  });

  app.get("/api/ecosystem/sig/stats", async (_req: Request, res: Response) => {
    try {
      const data = await dwscFetch("/api/presale/stats");
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "SIG service unavailable" });
    }
  });

  app.post("/api/ecosystem/sig/checkout", requireAuth, async (req: Request, res: Response) => {
    try {
      const { jwt } = await getOrCreateTrustLayerId(req.userId!);
      const user = await storage.getUser(req.userId!);
      const data = await dwscFetch("/api/presale/checkout", {
        jwt,
        method: "POST",
        body: { email: user?.email, amountUsd: req.body.amountUsd },
      });
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "SIG checkout unavailable" });
    }
  });

  app.get("/api/ecosystem/sig/purchases", requireAuth, async (req: Request, res: Response) => {
    try {
      const { jwt } = await getOrCreateTrustLayerId(req.userId!);
      const data = await dwscFetch("/api/presale/my-purchases", { jwt });
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "SIG service unavailable" });
    }
  });

  // ─── Trust Vault (Signal Wallet / On-Chain Balance) ──────────
  app.get("/api/ecosystem/vault/balance", requireAuth, async (req: Request, res: Response) => {
    try {
      const { trustLayerId } = await getOrCreateTrustLayerId(req.userId!);
      const data = await dwscFetch(`/api/signal/balance/${trustLayerId}`);
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "Trust Vault unavailable" });
    }
  });

  app.post("/api/ecosystem/vault/transfer", requireAuth, async (req: Request, res: Response) => {
    try {
      const bodyStr = JSON.stringify(req.body);
      const headers = hmacHeaders(bodyStr);
      const fetchRes = await fetch(`${DWSC_BASE}/api/signal/transfer`, {
        method: "POST",
        headers,
        body: bodyStr,
      });
      const data = await fetchRes.json().catch(() => ({ error: "Invalid response" }));
      if (!fetchRes.ok) return res.status(fetchRes.status).json(data);
      res.json(data);
    } catch (error: any) {
      res.status(502).json({ message: error?.message || "Trust Vault unavailable" });
    }
  });

  app.post("/api/ecosystem/vault/gate", requireAuth, async (req: Request, res: Response) => {
    try {
      const bodyStr = JSON.stringify(req.body);
      const headers = hmacHeaders(bodyStr);
      const fetchRes = await fetch(`${DWSC_BASE}/api/signal/gate`, {
        method: "POST",
        headers,
        body: bodyStr,
      });
      const data = await fetchRes.json().catch(() => ({ error: "Invalid response" }));
      if (!fetchRes.ok) return res.status(fetchRes.status).json(data);
      res.json(data);
    } catch (error: any) {
      res.status(502).json({ message: error?.message || "Trust Vault unavailable" });
    }
  });

  // ─── DW-STAMP (Blockchain Certifications) ────────────────────
  app.post("/api/ecosystem/stamp", requireAuth, async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.DWSTAMP_API_KEY;
      const data = await dwscFetch("/api/stamp/dual", {
        apiKey,
        method: "POST",
        body: {
          ...req.body,
          appId: "verdara",
          appName: "Verdara",
        },
      });
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "DW-STAMP unavailable" });
    }
  });

  app.get("/api/ecosystem/stamp/:stampId", async (req: Request, res: Response) => {
    try {
      const data = await dwscFetch(`/api/stamp/${req.params.stampId}`);
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "DW-STAMP unavailable" });
    }
  });

  app.get("/api/ecosystem/stamps/verdara", async (_req: Request, res: Response) => {
    try {
      const data = await dwscFetch("/api/stamps/app/verdara");
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "DW-STAMP unavailable" });
    }
  });

  // ─── TLID Identity (.tlid Domains) ───────────────────────────
  app.get("/api/ecosystem/tlid/search/:name", async (req: Request, res: Response) => {
    try {
      const data = await dwscFetch(`/api/domains/search/${req.params.name}`);
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "TLID service unavailable" });
    }
  });

  app.get("/api/ecosystem/tlid/stats", async (_req: Request, res: Response) => {
    try {
      const data = await dwscFetch("/api/domains/stats");
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "TLID service unavailable" });
    }
  });

  // ─── Credits System ──────────────────────────────────────────
  app.get("/api/ecosystem/credits/balance", requireAuth, async (req: Request, res: Response) => {
    try {
      const { jwt } = await getOrCreateTrustLayerId(req.userId!);
      const data = await dwscFetch("/api/credits/balance", { jwt });
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "Credits service unavailable" });
    }
  });

  app.get("/api/ecosystem/credits/packages", async (_req: Request, res: Response) => {
    try {
      const data = await dwscFetch("/api/credits/packages");
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "Credits service unavailable" });
    }
  });

  app.get("/api/ecosystem/credits/transactions", requireAuth, async (req: Request, res: Response) => {
    try {
      const { jwt } = await getOrCreateTrustLayerId(req.userId!);
      const data = await dwscFetch("/api/credits/transactions", { jwt });
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "Credits service unavailable" });
    }
  });

  app.post("/api/ecosystem/credits/purchase", requireAuth, async (req: Request, res: Response) => {
    try {
      const { jwt } = await getOrCreateTrustLayerId(req.userId!);
      const data = await dwscFetch("/api/credits/purchase", { jwt, method: "POST", body: req.body });
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "Credits service unavailable" });
    }
  });

  // ─── TrustVault (Media Vault & Creative Platform) ────────────
  const TRUSTVAULT_BASE = "https://trustvault.replit.app";

  async function tvFetch(path: string, jwt: string, options: { method?: string; body?: any } = {}): Promise<any> {
    const url = `${TRUSTVAULT_BASE}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwt}`,
    };
    const fetchOpts: RequestInit = { method: options.method || "GET", headers };
    if (options.body && (options.method === "POST" || options.method === "PUT")) {
      fetchOpts.body = JSON.stringify(options.body);
    }
    const res = await fetch(url, fetchOpts);
    const data = await res.json().catch(() => ({ error: "Invalid response" }));
    if (!res.ok) throw { status: res.status, data };
    return data;
  }

  app.get("/api/trustvault/capabilities", async (_req: Request, res: Response) => {
    try {
      const fetchRes = await fetch(`${TRUSTVAULT_BASE}/api/studio/capabilities`);
      const data = await fetchRes.json();
      res.json(data);
    } catch (error: any) {
      res.status(502).json({ message: "TrustVault unavailable" });
    }
  });

  app.get("/api/trustvault/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const { jwt } = await getOrCreateTrustLayerId(req.userId!);
      const data = await tvFetch("/api/studio/status", jwt);
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "TrustVault unavailable" });
    }
  });

  app.get("/api/trustvault/media", requireAuth, async (req: Request, res: Response) => {
    try {
      const { jwt } = await getOrCreateTrustLayerId(req.userId!);
      const { category, page, limit } = req.query;
      const qs = new URLSearchParams();
      if (category) qs.set("category", category as string);
      if (page) qs.set("page", page as string);
      if (limit) qs.set("limit", limit as string);
      const data = await tvFetch(`/api/studio/media/list?${qs.toString()}`, jwt);
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "TrustVault unavailable" });
    }
  });

  app.get("/api/trustvault/media/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { jwt } = await getOrCreateTrustLayerId(req.userId!);
      const data = await tvFetch(`/api/studio/media/${req.params.id}`, jwt);
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "TrustVault unavailable" });
    }
  });

  app.post("/api/trustvault/media/upload", requireAuth, async (req: Request, res: Response) => {
    try {
      const { jwt } = await getOrCreateTrustLayerId(req.userId!);
      const data = await tvFetch("/api/studio/media/upload", jwt, { method: "POST", body: req.body });
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "TrustVault unavailable" });
    }
  });

  app.post("/api/trustvault/media/confirm", requireAuth, async (req: Request, res: Response) => {
    try {
      const { jwt } = await getOrCreateTrustLayerId(req.userId!);
      const data = await tvFetch("/api/studio/media/confirm", jwt, { method: "POST", body: req.body });
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "TrustVault unavailable" });
    }
  });

  app.post("/api/trustvault/projects/create", requireAuth, async (req: Request, res: Response) => {
    try {
      const { jwt } = await getOrCreateTrustLayerId(req.userId!);
      const data = await tvFetch("/api/studio/projects/create", jwt, { method: "POST", body: req.body });
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "TrustVault unavailable" });
    }
  });

  app.get("/api/trustvault/projects/:id/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const { jwt } = await getOrCreateTrustLayerId(req.userId!);
      const data = await tvFetch(`/api/studio/projects/${req.params.id}/status`, jwt);
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "TrustVault unavailable" });
    }
  });

  app.post("/api/trustvault/projects/:id/export", requireAuth, async (req: Request, res: Response) => {
    try {
      const { jwt } = await getOrCreateTrustLayerId(req.userId!);
      const data = await tvFetch(`/api/studio/projects/${req.params.id}/export`, jwt, { method: "POST", body: req.body });
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "TrustVault unavailable" });
    }
  });

  app.post("/api/trustvault/editor/embed-token", requireAuth, async (req: Request, res: Response) => {
    try {
      const { jwt } = await getOrCreateTrustLayerId(req.userId!);
      const data = await tvFetch("/api/studio/editor/embed-token", jwt, { method: "POST", body: req.body });
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "TrustVault unavailable" });
    }
  });

  app.post("/api/trustvault/webhook", async (req: Request, res: Response) => {
    try {
      const { event, projectId, status, downloadUrl, outputMediaId, error: errMsg } = req.body;
      console.log(`[TrustVault Webhook] ${event} — project ${projectId} — status: ${status}`);
      if (event === "render.complete") {
        console.log(`[TrustVault] Render complete: mediaId=${outputMediaId}, url=${downloadUrl}`);
      }
      if (event === "render.failed") {
        console.error(`[TrustVault] Render failed: ${errMsg}`);
      }
      res.json({ received: true });
    } catch {
      res.status(200).json({ received: true });
    }
  });

  // ─── Ecosystem Widget Data ───────────────────────────────────
  app.get("/api/ecosystem/widget-data", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      const data = await dwscFetch("/api/ecosystem/widget-data", {
        jwt: authHeader?.replace("Bearer ", ""),
      });
      res.json(data);
    } catch (error: any) {
      res.status(error?.status || 502).json(error?.data || { message: "Ecosystem service unavailable" });
    }
  });
}
