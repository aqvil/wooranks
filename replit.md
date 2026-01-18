# SiteAudit.io - Website Analysis Tool

## Overview

SiteAudit.io is a website analysis tool that provides comprehensive SEO, performance, security, and mobile responsiveness audits. Users enter a URL, and the system fetches the page, analyzes various factors, calculates scores, and generates actionable reports stored in a PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **Animations**: Framer Motion for smooth transitions and progress animations
- **Build Tool**: Vite with custom plugins for Replit integration

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/` (Home, Report, NotFound)
- Reusable components in `client/src/components/`
- Custom hooks in `client/src/hooks/` for data fetching and UI logic
- Shared type definitions imported from `@shared/` alias

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: REST endpoints under `/api/` prefix
- **Validation**: Zod schemas shared between frontend and backend via `@shared/routes.ts`

Key endpoints:
- `POST /api/analyze` - Analyze a URL and create a report
- `GET /api/reports` - List recent reports
- `GET /api/reports/:id` - Get a specific report

The analysis engine uses Cheerio for HTML parsing to check SEO factors like title tags, meta descriptions, heading structure, canonical URLs, and more.

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Managed via `drizzle-kit push` command

The main `reports` table stores:
- URL analyzed
- Individual scores (SEO, performance, security, mobile)
- Overall score
- Detailed check results as JSONB
- Creation timestamp

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts` - Database schema and TypeScript types
- `routes.ts` - API route definitions with Zod validation schemas

This ensures type safety across the full stack and prevents API contract drift.

### Build System
- Development: Vite dev server with HMR proxied through Express
- Production: Custom build script (`script/build.ts`) that:
  - Bundles frontend with Vite
  - Bundles server with esbuild (selective dependency bundling for faster cold starts)
  - Outputs to `dist/` directory

## External Dependencies

### Database
- **PostgreSQL**: Required, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema management and queries
- **connect-pg-simple**: Session storage (available but may not be actively used)

### Web Scraping
- **Cheerio**: HTML parsing for analyzing web pages
- **Native Fetch**: HTTP requests to target URLs with 10-second timeout

### UI Libraries
- **Radix UI**: Accessible component primitives (dialogs, tooltips, dropdowns, etc.)
- **Framer Motion**: Animation library for score gauges and transitions
- **Lucide React**: Icon library
- **date-fns**: Date formatting for report timestamps

### Fonts
- Google Fonts: Plus Jakarta Sans, Outfit (loaded via CDN in index.html)