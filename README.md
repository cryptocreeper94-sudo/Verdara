# Verdara

Sustainability and environmental services platform — carbon tracking, ESG reporting, green initiative management, and compliance dashboards.

**Live:** [verdara.tlid.io](https://verdara.tlid.io)

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite 7 (Radix UI) |
| Backend | Express + TypeScript |
| Database | PostgreSQL (Drizzle ORM) |
| Auth | Trust Layer SSO |
| Deployment | Render (Ohio) |

## Structure

```
verdara/
├── server/
│   └── routes.ts     # 1,682 lines — API routes
├── client/           # React SPA
├── shared/           # Drizzle schema
└── render.yaml
```

## Development

```bash
npm install
npm run dev
npm run db:push
```
