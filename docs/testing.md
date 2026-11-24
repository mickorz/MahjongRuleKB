# Install & Run Acceptance Checklist

## Overview

Docs-only knowledge base: acceptance targets document structure and content quality, not runtime behavior.

## Installation Checks

- [ ] Clone succeeds without LFS/encoding errors
- [ ] Repository root contains the Hangzhou base doc and the Xiaoshan differential doc
- [ ] `docs/` and `docs/zh-CN/` each contain the same 6 docs with matching names

## Smoke Test

- [ ] Pick any variant doc: its nine-category structure matches the Xiaoshan doc
- [ ] No differential entry contradicts the Hangzhou base rules
- [ ] All referenced file names exist (cross references valid)

## Final Checklist

- [ ] New docs are in the right place (rule docs at root, process docs in dev-docs/)
- [ ] README overview lists any newly added variant
- [ ] Commit messages state the change scope
