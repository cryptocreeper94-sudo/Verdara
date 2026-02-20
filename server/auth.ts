import type { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "./storage";
import { registerSchema, loginSchema } from "@shared/schema";
import { sendVerificationEmail } from "./email";

const SALT_ROUNDS = 12;
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.session_token;
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  storage.getSessionByToken(token).then(session => {
    if (!session || session.expiresAt < new Date()) {
      res.clearCookie("session_token");
      return res.status(401).json({ message: "Session expired" });
    }
    req.userId = session.userId;
    next();
  }).catch(() => {
    res.status(500).json({ message: "Authentication error" });
  });
}

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const { firstName, lastName, email, password } = parsed.data;

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const verificationToken = generateToken();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const user = await storage.createUser({
        firstName,
        lastName,
        email,
        passwordHash,
        verificationToken,
        verificationExpires,
        emailVerified: false,
      });

      await sendVerificationEmail(email, verificationToken, firstName);

      const sessionToken = generateToken();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
      await storage.createSession(user.id, sessionToken, expiresAt);

      res.cookie("session_token", sessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: SESSION_DURATION_MS,
        path: "/",
      });

      return res.status(201).json({
        user: sanitizeUser(user),
        message: "Account created. Please check your email to verify your address.",
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const { email, password } = parsed.data;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const sessionToken = generateToken();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
      await storage.createSession(user.id, sessionToken, expiresAt);

      res.cookie("session_token", sessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: SESSION_DURATION_MS,
        path: "/",
      });

      return res.json({ user: sanitizeUser(user) });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = req.cookies?.session_token;
      if (token) {
        await storage.deleteSession(token);
      }
      res.clearCookie("session_token");
      return res.json({ message: "Logged out" });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({ message: "Logout failed" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({ user: sanitizeUser(user) });
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.get("/api/auth/verify", async (req: Request, res: Response) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.redirect("/?verified=error");
      }

      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res.redirect("/?verified=invalid");
      }

      if (user.verificationExpires && user.verificationExpires < new Date()) {
        return res.redirect("/?verified=expired");
      }

      await storage.updateUser(user.id, {
        emailVerified: true,
        verificationToken: null,
        verificationExpires: null,
      } as any);

      return res.redirect("/?verified=success");
    } catch (error) {
      console.error("Verification error:", error);
      return res.redirect("/?verified=error");
    }
  });

  app.post("/api/auth/resend-verification", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.emailVerified) {
        return res.json({ message: "Email already verified" });
      }

      const verificationToken = generateToken();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await storage.updateUser(user.id, { verificationToken, verificationExpires } as any);
      await sendVerificationEmail(user.email, verificationToken, user.firstName);

      return res.json({ message: "Verification email sent" });
    } catch (error) {
      console.error("Resend verification error:", error);
      return res.status(500).json({ message: "Failed to send verification email" });
    }
  });
}

function sanitizeUser(user: any) {
  const { passwordHash, verificationToken, verificationExpires, ...safe } = user;
  return safe;
}
