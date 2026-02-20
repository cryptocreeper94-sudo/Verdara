# Verdara - AI-Powered Outdoor Recreation Super-App

## Overview
Verdara is a comprehensive AI-powered outdoor recreation super-app by DarkWave Studios. It combines nature identification, outdoor activities suite, arborist business management, wood economy marketplace, trip planning, and more. Full 138-feature roadmap documented in attached_assets/.

## Current State
Phase 8: Location Catalog - All 18 categories with dedicated pages, Stripe subscription webhook for tier updates, Price Compare with affiliate retailer links, DarkWave Weather with live Open-Meteo API data, campground booking system with reservation UI, PWA offline caching via service worker. NEW: Nationwide outdoor location catalog with 125+ verified locations across 41 US states, proximity search by zip code, rich detail pages, and catalog browse/search UI. Affiliate program research document at attached_assets/affiliate-programs.md. GarageBot is an external product (NOT built into Verdara) - will connect via API later.

## Tech Stack
- Frontend: React 18 + TypeScript, Vite, Tailwind CSS, Shadcn UI, Framer Motion, Wouter routing, TanStack React Query
- Backend: Express.js + TypeScript, bcrypt password hashing, cookie-based sessions
- Database: PostgreSQL with Drizzle ORM (active)
- Email: Resend for transactional emails (verification)
- Payments: Stripe Checkout (hosted page redirect) for marketplace purchases
- Auth: Custom email/password (NOT Replit Auth), session tokens, httpOnly secure cookies

## Project Structure
- `client/src/pages/` - 26 screens + auth page: home, explore, identify, trails, track, planner, marketplace, dashboard, admin, auth, fishing, hunting, climbing, public-lands, arborist, survival, conservation, mtb, camping, emobility, winter, watersports, charters, price-compare, catalog, catalog-detail
- `client/src/components/` - Custom components: glass-card, bento-grid, trust-badge, weather-widget, theme-provider, app-layout
- `client/src/hooks/use-auth.ts` - Auth context hook with login/register/logout mutations
- `client/src/lib/mock-data.ts` - Remaining mock data (activity categories, gear lists, weather forecasts)
- `client/public/images/` - Stock photography for all cards and sections (cat-*.jpg for category images)
- `server/auth.ts` - Auth routes: register, login, logout, verify email, resend verification
- `server/email.ts` - Resend email integration for verification emails
- `server/storage.ts` - PostgreSQL storage layer with all CRUD operations
- `server/seed.ts` - Database seeding script with trails, campgrounds, marketplace listings, activity locations (56 entries across 10 types)
- `server/catalog-seed.ts` - Catalog seeding with 125 real US outdoor locations across 41 states (national parks, state parks, fishing, hunting, climbing, camping, MTB, watersports, winter sports, e-mobility, charters, public lands, conservation)
- `shared/schema.ts` - Drizzle ORM schema: users, sessions, trails, campgrounds, marketplaceListings, tripPlans, identifications, activityLog, activityLocations, arboristClients, arboristJobs, arboristInvoices, catalogLocations, locationSubmissions, campgroundBookings

## Authentication
- Custom email/password auth (NOT Replit Auth)
- Password requirements: 8+ chars, 1 capital letter, 1 special character (ecosystem-wide standard)
- Registration captures: first name, last name, email, password
- Resend email verification with 24-hour token expiry
- Session tokens stored in httpOnly secure cookies (sameSite: strict)
- SSO connection to Trust Layer ecosystem planned for future

## Design System
- Color palette: Emerald (#10b981), Slate (#64748b), Amber (#f59e0b), Forest Dark (#065f46)
- Dark mode default with earthy green tones
- Glassmorphism cards with backdrop blur
- Bento grid layouts
- Framer Motion animations
- Mobile-first: bottom tab nav on mobile (5 items max), sidebar on desktop (8 items)

## Screens
1. **Homepage** (`/`) - Hero, activity bento grid, featured trails carousel, weather widget, app feature stats
2. **Explore Command Center** (`/explore`) - All 138 features organized into 18 categories with photos, search, expandable feature lists. Each category links to its dedicated page.
3. **AI Identification** (`/identify`) - Upload zone, analyzing animation, species results with accordion
4. **Trail Discovery** (`/trails`) - Map placeholder, filters, trail cards grid with search/sort, GPS tracking buttons
5. **GPS Trail Tracker** (`/track/:id`) - Permission gate, live position, distance from trailhead/to trail end, elevation profile, waypoints, pace/ETA, trail conditions
6. **Trip Planner** (`/planner`) - Route builder, gear checklist accordion, weather forecast, campground booking
7. **Wood Marketplace** (`/marketplace`) - Product listings with TrustShield badges, trust scores, escrow
8. **User Dashboard** (`/dashboard`) - Profile, stats charts, activity feed, saved collections
9. **Owner Dashboard** (`/admin`) - Business tools (analytics, marketing, revenue, user mgmt, TrustShield, infrastructure, API) + all user features. Desktop sidebar only.
10. **Fishing** (`/fishing`) - Fishing spot database with search, state filter, species badges, regulations
11. **Hunting** (`/hunting`) - Hunting area database with search, state filter, species/tags, regulations
12. **Climbing** (`/climbing`) - Climbing area database with search, state filter, route grades, styles
13. **Public Lands** (`/public-lands`) - Parks, forests, WMAs with search, state filter, designation info
14. **Mountain Biking** (`/mtb`) - MTB trails and bike parks with trail types, lift-served badges
15. **Camping** (`/camping`) - Campgrounds with site counts, amenities, reservability
16. **Electric Mobility** (`/emobility`) - E-bike trails, charging stations, vehicle type badges
17. **Winter Sports** (`/winter`) - Ski resorts, backcountry zones with vertical drop, snowfall info
18. **Water Sports** (`/watersports`) - Kayak launches, SUP spots, rafting sections with water type badges
19. **Charters** (`/charters`) - Charter fishing/hunting with max passengers, charter type badges
20. **Price Compare** (`/price-compare`) - Gear price comparison tool with category cards (coming soon)
21. **Arborist Pro** (`/arborist`) - Client management, job scheduling, invoice creation (full CRUD)
22. **Survival Hub** (`/survival`) - Skills library, emergency checklists, first aid content
23. **Conservation** (`/conservation`) - Organization directory, educational content

## Navigation
- **Mobile (bottom tabs, 5 max):** Home, Explore, Trails, Market, Profile
- **Desktop (sidebar, 9 items):** Home, Explore, Identify, Trails, Planner, Market, Profile, Arborist, Admin
- Admin and Arborist links use amber highlight; all others use emerald
- All activity pages accessible from Explore Command Center

## Feature Categories (138 total across 18 categories)
- AI Nature ID (11), Hiking (7), Mountain Biking (5), Rock Climbing (6), Camping (6), Fishing (5), Hunting (6), Electric Mobility (8), Winter Sports (5), Water Sports (5), Public Lands (8), Arborist Pro (15), Wood Marketplace (12), Trip Planning (10), Charters (8), Survival Hub (7), Conservation (6), Price Compare (8)

## User Preferences
- Photorealistic images on every card (no gray placeholders)
- Earthy outdoor color palette (no cyan/lavender)
- 60fps animations
- Mobile-first responsive design
- No "Active Users" count on hero (app is new, use feature stats instead)
- GPS tracking requires permission gate before accessing location
