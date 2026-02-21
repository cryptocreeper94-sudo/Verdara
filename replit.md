# Verdara - AI-Powered Outdoor Recreation Super-App

## Overview
Verdara is a comprehensive AI-powered outdoor recreation super-app developed by DarkWave Studios. It integrates nature identification, outdoor activity planning and tracking, arborist business management, a wood economy marketplace, and detailed trip planning features. Verdara aims to be a leading platform in the outdoor recreation market, leveraging AI and robust system integrations within the broader DarkWave Trust Layer ecosystem.

## User Preferences
- Photorealistic images on every card (no gray placeholders)
- Earthy outdoor color palette (no cyan/lavender)
- 60fps animations
- Mobile-first responsive design
- No "Active Users" count on hero (app is new, use feature stats instead)
- GPS tracking requires permission gate before accessing location
- Premium everything - "everything should sparkle and shine"
- Simple, everyday language preferred over technical jargon

## System Architecture
Verdara is built as part of the DarkWave Trust Layer (DWTL) ecosystem, functioning as App #28. It leverages a monolithic React + Node.js codebase hosted on Replit, with host-based routing for different experiences. The app features a comprehensive PWA implementation with offline caching via service workers.

**Key Features & Implementations:**
- **UI/UX:** Dark mode default with an earthy green, slate, and amber color palette. Utilizes glassmorphism cards, bento grid layouts, and Framer Motion for animations. Designed mobile-first with a bottom tab navigation for mobile and a sidebar for desktop.
- **Authentication:** Custom email/password authentication with bcrypt hashing, cookie-based sessions, and Resend for email verification. Trust Layer SSO integrated with JWT-based cross-app authentication (HS256, shared JWT_SECRET), Trust Layer IDs (tl-xxxx-xxxx format), and bcryptjs password hashing (12 rounds).
- **Data & Storage:** PostgreSQL database managed with Drizzle ORM. Includes seeding scripts for trails, campgrounds, marketplace listings, and a living catalog of 170+ real US outdoor locations with proximity search. Catalog grows daily with 10-15 new entries.
- **Core Modules:**
    - **Command Center:** Bento grid dashboard with quick actions, featured locations, weather widget, recent activity feed, and activity categories. Personalized entry point for the app.
    - **AI Species Identification:** Real OpenAI Vision API (GPT-4o) integration for identifying trees, plants, fish, and wildlife from camera/upload photos. Returns species name, confidence score, habitat, conservation status, and fun facts.
    - **Catalog:** Nationwide outdoor location catalog with search, browse, detail pages, interactive Leaflet maps, and user reviews/ratings system.
    - **Campground Booking:** Comprehensive reservation UI and CRUD operations for bookings.
    - **Marketplace:** Wood economy marketplace with product listings, enhanced Stripe checkout flow (animated order summary, success/cancelled banners, TrustShield escrow), and seller management.
    - **Arborist Pro:** Client management, job scheduling, and invoice creation (full CRUD).
    - **Arbora (App #29):** Standalone PWA arborist business management suite at /arbora/*. Deep navy (#0f172a) + copper (#c2703e) branded theme with own sidebar layout (ArboraLayout). Features: Dashboard (KPI overview), CRM deal pipeline (new→contacted→qualified→proposal_sent→won/lost), estimates with line items and service types, job management with status tracking, invoicing with dynamic line items, calendar view, crew management with time entries, inventory tracking with low-stock alerts, GarageBot equipment integration. DB tables: arborist_deals, arborist_estimates, arborist_crew_members, arborist_time_entries, arborist_inventory. All routes require Arborist Starter tier. Pages: arbora-dashboard, arbora-clients, arbora-deals, arbora-jobs, arbora-estimates, arbora-invoices, arbora-calendar, arbora-crew, arbora-inventory, arbora-equipment.
    - **Trip Planner:** Route builder, gear checklists, and weather forecasts.
    - **Price Compare:** Template-driven universal comparison engine across 90+ affiliate retailers spanning 18 categories including Knives & Blades (BladeHQ, Benchmade, Spyderco, CRKT, Buck, Ka-Bar, Cold Steel, Kershaw, Zero Tolerance, Helle, We Knife, Civivi) and Firearms & Ammo (Palmetto State Armory, Primary Arms, OpticsPlanet, Guns.com, Buds Gun Shop, Cheaper Than Dirt, EuroOptic, Lucky Gunner, Aero Precision). Categories auto-populate from retailer data — adding a new retailer with new category tags instantly creates the category UI. Accordion sections with expand/collapse, category filter chips, glassmorphism cards.
    - **Wild Edibles & Natural Medicine:** Comprehensive wild plant database with 15+ edible and medicinal plants, historical uses, safety warnings, AI plant identification integration, and VedaSolus wellness hub link. Includes medical disclaimer.
    - **Signal Chat:** Real-time WebSocket chat integrated with Trust Layer SSO. JWT-authenticated WebSocket on /ws/chat, channel-based messaging (general, announcements, app-support channels), typing indicators, presence tracking. Separate auth system (chat_users table) with cross-app SSO compatibility.
    - **Developer Portal:** Provides a 9-phase product roadmap, affiliate network directory, and business suite preview.
    - **Interactive Maps:** Leaflet-based maps on trails page (showing all trail markers across the US) and catalog detail pages (showing individual location).
    - **Verdara Journal (Blog):** AI-assisted SEO-optimized blog system. Public listing page at /blog, detail pages at /blog/:slug, admin editor at /blog/admin with AI content generation via OpenAI GPT-4o. Categories: Lumberjack Sports, Wilderness Skills, Trail Guides, Gear Reviews, Conservation, Wild Edibles, Forestry, Outdoor Education, Safety, Wildlife, Fishing, Camping, Climbing, Water Sports, Winter Sports. Full SEO with structured data (JSON-LD Article schema), meta tags, seo keywords. Database table: blog_posts. DW-STAMP blockchain certification on publish.
- **Verdara Specific Tech Stack:**
    - Frontend: React 18 + TypeScript, Vite, Tailwind CSS, Shadcn UI, Framer Motion, Wouter routing, TanStack React Query.
    - Backend: Express.js + TypeScript.
    - Database: PostgreSQL with Drizzle ORM.

**Ecosystem Integration (Planned):**
- **SSO:** Trust Layer JWT SSO integrated — shared JWT_SECRET across ecosystem apps (HS256), cross-app identity via chat_users.trust_layer_id. Endpoints: /api/chat/auth/register, /api/chat/auth/login, /api/chat/auth/me.
- **TrustShield:** Integration for marketplace vendor verification badges using blockchain.
- **Signal (SIG) Payments:** Acceptance of the native cryptocurrency for marketplace transactions.
- **GarageBot API:** Integrated — server proxy at /api/garagebot/* forwards requests to garagebot.io/api/ecosystem/v1 with Trust Layer JWT auth. Equipment list, details, maintenance alerts, create/update. Equipment tab in Arborist Pro module.
- **DW-STAMP:** Blockchain certification stamped on all major events: marketplace listings, trip plans, arborist invoices, campground bookings, reviews, Stripe checkouts, species IDs, TrustVault uploads/projects. Uses stampToChain() helper from server/ecosystem.ts (async, non-blocking).
- **TrustVault:** Integrated — server proxy at /api/trustvault/* forwards requests to trustvault.replit.app/api/studio with Trust Layer JWT auth. Media gallery page at /vault with upload, browse, embedded editors (image/video/audio), project creation (highlight reels), and webhook receiver at /api/trustvault/webhook. Species identification photos can be saved directly to TrustVault from the identify page. Supports presigned URL upload flow (upload → PUT → confirm).
- **TLID Identity:** Support for .tlid domain names as user identities.
- **Credits System:** Acceptance of Trust Layer credits for AI identification services.
- **VedaSolus (vedasolus.io):** Holistic wellness hub integration — Ayurvedic dosha balancing, TCM (Traditional Chinese Medicine), herbal medicine database, nutrition tracking. Links wild edible/medicinal plant data from Verdara's foraging module into VedaSolus's wellness recommendations.
- **TrustHome:** Real estate platform integration — HMAC-SHA256 authenticated API connection. Verdara provides: species identification (POST /api/ecosystem/identify), tree removal plans (POST /api/ecosystem/removal-plan), property tree assessments (POST /api/ecosystem/assess), species details (GET /api/ecosystem/species/:id), SSO user sync (POST /api/ecosystem/sync-user). Outbound client available via callTrustHome(). Credentials: VERDARA_API_KEY, VERDARA_API_SECRET (generated), TRUSTHOME_API_KEY, TRUSTHOME_API_SECRET, TRUSTHOME_BASE_URL (pending from TrustHome).

**Living Catalog Strategy:**
- Verdara's location and plant databases are designed as living catalogs that grow 10-15 entries per day.
- Goal: Become the definitive non-governmental reference for all things outdoor recreation, wildlife, wild edibles, and natural medicine across the US.
- Target: 5,000+ outdoor locations, 500+ wild plants, comprehensive coverage of all geographic environments.
- All category pages display a "Living Catalog" banner indicating daily updates.
- Service worker cache version must be bumped when replacing images (currently v3).

**Subscription Tiers (Stripe):**
- Free Explorer (level 0): Free — browse catalog, basic trails, community, 3 AI IDs/month
- Outdoor Explorer (level 1): $19.99/yr — unlimited AI ID, trip planner, price compare, wild edibles, TrustVault
- Craftsman Pro (level 2): $29.99/yr — marketplace selling, DW-STAMP certs, priority support
- Arborist Starter (level 3): $49/mo — up to 25 clients, job scheduling, invoicing, GarageBot
- Arborist Business (level 4): $99/mo — unlimited clients, teams, TrustShield badge
- Arborist Enterprise (level 5): $199/mo — white-label, API access, dedicated support
- Pricing page at /pricing with tier comparison cards and Stripe Checkout integration
- Feature gating via requireTier() middleware on server routes (marketplace selling = Craftsman Pro+, arborist tools = Arborist Starter+)
- Stripe Products created with real Price IDs (not inline price_data)
- Webhook handles checkout.session.completed, subscription.deleted, subscription.updated

## External Dependencies
- **Stripe:** For payment processing (Stripe Checkout) and subscription management (webhook for tier updates).
- **Resend:** For transactional email delivery, specifically for email verification.
- **Open-Meteo API:** Provides live weather data for the weather widget.
- **OpenAI GPT-4o:** Planned integration for AI-powered features like nature identification.
- **Firebase Auth:** Used by the DarkWave Trust Layer for ecosystem-wide SSO, Verdara plans to integrate.
- **Coinbase Commerce:** Utilized by the DarkWave Trust Layer for cryptocurrency payments, Verdara plans to integrate Signal payments.