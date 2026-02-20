# Verdara - AI-Powered Outdoor Recreation Super-App

## Overview
Verdara is a comprehensive AI-powered outdoor recreation super-app by DarkWave Studios. It combines nature identification, outdoor activities suite, arborist business management, wood economy marketplace, trip planning, and more.

## Current State
Phase 1: Visual Mockup - 7 navigable screens with full design, mock data, and stock images.

## Tech Stack
- Frontend: React 18 + TypeScript, Vite, Tailwind CSS, Shadcn UI, Framer Motion, Wouter routing
- Backend: Express.js + TypeScript (minimal for mockup phase)
- Database: PostgreSQL with Drizzle ORM (not yet active)

## Project Structure
- `client/src/pages/` - 7 main screens: home, identify, trails, track, planner, marketplace, dashboard
- `client/src/components/` - Custom components: glass-card, bento-grid, trust-badge, weather-widget, theme-provider, app-layout
- `client/src/lib/mock-data.ts` - All mock data for the visual prototype
- `client/public/images/` - Stock photography for all cards and sections

## Design System
- Color palette: Emerald (#10b981), Slate (#64748b), Amber (#f59e0b), Forest Dark (#065f46)
- Dark mode default with earthy green tones
- Glassmorphism cards with backdrop blur
- Bento grid layouts
- Framer Motion animations
- Mobile-first: bottom tab nav on mobile, sidebar on desktop

## Screens
1. **Homepage** - Hero, activity bento grid, featured trails carousel, weather widget, app feature stats
2. **AI Identification** - Upload zone, analyzing animation, species results with accordion
3. **Trail Discovery** - Map placeholder, filters, trail cards grid with search/sort, GPS tracking buttons
4. **GPS Trail Tracker** (`/track/:id`) - Live position on trail, distance from trailhead/to trail end, elevation profile, waypoints list, pace/ETA/elapsed stats, trail conditions, pause/resume
5. **Trip Planner** - Route builder, gear checklist accordion, weather forecast, campground booking
6. **Wood Marketplace** - Product listings with TrustShield badges, trust scores, escrow
7. **User Dashboard** - Profile, stats charts, activity feed, saved collections

## User Preferences
- Photorealistic images on every card (no gray placeholders)
- Earthy outdoor color palette (no cyan/lavender)
- 60fps animations
- Mobile-first responsive design
- No "Active Users" count on hero (app is new, use feature stats instead)
