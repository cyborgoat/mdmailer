---
title: "Release Notes — v1.4"
date: 2026-03-02
type: release-notes
lang: en
theme: plum-rose
---

# v1.4 release notes

A smaller release this cycle, mostly bug fixes and a couple of quality-of-life improvements requested by the community.

## Added

- `--dry-run` flag to preview changes without writing files
- Config validation now runs before any output is written, so typos fail fast

## Fixed

- Timestamps in exported reports used the server's timezone instead of the user's
- `retry` no longer double-counts attempts when a request times out
- Long filenames were truncated incorrectly on Windows

## Changed

~~Deprecated the `--legacy-output` flag~~ — removed entirely in this release. Use `--format` instead.

```bash
# before
mytool export --legacy-output

# after
mytool export --format=json
```

## Upgrade notes

Run `mytool doctor` after upgrading to confirm your config is still valid:

```bash
npm install -g mytool@1.4.0
mytool doctor
```

No other action is required. See the [full changelog](https://example.com/changelog/v1.4) for the complete diff.

Questions or issues? Open a ticket or reply to this email.
