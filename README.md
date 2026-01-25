# Local Run Guide

Prerequisites:
- Node.js (v18+ recommended)
- PostgreSQL (local install or Docker). Ensure a database is accessible
- Git and npm (or yarn)

1) Prepare environment
- Copy the example env: `cp .env.example .env`
- Edit `.env` to set:
  - DATABASE_URL (e.g. `postgres://postgres:password@localhost:5432/wooranks`)
  - PORT (optional, defaults to 5000)

2) Install dependencies
- npm install

3) Run locally (development)
- npm run dev
- Open http://localhost:5000 (or the port you configured)

Notes:
- The app uses a PostgreSQL database. If you don't have Postgres installed locally, you can use Docker to run a Postgres container and map port 5432.
- In development, Vite serves the client and the server runs with tsx.
- For production, build and start the server: `npm run build` followed by `npm run start`.

4) Database setup (optional, if needed)
- If you want to seed or push migrations through drizzle-kit, you can use `npm run db:push` after ensuring your database is accessible.
