# Operations Playbook

This document captures the day-to-day operational processes for the Notania platform.

## Content Updates

1. **Source material**: Licensed game metadata is stored in `apps/api/data/games.json`. External providers can deliver CSV/JSON in the same shape.
2. **Ingest pipeline**:
   - Drop raw files into `apps/api/data/ingest/`.
   - Run `pnpm --filter api ingest` to normalize and upsert metadata via Prisma.
   - Validate new entries via `GET /games?category=New%20Releases`.
3. **Quality checks**:
   - Verify hero images and iframe URLs load in staging.
   - Confirm ESRB/age ratings are attached when required.

## Moderation Workflow

1. Monitor `apps/api/logs/moderation.log` (ingestion emits flagged rows).
2. Use the admin console (planned) or direct DB queries to deactivate inappropriate content.
3. Archive removed assets in cloud storage for audit.

## Advertising & Reporting

- Slot definitions live in `apps/api/src/modules/ads/ads.controller.ts`.
- Update inventory in Google Ad Manager / AdInPlay dashboards before deploying slot changes.
- Weekly revenue reports are exported from each network and stored in `/reports/ads/`.
- Use the consent dashboard (OneTrust/Quantcast) to verify opt-in rates.

## Analytics & Monitoring

- Google Analytics (gtag) collects engagement metrics.
- Server logs are shipped to the logging provider via the request logger (see `apps/api/src/middleware/request-logger.ts`).
- Configure alerts for error rates >2% using your observability platform of choice (Datadog/New Relic).
- Track ingestion failures via CI notifications.

## Deployment

1. Merge to `main` triggers GitHub Actions (`.github/workflows/ci.yml`).
2. Successful builds deploy the web app to Vercel (`apps/web`) and the API to your container runtime (Railway/Fly.io/AWS Fargate).
3. Database migrations run automatically via `pnpm --filter api db:migrate`.
4. Seed staging with `pnpm --filter api db:seed`.

## Incident Response

- Page the on-call engineer via Slack (#notania-ops) for Sev1 incidents.
- Document postmortems in `docs/incidents/` (create folder as needed).
- Review logs and analytics to correlate spikes with deployments.
