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
- **Authentication:** Custom email/password authentication with bcrypt hashing, cookie-based sessions, and Resend for email verification. Future plans include integration with the Trust Layer ecosystem SSO.
- **Data & Storage:** PostgreSQL database managed with Drizzle ORM. Includes seeding scripts for trails, campgrounds, marketplace listings, and a catalog of 125+ real US outdoor locations with proximity search.
- **Core Modules:**
    - **Catalog:** Nationwide outdoor location catalog with search, browse, and detail pages.
    - **Campground Booking:** Comprehensive reservation UI and CRUD operations for bookings.
    - **Marketplace:** Wood economy marketplace with product listings and Stripe checkout integration.
    - **Arborist Pro:** Client management, job scheduling, and invoice creation (full CRUD).
    - **Trip Planner:** Route builder, gear checklists, and weather forecasts.
    - **Price Compare:** Gear price comparison across 62+ affiliate retailers.
    - **Developer Portal:** Provides an 8-phase product roadmap, affiliate network directory, and business suite preview.
- **Verdara Specific Tech Stack:**
    - Frontend: React 18 + TypeScript, Vite, Tailwind CSS, Shadcn UI, Framer Motion, Wouter routing, TanStack React Query.
    - Backend: Express.js + TypeScript.
    - Database: PostgreSQL with Drizzle ORM.

**Ecosystem Integration (Planned):**
- **SSO:** Connection to the Trust Layer ecosystem's Firebase Auth + JWT SSO.
- **TrustShield:** Integration for marketplace vendor verification badges using blockchain.
- **Signal (SIG) Payments:** Acceptance of the native cryptocurrency for marketplace transactions.
- **GarageBot API:** Connection for motorized equipment maintenance tracking.
- **DW-STAMP:** Blockchain certification for activities like trail completions or species identifications.
- **Trust Vault:** Signal wallet integration for in-app purchases.
- **TLID Identity:** Support for .tlid domain names as user identities.
- **Credits System:** Acceptance of Trust Layer credits for AI identification services.

## External Dependencies
- **Stripe:** For payment processing (Stripe Checkout) and subscription management (webhook for tier updates).
- **Resend:** For transactional email delivery, specifically for email verification.
- **Open-Meteo API:** Provides live weather data for the weather widget.
- **OpenAI GPT-4o:** Planned integration for AI-powered features like nature identification.
- **Firebase Auth:** Used by the DarkWave Trust Layer for ecosystem-wide SSO, Verdara plans to integrate.
- **Coinbase Commerce:** Utilized by the DarkWave Trust Layer for cryptocurrency payments, Verdara plans to integrate Signal payments.