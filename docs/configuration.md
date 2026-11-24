# Configuration Reference

## Configuration Fields

This repository is a docs-only knowledge base with **no runtime configuration today**.

Planned structured rule fields (the "rules/config" category of differential descriptions):

| Field | Type | Default (Hangzhou base) | Description |
|-------|------|------------------------|-------------|
| base score | number | 1 | per-round score base |
| rounds | number | TBD | max rounds per session |
| joker | flag | enabled | whether joker (wildcard) tiles are used |
| cap | number | TBD | per-round score cap |

## Taking Effect & Verification

Not applicable to a docs repository; rule "effect" is realized by composing a complete variant description, verified per `testing.md`.

## Upgrade

Run `git pull` to get the latest rule content.

## Uninstall

Delete the local clone; nothing else remains.
