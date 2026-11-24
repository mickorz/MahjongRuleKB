# Troubleshooting

## Installation

**Chinese file names look garbled after clone**: on Windows run `git config --global core.quotepath false` and check again.

## Runtime

**Cannot locate where a rule is defined**: navigate by the nine-category taxonomy (rules/judging/timing, state/counting/recording, scoring/formula/lookup/allocation, UI), then check the Hangzhou base doc for the default.

**Two docs describe the same rule inconsistently**: the Hangzhou base doc wins. Variant docs describe differences only; a conflict means the base rule was revised without syncing the differential doc — follow the "Modify Base Rules" flow in `how-to-guides.md`.

## Still Stuck

Open an issue in the GitHub repository with the doc name and the specific entry.
