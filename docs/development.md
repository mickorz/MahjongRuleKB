# Contributor Guide

## Environment & Common Commands

Only Git and any Markdown editor are needed:

```bash
git pull                  # sync latest rule docs
git add . && git commit   # commit doc changes
```

## Architecture at a Glance

- **Repository root**: rule docs themselves (named with `【地名麻将】` prefix), e.g. Hangzhou (base) and Xiaoshan (derivative).
- **docs/**: reader-facing docs (this directory).
- **dev-docs/**: development-process docs; conventions in root `CLAUDE.md`.
- **Rule organization**: the nine-category taxonomy (rules/judging/timing, state/counting/recording, scoring/formula/lookup/allocation, UI); new variants follow it.

## Tests

Doc-change acceptance per `testing.md` (structure complete, taxonomy covered, cross references valid).

## Local Development Loop

1. Edit or add rule docs, keeping the nine-category structure.
2. Derivative variants describe only differences from Hangzhou; mark identical parts as "same as Hangzhou".
3. Self-check before commit: taxonomy complete, no contradictions with base rules, naming conventions.
4. Commit and push; record process conclusions in `dev-docs/`.

## Release

Docs repository: merging to `main` is the release. Versioned releases will be introduced when AI Agent / rule-generation integration lands.
