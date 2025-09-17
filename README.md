# RacingControl

RacingControl is a Next.js 14 starter for building race-control and strategy tools. It ships with Tailwind CSS, an openf1-powered telemetry API, and seed data for exploring an Australian Grand Prix weekend out of the box.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:3000.

## Environment variables

The application reaches out to [openf1](https://openf1.org/) for race telemetry. No authentication is required, but you can override the base URL if you are proxying or self-hosting the API:

```bash
OPENF1_BASE_URL=https://api.openf1.org/v1
```

Supabase/Postgres migrations and seeds are still included for local tinkering. If you plan to run that database, you can optionally provide the familiar connection variables:

```bash
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

If you prefer to use the anon key instead of the service role, set `SUPABASE_ANON_KEY` instead of `SUPABASE_SERVICE_ROLE_KEY`.

## Database schema

SQL migrations and seed data live under [`supabase/`](./supabase).

- [`supabase/migrations/0001_create_racing_schema.sql`](./supabase/migrations/0001_create_racing_schema.sql) defines tables for teams, drivers, races, sessions, stints, laps, and pit stops.
- [`supabase/seed.sql`](./supabase/seed.sql) inserts a single race weekend (2024 Australian Grand Prix) with representative data across all tables.

You can apply the migration and seed to any Postgres-compatible database. When using the Supabase CLI with a `.env` file that defines `SUPABASE_DB_URL`, run:

```bash
npx supabase db push
npx supabase db seed
```

Alternatively, with `psql` available and a `DATABASE_URL` environment variable:

```bash
npm run db:migrate
npm run db:seed
```

## Scripts

| Command              | Description                                      |
| -------------------- | ------------------------------------------------ |
| `npm run dev`        | Start the Next.js development server.            |
| `npm run build`      | Build the production bundle.                     |
| `npm run start`      | Start the production server.                     |
| `npm run lint`       | Run ESLint with the Next.js configuration.       |
| `npm run db:migrate` | Apply the initial schema using `psql`.           |
| `npm run db:seed`    | Seed the demo Australian Grand Prix data.        |

## Deployment

RacingControl can be deployed to Vercel or any Node-compatible platform. A sample workflow is:

1. **Configure telemetry access** – No credentials are needed for openf1, but if you are proxying the service expose `OPENF1_BASE_URL` in your hosting provider.
2. **(Optional) Prepare Supabase** – If you want to run the demo schema on your own database, create a Supabase project and run the migration and seed from this repo using either `npx supabase db push && npx supabase db seed` or the provided `npm run db:migrate` / `npm run db:seed` scripts.
3. **Install & build** – Use `npm install` followed by `npm run build` as the Build Command. The default Output Directory (`.next`) and Install Command are compatible with Vercel’s defaults.
4. **Launch** – Start the production server with `npm run start` (Vercel handles this automatically) and the application will serve the static pages, API routes, and PDF export endpoint at `/api/races/[id]/summary/pdf`.

Deploying to other platforms follows the same pattern: provide any environment overrides (`OPENF1_BASE_URL`, optional Supabase credentials), run the SQL migration and seed if desired, and execute `npm run build` followed by `npm run start` on the server.

## API endpoints

The API routes proxy openf1 and expose the same data the UI uses:

- `GET /api/races/[id]/summary` returns race metadata, sessions, drivers, stints, pit stops, lap timings, and aggregate metrics for the provided openf1 `race_key`. Filter specific sessions with `?session_type=practice&session_type=race`.
- `GET /api/races/[id]/summary/pdf` renders a downloadable PDF race report based on the summary payload.
- `GET /api/drivers/[id]/lap-deltas` returns per-session lap charts for a driver (identified by `driver_number`). Narrow the dataset with `?year=2024`, `?race_key=1234`, or `?session_key=9158`.

### OpenF1 proxy routes

Every OpenF1 collection is available through a matching `/api/openf1/*` route. These handlers accept the same query parameters as the upstream service and return the JSON payload from `https://api.openf1.org/v1`:

- `GET /api/openf1/car_data`
- `GET /api/openf1/drivers`
- `GET /api/openf1/intervals`
- `GET /api/openf1/laps`
- `GET /api/openf1/location`
- `GET /api/openf1/meetings`
- `GET /api/openf1/overtakes`
- `GET /api/openf1/pit`
- `GET /api/openf1/position`
- `GET /api/openf1/race_control`
- `GET /api/openf1/sessions`
- `GET /api/openf1/session_result`
- `GET /api/openf1/starting_grid`
- `GET /api/openf1/stints`
- `GET /api/openf1/team_radio`
- `GET /api/openf1/weather`

## Project structure

```
.
├── public/              # Static assets
├── src/app/             # App Router entrypoint and pages
├── supabase/            # Database migrations and seed data
├── tailwind.config.ts   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## License

This project is provided for demonstration purposes. Adapt and extend it for your own racing operations tooling.
