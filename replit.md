# Verdara - AI-Powered Outdoor Recreation Super-App

## Overview
Verdara is an AI-powered outdoor recreation super-app developed by DarkWave Studios. It integrates nature identification, outdoor activity planning and tracking, arborist business management, a wood economy marketplace, and detailed trip planning features. Verdara aims to be a leading platform in the outdoor recreation market, leveraging AI and robust system integrations within the broader DarkWave Trust Layer ecosystem. The project's vision is to become the definitive non-governmental reference for outdoor recreation, wildlife, wild edibles, and natural medicine in the US, with a living catalog strategy to continuously expand its databases. Future revenue streams include a premium downloadable PDF outdoor guide.

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
Verdara is built as part of the DarkWave Trust Layer (DWTL) ecosystem (App #28) using a monolithic React + Node.js codebase hosted on Replit, with host-based routing and PWA implementation.

**UI/UX Decisions:**
- Dark mode default with an earthy green, slate, and amber color palette.
- Utilizes glassmorphism cards, bento grid layouts, and Framer Motion for animations.
- Mobile-first design with bottom tab navigation for mobile and a sidebar for desktop.
- Command Center features rotating cinematic aerial flyover videos as hero content.

**Technical Implementations:**
- **Authentication:** Custom email/password authentication with bcrypt hashing, cookie-based sessions, and Resend for email verification. Trust Layer SSO integrated with JWT-based cross-app authentication (HS256) and Trust Layer IDs (tl-xxxx-xxxx format). Live Trust Layer Hub at `orbitstaffing.io` with ecosystem registration, cross-app SSO login, and federated user registration. Hub credentials stored in `TRUST_LAYER_HUB_API_KEY`, `TRUST_LAYER_HUB_API_SECRET`, and `TRUST_LAYER_HUB_APP_ID` env vars.
- **Data & Storage:** PostgreSQL database managed with Drizzle ORM, including seeding scripts and a living catalog of 167+ US outdoor locations (including 25 Tennessee state parks and national park sites with coffee-table-book quality descriptions, foraging guides, and species data). Tennessee catalog seed in `server/tennessee-catalog-seed.ts`. Catalog content is designed to be print-publish ready for a future outdoor coffee table book.
- **Core Modules:**
    - **Command Center:** Personalized bento grid dashboard.
    - **AI Species Identification:** Integrates OpenAI Vision API (GPT-4o) for identifying trees, plants, fish, and wildlife from photos. Also features audio identification via OpenAI Whisper and GPT-4o for animal sounds.
    - **Catalog:** Nationwide outdoor location catalog with search, browse, detail pages, Leaflet maps, and user reviews.
    - **Campground Booking:** Comprehensive reservation UI.
    - **Marketplace:** Wood economy marketplace with Stripe checkout and seller management.
    - **Arborist Pro:** Client management, job scheduling, and invoicing.
    - **Arbora (App #29):** Standalone PWA at `/arbora/*` for arborist business management, featuring CRM, estimates, job management, invoicing, calendar, crew, and inventory.
    - **Trip Planner:** Route builder, gear checklists, and weather forecasts.
    - **Price Compare:** Template-driven universal comparison engine across 90+ affiliate retailers in 18 categories.
    - **Wild Edibles & Natural Medicine:** Database of wild plants with identification integration.
    - **Signal Chat:** Real-time WebSocket chat with Trust Layer SSO, supporting channel-based messaging and presence.
    - **Developer Portal:** Provides roadmap, affiliate network, and business suite preview.
    - **Evergreen AI Assistant:** Floating AI chatbot (OpenAI GPT-4o-mini) accessible from any page.
    - **Verdara Journal (Blog):** AI-assisted, SEO-optimized blog system with public listing, detail pages, and admin editor.
    - **Diagnostics System:** Comprehensive error tracking with client-side error capture (JS errors, unhandled rejections, network failures), auth interaction tracking (focus/touch/input events on form fields), device info capture (screen size, touch support, connection type, browser), React error boundary, and admin dashboard at `/admin/diagnostics`. Logs stored in `error_logs` table. Frontend tracker at `client/src/lib/error-tracker.ts`.
- **Verdara Specific Tech Stack:**
    - Frontend: React 18 + TypeScript, Vite, Tailwind CSS, Shadcn UI, Framer Motion, Wouter, TanStack React Query.
    - Backend: Express.js + TypeScript.
    - Database: PostgreSQL with Drizzle ORM.
- **Ecosystem Integration:** Verdara is designed for deep integration within the DarkWave Trust Layer (DWTL) ecosystem.
    - **SSO:** Trust Layer JWT SSO for cross-app identity.
    - **TrustShield:** Integration for marketplace vendor verification.
    - **Signal (SIG) Payments:** Acceptance of native cryptocurrency.
    - **GarageBot API:** Server proxy for equipment management in Arborist Pro.
    - **DW-STAMP:** Blockchain certification for major events.
    - **TrustVault:** Server proxy for media gallery, uploads, and project creation, including saving species identification photos.
    - **TLID Identity:** Support for .tlid domain names.
    - **Credits System:** Acceptance of Trust Layer credits for AI identification.
    - **VedaSolus:** Integration with wellness hub for wild edible/medicinal plant data.
    - **TrustHome:** API integration for ecosystem services like species identification and tree removal plans.
- **Subscription Tiers:** Multiple tiers (Free Explorer, Outdoor Explorer, Craftsman Pro, Arborist Starter, Arborist Business, Arborist Enterprise) with feature gating and Stripe Checkout integration.

## External Dependencies
- **Stripe:** Payment processing and subscription management.
- **Resend:** Transactional email delivery (email verification).
- **Open-Meteo API:** Live weather data.
- **OpenAI GPT-4o / GPT-4o-mini:** AI-powered species identification and AI assistant.
- **Firebase Auth:** Planned integration for ecosystem-wide SSO.
- **Coinbase Commerce:** Planned integration for cryptocurrency payments via Signal.
- **garagebot.io:** API for equipment management in Arborist Pro.
- **trustvault.replit.app:** For media management and storage.
- **vedasolus.io:** For wellness hub integration.
- **trusthome.replit.app:** For real estate platform ecosystem services.