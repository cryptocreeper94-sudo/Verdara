# Verdara - AI-Powered Outdoor Recreation Super-App

## Overview
Verdara is a comprehensive AI-powered outdoor recreation super-app by DarkWave Studios. It combines nature identification, outdoor activities suite, arborist business management, wood economy marketplace, trip planning, and more. Full 138-feature roadmap documented in attached_assets/.

## Current State
Phase 1: Visual Mockup - 9 navigable screens with full design, mock data, and stock images. Transitioning to Phase 2.

## Tech Stack
- Frontend: React 18 + TypeScript, Vite, Tailwind CSS, Shadcn UI, Framer Motion, Wouter routing
- Backend: Express.js + TypeScript (minimal for mockup phase)
- Database: PostgreSQL with Drizzle ORM (not yet active)

## Project Structure
- `client/src/pages/` - 9 screens: home, explore, identify, trails, track, planner, marketplace, dashboard, admin
- `client/src/components/` - Custom components: glass-card, bento-grid, trust-badge, weather-widget, theme-provider, app-layout
- `client/src/lib/mock-data.ts` - All mock data for the visual prototype
- `client/public/images/` - Stock photography for all cards and sections (cat-*.jpg for category images)

## Design System
- Color palette: Emerald (#10b981), Slate (#64748b), Amber (#f59e0b), Forest Dark (#065f46)
- Dark mode default with earthy green tones
- Glassmorphism cards with backdrop blur
- Bento grid layouts
- Framer Motion animations
- Mobile-first: bottom tab nav on mobile (5 items max), sidebar on desktop (8 items)

## Screens
1. **Homepage** (`/`) - Hero, activity bento grid, featured trails carousel, weather widget, app feature stats
2. **Explore Command Center** (`/explore`) - All 138 features organized into 18 categories with photos, search, expandable feature lists
3. **AI Identification** (`/identify`) - Upload zone, analyzing animation, species results with accordion
4. **Trail Discovery** (`/trails`) - Map placeholder, filters, trail cards grid with search/sort, GPS tracking buttons
5. **GPS Trail Tracker** (`/track/:id`) - Permission gate, live position, distance from trailhead/to trail end, elevation profile, waypoints, pace/ETA, trail conditions
6. **Trip Planner** (`/planner`) - Route builder, gear checklist accordion, weather forecast, campground booking
7. **Wood Marketplace** (`/marketplace`) - Product listings with TrustShield badges, trust scores, escrow
8. **User Dashboard** (`/dashboard`) - Profile, stats charts, activity feed, saved collections
9. **Owner Dashboard** (`/admin`) - Business tools (analytics, marketing, revenue, user mgmt, TrustShield, infrastructure, API) + all user features. Desktop sidebar only.

## Navigation
- **Mobile (bottom tabs, 5 max):** Home, Explore, Trails, Market, Profile
- **Desktop (sidebar, 8 items):** Home, Explore, Identify, Trails, Planner, Market, Profile, Admin
- Admin link uses amber highlight; all others use emerald

## Feature Categories (138 total across 18 categories)
- AI Nature ID (11), Hiking (7), Mountain Biking (5), Rock Climbing (6), Camping (6), Fishing (5), Hunting (6), Electric Mobility (8), Winter Sports (5), Water Sports (5), Public Lands (8), Arborist Pro (15), Wood Marketplace (12), Trip Planning (10), Charters (8), Survival Hub (7), Conservation (6), Price Compare (8)

## User Preferences
- Photorealistic images on every card (no gray placeholders)
- Earthy outdoor color palette (no cyan/lavender)
- 60fps animations
- Mobile-first responsive design
- No "Active Users" count on hero (app is new, use feature stats instead)
- GPS tracking requires permission gate before accessing location
