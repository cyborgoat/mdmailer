---
title: "August Engineering Update"
date: 2026-08-26
---

# What shipped this month

We wrapped up the migration to the new build pipeline and cut deploy times by 40%.

## Highlights

- New CI pipeline is live for all services
- Search latency down from 800ms to 220ms
- On-call rotation tool launched internally

## Team shoutouts

Big thanks to the platform team for carrying the migration across the finish line.

## Metrics

| Metric | Before | After |
| --- | --- | --- |
| Deploy time | 22 min | 13 min |
| Search latency | 800ms | 220ms |

## Roadmap check-in

- [x] Migrate CI pipeline
- [x] Ship on-call tool
- [ ] Roll out canary deploys

~~Rollback tooling~~ is no longer needed after the migration.

Run `npm run deploy` to ship. See the [migration doc](https://example.com/docs) for details.

> Heads up: staging will be read-only during Friday's maintenance window.

Questions? Reply to this email or drop by #eng-general.
