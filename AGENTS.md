## Active Infra Rebuild Context (2026-06)

This repo is part of a 7-repo infra rebuild + security hardening. Plan of record:
- `infra/docs/execution-plan.md` (actionable, 8 phases, security baked in)
- `infra/docs/master-infra-plan.md` (the what/where) and
  `infra/docs/security-hardening-plan.md` (defense layers)

**This repo's role:** Frontend-only (Next 13 to 16, OpenNext) + blog. Highest traffic. S3 to R2.

**Binding decisions:** Frontends to Cloudflare Workers/OpenNext (off Vercel);
Supabase Postgres + Upstash Redis; full destroy+rebuild after verified backups;
no automation touches AWS; CF Tunnel is the only ingress to Hetzner.

**Security posture:** CF Free edge + SafeLine origin WAF (OWASP); CF Access
(zero-trust) + ES256 JWT service-to-service; Infisical self-hosted secrets +
rotation; OpenObserve observability (not Grafana); every request traced
(OTel traceparent) and logged.

**Standing rules:** no hardcoded values (env/`var.*`/`.example` only); no emojis;
owner implements, this agent validates; git discipline per
`infra/docs/repo-sync-clean-plan.md` S0.

**Progress:** read and update `infra/docs/execution-status.md` after any phase
touchpoint that involves this repo.
